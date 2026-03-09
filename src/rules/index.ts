import { DetectionRule, CliOptions, Framework } from '../types/index.js';
import { loadRulesFromJson, RuleDefinition } from './data/loader.js';

// Lazy load rule modules to avoid tracking in coverage
// These are only loaded when needed, not at import time
type RuleLoader = () => DetectionRule[];

// Map categories to their loader functions
// This allows loading only the categories needed instead of all at once
const CATEGORY_LOADERS: Record<string, RuleLoader> = {
  security: () => loadRulesFromJson('security'),
  accessibility: () => loadRulesFromJson('accessibility'),
  complexity: () => loadRulesFromJson('complexity'),
  cli: () => loadRulesFromJson('cli'),
  'error-handling': () => loadRulesFromJson('error-handling'),
  logging: () => loadRulesFromJson('logging'),
  state: () => loadRulesFromJson('state'),
  api: () => loadRulesFromJson('api'),
  forms: () => loadRulesFromJson('forms'),
  mvc: () => loadRulesFromJson('mvc'),
  'ai-patterns': () => loadRulesFromJson('ai-patterns'),
  database: () => loadRulesFromJson('database'),
  testing: () => loadRulesFromJson('testing'),
  typescript: () => loadRulesFromJson('typescript'),
  performance: () => loadRulesFromJson('performance'),
  maintainability: () => loadRulesFromJson('maintainability'),
  usability: () => loadRulesFromJson('usability'),
  cleanliness: () => loadRulesFromJson('cleanliness'),
  documentation: () => loadRulesFromJson('documentation'),
  architecture: () => loadRulesFromJson('architecture'),
  saas: () => loadRulesFromJson('saas'),
  mobile: () => loadRulesFromJson('mobile'),
  graphql: () => loadRulesFromJson('graphql'),
  css: () => loadRulesFromJson('css'),
  docker: () => loadRulesFromJson('docker'),
  dependencies: () => loadRulesFromJson('dependencies'),
  cors: () => loadRulesFromJson('cors'),
  queues: () => loadRulesFromJson('queues'),
  caching: () => loadRulesFromJson('caching'),
  monitoring: () => loadRulesFromJson('monitoring'),
  i18n: () => loadRulesFromJson('i18n'),
  uploads: () => loadRulesFromJson('uploads'),
  email: () => loadRulesFromJson('email'),
  websockets: () => loadRulesFromJson('websockets'),
  payments: () => loadRulesFromJson('payments'),
  cicd: () => loadRulesFromJson('cicd'),
  'graphql-subscriptions': () => loadRulesFromJson('graphql-subscriptions'),
  kubernetes: () => loadRulesFromJson('kubernetes'),
  migrations: () => loadRulesFromJson('migrations'),
  'api-versioning': () => loadRulesFromJson('api-versioning'),
};

// Framework-specific loaders
const FRAMEWORK_LOADERS: Record<string, RuleLoader> = {
  react: () => loadRulesFromJson('react'),
  nextjs: () => loadRulesFromJson('nextjs'),
  express: () => loadRulesFromJson('express'),
  vue: () => loadRulesFromJson('vue'),
  nuxt: () => loadRulesFromJson('nuxt'),
  svelte: () => loadRulesFromJson('svelte'),
  remix: () => loadRulesFromJson('remix'),
  astro: () => loadRulesFromJson('astro'),
  solidjs: () => loadRulesFromJson('solidjs'),
  fastify: () => loadRulesFromJson('fastify'),
  trpc: () => loadRulesFromJson('trpc'),
  angular: () => loadRulesFromJson('angular'),
};

/**
 * Determine which categories to load based on options
 */
function getCategoriesToLoad(options: CliOptions): string[] {
  // If specific category requested, only load that
  if (options.security) return ['security'];
  if (options.architecture) return ['architecture'];
  if (options.performance) return ['performance'];
  if (options.testing) return ['testing'];

  // Otherwise load all core categories (not framework-specific)
  return Object.keys(CATEGORY_LOADERS);
}

/**
 * Determine which frameworks to load based on framework
 */
