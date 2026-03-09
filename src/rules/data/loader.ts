import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { Finding, AnalysisContext, Category, Severity, Framework, Recommendation, DetectionRule } from '../../types/index.js';
import { helperRegistry } from '../helpers/index.js';

// Get __dirname equivalent for ESM
const getDirname = () => {
  if (typeof __dirname !== 'undefined') {
    return __dirname;
  }
  return dirname(fileURLToPath(import.meta.url));
};

export interface RuleDefinition {
  id: string;
  name: string;
  category: string;
  severity: string;
  frameworks: string[];
  recommendation: Recommendation;
  patterns: PatternDefinition[];
  helpers?: HelperConfig[];
  // Actionable bullets for --explain output
  catches?: string[];  // What the rule detects
  fix?: string[];      // What to do to fix
  // File extensions to apply to all patterns in this rule (default: all files)
  fileExtensions?: string[];
}

export interface PatternDefinition {
  type: 'regex';
  pattern: string;
  excludePatterns?: string[];
  message: string;
  fileExtensions?: string[];
}

export interface HelperConfig {
  name: string;
  params: Record<string, unknown>;
}

// Cache for compiled regex patterns - improves performance significantly
// Security: Limit cache size to prevent unbounded memory growth
const patternCache = new Map<string, RegExp>();
const MAX_PATTERN_CACHE_SIZE = 500;

// Security: Limit matches per file to prevent ReDoS
const MAX_MATCHES_PER_FILE = 1000;
const MAX_EXECUTION_TIME_MS = 5000; // 5 seconds max per rule

// File size limit - files larger than this will be skipped for regex rules
// This is a safeguard against ReDoS and memory issues on extremely large files
// DEFAULT: 1MB - covers 99.9%+ of source files while preventing extreme cases
// Set to 0 to disable skip (scan all files - may cause performance issues on huge files)
const MAX_FILE_SIZE_BYTES = 1 * 1024 * 1024;

// Global compiled regex cache for better performance
// Uses Map with pattern string as key to avoid recompilation
// NOTE: Always stored WITHOUT 'g' flag for matchAll compatibility
let GLOBAL_REGEX_CACHE = new Map<string, RegExp>();
const MAX_GLOBAL_CACHE_SIZE = 1000;

// Track skipped files to avoid duplicate warnings
// Reset on each scan via clearSkippedFiles()
const SKIPPED_FILES = new Set<string>();

/**
 * Clear the skipped files tracking - call at start of each scan
 */
export function clearSkippedFiles(): void {
  SKIPPED_FILES.clear();
}

/**
 * Clear the global regex cache - useful for testing or when patterns change
 */
export function clearRegexCache(): void {
  GLOBAL_REGEX_CACHE = new Map();
}

// Clear cache at module load to ensure clean state
GLOBAL_REGEX_CACHE.clear();

export class JsonRule implements DetectionRule {
  id: string;
  name: string;
  category: Category;
  severity: Severity;
  frameworks: Framework[];
  recommendation: Recommendation;
  catches?: string[];  // What the rule detects
  fix?: string[];     // What to do to fix

  // Store full rule definition for rule-level fileExtensions
  rule: RuleDefinition;

  private patterns: PatternDefinition[];
  private helpers: HelperConfig[];
  private compilationErrors: string[] = []; // Track pattern compilation errors
  private compiledPatterns: Map<string, RegExp> = new Map(); // Cached compiled patterns
  private compiledExcludePatterns: Map<string, RegExp> = new Map(); // Cached exclude patterns

  constructor(def: RuleDefinition) {
    this.id = def.id;
    this.name = def.name;
    this.category = def.category as Category;
    this.severity = def.severity as Severity;
    this.frameworks = def.frameworks as Framework[];
    this.recommendation = def.recommendation;
    this.catches = def.catches;
    this.fix = def.fix;
    this.rule = def; // Store full rule for rule-level fileExtensions
    this.patterns = def.patterns || [];
    this.helpers = def.helpers || [];

    // Pre-validate patterns and cache compiled regexes
    this.precompilePatterns();
  }

