/**
 * Helper Registry Interface
 *
 * Defines the contract for helper functions that can be called by rules.
 * Using an interface enables dependency injection for better testability.
 */

import { Finding, AnalysisContext } from '../../types/index.js';

export type HelperFunction = (context: AnalysisContext, params: unknown) => Finding[];

export interface IHelperRegistry {
  /**
   * Get a helper function by name
   * @param name - The helper function name
   * @returns The helper function, or undefined if not found
   */
  get(name: string): HelperFunction | undefined;

  /**
   * Check if a helper exists
   * @param name - The helper function name
   * @returns true if the helper exists
   */
  has(name: string): boolean;

  /**
   * Get all helper names
   * @returns Array of helper names
   */
  keys(): string[];
}

/**
 * Default helper registry implementation
 * Wraps the static helperRegistry with the interface
 */
export class DefaultHelperRegistry implements IHelperRegistry {
  constructor(private helpers: Record<string, HelperFunction>) {}

  get(name: string): HelperFunction | undefined {
    return this.helpers[name];
  }

  has(name: string): boolean {
    return name in this.helpers;
  }

  keys(): string[] {
    return Object.keys(this.helpers);
  }
}