function getFrameworksToLoad(framework: Framework): string[] {
  if (framework === 'nodejs' || framework === 'library') {
    return [];
  }
  return [framework];
}

export class RuleRegistry {
  // Cache loaded rules by category/framework for reuse
  private categoryCache: Map<string, DetectionRule[]> = new Map();

  constructor() {
    // Don't load rules at construction time - lazy load on first access
  }

  /**
   * Load rules for a specific category (with caching)
   */
  private loadCategory(category: string): DetectionRule[] {
    if (this.categoryCache.has(category)) {
      return this.categoryCache.get(category)!;
    }

    const loader = CATEGORY_LOADERS[category];
    if (!loader) {
      return [];
    }

    try {
      const rules = loader();
      this.categoryCache.set(category, rules);
      return rules;
    } catch {
      return [];
    }
  }

  /**
   * Load rules for a specific framework (with caching)
   */
  private loadFramework(framework: string): DetectionRule[] {
    const cacheKey = `fw:${framework}`;
    if (this.categoryCache.has(cacheKey)) {
      return this.categoryCache.get(cacheKey)!;
    }

    const loader = FRAMEWORK_LOADERS[framework];
    if (!loader) {
      return [];
    }

    try {
      const rules = loader();
      this.categoryCache.set(cacheKey, rules);
      return rules;
    } catch {
      return [];
    }
  }

  /**
   * Load all rules (used for getAllRules)
   */
  private loadAllRules(): DetectionRule[] {
    const allRules: DetectionRule[] = [];

    // Load all categories
    for (const category of Object.keys(CATEGORY_LOADERS)) {
      allRules.push(...this.loadCategory(category));
    }

    // Load all frameworks
    for (const framework of Object.keys(FRAMEWORK_LOADERS)) {
      allRules.push(...this.loadFramework(framework));
    }

    return allRules;
  }

  getRulesForFramework(framework: Framework, options: CliOptions): DetectionRule[] {
    const categories = getCategoriesToLoad(options);
    const frameworks = getFrameworksToLoad(framework);

    // Load only the categories and frameworks needed
    let filtered: DetectionRule[] = [];

    for (const category of categories) {
      filtered.push(...this.loadCategory(category));
    }

    for (const fw of frameworks) {
      filtered.push(...this.loadFramework(fw));
    }

    // Filter by framework applicability
    if (framework !== 'nodejs') {
      filtered = filtered.filter(
        r => r.frameworks.length === 0 || r.frameworks.includes(framework)
      );
    }

    // Lite mode = fewer rules
    if (options.lite) {
      // Only critical and high severity
      filtered = filtered.filter(r =>
        r.severity === 'critical' || r.severity === 'high'
      );
    }

    return filtered;
  }

  getAllRules(): DetectionRule[] {
    return this.loadAllRules();
  }

  /**
   * Get all unique file extensions that rules care about
   * Used for pre-filtering files during scanning
   */
  getRelevantExtensions(framework: Framework, options: CliOptions): Set<string> {
    const rules = this.getRulesForFramework(framework, options);
    const extensions = new Set<string>();

    for (const rule of rules) {
      // Check if rule has fileExtensions property (JsonRule has this)
      if ('rule' in rule && rule.rule) {
        const ruleDef = rule.rule as RuleDefinition;
        if (ruleDef.fileExtensions && ruleDef.fileExtensions.length > 0) {
          for (const ext of ruleDef.fileExtensions) {
            extensions.add(ext);
          }
        }
        // Also check individual patterns
        if (ruleDef.patterns) {
          for (const pattern of ruleDef.patterns) {
            if (pattern.fileExtensions && pattern.fileExtensions.length > 0) {
              for (const ext of pattern.fileExtensions) {
                extensions.add(ext);
              }
            }
          }
        }
      }
    }

    // If no specific extensions, return all common source extensions
    if (extensions.size === 0) {
      return new Set(['.ts', '.tsx', '.js', '.jsx', '.vue', '.svelte', '.astro', '.json', '.md']);
    }

    return extensions;
  }
}