  // Get any errors from pattern compilation
  getErrors(): string[] {
    return this.compilationErrors;
  }

  // Pre-compile patterns and cache them for performance
  private precompilePatterns(): void {
    for (const patternDef of this.patterns) {
      // Pre-compile and cache main pattern using global cache
      try {
        // Check global cache first
        if (!GLOBAL_REGEX_CACHE.has(patternDef.pattern)) {
          // Security: Prevent unbounded cache growth - evict oldest if at limit
          if (GLOBAL_REGEX_CACHE.size >= MAX_GLOBAL_CACHE_SIZE) {
            const firstKey = GLOBAL_REGEX_CACHE.keys().next().value;
            if (firstKey) GLOBAL_REGEX_CACHE.delete(firstKey);
          }
          // Create regex - remove 'g' flag if present for matchAll compatibility
          // matchAll works with both global and non-global, but non-global is simpler
          let regex: RegExp;
          try {
            regex = new RegExp(patternDef.pattern);
            // If it has 'g' flag, recreate without it
            if (regex.flags.includes('g')) {
              regex = new RegExp(patternDef.pattern, regex.flags.replace('g', ''));
            }
          } catch {
            // Pattern might be invalid, try without flags
            regex = new RegExp(patternDef.pattern);
          }
          GLOBAL_REGEX_CACHE.set(patternDef.pattern, regex);
        }
        this.compiledPatterns.set(patternDef.pattern, GLOBAL_REGEX_CACHE.get(patternDef.pattern)!);
      } catch (e) {
        this.compilationErrors.push(
          `Invalid regex pattern in rule ${this.id}: ${patternDef.pattern} - ${e instanceof Error ? e.message : 'Unknown error'}`
        );
      }

      // Pre-compile exclude patterns using global cache
      if (patternDef.excludePatterns) {
        for (const excludePattern of patternDef.excludePatterns) {
          try {
            if (!GLOBAL_REGEX_CACHE.has(excludePattern)) {
              // Security: Prevent unbounded cache growth
              if (GLOBAL_REGEX_CACHE.size >= MAX_GLOBAL_CACHE_SIZE) {
                const firstKey = GLOBAL_REGEX_CACHE.keys().next().value;
                if (firstKey) GLOBAL_REGEX_CACHE.delete(firstKey);
              }
              // Remove 'g' flag if present for consistency
              let excludeRegex = new RegExp(excludePattern);
              if (excludeRegex.flags.includes('g')) {
                excludeRegex = new RegExp(excludePattern, excludeRegex.flags.replace('g', ''));
              }
              GLOBAL_REGEX_CACHE.set(excludePattern, excludeRegex);
            }
            this.compiledExcludePatterns.set(excludePattern, GLOBAL_REGEX_CACHE.get(excludePattern)!);
          } catch (e) {
            this.compilationErrors.push(
              `Invalid exclude pattern in rule ${this.id}: ${excludePattern} - ${e instanceof Error ? e.message : 'Unknown error'}`
            );
          }
        }
      }
    }

    // Log compilation errors
    if (this.compilationErrors.length > 0) {
      console.warn(`Rule ${this.id} has ${this.compilationErrors.length} pattern error(s):`);
      for (const err of this.compilationErrors) {
        console.warn(`  - ${err}`);
      }
    }
  }

  detect(context: AnalysisContext): Finding[] {
    const findings: Finding[] = [];

    // Skip if framework doesn't match (empty array means all frameworks)
    if (this.frameworks.length > 0 && !this.frameworks.includes(context.framework)) {
      return findings;
    }

    // Run pattern-based detection
    findings.push(...this.runPatterns(context));

    // Run helper-based detection
    findings.push(...this.runHelpers(context));

    return findings;
  }

