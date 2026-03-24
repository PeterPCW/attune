/**
 * Engine Wrapper for json-function-engine v0.9.0
 *
 * This provides the interface between attune's rule system and json-function-engine.
 * Now uses the updated schema with metadata fields (category, recommendation, catches, fix),
 * multiple conditions, exclude patterns, and custom findings.
 */

import {
  Engine,
  FunctionDefinition,
  Finding as EngineFinding,
  createDefaultLogger,
  createSilentLogger,
  FileLoader,
} from 'json-function-engine';

import { DetectionRule, AnalysisContext, Finding, SourceFile, Framework } from '../types/index.js';
import { helperRegistry } from './helpers/index.js';
import { IHelperRegistry, DefaultHelperRegistry } from './helpers/registry.js';

// Re-export types we'll need
export interface AttuneFunctionConfig {
  version: string;
  functions: FunctionDefinition[];
}

export interface EngineWrapperOptions {
  logger?: 'default' | 'silent' | 'verbose';
  cwd?: string;
  /** Optional helper registry for dependency injection (defaults to built-in) */
  helperRegistry?: IHelperRegistry;
}

/**
 * Create an Engine instance configured for attune
 */
export function createEngine(options: EngineWrapperOptions = {}): Engine {
  const logger = options.logger === 'silent'
    ? createSilentLogger()
    : options.logger === 'verbose'
      ? createDefaultLogger()
      : createSilentLogger();

  return new Engine({
    logger,
    cwd: options.cwd || process.cwd(),
    skipValidation: true,
    skipRegexValidation: true,
    // Enable streaming for large files - processes line by line to reduce memory
    streaming: true,
    streamingThreshold: 1024 * 1024, // 1MB threshold
  });
}

/**
 * Wrapper class that provides attune-compatible interface to json-function-engine
 */
export class AttuneEngineWrapper {
  private engine: Engine;
  private rules: DetectionRule[] = [];
  private helperRegistry: IHelperRegistry;

  constructor(options: EngineWrapperOptions = {}) {
    this.engine = createEngine(options);
    // Use injected helper registry or default to built-in helpers
    this.helperRegistry = options.helperRegistry || new DefaultHelperRegistry(helperRegistry as Record<string, Function>);
    this.registerHelperActions();
  }

  /**
   * Register all current attune helpers as custom actions in the engine
   * Also registers a special flag action that delegates to helpers when needed
   */
  private registerHelperActions(): void {
    const registry = this.engine.getRegistry();

    // Register each helper as a custom action using the helper registry
    for (const name of this.helperRegistry.keys()) {
      const fn = this.helperRegistry.get(name);
      if (!fn) continue;

      registry.registerAction(name, {
        name,
        execute: async (config, context, _matches, _file) => {
          // Convert engine context to attune context
          const attuneContext = this.toAttuneContext(context);

          // Extract params from the config (action config contains params)
          const params = (config as Record<string, unknown>).params || {};

          try {
            const findings = fn(attuneContext, params) as Finding[];

            return {
              success: findings.length > 0,
              findings: findings.map(f => this.toEngineFinding(f)),
            };
          } catch (error) {
            console.warn(`Helper ${name} failed:`, error);
            return { success: false, findings: [] };
          }
        },
      });
    }

    // Also register a custom flag action that delegates to helpers based on helper field
    registry.registerAction('helper-flag', {
      name: 'helper-flag',
      execute: async (config, context, _matches, _file) => {
        const actionConfig = config as Record<string, unknown>;
        const helperName = actionConfig.helper as string;
        const params = actionConfig.params as Record<string, unknown> || {};

        if (!helperName) {
          // No helper specified, just use the message
          return { success: false, findings: [] };
        }

        const helperFn = this.helperRegistry.get(helperName);
        if (!helperFn) {
          console.warn(`Unknown helper: ${helperName}`);
          return { success: false, findings: [] };
        }

        // Convert engine context to attune context
        const attuneContext = this.toAttuneContext(context);

        try {
          const findings = helperFn(attuneContext, params) as Finding[];

          return {
            success: findings.length > 0,
            findings: findings.map(f => this.toEngineFinding(f)),
          };
        } catch (error) {
          console.warn(`Helper ${helperName} failed:`, error);
          return { success: false, findings: [] };
        }
      },
    });
  }

