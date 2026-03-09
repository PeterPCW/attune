import { Finding, ScanMetadata } from '../types/index.js';
import REPORT_CSS from './report-styles.js';

export function formatHtml(findings: Finding[], metadata: ScanMetadata): string {
  const critical = findings.filter(f => f.severity === 'critical');
  const high = findings.filter(f => f.severity === 'high');
  const medium = findings.filter(f => f.severity === 'medium');
  const low = findings.filter(f => f.severity === 'low');
  const info = findings.filter(f => f.severity === 'info');

  const total = findings.length;
  const score = total === 0 ? 100 : Math.max(0, 100 - (critical.length * 10 + high.length * 5 + medium.length * 2 + low.length * 1));

  // Sort findings by severity: critical > high > medium > low > info
  const severityOrder: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3, info: 4 };
  const sortedFindings = [...findings].sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

  // Category breakdown
  const byCategory: Record<string, number> = {};
  for (const f of findings) {
    byCategory[f.category] = (byCategory[f.category] || 0) + 1;
  }

  // Severity colors
  const severityColors: Record<string, string> = {
    critical: 'var(--severity-critical)',
    high: 'var(--severity-high)',
    medium: 'var(--severity-medium)',
    low: 'var(--severity-low)',
    info: 'var(--severity-info)'
  };

  // Check if this is a perfect score (no issues)
  const isPerfectScore = score === 100 && total === 0;

  // Calculate pie chart segments (only if not perfect)
  let pieSegments: { path: string; color: string }[] = [];
  if (!isPerfectScore && total > 0) {
    const severityCounts = [
      { count: critical.length, color: severityColors.critical },
      { count: high.length, color: severityColors.high },
      { count: medium.length, color: severityColors.medium },
      { count: low.length, color: severityColors.low },
      { count: info.length, color: severityColors.info }
    ].filter(s => s.count > 0);

    let cumulativePercent = 0;
    pieSegments = severityCounts.map(severity => {
      const percent = (severity.count / total) * 100;
      const startAngle = cumulativePercent * 3.6;
      cumulativePercent += percent;
      const endAngle = cumulativePercent * 3.6;

      // Handle edge case: single segment or very small segments
      if (severityCounts.length === 1) {
        return { path: '', color: severity.color };
      }

      const start = polarToCartesian(50, 50, 40, endAngle - 0.1);
      const end = polarToCartesian(50, 50, 40, startAngle + 0.1);
      const largeArc = percent > 50 ? 1 : 0;

      const path = `M 50 50 L ${start.x} ${start.y} A 40 40 0 ${largeArc} 0 ${end.x} ${end.y} Z`;
      return { path, color: severity.color };
    });
  }

  function polarToCartesian(cx: number, cy: number, r: number, angle: number) {
    const rad = (angle - 90) * Math.PI / 180;
    return {
      x: cx + r * Math.cos(rad),
      y: cy + r * Math.sin(rad)
    };
  }

  // Generate category badges
  const categoryBadges = Object.entries(byCategory).map(([cat, count]) =>
    `<span class="category-badge">${cat} (${count})</span>`
  ).join('');

  // Generate findings list (limited for display, already sorted by severity)
  const findingsList = sortedFindings.slice(0, 15).map(f => `
    <div class="finding-item severity-${f.severity}">
      <div style="display:flex;justify-content:space-between;align-items:center;">
        <span class="rule-id">${f.ruleId}</span>
        <span class="severity-badge severity-${f.severity}">${f.severity}</span>
      </div>
      <div class="file-path">${f.file}${f.line ? ':' + f.line : ''}</div>
      <div class="message">${f.message}</div>
    </div>
  `).join('');

  // Generate full rules list (for --full mode)
  let rulesListSection = '';
  if (metadata.full && metadata.ruleResults && metadata.ruleResults.length > 0) {
    // Group by category
    const byRuleCategory: Record<string, typeof metadata.ruleResults> = {};
    for (const rule of metadata.ruleResults) {
      if (!byRuleCategory[rule.category]) {
        byRuleCategory[rule.category] = [];
      }
      byRuleCategory[rule.category].push(rule);
    }

    const passedCount = metadata.ruleResults.filter(r => r.passed).length;
    const failedCount = metadata.ruleResults.filter(r => !r.passed).length;

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
      <h3>All Rules Checked (${metadata.ruleResults.length})</h3>
      <div class="rules-summary">
        <span class="passed-count">✓ Passed: ${passedCount}</span>
        <span class="failed-count">✗ Failed: ${failedCount}</span>
      </div>
      <div class="rules-by-category">${rulesByCategory}</div>
    </div>
    `;
  }

  // Check if there are pie segments
  const hasSegments = pieSegments.some(s => s.path);

  // Generate score visualization - always shows score and SCORE label
  let scoreVisual: string;
  scoreVisual = `
    <div class="score-circle">
      <div class="score-value">
        <div class="score-number">${score}</div>
        <div class="score-label">SCORE</div>
      </div>
    </div>
  `;

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
      <h1>Attune Scan Report</h1>
      <div class="subtitle">${metadata.framework} • ${metadata.filesScanned} files scanned</div>
    </div>

    <div class="score-section">
      ${scoreVisual}

      <div class="pie-chart">
        ${isPerfectScore ? `
          <div class="perfect-circle">
            <div class="perfect-icon">✓</div>
            <div class="perfect-score-text">ALL CLEAR</div>
          </div>
        ` : `
          <svg width="140" height="140" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="40" fill="none" stroke="var(--border)" stroke-width="8"/>
            ${hasSegments ? pieSegments.map(seg => seg.path ? `<path d="${seg.path}" fill="${seg.color}"/>` : `<circle cx="50" cy="50" r="40" fill="${seg.color}"/>`).join('') : ''}
          </svg>
        `}
      </div>

      <div class="stats">
        <div class="stat stat-critical">
          <div class="stat-value">${critical.length}</div>
          <div class="stat-label">Critical</div>
        </div>
        <div class="stat stat-high">
          <div class="stat-value">${high.length}</div>
          <div class="stat-label">High</div>
        </div>
        <div class="stat stat-medium">
          <div class="stat-value">${medium.length}</div>
          <div class="stat-label">Medium</div>
        </div>
        <div class="stat stat-low">
          <div class="stat-value">${low.length}</div>
          <div class="stat-label">Low</div>
        </div>
      </div>
    </div>

    <div class="branding-bar">
      <span class="attune-branding">Attune</span> analyzed in <span class="scan-time">${(metadata.scanTime / 1000).toFixed(1)}s</span> &bull; <a href="https://www.npmjs.com/package/attune" target="_blank">Get Attune</a> for your codebase
    </div>

    ${Object.keys(byCategory).length > 0 ? `
    <div class="categories">
      <h3>Categories</h3>
      <div class="category-list">${categoryBadges}</div>
    </div>
    ` : ''}

    ${findingsList ? `
    <div class="findings">
      <h3>Top Findings${findings.length > 15 ? ` (showing 15 of ${findings.length})` : ''}</h3>
      <div class="findings-list">
      ${findingsList}
      </div>
    </div>
    ` : ''}

    ${rulesListSection}

    <div class="footer">
      Local-first code quality analysis
    </div>
  </div>
</body>
</html>`;
}
