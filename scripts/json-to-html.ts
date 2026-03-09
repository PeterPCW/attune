#!/usr/bin/env node

/**
 * Convert Attune JSON report to Full HTML
 *
 * Usage:
 *   node scripts/json-to-full-html.js report.json
 *   node scripts/json-to-full-html.js report.json -o report.html
 *   cat report.json | node scripts/json-to-full-html.js
 *
 * This version includes all rules section even if JSON doesn't have ruleResults
 * (will show as "No rule data available" if missing)
 */

import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname, basename } from 'path';
import { fileURLToPath } from 'url';

// Load shared CSS from formatters
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const REPORT_CSS = readFileSync(resolve(__dirname, '../src/formatters/report-styles.ts'), 'utf-8')
  .replace(/^.*const REPORT_CSS = `\n?/, '')
  .replace(/`;.*$/s, '')
  .replace(/^/gm, '    ');

interface Finding {
  id: string;
  ruleId: string;
  severity: string;
  category: string;
  file: string;
  line?: number;
  message: string;
  code?: string;
  recommendation?: {
    title: string;
    description: string;
    library?: string;
  };
}

interface RuleResult {
  id: string;
  name: string;
  category: string;
  severity: string;
  passed: boolean;
  findingsCount: number;
}

interface Metadata {
  projectRoot: string;
  framework: string;
  scanTime: number;
  filesScanned: number;
  rulesRun?: number;
  full?: boolean;
  ruleResults?: RuleResult[];
}

interface Report {
  version: string;
  metadata: Metadata;
  summary: {
    critical: number;
    high: number;
    medium: number;
    low: number;
    info: number;
    total: number;
  };
  findings: Finding[];
  ruleResults?: RuleResult[]; // Also check at root level for older JSONs
}