  private runPatterns(context: AnalysisContext): Finding[] {
    const findings: Finding[] = [];

    // Get max file size from options, or use default (1MB)
    // 0 means unlimited (scan all files)
    const maxFileSize = context.options?.maxFileSize ?? MAX_FILE_SIZE_BYTES;

    for (const file of context.files) {
      // Skip internal files
      if (file.path.includes('/rules/') || file.path.includes('/formatters/') || file.path.includes('/cli/')) {
        continue;
      }

      const content = file.content;

      // Security: Skip very large files to prevent ReDoS and memory issues
      // maxFileSize === 0 means unlimited (scan all files)
      if (maxFileSize > 0 && content.length > maxFileSize) {
        // Only warn once per file per scan to avoid spam (track in module-level set)
        const skipKey = `${this.id}:${file.path}`;
        if (!SKIPPED_FILES.has(skipKey)) {
          SKIPPED_FILES.add(skipKey);
          console.warn(`⚠️  ${this.id}: SKIPPED large file (${(content.length / 1024 / 1024).toFixed(1)}MB): ${file.path}`);
          console.warn(`    File exceeds ${maxFileSize / 1024 / 1024}MB limit - this file was NOT analyzed for issues!`);
          console.warn(`    → Use --max-file-size ${Math.ceil(content.length / 1024 / 1024)} or higher to analyze this file`);
        }
        continue;
      }

      const lines = content.split('\n');

      for (const patternDef of this.patterns) {
        // Skip by file extension - use pattern-level if specified, otherwise fall back to rule-level
        const extensions = patternDef.fileExtensions || this.rule.fileExtensions;
        if (extensions && !extensions.some(ext => file.path.endsWith(ext))) {
          continue;
        }

        // Use cached compiled regex
        const cachedRegex = this.compiledPatterns.get(patternDef.pattern);
        if (!cachedRegex) {
          continue; // Pattern failed to compile
        }

        // Create a new regex with 'g' flag for exec-based iteration
        // This is more reliable than matchAll for iterative matching
        const regex = new RegExp(cachedRegex.source, 'g');

        let matchCount = 0;
        const startTime = Date.now();
        let match: RegExpExecArray | null;

        // Use exec in a loop with proper lastIndex resetting
        while ((match = regex.exec(content)) !== null) {
          // Security: Prevent ReDoS by limiting matches and execution time
          matchCount++;
          if (matchCount > MAX_MATCHES_PER_FILE) {
            console.warn(`Rule ${this.id}: Match limit (${MAX_MATCHES_PER_FILE}) exceeded for file ${file.path}`);
            break;
          }
          if (Date.now() - startTime > MAX_EXECUTION_TIME_MS) {
            console.warn(`Rule ${this.id}: Execution timeout exceeded for file ${file.path}`);
            break;
          }

          const matchIndex = match.index ?? 0;

          // Check exclude patterns using cached compiled regexes
          let shouldExclude = false;
          if (patternDef.excludePatterns) {
            for (const excludePattern of patternDef.excludePatterns) {
              const excludeRegex = this.compiledExcludePatterns.get(excludePattern);
              if (excludeRegex) {
                const contextSlice = content.substring(Math.max(0, matchIndex - 50), matchIndex + 50);
                // Reset state for test (creates new regex instance internally)
                const testRegex = new RegExp(excludeRegex.source, excludeRegex.flags);
                if (testRegex.test(contextSlice)) {
                  shouldExclude = true;
                  break;
                }
              }
            }
          }

          if (!shouldExclude) {
            const lineNumber = content.substring(0, matchIndex).split('\n').length;
            findings.push({
              id: this.id,
              ruleId: this.id,
              severity: this.severity,
              category: this.category,
              file: file.path,
              line: lineNumber,
              message: patternDef.message,
              code: lines[lineNumber - 1]?.trim() || '',
              recommendation: this.recommendation
            });
          }
        }
      }
    }

    return findings;
  }

  private runHelpers(context: AnalysisContext): Finding[] {
    const findings: Finding[] = [];

    for (const helperConfig of this.helpers) {
      const helperFn = helperRegistry[helperConfig.name];
      if (!helperFn) {
        console.warn(`Unknown helper: ${helperConfig.name}`);
        continue;
      }

      try {
        const helperFindings = helperFn(context, helperConfig.params);
        // Add rule metadata to findings
        for (const finding of helperFindings) {
          finding.ruleId = this.id;
          finding.severity = this.severity;
          finding.category = this.category;
          finding.recommendation = this.recommendation;
        }
        findings.push(...helperFindings);
      } catch (error) {
        console.warn(`Error running helper ${helperConfig.name}:`, error);
      }
    }

    return findings;
  }
}

