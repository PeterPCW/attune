#!/usr/bin/env node
/**
 * Search rules by keywords
 * Helps contributors find existing rules and understand patterns
 *
 * Usage:
 *   node scripts/find-rules.js "react"           # Search all fields
 *   node scripts/find-rules.js "security sql"    # Multiple keywords
 *   node scripts/find-rules.js --category "performance"
 *   node scripts/find-rules.js --severity "high"
 *   node scripts/find-rules.js --id "REACT"
 */

import { readdirSync, readFileSync } from 'fs';
import { join, relative } from 'path';

const RULES_DIR = join(process.cwd(), 'src/rules/data');

// Parse command line args
const args = process.argv.slice(2);
const options = {
  category: null,
  severity: null,
  id: null,
  keywords: []
};

for (let i = 0; i < args.length; i++) {
  const arg = args[i];
  if (arg === '--category' && i + 1 < args.length) {
    options.category = args[++i];
  } else if (arg === '--severity' && i + 1 < args.length) {
    options.severity = args[++i];
  } else if (arg === '--id' && i + 1 < args.length) {
    options.id = args[++i];
  } else if (!arg.startsWith('--')) {
    options.keywords.push(arg.toLowerCase());
  }
}

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

function searchRules() {
  const jsonFiles = findJsonFiles(RULES_DIR);
  const results = [];

  for (const file of jsonFiles) {
    const content = readFileSync(file, 'utf-8');
    const data = JSON.parse(content);

    if (data.rules) {
      for (const rule of data.rules) {
        const match = evaluateRule(rule);
        if (match) {
          results.push({
            ...match,
            file: relative(process.cwd(), file)
          });
        }
      }
    }
  }

  return results;
}

function evaluateRule(rule) {
  // Filter by specific ID
  if (options.id) {
    if (!rule.id.toLowerCase().includes(options.id.toLowerCase())) {
      return null;
    }
  }

  // Filter by category
  if (options.category) {
    if (rule.category.toLowerCase() !== options.category.toLowerCase()) {
      return null;
    }
  }

  // Filter by severity
  if (options.severity) {
    if (rule.severity.toLowerCase() !== options.severity.toLowerCase()) {
      return null;
    }
  }

  // Filter by keywords
  if (options.keywords.length > 0) {
    const ruleText = JSON.stringify(rule).toLowerCase();
    const hasAllKeywords = options.keywords.every(kw => ruleText.includes(kw));
    if (!hasAllKeywords) {
      return null;
    }
  }

  // Return matched fields for display
  const matchedFields = [];
  if (options.keywords.length > 0) {
    for (const kw of options.keywords) {
      if (rule.id.toLowerCase().includes(kw)) matchedFields.push('id');
      if (rule.name?.toLowerCase().includes(kw)) matchedFields.push('name');
      if (rule.category?.toLowerCase().includes(kw)) matchedFields.push('category');
      if (rule.recommendation?.title?.toLowerCase().includes(kw)) matchedFields.push('recommendation.title');
      if (rule.recommendation?.description?.toLowerCase().includes(kw)) matchedFields.push('recommendation.description');

      // Check patterns
      if (rule.patterns) {
        for (const p of rule.patterns) {
          if (p.pattern?.toLowerCase().includes(kw)) matchedFields.push('pattern');
          if (p.message?.toLowerCase().includes(kw)) matchedFields.push('message');
        }
      }
    }
  }

  return {
    rule,
    matchedFields: [...new Set(matchedFields)]
  };
}

function formatRule(match) {
  const { rule, matchedFields } = match;

  console.log('\n' + '='.repeat(60));
  console.log(`Rule: ${rule.id}`);
  console.log('='.repeat(60));
  console.log(`Name:       ${rule.name}`);
  console.log(`Category:   ${rule.category}`);
  console.log(`Severity:   ${rule.severity}`);
  console.log(`Frameworks: ${rule.frameworks?.join(', ') || '(all)'}`);

  if (rule.recommendation) {
    console.log(`\nRecommendation:`);
    console.log(`  Title:       ${rule.recommendation.title}`);
    console.log(`  Description: ${rule.recommendation.description}`);
    if (rule.recommendation.library) {
      console.log(`  Library:     ${rule.recommendation.library}`);
    }
  }

  if (rule.patterns && rule.patterns.length > 0) {
    console.log(`\nPatterns:`);
    for (const p of rule.patterns) {
      console.log(`  - Type: ${p.type}`);
      console.log(`    Pattern: ${p.pattern}`);
      if (p.message) console.log(`    Message: ${p.message}`);
      if (p.fileExtensions) console.log(`    Extensions: ${p.fileExtensions.join(', ')}`);
      if (p.excludePatterns) console.log(`    Excludes: ${p.excludePatterns.join(', ')}`);
    }
  }

  if (rule.helpers && rule.helpers.length > 0) {
    console.log(`\nHelpers:`);
    for (const h of rule.helpers) {
      console.log(`  - ${h.name}`);
      console.log(`    Params: ${JSON.stringify(h.params)}`);
    }
  }

  console.log(`\nFile: ${match.file}`);

  if (matchedFields.length > 0) {
    console.log(`Matched in: ${matchedFields.join(', ')}`);
  }
}

// Main
const results = searchRules();

if (results.length === 0) {
  console.log('No rules found matching your criteria.');
  console.log('\nUsage:');
  console.log('  node scripts/find-rules.js "keyword"       # Search all fields');
  console.log('  node scripts/find-rules.js --category "security"');
  console.log('  node scripts/find-rules.js --severity "high"');
  console.log('  node scripts/find-rules.js --id "REACT"');
  console.log('\nExamples:');
  console.log('  node scripts/find-rules.js "react"');
  console.log('  node scripts/find-rules.js "sql injection"');
  console.log('  node scripts/find-rules.js --category "performance"');
  process.exit(0);
}

console.log(`\nFound ${results.length} rule(s)\n`);

for (const match of results) {
  formatRule(match);
}

console.log('\n' + '='.repeat(60));
console.log(`Total: ${results.length} rules found`);