function generateHtml(report: Report): string {
  const { metadata, summary, findings } = report;

  const total = summary.total;
  const score = total === 0 ? 100 : Math.max(0, 100 - (summary.critical * 10 + summary.high * 5 + summary.medium * 2 + summary.low * 1));

  const severityColors: Record<string, string> = {
    critical: 'var(--severity-critical)',
    high: 'var(--severity-high)',
    medium: 'var(--severity-medium)',
    low: 'var(--severity-low)',
    info: 'var(--severity-info)'
  };

  // Sort findings by severity
  const severityOrder: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3, info: 4 };
  const sortedFindings = [...findings].sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

  // Category breakdown
  const byCategory: Record<string, number> = {};
  for (const f of findings) {
    byCategory[f.category] = (byCategory[f.category] || 0) + 1;
  }
  const categoryBadges = Object.entries(byCategory).map(([cat, count]) =>
    `<span class="category-badge">${cat} (${count})</span>`
  ).join('');

  // Pie chart (only if not perfect score)
  let pieChart = '';
  if (total > 0) {
    const severityCounts = [
      { label: 'Critical', count: summary.critical, color: severityColors.critical },
      { label: 'High', count: summary.high, color: severityColors.high },
      { label: 'Medium', count: summary.medium, color: severityColors.medium },
      { label: 'Low', count: summary.low, color: severityColors.low },
      { label: 'Info', count: summary.info, color: severityColors.info }
    ].filter(s => s.count > 0);

    let cumulativePercent = 0;
    const segments = severityCounts.map(severity => {
      const percent = (severity.count / total) * 100;
      const startAngle = cumulativePercent * 3.6;
      cumulativePercent += percent;
      const endAngle = cumulativePercent * 3.6;

      if (severityCounts.length === 1) {
        return `<circle cx="50" cy="50" r="40" fill="${severity.color}" />`;
      }

      const start = polarToCartesian(50, 50, 40, endAngle - 0.1);
      const end = polarToCartesian(50, 50, 40, startAngle + 0.1);
      const largeArc = percent > 50 ? 1 : 0;

      const path = `M 50 50 L ${start.x} ${start.y} A 40 40 0 ${largeArc} 0 ${end.x} ${end.y} Z`;
      return `<path d="${path}" fill="${severity.color}" />`;
    }).join('');

    pieChart = `
      <div class="pie-container">
        <svg viewBox="0 0 100 100" class="pie-chart">
          ${segments}
        </svg>
      </div>
    `;
  }

  function polarToCartesian(cx: number, cy: number, r: number, angle: number) {
    const rad = (angle - 90) * Math.PI / 180;
    return {
      x: cx + r * Math.cos(rad),
      y: cy + r * Math.sin(rad)
    };
  }

  // Score circle
  let scoreVisual = '';
  if (score === 100 && total === 0) {
    scoreVisual = `
      <div class="score-circle perfect-score">
        <div class="perfect-badge">
          <div class="perfect-icon">&#10003;</div>
          <div class="perfect-label">ALL CLEAR</div>
        </div>
      </div>
    `;
  } else {
    scoreVisual = `
      <div class="score-circle">
        <svg viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="45" fill="none" stroke="var(--border)" stroke-width="8" />
          <circle cx="50" cy="50" r="45" fill="none" stroke="${score > 70 ? 'var(--severity-low)' : score > 40 ? 'var(--severity-high)' : 'var(--severity-critical)'}" stroke-width="8"
            stroke-dasharray="${score * 2.83} 283" stroke-linecap="round" transform="rotate(-90 50 50)" />
        </svg>
        <div class="score-value">
          <div class="score-number">${score}</div>
          <div class="score-label">Score</div>
        </div>
      </div>
    `;
  }

  // Findings list
  let findingsList = '';
  if (findings.length === 0) {
    findingsList = `<div class="no-findings">No issues found!</div>`;
  } else {
    findingsList = sortedFindings.map(f => `
      <div class="finding-item">
        <div class="finding-header">
          <span class="severity-badge severity-${f.severity}">${f.severity}</span>
          <span class="finding-category">${f.category}</span>
        </div>
        <div class="finding-message">${f.message}</div>
        <div class="finding-location">${f.file}${f.line ? `:${f.line}` : ''}</div>
        ${f.code ? `<div class="finding-code">${escapeHtml(f.code.substring(0, 100))}</div>` : ''}
      </div>
    `).join('');
  }

  // Get ruleResults from metadata or report root (for backward compatibility)
  const ruleResults = metadata.ruleResults || report.ruleResults;

  // Rules section (full report)
  let rulesListSection = '';
  if (ruleResults && ruleResults.length > 0) {
    // Group by category
    const byRuleCategory: Record<string, RuleResult[]> = {};
    for (const rule of ruleResults) {
      if (!byRuleCategory[rule.category]) {
        byRuleCategory[rule.category] = [];
      }
      byRuleCategory[rule.category].push(rule);
    }

    const passedCount = ruleResults.filter(r => r.passed).length;
    const failedCount = ruleResults.filter(r => !r.passed).length;

    const rulesByCategory = Object.entries(byRuleCategory).map(([category, rules]) => {
      const rulesHtml = rules.map(r => `
        <div class="rule-item ${r.passed ? 'passed' : 'failed'}">
          <span class="rule-status">${r.passed ? '✓' : '✗'}</span>
          <span class="rule-name">${r.name}</span>
          <span class="rule-findings">${r.findingsCount > 0 ? `(${r.findingsCount})` : ''}</span>
        </div>
      `).join('');

      return `
        <div class="rules-category">
          <h4>${category} (${rules.length})</h4>
          <div class="rules-list">${rulesHtml}</div>
        </div>
      `;
    }).join('');

    rulesListSection = `
    <div class="rules-section">
      <h3>All Rules Checked (${ruleResults.length})</h3>
      <div class="rules-summary">
        <span class="passed-count">✓ Passed: ${passedCount}</span>
        <span class="failed-count">✗ Failed: ${failedCount}</span>
      </div>
      <div class="rules-by-category">${rulesByCategory}</div>
    </div>
    `;
  } else if (metadata.full || (metadata.rulesRun !== undefined)) {
    // Full scan was run but ruleResults not available (old JSON format)
    rulesListSection = `
    <div class="rules-section">
      <h3>Full Scan Results</h3>
      <div class="rules-summary">
        <span class="info-text">Note: Rule-by-rule results not available in this JSON version</span>
      </div>
      <p style="color: var(--text-secondary); font-size: 13px; margin-top: 12px;">
        This JSON was generated before rule-by-rule tracking was added.
        Re-run with --full --json to get complete rule results.
      </p>
    </div>
    `;
  }

  function escapeHtml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="icon" type="image/png" href="../../assets/attune_favicon.png">
  <title>Attune Scan Report</title>
  ${REPORT_CSS}
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Attune${metadata.full ? ' Full' : ''} Scan Report</h1>
      <div class="subtitle">${metadata.projectRoot}</div>
    </div>

    <div class="score-section">
      ${scoreVisual}
      ${pieChart}
      <div class="stats-row">
        <div class="stat-item">
          <div class="stat-value severity-critical">${summary.critical}</div>
          <div class="stat-label">Critical</div>
        </div>
        <div class="stat-item">
          <div class="stat-value severity-high">${summary.high}</div>
          <div class="stat-label">High</div>
        </div>
        <div class="stat-item">
          <div class="stat-value severity-medium">${summary.medium}</div>
          <div class="stat-label">Medium</div>
        </div>
        <div class="stat-item">
          <div class="stat-value severity-low">${summary.low}</div>
          <div class="stat-label">Low</div>
        </div>
        <div class="stat-item">
          <div class="stat-value severity-info">${summary.info}</div>
          <div class="stat-label">Info</div>
        </div>
      </div>
    </div>

    ${categoryBadges ? `<div class="categories">${categoryBadges}</div>` : ''}

    <div class="findings-section">
      <h2>Findings (${findings.length})</h2>
      ${findingsList}
    </div>

    ${rulesListSection}

    <div class="footer">
      Scanned with Attune v${report.version} | Framework: ${metadata.framework} | ${metadata.scanTime}ms | ${metadata.filesScanned} files
    </div>
  </div>
