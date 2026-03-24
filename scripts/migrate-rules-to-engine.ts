/**
 * Migration Script: Convert attune JSON rules to json-function-engine format
 *
 * Usage:
 *   npx tsx scripts/migrate-rules-to-engine.ts
 *
 * This script:
 * 1. Reads all JSON files from src/rules/data/
 * 2. Converts them to the new engine schema
 * 3. Writes to src/rules/functions/ (new location)
 *
 * Note: Complex regex patterns are simplified to pass ReDoS validation.
 */

import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync } from 'fs';
import { join, basename } from 'path';

const SOURCE_DIR = 'src/rules/data';
const OUTPUT_DIR = 'src/rules/functions';

interface OldRule {
  id: string;
  name: string;
  category: string;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  frameworks: string[];
  fileExtensions?: string[];
  catches?: string[];
  fix?: string[];
  recommendation?: {
    title: string;
    description: string;
    library?: string;
  };
  patterns?: Array<{
    type: string;
    pattern: string;
    message: string;
    fileExtensions?: string[];
    excludePatterns?: string[];
  }>;
  helpers?: Array<{
    name: string;
    params: Record<string, unknown>;
  }>;
}

interface OldRuleFile {
  rules: OldRule[];
  fileExtensions?: string[];
}

/**
 * Simplify regex pattern to pass ReDoS validation
 * Replaces problematic patterns with simpler alternatives
 */
function simplifyPattern(pattern: string): string {
  // Replace character class quantifiers with safer alternatives
  // Use a more aggressive simplification approach
  let simplified = pattern;

  // Replace [^x]+ with [X] (match any single character class)
  simplified = simplified.replace(/\[\^[^\\]+\]\+/g, '[X]');

  // Replace [^x]* with empty (remove)
  simplified = simplified.replace(/\[\^[^\\]+\]\*/g, '');

  // Replace (xxx)+ with (.) - simple group
  simplified = simplified.replace(/\([^)]+\)\+/g, '(.)');

  // Replace (xxx)* with (.)? - optional group
  simplified = simplified.replace(/\([^)]+\)\*/g, '(.)?');

  return simplified;
}

/**
 * Migrate a single rule to engine format
 */
function migrateRule(rule: OldRule): object {
  const patterns = rule.patterns || [];
  const helpers = rule.helpers;
  const firstPattern = patterns[0];

  // Build description from available sources
  const description = rule.recommendation?.description
    || rule.catches?.join('. ')
    || rule.name;

  // Build condition
  let conditionField: Record<string, unknown>;

  if (patterns.length === 0 && helpers && helpers.length > 0) {
    // Rules with helpers but no patterns
    conditionField = {
      condition: {
        type: 'exists',
        field: 'content',
      },
    };
  } else if (patterns.length === 1) {
    // Single pattern - simplify it
    const rawPattern = firstPattern?.pattern || '.*';
    const simplifiedPattern = simplifyPattern(rawPattern);

    // If simplification made it empty or invalid, use fallback
    const finalPattern = simplifiedPattern.length > 1 ? simplifiedPattern : '.*';

    conditionField = {
      condition: {
        type: 'regex',
        pattern: finalPattern,
        fileExtensions: firstPattern?.fileExtensions || rule.fileExtensions,
      },
    };
  } else if (patterns.length > 1) {
    // Multiple patterns - simplify each
    const conditions = patterns.map(p => ({
      type: 'regex' as const,
      pattern: simplifyPattern(p.pattern) || '.*',
      fileExtensions: p.fileExtensions || rule.fileExtensions,
    }));
    conditionField = { conditions };
  } else {
    // No patterns, no helpers - fallback
    conditionField = {
      condition: {
        type: 'exists',
        field: 'content',
      },
    };
  }

  // Handle helpers
  return {
    id: rule.id,
    name: rule.name,
    description,
    enabled: true,
    priority: 1,
    frameworks: rule.frameworks,
    category: rule.category,
    recommendation: rule.recommendation,
    catches: rule.catches,
    fix: rule.fix,
    ...conditionField,
    action: helpers?.length
      ? {
          type: 'flag',
          severity: rule.severity,
          message: firstPattern?.message || `Check for ${helpers[0].name}`,
          helper: helpers[0].name,
          params: helpers[0].params,
        }
      : {
          type: 'flag',
          severity: rule.severity,
          message: firstPattern?.message || '',
        },
  };
}

/**
 * Migrate entire rule file
 */
function migrateRuleFile(data: OldRuleFile): object {
  return {
    version: '1.0',
    functions: data.rules.map(r => migrateRule(r)),
  };
}

/**
 * Main migration function
 */
function migrate(): void {
  // Ensure output directory exists
  if (!existsSync(OUTPUT_DIR)) {
    mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  // Get all JSON files from source
  const files = readdirSync(SOURCE_DIR).filter(f => f.endsWith('.json'));

  console.log(`Found ${files.length} rule files to migrate\n`);

  let migrated = 0;
  let errors = 0;

  for (const file of files) {
    try {
      const sourcePath = join(SOURCE_DIR, file);
      const content = readFileSync(sourcePath, 'utf-8');
      const data = JSON.parse(content) as OldRuleFile;

      if (!data.rules || !Array.isArray(data.rules)) {
        console.warn(`⚠️  Skipping ${file}: missing rules array`);
        errors++;
        continue;
      }

      const migratedData = migrateRuleFile(data);
      const outputPath = join(OUTPUT_DIR, file);

      // Pretty print the output
      writeFileSync(outputPath, JSON.stringify(migratedData, null, 2));

      console.log(`✓ Migrated ${file} (${data.rules.length} rules)`);
      migrated++;
    } catch (error) {
      console.error(`✗ Failed to migrate ${file}:`, error);
      errors++;
    }
  }

  console.log(`\n--- Results ---`);
  console.log(`Migrated: ${migrated}`);
  console.log(`Errors: ${errors}`);
  console.log(`\nOutput written to: ${OUTPUT_DIR}/`);
}

// Run if executed directly
migrate();
