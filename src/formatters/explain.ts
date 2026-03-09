import { Finding, ScanMetadata, Recommendation } from '../types/index.js';

/**
 * Interface for rule metadata that includes catches/fix info
 */
interface RuleInfo {
  ruleId: string;
  catches: string[];
  fix: string[];
  recommendation?: Recommendation;
}

/**
 * Groups findings by rule ID and extracts rule info
 */
function groupFindingsByRule(findings: Finding[]): Map<string, { findings: Finding[]; ruleInfo: RuleInfo }> {
  const grouped = new Map<string, { findings: Finding[]; ruleInfo: RuleInfo }>();

  for (const finding of findings) {
    if (!grouped.has(finding.ruleId)) {
      const recommendation = finding.recommendation || { title: '', description: '' };
      grouped.set(finding.ruleId, {
        findings: [],
        ruleInfo: {
          ruleId: finding.ruleId,
          catches: recommendation.catches || generateCatches(finding),
          fix: recommendation.fix || generateFix(recommendation),
          recommendation
        }
      });
    }
    grouped.get(finding.ruleId)!.findings.push(finding);
  }

  return grouped;
}

/**
 * Generate catches from pattern messages if not provided
 */
function generateCatches(finding: Finding): string[] {
  // Use the finding message as the primary catch
  const catches = [finding.message];

  // Add category-based catches if available
  if (finding.category === 'security') {
    catches.push(`Security vulnerability in ${finding.ruleId}`);
  }

  return catches;
}

/**
 * Generate fix suggestions from recommendation if not provided
 */
function generateFix(recommendation: Recommendation): string[] {
  const fix: string[] = [];

  if (recommendation.title) {
    fix.push(recommendation.title);
  }

  if (recommendation.description) {
    // Extract the first sentence as a bullet
    const firstSentence = recommendation.description.split('.')[0];
    if (firstSentence) {
      fix.push(firstSentence + '.');
    }
  }

  if (recommendation.library) {
    fix.push(`Suggested: ${recommendation.library}`);
  }

  return fix;
}

/**
 * Format findings for human consumption (suitable for AI agents too)
 */
function formatForHuman(grouped: Map<string, { findings: Finding[]; ruleInfo: RuleInfo }>): string {
  const lines: string[] = [
    '# Attune Analysis - Detailed Report',
    '',
    '## Summary',
    ''
  ];

  // Count by severity
  const severities = { critical: 0, high: 0, medium: 0, low: 0 };
  for (const { findings } of grouped.values()) {
    for (const f of findings) {
      if (Object.hasOwn(severities, f.severity)) {
        severities[f.severity as keyof typeof severities]++;
      }
    }
  }

  lines.push(`- Critical: ${severities.critical}`);
  lines.push(`- High: ${severities.high}`);
  lines.push(`- Medium: ${severities.medium}`);
  lines.push(`- Low: ${severities.low}`);
  lines.push(`- Total: ${Array.from(grouped.values()).reduce((sum, g) => sum + g.findings.length, 0)}`);
  lines.push('');

  // Group by severity
  const severityOrder = ['critical', 'high', 'medium', 'low'] as const;

  for (const severity of severityOrder) {
    const rulesWithSeverity = Array.from(grouped.entries())
      .filter(([, { findings }]) => findings.some(f => f.severity === severity));

    if (rulesWithSeverity.length === 0) continue;

    lines.push(`## ${severity.toUpperCase()} Issues`);
    lines.push('');

    for (const [ruleId, { findings, ruleInfo }] of rulesWithSeverity) {
      lines.push(`### ${ruleId}`);
      lines.push('');

      // What it catches
      lines.push('**What this catches:**');
      for (const c of ruleInfo.catches) {
        lines.push(`- ${c}`);
      }
      lines.push('');

      // How to fix
      lines.push('**How to fix:**');
      for (const f of ruleInfo.fix) {
        lines.push(`- ${f}`);
      }
      lines.push('');

      // Where to fix
      const fileMap = new Map<string, number[]>();
      for (const f of findings) {
        if (!fileMap.has(f.file)) {
          fileMap.set(f.file, []);
        }
        if (f.line) fileMap.get(f.file)!.push(f.line);
      }

      lines.push('**Files to review:**');
      for (const [file, lines2] of fileMap) {
        const lineStr = lines2.length > 0 ? `:${[...new Set(lines2)].join(',')}` : '';
        lines.push(`- \`${file}${lineStr}\``);
      }
      lines.push('');
      lines.push('---');
      lines.push('');
    }
  }

  return lines.join('\n');
}

/**
 * Format explain output
 */
export function formatExplain(findings: Finding[], metadata: ScanMetadata): string {
  const grouped = groupFindingsByRule(findings);

  if (grouped.size === 0) {
    return '# Attune Analysis\n\nNo issues found!';
  }

  let output = formatForHuman(grouped);

  // Add note about finding limits if any rule has more findings than shown
  const hasLimited = metadata.ruleResults?.some(r => r.findingsCount > 10);
  if (hasLimited) {
    output += '\n\n---\n\n**Note:** Findings are limited to 10 per rule to prevent overwhelming reports. ';
    output += 'The full count is shown in parentheses in the summary above. ';
    output += 'Use `.attuneignore` to suppress rules you don\'t want to see.';
  }

  return output;
}