</body>
</html>`;
}

// Main
const args = process.argv.slice(2);
let inputFile: string | null = null;
let outputFile: string | null = null;

for (let i = 0; i < args.length; i++) {
  if (args[i] === '-o' || args[i] === '--output') {
    outputFile = args[i + 1];
    i++;
  } else if (!args[i].startsWith('-')) {
    inputFile = args[i];
  }
}

// Read input
let jsonContent: string;
if (inputFile) {
  jsonContent = readFileSync(resolve(inputFile), 'utf-8');
} else {
  // Read from stdin
  jsonContent = '';
  process.stdin.on('data', (chunk) => jsonContent += chunk);
  process.stdin.on('end', () => {
    if (!jsonContent) {
      console.error('Usage: node json-to-html.js <input.json> [-o <output.html>]');
      process.exit(1);
    }
    convert(jsonContent);
  });
}

function convert(jsonContent: string) {
  let report: Report;

  // Handle files that have terminal output mixed with JSON
  // Find the first { and parse from there
  let jsonStr = jsonContent;
  const firstBrace = jsonContent.indexOf('{');
  if (firstBrace > 0) {
    console.log('Note: Found non-JSON content before JSON, extracting...');
    jsonStr = jsonContent.substring(firstBrace);
  }

  try {
    report = JSON.parse(jsonStr);
  } catch (e) {
    console.error('Invalid JSON:', e);
    process.exit(1);
  }

  const html = generateHtml(report);

  if (outputFile) {
    const outputPath = resolve(outputFile);
    writeFileSync(outputPath, html);
    console.log(`HTML report saved to ${outputPath}`);
  } else {
    console.log(html);
  }
}

if (inputFile) {
  convert(jsonContent);
}
