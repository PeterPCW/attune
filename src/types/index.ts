// Severity levels
export type Severity = 'critical' | 'high' | 'medium' | 'low' | 'info' | 'warning';

// Category types
export type Category =
  | 'security'
  | 'testing'
  | 'architecture'
  | 'performance'
  | 'accessibility'
  | 'typescript'
  | 'usability'
  | 'complexity'
  | 'maintainability'
  | 'cleanliness'
  | 'documentation'
  | 'database'
  | 'error-handling'
  | 'reliability';

// Framework types
export type Framework =
  | 'nextjs' | 'react' | 'vue' | 'nuxt' | 'svelte' | 'remix'
  | 'astro' | 'solidjs' | 'angular' | 'express' | 'fastify'
  | 'nodejs' | 'library';

// Finding represents a single detected issue
export interface Finding {
  id: string;
  ruleId: string;
  severity: Severity;
  category: Category;
  framework?: Framework;
  file: string;
  line?: number;
  column?: number;
  message: string;
  code?: string;
  recommendation?: Recommendation;
}

export interface Recommendation {
  title: string;
  description: string;
  library?: string;
  codeExample?: {
    before: string;
    after: string;
  };
  docsLink?: string;
  // Actionable bullets for --explain output
  catches?: string[];  // What the rule detects
  fix?: string[];     // What to do to fix
}

// Detection rule interface
export interface DetectionRule {
  id: string;
  name: string;
  category: Category;
  severity: Severity;
  frameworks: Framework[]; // Empty = all frameworks

  detect(context: AnalysisContext): Finding[];

  recommendation: Recommendation;

  metadata?: {
    owaspCategory?: string;
    aiGeneratedLikely?: boolean;
    autoFixable?: boolean;
    manualCheck?: boolean;
  };
}

// Analysis context passed to rule detectors
export interface AnalysisContext {
  projectRoot: string;
  framework: Framework;
  files: SourceFile[];
  packageJson: PackageJson | null;
  options?: CliOptions;
}

export interface SourceFile {
  path: string;
  content: string;
  ast?: object;
}

export interface PackageJson {
  name: string;
  version: string;
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
  scripts?: Record<string, string>;
}

// Framework plugin interface
export interface FrameworkPlugin {
  name: Framework;
  patterns: string[]; // Rule IDs this framework supports

  detectors: {
    files: string[];
    packageNames: string[];
  };

  metadata: {
    testFiles: string[];
    configFiles: string[];
    entryPoints: string[];
  };
}

// Rule check result
export interface RuleResult {
  id: string;
  name: string;
  category: string;
  severity: string;
  passed: boolean;
  findingsCount: number;
  durationMs?: number; // Time taken to execute the rule
  error?: string; // Error message if rule failed to execute
}

// Scan result
export interface ScanResult {
  findings: Finding[];
  filesScanned: number;
  ruleResults?: RuleResult[];
}

// Scan metadata
export interface ScanMetadata {
  projectRoot: string;
  framework: Framework;
  scanTime: number;
  filesScanned: number;
  rulesRun: number;
  full?: boolean;
  ruleResults?: RuleResult[];
}

// CLI options
export interface CliOptions {
  lite?: boolean;
  full?: boolean;
  security?: boolean;
  architecture?: boolean;
  performance?: boolean;
  testing?: boolean;
  framework?: Framework;
  json?: boolean;
  html?: boolean;
  markdown?: boolean;
  sarif?: boolean;
  explain?: boolean;       // Generate explain output (default: true)
  verbose?: boolean;
  ignoreDevDeps?: boolean;
  // Safety/privacy options
  publicSafe?: boolean;
  silentSecurity?: boolean;
  noPaths?: boolean;
  redactSecrets?: boolean;
  output?: string;
  storeOnly?: boolean;
  // Config file options
  config?: string | false;  // path to config file, or false to disable
  // Finding limit options
  maxFindings?: number;     // Maximum findings to show per rule (default: 10)
  // Cache options
  cache?: boolean;          // Enable/disable result caching (default: true)
  // File size limit (in bytes, for regex rules)
  maxFileSize?: number;    // Maximum file size to analyze in bytes (default: 1MB)
}

// Formatter interface
export interface Formatter {
  format(findings: Finding[], metadata: ScanMetadata): string;
}
