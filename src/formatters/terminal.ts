import chalk from 'chalk';
import { Finding, ScanMetadata } from '../types/index.js';

export function formatTerminal(findings: Finding[], metadata: ScanMetadata): string {
  const critical = findings.filter(f => f.severity === 'critical');
  const high = findings.filter(f => f.severity === 'high');
  const medium = findings.filter(f => f.severity === 'medium');
  const low = findings.filter(f => f.severity === 'low');
  const info = findings.filter(f => f.severity === 'info');

  let output = `📊 Attune ${metadata.full ? 'Full' : 'Lite'} Report\n`;
  output += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;

  output += `Project: ${metadata.projectRoot}\n`;
  output += `Framework: ${metadata.framework}\n`;
  output += `Scan Time: ${(metadata.scanTime / 1000).toFixed(1)}s\n`;
  output += `Files Scanned: ${metadata.filesScanned}\n`;
  if (metadata.rulesRun > 0) {
    output += `Rules Checked: ${metadata.rulesRun}\n`;
  }
  output += '\n';

  if (critical.length > 0) {
    output += chalk.red(`🔴 Critical Issues (${critical.length})\n`);
    for (const f of critical.slice(0, 10)) {
      output += `   • ${f.ruleId}: ${f.file}${f.line ? `:${f.line}` : ''}\n`;
    }
    if (critical.length > 10) {
      output += `   ... and ${critical.length - 10} more\n`;
    }
    output += '\n';
  }

  if (high.length > 0) {
    output += chalk.yellow(`🟡 High Issues (${high.length})\n`);
    for (const f of high.slice(0, 10)) {
      output += `   • ${f.ruleId}: ${f.file}${f.line ? `:${f.line}` : ''}\n`;
    }
    if (high.length > 10) {
      output += `   ... and ${high.length - 10} more\n`;
    }
    output += '\n';
  }

  if (medium.length > 0) {
    output += chalk.blue(`🔵 Medium Issues (${medium.length})\n`);
    output += '\n';
  }

  if (low.length + info.length > 0) {
    output += chalk.gray(`ℹ️ Low/Info (${low.length + info.length})\n`);
    output += '\n';
  }

  if (findings.length === 0) {
    output += chalk.green('✅ No issues found!\n');
  }

  // Full report: show all rules checked
  if (metadata.full && metadata.ruleResults && metadata.ruleResults.length > 0) {
    const passedCount = metadata.ruleResults.filter(r => r.passed).length;
    const failedCount = metadata.ruleResults.filter(r => !r.passed).length;

    output += '\n';
    output += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
    output += `📋 All Rules Checked (${metadata.ruleResults.length})\n`;
    output += `   ${chalk.green('✓ Passed')}: ${passedCount}\n`;
    output += `   ${chalk.red('✗ Failed')}: ${failedCount}\n\n`;

    // Group by category
    const byCategory: Record<string, typeof metadata.ruleResults> = {};
    for (const rule of metadata.ruleResults) {
      if (!byCategory[rule.category]) {
        byCategory[rule.category] = [];
      }
      byCategory[rule.category].push(rule);
    }

    for (const [category, rules] of Object.entries(byCategory)) {
      const passed = rules.filter(r => r.passed).length;
      const failed = rules.filter(r => !r.passed).length;
      output += `${category}:\n`;
      output += `   ${chalk.green('✓')} ${passed} passed`;
      if (failed > 0) {
        output += `, ${chalk.red('✗')} ${failed} failed`;
      }
      output += '\n';
    }
  }

  return output;
}
