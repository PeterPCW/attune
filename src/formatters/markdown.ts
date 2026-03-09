import { Finding, ScanMetadata } from '../types/index.js';

export function formatMarkdown(findings: Finding[], metadata: ScanMetadata): string {
  let output = `# Attune Report\n\n`;
  output += `**Project:** ${metadata.projectRoot}\n`;
  output += `**Framework:** ${metadata.framework}\n`;
  output += `**Scan Time:** ${(metadata.scanTime / 1000).toFixed(1)}s\n`;
  output += `**Files Scanned:** ${metadata.filesScanned}\n\n`;

  const critical = findings.filter(f => f.severity === 'critical');
  const high = findings.filter(f => f.severity === 'high');
  const medium = findings.filter(f => f.severity === 'medium');
  const low = findings.filter(f => f.severity === 'low');

  if (critical.length > 0) {
    output += `## 🔴 Critical (${critical.length})\n\n`;
    for (const f of critical) {
      output += `### ${f.ruleId}\n`;
      output += `- **File:** ${f.file}${f.line ? `:${f.line}` : ''}\n`;
      output += `- **Message:** ${f.message}\n`;
      if (f.code) {
        output += '```\n' + f.code + '\n```\n';
      }
      if (f.recommendation) {
        output += `- **Fix:** ${f.recommendation.description}\n`;
      }
      output += '\n';
    }
  }

  if (high.length > 0) {
    output += `## 🟡 High (${high.length})\n\n`;
    for (const f of high) {
      output += `### ${f.ruleId}\n`;
      output += `- **File:** ${f.file}${f.line ? `:${f.line}` : ''}\n`;
      output += `- **Message:** ${f.message}\n`;
      if (f.recommendation) {
        output += `- **Fix:** ${f.recommendation.description}\n`;
      }
      output += '\n';
    }
  }

  if (medium.length > 0) {
    output += `## 🔵 Medium (${medium.length})\n\n`;
    output += 'See JSON output for details.\n\n';
  }

  if (low.length > 0) {
    output += `## ℹ️ Low (${low.length})\n\n`;
    output += 'See JSON output for details.\n\n';
  }

  if (findings.length === 0) {
    output += '## ✅ No issues found!\n';
  }

  return output;
}
