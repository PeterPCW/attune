#!/usr/bin/env node
/**
 * Lists all rules with fileExtensions filtering
 * Useful for maintaining which rules are gated by file type
 *
 * Usage: node scripts/list-extension-rules.js
 */

import { readdirSync, readFileSync } from 'fs';
import { join, relative } from 'path';

const RULES_DIR = join(process.cwd(), 'src/rules/data');

function findJsonFiles(dir) {
  const files = readdirSync(dir, { withFileTypes: true });
  let jsonFiles = [];

  for (const file of files) {
    const fullPath = join(dir, file.name);
    if (file.isDirectory()) {
      jsonFiles = jsonFiles.concat(findJsonFiles(fullPath));
    } else if (file.name.endsWith('.json')) {
      jsonFiles.push(fullPath);
    }
  }

  return jsonFiles;
}

function findExtensionGatedRules() {
  const jsonFiles = findJsonFiles(RULES_DIR);
  const rules = [];

  for (const file of jsonFiles) {
    const content = readFileSync(file, 'utf-8');
    const data = JSON.parse(content);

    if (data.rules) {
      for (const rule of data.rules) {
        // Check if rule has patterns with fileExtensions
        if (rule.patterns) {
          for (const pattern of rule.patterns) {
            if (pattern.fileExtensions) {
              rules.push({
                id: rule.id,
                file: relative(process.cwd(), file),
                extensions: pattern.fileExtensions,
                category: rule.category,
                severity: rule.severity
              });
              break; // Only list rule once even if multiple patterns
            }
          }
        }
      }
    }
  }

  return rules;
}

function findFrameworkGatedRules() {
  const jsonFiles = findJsonFiles(RULES_DIR);
  const rules = [];

  for (const file of jsonFiles) {
    const content = readFileSync(file, 'utf-8');
    const data = JSON.parse(content);

    if (data.rules) {
      for (const rule of data.rules) {
        // Check if rule has frameworks specified (and not empty)
        if (rule.frameworks && rule.frameworks.length > 0) {
          rules.push({
            id: rule.id,
            file: relative(process.cwd(), file),
            frameworks: rule.frameworks,
            category: rule.category,
            severity: rule.severity
          });
        }
      }
    }
  }

  return rules;
}

// Main
const extensionRules = findExtensionGatedRules();
const frameworkRules = findFrameworkGatedRules();

console.log('# Extension-Gated Rules\n');
console.log('| Rule ID | Category | Severity | Extensions | File |');
console.log('|---------|----------|----------|------------|------|');
for (const rule of extensionRules) {
  console.log(`| ${rule.id} | ${rule.category} | ${rule.severity} | ${rule.extensions.join(', ')} | ${rule.file} |`);
}

console.log('\n# Framework-Gated Rules\n');
console.log('| Rule ID | Category | Severity | Frameworks | File |');
console.log('|---------|----------|----------|-----------|------|');
for (const rule of frameworkRules) {
  console.log(`| ${rule.id} | ${rule.category} | ${rule.severity} | ${rule.frameworks.join(', ')} | ${rule.file} |`);
}

console.log(`\nTotal: ${extensionRules.length} extension-gated, ${frameworkRules.length} framework-gated rules`);
