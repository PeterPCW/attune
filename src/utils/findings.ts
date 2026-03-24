import { Finding, Severity } from '../types/index.js';

/**
 * Group findings by severity level
 */
export function groupBySeverity(findings: Finding[]): Record<Severity, Finding[]> {
  return {
    critical: findings.filter(f => f.severity === 'critical'),
    high: findings.filter(f => f.severity === 'high'),
    medium: findings.filter(f => f.severity === 'medium'),
    low: findings.filter(f => f.severity === 'low'),
    info: findings.filter(f => f.severity === 'info'),
    warning: findings.filter(f => f.severity === 'warning'),
  };
}

/**
 * Count findings by severity
 */
export function countBySeverity(findings: Finding[]): Record<Severity, number> {
  const grouped = groupBySeverity(findings);
  return {
    critical: grouped.critical.length,
    high: grouped.high.length,
    medium: grouped.medium.length,
    low: grouped.low.length,
    info: grouped.info.length,
    warning: grouped.warning.length,
  };
}

/**
 * Get total findings count
 */
export function getTotalFindings(findings: Finding[]): number {
  return findings.length;
}

/**
 * Get findings with critical or high severity
 */
export function getCriticalFindings(findings: Finding[]): Finding[] {
  return findings.filter(f => f.severity === 'critical' || f.severity === 'high');
}

/**
 * Group findings by category
 */
export function groupByCategory(findings: Finding[]): Record<string, Finding[]> {
  const grouped: Record<string, Finding[]> = {};

  for (const finding of findings) {
    if (!grouped[finding.category]) {
      grouped[finding.category] = [];
    }
    grouped[finding.category].push(finding);
  }

  return grouped;
}

/**
 * Get unique categories from findings
 */
export function getCategories(findings: Finding[]): string[] {
  return [...new Set(findings.map(f => f.category))];
}

/**
 * Deduplicate findings by ruleId + message similarity
 * Groups findings that have the same ruleId and similar messages,
 * keeping one representative per unique issue type
 */
export function deduplicateFindings(findings: Finding[]): Finding[] {
  const seen = new Map<string, Finding>();

  for (const finding of findings) {
    // Create a key based on ruleId and normalized message
    // Normalize message by removing file-specific details
    const normalizedMessage = normalizeMessage(finding.message);
    const key = `${finding.ruleId}:${normalizedMessage}`;

    // Keep first occurrence (most severe or first found)
    if (!seen.has(key)) {
      seen.set(key, finding);
    }
  }

  return Array.from(seen.values());
}

/**
 * Normalize message for deduplication
 * Removes variable parts like file paths and line numbers
 */
function normalizeMessage(message: string): string {
  // Remove common variable patterns
  return message
    .replace(/\s+/g, ' ')
    .replace(/:\d+/g, '')
    .replace(/\/[^/]+\//g, '/')
    .trim();
}
