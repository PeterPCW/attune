import { Finding, ScanMetadata } from '../types/index.js';

// Maximum findings to include in SARIF output to prevent memory issues
const MAX_SARIF_FINDINGS = 500;

/**
 * Format findings as SARIF (Static Analysis Results Interchange Format)
 * SARIF is an OASIS standard for sharing static analysis results
 */
export function formatSarif(findings: Finding[], metadata: ScanMetadata): string {
  // Limit findings to prevent output size issues
  const limitedFindings = findings.slice(0, MAX_SARIF_FINDINGS);
  const truncated = findings.length > MAX_SARIF_FINDINGS;

  const sarifOutput: Record<string, unknown> = {
    version: '2.1.0',
    $schema: 'https://raw.githubusercontent.com/oasis-tcs/sarif-spec/master/Schemata/sarif-schema-2.1.0.json',
    runs: [
      {
        tool: {
          driver: {
            name: 'Attune',
            version: '1.0.0',
            informationUri: 'https://github.com/attune/attune',
            rules: getUniqueRules(findings)
          }
        },
        results: findings.map(finding => ({
          ruleId: finding.ruleId,
          level: mapSeverityToSarifLevel(finding.severity),
          message: {
            text: finding.message
          },
          locations: [
            {
              physicalLocation: {
                artifactLocation: {
                  uri: finding.file.replace(metadata.projectRoot + '/', ''),
                  uriBaseId: 'PROJECT_ROOT'
                },
                region: {
                  startLine: finding.line
                }
              }
            }
          ]
        }))
      }
    ],
    // Add artifact locations
    artifacts: [],
    // Add a base URI for the project
    originalUriBaseIds: {
      PROJECT_ROOT: {
        uri: `file://${metadata.projectRoot}/`
      }
    },
    // Add truncation notice if findings were limited
    ...(truncated && {
      properties: {
        note: `Output limited to ${MAX_SARIF_FINDINGS} findings. Total: ${findings.length}.`
      }
    })
  };

  return JSON.stringify(sarifOutput, null, 2);
}

/**
 * Map severity to SARIF level
 */
function mapSeverityToSarifLevel(severity: string): string {
  switch (severity) {
    case 'critical':
      return 'error';
    case 'high':
      return 'error';
    case 'medium':
      return 'warning';
    case 'low':
      return 'note';
    case 'info':
      return 'note';
    default:
      return 'warning';
  }
}

/**
 * Get unique rules from findings for the tool driver
 */
function getUniqueRules(findings: Finding[]): Array<{
  id: string;
  name: string;
  shortDescription: { text: string };
  helpUri?: string;
}> {
  const uniqueRules = new Map<string, Finding>();

  for (const finding of findings) {
    if (!uniqueRules.has(finding.ruleId)) {
      uniqueRules.set(finding.ruleId, finding);
    }
  }

  return Array.from(uniqueRules.values()).map(finding => ({
    id: finding.ruleId,
    name: finding.ruleId,
    shortDescription: {
      text: finding.message
    },
    helpUri: `https://github.com/attune/attune/rules/${finding.ruleId}`
  }));
}