  /**
   * Convert engine context to attune AnalysisContext
   */
  private toAttuneContext(context: Record<string, unknown>): AnalysisContext {
    // Extract files from engine context
    const files = (context.files as Array<{ path: string; content: string }>)?.map(f => ({
      path: f.path,
      content: f.content,
    })) || [];

    return {
      files,
      framework: (context.framework as Framework) || 'nodejs',
      projectType: (context.projectType as string) || undefined,
      options: (context.options as Record<string, unknown>) || {},
    };
  }

  /**
   * Convert attune Finding to engine Finding
   */
  private toEngineFinding(finding: Finding): EngineFinding {
    return {
      functionId: finding.ruleId || finding.id,
      severity: finding.severity,
      category: finding.category || '',
      message: finding.message,
      location: {
        file: finding.file,
        line: finding.line,
      },
      code: finding.code,
      recommendation: finding.recommendation,
    };
  }

  /**
   * Convert engine Finding to attune Finding
   */
  private toAttuneFinding(finding: EngineFinding): Finding {
    return {
      id: finding.functionId,
      ruleId: finding.functionId,
      severity: finding.severity,
      category: finding.category || '',
      file: finding.location.file,
      line: finding.location.line,
      message: finding.message,
      code: finding.code || '',
      recommendation: finding.recommendation,
    };
  }

  /**
   * Load functions from JSON file(s) using FileLoader
   * Supports glob patterns
   */
  async loadFunctions(patterns: string | string[]): Promise<void> {
    // Use the engine's loadFunctions method which properly adds them
    // skipValidation allows loading rules with complex regex patterns
    const result = await this.engine.loadFunctions(patterns, { skipValidation: true } as any);
    // Only log if there are errors or verbose
    if (result.errors.length > 0) {
      console.log(`Loaded ${result.loaded} functions, ${result.errors.length} errors`);
      for (const err of result.errors) {
        console.warn(`  Error: ${err}`);
      }
    }
  }

  /**
   * Add functions directly from config object
   */
  addFunctions(config: AttuneFunctionConfig): void {
    this.engine.addFunctions(config.functions);
  }

  /**
   * Get the file loader for configuration
   */
  getFileLoader(): FileLoader {
    return this.engine.getFileLoader();
  }

  /**
   * Execute the engine against files
   */
  async execute(files: SourceFile[], context?: Partial<AnalysisContext>): Promise<Finding[]> {
    // Convert attune SourceFile to engine format
    const engineFiles = files.map(f => ({
      path: f.path,
      content: f.content,
    }));

    // Execute - returns Finding[] directly in v0.9.0
    const findings = await this.engine.execute(engineFiles, {
      framework: context?.framework || 'nodejs',
      projectType: context?.projectType,
      options: context?.options,
    } as any);

    // Convert engine findings back to attune format
    return findings.map(f => this.toAttuneFinding(f));
  }

  /**
   * Get the underlying engine for direct access if needed
   */
  getEngine(): Engine {
    return this.engine;
  }

  /**
   * Get registry for adding custom conditions/actions
   */
  getRegistry() {
    return this.engine.getRegistry();
  }

  /**
   * Get all loaded functions
   */
  getFunctions(): FunctionDefinition[] {
    return this.engine.getFunctions();
  }

  /**
   * Get count of loaded functions
   */
  getFunctionCount(): number {
    return this.engine.getFunctionCount();
  }

  /**
   * Clear all functions
   */
  clear(): void {
    this.engine.clear();
  }
}
