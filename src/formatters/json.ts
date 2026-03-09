import { Finding, ScanMetadata } from '../types/index.js';

// Maximum findings to include in JSON output to prevent memory issues
const MAX_JSON_FINDINGS = 500;

export function formatJson(findings: Finding[], metadata: ScanMetadata): string {
  // Limit findings to prevent JSON.stringify memory issues on large scans
  const limitedFindings = findings.slice(0, MAX_JSON_FINDINGS);
  const truncated = findings.length > MAX_JSON_FINDINGS;

  const output: {
    version: string;
    metadata: Record<string, unknown>;
    summary: Record<string, number>;
    findings: unknown[];
    ruleResults?: unknown[];
    truncated?: boolean;
    truncationNote?: string;
  } = {
    version: '1.0.0',
    metadata: {
      projectRoot: metadata.projectRoot,
      framework: metadata.framework,
      scanTime: metadata.scanTime,
      filesScanned: metadata.filesScanned,
      rulesRun: metadata.rulesRun
    },
    summary: {
      critical: findings.filter(f => f.severity === 'critical').length,
      high: findings.filter(f => f.severity === 'high').length,
      medium: findings.filter(f => f.severity === 'medium').length,
      low: findings.filter(f => f.severity === 'low').length,
      info: findings.filter(f => f.severity === 'info').length,
      total: findings.length
    },
    findings: limitedFindings.map(f => ({
      id: f.ruleId,
      severity: f.severity,
      category: f.category,
      file: f.file,
      line: f.line,
      message: f.message,
      code: f.code,
      recommendation: f.recommendation
    }))
  };

  // Add truncation notice if findings were limited
  if (truncated) {
    output.truncated = true;
    output.truncationNote = `Output limited to ${MAX_JSON_FINDINGS} findings. Total: ${findings.length}. Use --full for complete report or filter by severity.`;
  }

  // Add full scan data if available
  if (metadata.full) {
    output.metadata.full = true;
  }
  if (metadata.ruleResults) {
    // Limit ruleResults to prevent massive output
    output.metadata.ruleResults = metadata.ruleResults.slice(0, 50);
    output.ruleResults = metadata.ruleResults.slice(0, 50);
  }

  try {
    return JSON.stringify(output, null, 2);
  } catch (error) {
    // Fallback if JSON.stringify still fails (e.g., circular references)
    const minimalOutput = {
      version: '1.0.0',
      error: 'Failed to serialize full output',
      summary: output.summary,
      truncated: true,
      truncationNote: 'Full output too large for JSON. Use --markdown or --html for smaller output.'
    };
    return JSON.stringify(minimalOutput, null, 2);
  }
}
