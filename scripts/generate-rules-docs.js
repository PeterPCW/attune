#!/usr/bin/env node
/**
 * Generates API documentation for all rules
 * Outputs JSON and Markdown documentation
 *
 * Usage: node scripts/generate-rules-docs.js
 */

import { readdirSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const RULES_DIR = join(process.cwd(), 'src/rules/functions');
const OUTPUT_DIR = join(process.cwd(), 'docs');

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

function generateDocs() {
  const jsonFiles = findJsonFiles(RULES_DIR);
  const rules = [];
  const categories = {};
  const severities = { critical: 0, high: 0, medium: 0, low: 0, info: 0 };

  for (const file of jsonFiles) {
    try {
      const content = readFileSync(file, 'utf-8');
      const data = JSON.parse(content);

      // Support both 'rules' (legacy) and 'functions' (current) formats
      const ruleArray = data.functions || data.rules || [];

      for (const rule of ruleArray) {
        const fileName = file.split('/').pop().replace('.json', '');

        // Get severity from action or rule directly
        const severity = rule.action?.severity || rule.severity || 'medium';

        rules.push({
          id: rule.id,
          name: rule.name,
          category: rule.category,
          severity: severity,
          frameworks: rule.frameworks || [],
          description: rule.description || rule.recommendation?.description || '',
          title: rule.recommendation?.title || rule.name || '',
          library: rule.recommendation?.library || '',
          catches: rule.catches || [],
          fix: rule.fix || [],
          // Get file extensions from condition
          fileExtensions: rule.condition?.fileExtensions || [],
          hasCondition: !!rule.condition,
          sourceFile: fileName
        });

        categories[rule.category] = (categories[rule.category] || 0) + 1;
        severities[severity] = (severities[severity] || 0) + 1;
      }
    } catch (e) {
      console.error(`Error parsing ${file}: ${e.message}`);
    }
  }

  return { rules, categories, severities, total: rules.length };
}

function generateMarkdown(docs) {
  let md = `# Attune Rules API Documentation

This document provides comprehensive details about all rules in Attune.

## Summary

- **Total Rules**: ${docs.total}
- **Categories**: ${Object.keys(docs.categories).length}

### By Severity

| Severity | Count |
|----------|-------|
| Critical | ${docs.severities.critical || 0} |
| High | ${docs.severities.high || 0} |
| Medium | ${docs.severities.medium || 0} |
| Low | ${docs.severities.low || 0} |
| Info | ${docs.severities.info || 0} |

### By Category

| Category | Rules |
|----------|-------|
${Object.entries(docs.categories).sort((a,b) => b[1] - a[1]).map(([cat, count]) => `| ${cat} | ${count} |`).join('\n')}

---

## Rules Reference

`;

  // Group by category
  const byCategory = {};
  for (const rule of docs.rules) {
    if (!byCategory[rule.category]) byCategory[rule.category] = [];
    byCategory[rule.category].push(rule);
  }

  for (const [category, categoryRules] of Object.entries(byCategory).sort((a,b) => a[0].localeCompare(b[0]))) {
    md += `## ${category.charAt(0).toUpperCase() + category.slice(1)}\n\n`;

    for (const rule of categoryRules.sort((a,b) => a.id.localeCompare(b.id))) {
      md += `### ${rule.id}: ${rule.name}

**Severity**: ${rule.severity.toUpperCase()} | **Category**: ${rule.category}

${rule.description}

${rule.catches && rule.catches.length > 0 ? `**What it catches:**\n${rule.catches.map(c => `- ${c}`).join('\n')}\n` : ''}
${rule.fix && rule.fix.length > 0 ? `**How to fix:**\n${rule.fix.map(f => `- ${f}`).join('\n')}\n` : ''}
**Recommendation**: ${rule.title}
${rule.library ? `**Library**: ${rule.library}` : ''}

**Applies to**: ${rule.frameworks.length > 0 ? rule.frameworks.join(', ') : 'All frameworks'}
${rule.fileExtensions.length > 0 ? `**File Extensions**: ${[...new Set(rule.fileExtensions)].join(', ')}` : ''}

**Source**: \`src/rules/functions/${rule.sourceFile}.json\`

---

`;
    }
  }

  return md;
}

function generateJson(docs) {
  return JSON.stringify({
    version: '1.0.0',
    generated: new Date().toISOString(),
    summary: {
      total: docs.total,
      categories: Object.keys(docs.categories).length,
      severities: docs.severities
    },
    rules: docs.rules
  }, null, 2);
}

// Main
console.log('Generating rules documentation...');

const docs = generateDocs();

// Write JSON
writeFileSync(join(OUTPUT_DIR, 'rules.json'), generateJson(docs));
console.log(`  ✓ docs/rules.json`);

// Write Markdown
writeFileSync(join(OUTPUT_DIR, 'RULES.md'), generateMarkdown(docs));
console.log(`  ✓ docs/RULES.md`);

console.log(`\nGenerated documentation for ${docs.total} rules in ${Object.keys(docs.categories).length} categories`);