// Valid severity values
const VALID_SEVERITIES = ['critical', 'high', 'medium', 'low', 'info'];

// Validate a single rule definition
function validateRule(rule: unknown, index: number): string[] {
  const errors: string[] = [];
  const r = rule as Record<string, unknown>;

  if (!r.id || typeof r.id !== 'string') {
    errors.push(`Rule[${index}]: missing or invalid 'id'`);
  }
  if (!r.name || typeof r.name !== 'string') {
    errors.push(`Rule[${index}]: missing or invalid 'name'`);
  }
  if (!r.category || typeof r.category !== 'string') {
    errors.push(`Rule[${index}]: missing or invalid 'category'`);
  }
  if (!r.severity || !VALID_SEVERITIES.includes(r.severity as string)) {
    errors.push(`Rule[${index}]: missing or invalid 'severity' (must be one of: ${VALID_SEVERITIES.join(', ')})`);
  }
  if (!r.recommendation || typeof r.recommendation !== 'object') {
    errors.push(`Rule[${index}]: missing or invalid 'recommendation'`);
  }
  if (r.frameworks && !Array.isArray(r.frameworks)) {
    errors.push(`Rule[${index}]: 'frameworks' must be an array`);
  }
  if (r.patterns && !Array.isArray(r.patterns)) {
    errors.push(`Rule[${index}]: 'patterns' must be an array`);
  }
  if (r.helpers && !Array.isArray(r.helpers)) {
    errors.push(`Rule[${index}]: 'helpers' must be an array`);
  }

  return errors;
}

// Validate entire rule file
function validateRuleFile(data: unknown): string[] {
  const errors: string[] = [];
  const d = data as Record<string, unknown>;

  if (!data || typeof data !== 'object') {
    return ['Root must be an object'];
  }
  if (!d.rules || !Array.isArray(d.rules)) {
    return ['Missing or invalid "rules" array'];
  }

  for (let i = 0; i < d.rules.length; i++) {
    errors.push(...validateRule(d.rules[i], i));
  }

  return errors;
}

export function loadRulesFromJson(category: string): DetectionRule[] {
  try {
    let baseDir = getDirname();

    // Handle different directory structures:
    // - Bundled: getDirname() returns dist/, files are in dist/rules/data/
    // - Source (tests): getDirname() returns src/rules/data/, files are in src/rules/data/
    let jsonPath = join(baseDir, `${category}.json`);
    let jsonContent: string;

    // Try current location first
    try {
      jsonContent = readFileSync(jsonPath, 'utf-8');
    } catch {
      // If in src/rules/data/, try going to dist/rules/data/
      // If in dist/, also try dist/rules/data/
      const possiblePaths = [
        join(baseDir, '..', '..', 'dist', 'rules', 'data', `${category}.json`),
        join(baseDir, 'rules', 'data', `${category}.json`),
      ];

      for (const tryPath of possiblePaths) {
        try {
          jsonPath = tryPath;
          jsonContent = readFileSync(tryPath, 'utf-8');
          break;
        } catch {
          // Continue to next path
        }
      }

      if (!jsonContent) {
        throw new Error(`Could not find ${category}.json`);
      }
    }
    const data = JSON.parse(jsonContent);

    // Validate the rule file
    const validationErrors = validateRuleFile(data);
    if (validationErrors.length > 0) {
      console.warn(`Validation errors in ${category}.json:`);
      for (const err of validationErrors) {
        console.warn(`  - ${err}`);
      }
    }

    if (data.rules && Array.isArray(data.rules)) {
      return data.rules.map((def: RuleDefinition) => new JsonRule(def));
    }
  } catch (e) {
    // Log parsing errors
    console.warn(`Error loading rules from ${category}.json:`, e instanceof Error ? e.message : String(e));
  }
  return [];
}
