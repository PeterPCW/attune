/**
 * Engine-based Rule Registry
 *
 * Architecture:
 * 1. Loads JSON rules from json-function-engine (src/rules/functions/*.json)
 * 2. Loads TypeScript framework rules (React, Vue, Python, etc.) based on detected framework
 * 3. Executes all matching rules and aggregates findings
 *
 * Error handling: Log-and-continue - one rule failure doesn't stop the scan
 * Performance: Streaming enabled for large files, circuit breaker prevents hangs
 *
 * @see https://github.com/PeterPCW/json-function-engine for engine details
 */

import { readdirSync, existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { DetectionRule, AnalysisContext, Finding, CliOptions, Framework, ProjectType, Language, SourceFile } from '../types/index.js';
import { AttuneEngineWrapper } from './engine-wrapper.js';
import { getFrameworkRuleLoaders } from './framework-rules.js';
import type { IRuleRegistry, EngineOptions } from './interfaces.js';
import { createError, ErrorCode, isAttuneError } from '../errors.js';

// ============================================
// Configuration
// ============================================

// Where JSON rules are stored (built-in rules)
// Detects whether we're in development or production based on whether
// the src folder exists. Production builds copy files to dist/rules/functions.
function getBuiltInRulesDir(): string {
  const srcPath = join(process.cwd(), 'src/rules/functions');
  const distPath = join(process.cwd(), 'dist/rules/functions');

  if (existsSync(srcPath)) {
    return 'src/rules/functions';
  } else if (existsSync(distPath)) {
    return 'dist/rules/functions';
  }
  // Fallback to src for development
  return 'src/rules/functions';
}

// Where users can add custom rules (auto-loaded)
const CUSTOM_RULES_DIR = 'rules';

// Default circuit breaker values - can be overridden via EngineOptions
const DEFAULT_CIRCUIT_BREAKER_TIMEOUT_MS = 30000; // 30 seconds max per rule
const DEFAULT_CIRCUIT_BREAKER_MAX_FAILURES = 5;   // Stop after 5 consecutive failures

// Default max findings per rule to prevent overwhelming reports
const DEFAULT_MAX_FINDINGS_PER_RULE = 10;

// Default global max findings cap to prevent OOM from rules with many matches
const DEFAULT_GLOBAL_MAX_FINDINGS = 10000;

/**
 * @deprecated Use EngineOptions from './interfaces.js' instead
 */
export type EngineRegistryOptions = EngineOptions;

/**
 * A DetectionRule wrapper that delegates to the engine
 * This allows the engine to be used through the existing rule interface
 */
export class EngineDetectionRule implements DetectionRule {
  id: string;
  name: string;
  category: string;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  frameworks: Framework[];
  projectTypes?: ProjectType[];
  languages?: Language[];
  recommendation: { title: string; description: string; library?: string };

  private engine: AttuneEngineWrapper;
  private functionId: string;

  constructor(engine: AttuneEngineWrapper, functionDef: any) {
    this.engine = engine;
    this.functionId = functionDef.id;
    this.id = functionDef.id;
    this.name = functionDef.name;
    this.category = functionDef.category || 'unknown';
    this.severity = functionDef.action?.severity || 'medium';
    this.frameworks = functionDef.frameworks || [];
    this.projectTypes = functionDef.projectTypes;
    this.languages = functionDef.languages;
    this.recommendation = functionDef.recommendation || {
      title: functionDef.name,
      description: functionDef.description || '',
    };
  }

  async detect(context: AnalysisContext): Promise<Finding[]> {
    // Execute the engine for this specific function
    const findings = await this.engine.execute(context.files, {
      framework: context.framework,
      projectType: context.projectType,
      options: context.options,
    });

    // Filter to only this function's findings
    return findings.filter(f => f.ruleId === this.functionId);
  }
}

/**
 * Determine which categories to load based on options and project type
 * Matches the legacy RuleRegistry behavior
 */
function getCategoriesToLoad(options: CliOptions): string[] {
  // If specific category requested, only load that
  if (options.security) return ['security'];
  if (options.architecture) return ['architecture'];
  if (options.performance) return ['performance'];
  if (options.testing) return ['testing'];
  if (options.accessibility) return ['accessibility'];
  if (options.complexity) return ['complexity'];

  // Return null to load all categories
  return [];
}

/**
 * Engine-based Rule Registry
 * Uses json-function-engine instead of the legacy loader
 */
export class EngineRuleRegistry implements IRuleRegistry {
  private engine: AttuneEngineWrapper;
  private loaded: boolean = false;
  private rules: EngineDetectionRule[] = [];
  private frameworkRules: DetectionRule[] = []; // TypeScript framework rules (React, Vue, etc.)
  private frameworkModules: Record<string, () => DetectionRule[]> | null = null;
  // Circuit breaker state and config
  private consecutiveFailures: number = 0;
  private circuitOpen: boolean = false;
  private circuitBreakerTimeoutMs: number;
  private circuitBreakerMaxFailures: number;

  // Finding limits
  private maxFindingsPerRule: number;
  private globalMaxFindings: number;

  // Configurable paths
  private builtInRulesDir: string;
  private customRulesDir: string;

  constructor(options: EngineOptions = {}) {
    this.engine = new AttuneEngineWrapper({ logger: options.logger || 'silent', cwd: options.cwd });
    // Use provided paths or auto-detect (src vs dist)
    this.builtInRulesDir = options.builtInRulesDir || getBuiltInRulesDir();
    this.customRulesDir = options.customRulesDir || CUSTOM_RULES_DIR;

    // Circuit breaker configuration (with defaults)
    this.circuitBreakerTimeoutMs = options.circuitBreakerTimeoutMs || DEFAULT_CIRCUIT_BREAKER_TIMEOUT_MS;
    this.circuitBreakerMaxFailures = options.circuitBreakerMaxFailures || DEFAULT_CIRCUIT_BREAKER_MAX_FAILURES;

    // Finding limits (with defaults)
    this.maxFindingsPerRule = options.maxFindingsPerRule || DEFAULT_MAX_FINDINGS_PER_RULE;
    this.globalMaxFindings = options.globalMaxFindings || DEFAULT_GLOBAL_MAX_FINDINGS;
  }

  /**
   * Execute a function with timeout and circuit breaker
   */
  private async executeWithTimeout<T>(
    fn: () => Promise<T>,
    timeoutMs: number,
    ruleId: string
  ): Promise<T | null> {
    if (this.circuitOpen) {
      console.warn(`⚠️  Circuit breaker open, skipping rule: ${ruleId}`);
      return null;
    }

    try {
      const result = await Promise.race([
        fn(),
        new Promise<null>((_, reject) =>
          setTimeout(() => reject(new Error(`Timeout after ${timeoutMs}ms`)), timeoutMs)
        )
      ]);
      // Success - reset failure count
      this.consecutiveFailures = 0;
      return result as T;
    } catch (error) {
      this.consecutiveFailures++;
      if (this.consecutiveFailures >= this.circuitBreakerMaxFailures) {
        this.circuitOpen = true;
        console.warn(`⚠️  Circuit breaker opened after ${this.consecutiveFailures} consecutive failures`);
      }
      throw error;
    }
  }

  /**
   * Load TypeScript framework rules for a specific framework
   * These have complex detection logic that can't be expressed in JSON
   * Only loads rules for the detected framework to save memory and startup time
   */
  private async loadFrameworkRules(framework: Framework): Promise<void> {
    // Check if we already loaded rules for this framework
    if (this.frameworkModules?.[framework]) return;

    try {
      // Initialize the modules cache if needed
      if (!this.frameworkModules) {
        this.frameworkModules = {};
      }

      // Get framework rule loaders from separate module
      const loaders = await getFrameworkRuleLoaders();

      // Only load rules for the specific framework
      const loader = loaders[framework];
      if (loader) {
        try {
          const rules = await loader();
          this.frameworkRules.push(...rules);
          this.frameworkModules[framework] = true;
          console.log(`📦 Loaded ${rules.length} ${framework} rules`);
        } catch (e: any) {
          console.warn(`Failed to load ${framework} rules: ${e.message}`);
        }
      }
    } catch (e: any) {
      console.warn(`Failed to load framework rules: ${e.message}`);
    }
  }

  /**
   * Validate a custom rule function before adding to engine
   * Custom rules have limited scope compared to built-in rules
   */
  private validateCustomRule(fn: any, fileName: string): boolean {
    // Required fields
    if (!fn.id || typeof fn.id !== 'string') {
      console.warn(`Custom rule in ${fileName}: missing or invalid 'id' field`);
      return false;
    }
    if (!fn.name || typeof fn.name !== 'string') {
      console.warn(`Custom rule '${fn.id}' in ${fileName}: missing or invalid 'name' field`);
      return false;
    }
    if (!fn.category || typeof fn.category !== 'string') {
      console.warn(`Custom rule '${fn.id}' in ${fileName}: missing or invalid 'category' field`);
      return false;
    }
    if (!fn.action || typeof fn.action !== 'object') {
      console.warn(`Custom rule '${fn.id}' in ${fileName}: missing or invalid 'action' field`);
      return false;
    }

    // Validate action object
    if (!fn.action.type || !['flag', 'warn', 'error'].includes(fn.action.type)) {
      console.warn(`Custom rule '${fn.id}' in ${fileName}: action.type must be 'flag', 'warn', or 'error'`);
      return false;
    }
    if (!fn.action.severity || !['critical', 'high', 'medium', 'low', 'info'].includes(fn.action.severity)) {
      console.warn(`Custom rule '${fn.id}' in ${fileName}: action.severity must be valid severity`);
      return false;
    }

    // Validate regex patterns if present
    if (fn.condition?.type === 'regex' && fn.condition.pattern) {
      try {
        new RegExp(fn.condition.pattern);
      } catch (e) {
        console.warn(`Custom rule '${fn.id}' in ${fileName}: invalid regex pattern`);
        return false;
      }
    }

    // Limit rule ID length to prevent issues
    if (fn.id.length > 50) {
      console.warn(`Custom rule '${fn.id}' in ${fileName}: id too long (max 50 chars)`);
      return false;
    }

    // Warn about potentially dangerous patterns but allow them (user's responsibility)
    // We keep skipValidation: true for the engine but validate structure here

    return true;
  }

  /**
   * Load custom rules from a local folder (./rules/)
   * Custom rules have limited scope and require validation
   */
  private loadCustomRules(cwd: string = process.cwd()): number {
    const customDir = join(cwd, this.customRulesDir);

    if (!existsSync(customDir)) {
      return 0;
    }

    try {
      const files = readdirSync(customDir).filter(f => f.endsWith('.json'));
      let customCount = 0;

      for (const file of files) {
        try {
          const content = readFileSync(join(customDir, file), 'utf-8');
          const data = JSON.parse(content);

          if (data.functions && Array.isArray(data.functions)) {
            // Validate each custom function before adding
            const validFunctions = data.functions.filter((fn: any) =>
              this.validateCustomRule(fn, file)
            );

            if (validFunctions.length > 0) {
              // Use skipValidation: true for custom rules too (user's responsibility)
              // but we validate structure above
              this.engine.getEngine().addFunctions(validFunctions);
              customCount += validFunctions.length;
              console.log(`📦 Loaded ${validFunctions.length} custom rules from ${this.customRulesDir}/${file}`);
            }
          }
        } catch (e: any) {
          console.warn(`Failed to load custom rules from ${file}: ${e.message}`);
        }
      }

      return customCount;
    } catch (e) {
      console.warn(`Failed to load custom rules from ${customDir}:`, e);
      return 0;
    }
  }

  /**
   * Load all functions from the migrated JSON files
   */
  private async ensureLoaded(): Promise<void> {
    if (this.loaded) return;

    // Use src folder for development
    const functionsDir = this.builtInRulesDir;

    if (!existsSync(functionsDir)) {
      console.warn(`Functions directory not found: ${functionsDir}`);
      this.loaded = true;
      return;
    }

    try {
      // Read and parse each file, then add functions directly
      const files = readdirSync(functionsDir).filter(f => f.endsWith('.json'));
      let totalFunctions = 0;

      for (const file of files) {
        try {
          const content = readFileSync(join(functionsDir, file), 'utf-8');
          const data = JSON.parse(content);

          if (data.functions && Array.isArray(data.functions)) {
            // Add functions directly to bypass validation issues
            this.engine.getEngine().addFunctions(data.functions);
            totalFunctions += data.functions.length;
          }
        } catch (e: any) {
          console.log(`${file}: ${e.message}`);
        }
      }

      console.log(`Total: Loaded ${totalFunctions} functions from ${files.length} files`);
    } catch (e) {
      console.warn(`Failed to load functions:`, e);
    }

    // Load custom rules from ./rules/ folder
    const customCount = this.loadCustomRules();
    if (customCount > 0) {
      console.log(`📦 Added ${customCount} custom rules`);
    }

    // Convert to DetectionRule wrappers (includes both built-in and custom)
    const functions = this.engine.getFunctions();
    this.rules = functions.map(fn => new EngineDetectionRule(this.engine, fn));

    this.loaded = true;

    if (this.rules.length > 0) {
      console.log(`📦 Engine loaded ${this.rules.length} rules from json-function-engine`);
    }
  }

  /**
   * Get rules for a specific framework and options
   */
  async getRulesForFramework(framework: Framework, options: CliOptions, projectType?: ProjectType, language?: Language): Promise<DetectionRule[]> {
    await this.ensureLoaded();

    let filtered = [...this.rules];

    // Filter by category (security, architecture, etc.)
    const categories = getCategoriesToLoad(options);
    if (categories.length > 0) {
      filtered = filtered.filter(r => categories.includes(r.category));
    }

    // Filter by framework
    if (framework !== 'nodejs') {
      filtered = filtered.filter(
        r => r.frameworks.length === 0 || r.frameworks.includes(framework)
      );
    }

    // Filter by project type - skip rules that don't apply to this project type
    if (projectType) {
      filtered = filtered.filter(r => {
        // If rule has projectTypes, only include if it matches
        if (r.projectTypes && r.projectTypes.length > 0) {
          return r.projectTypes.includes(projectType);
        }
        // No projectTypes means rule applies to all types
        return true;
      });
    }

    // Filter by language - skip Python rules for TypeScript/JS projects and vice versa
    if (language) {
      filtered = filtered.filter(r => {
        // If rule has languages, only include if it matches
        if (r.languages && r.languages.length > 0) {
          return r.languages.includes(language);
        }
        // No languages means rule applies to all languages
        return true;
      });
    }

    // Lite mode
    if (options.lite) {
      filtered = filtered.filter(r =>
        r.severity === 'critical' || r.severity === 'high'
      );
    }

    return filtered;
  }

  /**
   * Get all rules
   */
  async getAllRules(): Promise<DetectionRule[]> {
    await this.ensureLoaded();
    return [...this.rules];
  }

  /**
   * Get relevant file extensions (sync version for scanner)
   */
  getRelevantExtensions(framework: Framework, options: CliOptions, projectType?: ProjectType): Set<string> {
    // Default extensions - the scanner will filter appropriately
    const defaultExtensions = ['.ts', '.tsx', '.js', '.jsx', '.vue', '.svelte', '.astro', '.json', '.md'];
    if (['python', 'django', 'fastapi', 'flask', 'sqlalchemy', 'celery'].includes(framework)) {
      defaultExtensions.push('.py', '.pyw');
    }

    return new Set(defaultExtensions);
  }

  /**
   * Execute all rules directly via engine (bypasses individual rule.detect())
   * This is more efficient for bulk execution
   */
  async executeAll(files: SourceFile[], framework: Framework, options: CliOptions, projectType?: ProjectType, language?: Language): Promise<Finding[]> {
    await this.ensureLoaded();

    // Load framework-specific TypeScript rules for the detected framework only
    await this.loadFrameworkRules(framework);

    // Get filtered JSON rules by category, framework, project type, and language
    const filteredRules = await this.getRulesForFramework(framework, options, projectType, language);
    const functionIds = new Set(filteredRules.map(r => r.id));

    // Get framework-specific TypeScript rules for the detected framework
    const activeFrameworkRules = this.frameworkRules.filter(rule => {
      // Match by framework
      if (rule.frameworks && rule.frameworks.length > 0) {
        return rule.frameworks.includes(framework);
      }
      return false;
    });

    const totalRules = functionIds.size + activeFrameworkRules.length;
    console.log(`Executing ${totalRules} rules on ${files.length} files (${functionIds.size} JSON + ${activeFrameworkRules.length} framework)`);

    // Execute JSON rules with error handling - log-and-continue on failure
    let jsonFindings: Finding[] = [];
    try {
      jsonFindings = await this.engine.execute(files, {
        framework,
        projectType,
        options: options as any,
      });
    } catch (error) {
      // Log error but continue with empty findings - don't let one rule crash the scan
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.warn(`⚠️  Engine execution encountered an error: ${errorMsg}`);
      console.warn(`  → Continuing with remaining rules...`);
    }

    // Filter JSON findings to only include those from our filtered rules
    let findings = jsonFindings.filter(f => functionIds.has(f.ruleId));

    // Apply excludePaths filter - remove findings from excluded paths
    findings = this.filterFindingsByExcludePaths(findings, filteredRules);

    // Execute framework TypeScript rules (React, Vue, Python, etc.)
    // These have complex detection logic that can't be expressed in JSON
    if (activeFrameworkRules.length > 0) {
      const context: AnalysisContext = {
        files,
        framework,
        projectType,
        options: options as any,
      };

      for (const rule of activeFrameworkRules) {
        // Check circuit breaker before each rule
        if (this.circuitOpen) {
          console.warn(`⚠️  Circuit breaker open, skipping remaining framework rules`);
          break;
        }

        try {
          const ruleFindings = await this.executeWithTimeout(
            () => rule.detect(context),
            this.circuitBreakerTimeoutMs,
            rule.id
          );
          if (ruleFindings) {
            findings.push(...ruleFindings);
          }
        } catch (error) {
          // Log error but continue with other rules - log-and-continue
          const errorMsg = error instanceof Error ? error.message : String(error);
          console.warn(`⚠️  Rule ${rule.id} failed: ${errorMsg}`);
          console.warn(`  → Continuing with remaining rules...`);
        }
      }
    }

    // Limit findings per rule to prevent overwhelming reports
    // CLI option takes precedence over instance config
    const maxFindings = options.maxFindings || this.maxFindingsPerRule;
    const ruleFindings = new Map<string, Finding[]>();

    for (const finding of findings) {
      const ruleId = finding.ruleId;
      if (!ruleFindings.has(ruleId)) {
        ruleFindings.set(ruleId, []);
      }
      const ruleFindingsList = ruleFindings.get(ruleId)!;
      if (ruleFindingsList.length < maxFindings) {
        ruleFindingsList.push(finding);
      }
    }

    let limitedFindings = Array.from(ruleFindings.values()).flat();

    // Apply global cap to prevent OOM from rules with many matches
    if (limitedFindings.length > this.globalMaxFindings) {
      limitedFindings = limitedFindings.slice(0, this.globalMaxFindings);
      console.log(`⚠️  Global cap applied: limited to ${this.globalMaxFindings} findings`);
    }

    return limitedFindings;
  }

  /**
   * Filter findings based on excludePaths defined in rules
   * This removes findings from files that match any of the excluded path patterns
   */
  private filterFindingsByExcludePaths(findings: Finding[], rules: DetectionRule[]): Finding[] {
    // Build a map of rule ID -> exclude patterns
    const ruleExcludePaths = new Map<string, string[]>();
    for (const rule of rules) {
      if (rule.excludePaths && rule.excludePaths.length > 0) {
        ruleExcludePaths.set(rule.id, rule.excludePaths);
      }
    }

    // If no rules have excludePaths, return unchanged
    if (ruleExcludePaths.size === 0) {
      return findings;
    }

    // Filter out findings that match exclude patterns
    return findings.filter(finding => {
      const excludePaths = ruleExcludePaths.get(finding.ruleId);
      if (!excludePaths || excludePaths.length === 0) {
        // No exclude paths for this rule, keep the finding
        return true;
      }

      // Check if the file path matches any exclude pattern
      const filePath = finding.file.replace(/\\/g, '/');
      for (const pattern of excludePaths) {
        // Check for path segments (directories)
        // e.g., "test" matches "/test/", "/tests/", "test/file.ts"
        // e.g., "docs/" matches any file in docs directory
        // e.g., "*.test.*" matches test files
        const patternLower = pattern.toLowerCase();

        // Handle glob-like patterns
        if (pattern.includes('*')) {
          const globRegex = new RegExp(
            pattern.replace(/\./g, '\\.').replace(/\*/g, '.*').replace(/\?/g, '.'),
            'i'
          );
          if (globRegex.test(filePath)) {
            return false;
          }
        }

        // Handle directory patterns (ending with /)
        if (pattern.endsWith('/')) {
          const dirPattern = pattern.slice(0, -1).toLowerCase();
          if (filePath.includes(`/${dirPattern}/`) || filePath.includes(`\\${dirPattern}\\`)) {
            return false;
          }
        }

        // Handle simple substring matches (directory names, file name parts)
        if (filePath.toLowerCase().includes(patternLower)) {
          return false;
        }
      }

      // No exclude pattern matched, keep the finding
      return true;
    });
  }

  /**
   * Get the underlying engine for direct access
   */
  getEngine(): AttuneEngineWrapper {
    return this.engine;
  }

  /**
   * Get metrics and health status for monitoring
   */
  getMetrics(): {
    rulesLoaded: number;
    frameworkRulesLoaded: number;
    circuitBreaker: {
      open: boolean;
      consecutiveFailures: number;
      maxFailures: number;
      timeoutMs: number;
    };
    limits: {
      maxFindingsPerRule: number;
      globalMaxFindings: number;
    };
  } {
    return {
      rulesLoaded: this.rules.length,
      frameworkRulesLoaded: this.frameworkRules.length,
      circuitBreaker: {
        open: this.circuitOpen,
        consecutiveFailures: this.consecutiveFailures,
        maxFailures: this.circuitBreakerMaxFailures,
        timeoutMs: this.circuitBreakerTimeoutMs,
      },
      limits: {
        maxFindingsPerRule: this.maxFindingsPerRule,
        globalMaxFindings: this.globalMaxFindings,
      },
    };
  }

  /**
   * Reset the circuit breaker (for testing or recovery)
   */
  resetCircuitBreaker(): void {
    this.consecutiveFailures = 0;
    this.circuitOpen = false;
    console.log('Circuit breaker reset');
  }
}
