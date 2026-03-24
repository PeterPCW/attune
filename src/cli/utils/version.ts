/**
 * Version management
 * Single source of truth for Attune version
 */

import packageJson from '../../../package.json';

export const ATTUNE_VERSION = packageJson.version;

/**
 * Get version for display
 */
export function getVersion(): string {
  return ATTUNE_VERSION;
}
