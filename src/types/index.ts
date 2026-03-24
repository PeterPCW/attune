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
  | 'reliability'
  | 'api'
  | 'css'
  | 'payments'
  | 'forms'
  | 'queues'
  | 'monitoring'
  | 'caching'
  | 'migrations'
  | 'i18n'
  | 'kubernetes'
  | 'docker'
  | 'cicd'
  | 'graphql'
  | 'uploads'
  | 'websockets'
  | 'email'
  | 'state'
  | 'cli';

// Framework types
export type Framework =
  | 'nextjs' | 'react' | 'vue' | 'nuxt' | 'svelte' | 'remix'
  | 'astro' | 'solidjs' | 'angular' | 'express' | 'fastify'
  | 'nodejs' | 'library'
  | 'python' | 'django' | 'fastapi' | 'flask' | 'sqlalchemy' | 'celery';

// Project type - distinguishes different types of projects
export type ProjectType = 'cli' | 'devtool' | 'library' | 'webapp' | 'saas' | 'mobile' | 'desktop' | 'firmware';

// Language - for filtering language-specific rules
export type Language = 'python' | 'typescript' | 'javascript';

// Mapping of which categories apply to which project types
export const PROJECT_TYPE_CATEGORIES: Record<ProjectType, string[]> = {
  // User-facing command line tools (docker, kubectl, git)
  cli: [
    'typescript',
    'complexity',
    'maintainability',
    'cleanliness',
    'documentation',
    'error-handling',
    'security',
    'performance'
  ],
  // Developer tools (linters, bundlers, Attune, prettier)
  devtool: [
    'typescript',
    'complexity',
    'maintainability',
    'cleanliness',
    'documentation',
    'error-handling',
    'security',
    'performance',
    'usability'
  ],
  // Reusable packages (npm packages, Python libs)
  library: [
    'typescript',
    'complexity',
    'maintainability',
    'cleanliness',
    'documentation',
    'error-handling',
    'security',
    'performance',
    'accessibility'
  ],
  // Frontend-only web apps (no backend)
  webapp: [
    'security',
    'performance',
    'accessibility',
    'typescript',
    'usability',
    'maintainability',
    'cleanliness',
    'error-handling',
    'database',
    'api'
  ],
  // Full-stack SaaS with users, payments, database
  saas: [
    'security',
    'performance',
    'accessibility',
    'typescript',
    'usability',
    'maintainability',
    'cleanliness',
    'error-handling',
    'database',
    'api',
    'payments',
    'migrations',
    'caching',
    'monitoring'
  ],
  // Mobile apps (React Native, Flutter, native)
  mobile: [
    'security',
    'performance',
    'accessibility',
    'typescript',
    'usability',
    'maintainability',
    'cleanliness',
    'error-handling',
    'database',
    'api',
    'mobile'
  ],
  // Desktop apps (Electron, Tauri, native)
  desktop: [
    'security',
    'performance',
    'accessibility',
    'typescript',
    'usability',
    'maintainability',
    'cleanliness',
    'error-handling',
    'database',
    'api',
    'mobile'
  ],
  // Embedded/IoT firmware (C, Rust, C++ for microcontrollers)
  firmware: [
    'security',
    'performance',
    'complexity',
    'maintainability',
    'cleanliness',
    'error-handling',
    'documentation'
  ]
};

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
  projectTypes?: ProjectType[]; // Empty = all project types
  languages?: Language[]; // Empty = all languages
  excludePaths?: string[]; // Paths to exclude from this rule (e.g., ["test", "docs"])

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
  projectType?: ProjectType;
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
  bin?: Record<string, string>;
  peerDependencies?: Record<string, string>;
  [key: string]: unknown;
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
  projectType?: ProjectType;  // Override auto-detected project type
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
  // Metrics
  metrics?: boolean;        // Output performance metrics after scan
  // Custom rules
  rulesPath?: string;       // Path to custom rules JSON file or directory
  // CI options
  failOnWarnings?: boolean; // Exit with error code if warnings or higher found
}

// Formatter interface
export interface Formatter {
  format(findings: Finding[], metadata: ScanMetadata): string;
}
