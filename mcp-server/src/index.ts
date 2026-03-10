#!/usr/bin/env node

/**
 * Attune MCP Server
 *
 * This MCP server allows AI tools (Claude Code, Cursor, etc.) to run
 * Attune code quality analysis directly from their conversations.
 *
 * Usage:
 *   npx attune-mcp-server
 *   npm run start
 *
 * Configuration (Claude Code):
 *   {
 *     "mcpServers": {
 *       "attune": {
 *         "command": "npx",
 *         "args": ["attune-mcp-server"]
 *       }
 *     }
 *   }
 */

import { Server } from '@modelcontextprotocol/sdk';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// Server metadata
const SERVER_NAME = 'attune-mcp';
const SERVER_VERSION = '1.0.0';

// Create the MCP server
const server = new Server(
  {
    name: SERVER_NAME,
    version: SERVER_VERSION,
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

/**
 * Run Attune analysis
 */
async function runAttuneAnalysis(path: string, flags: string): Promise<string> {
  const defaultFlags = '--json --no-paths';
  const fullFlags = flags ? `${defaultFlags} ${flags}` : defaultFlags;

  try {
    // Try running attune from npx
    const command = `npx attune analyze "${path}" ${fullFlags}`;
    const { stdout, stderr } = await execAsync(command, {
      timeout: 300000,
      maxBuffer: 10 * 1024 * 1024, // 10MB
    });

    return stdout || stderr;
  } catch (error: any) {
    // If attune isn't installed, provide helpful message
    if (error.message?.includes('ENOENT') || error.message?.includes('command not found')) {
      return JSON.stringify({
        error: 'Attune not installed',
        message: 'Please install Attune: npm install -g attune',
        installation: 'npm install -g attune'
      });
    }

    // Return error as JSON if possible
    try {
      return JSON.stringify({
        error: error.message,
        stderr: error.stderr,
        stdout: error.stdout
      });
    } catch {
      return JSON.stringify({
        error: 'Unknown error',
        message: String(error)
      });
    }
  }
}

/**
 * Parse Attune results into a human-readable summary
 */
function summarizeResults(results: any): string {
  if (!results || typeof results !== 'object') {
    return String(results);
  }

  const findings = results.findings || [];
  const metadata = results.metadata || {};

  if (findings.length === 0) {
    return `✅ **No issues found!**\n\nFiles scanned: ${metadata.filesScanned || 'unknown'}\nTime: ${metadata.scanTime ? `${metadata.scanTime}ms` : 'unknown'}`;
  }

  const severityCounts = {
    critical: findings.filter((f: any) => f.severity === 'critical').length,
    high: findings.filter((f: any) => f.severity === 'high').length,
    medium: findings.filter((f: any) => f.severity === 'medium').length,
    low: findings.filter((f: any) => f.severity === 'low').length,
  };

  let summary = `📊 **Attune Results**\n\n`;
  summary += `Found ${findings.length} issues:\n`;
  summary += `- 🔴 Critical: ${severityCounts.critical}\n`;
  summary += `- 🟠 High: ${severityCounts.high}\n`;
  summary += `- 🔵 Medium: ${severityCounts.medium}\n`;
  summary += `- 🟢 Low: ${severityCounts.low}\n\n`;

  // Add top issues
  const topIssues = findings
    .filter((f: any) => f.severity === 'critical' || f.severity === 'high')
    .slice(0, 5);

  if (topIssues.length > 0) {
    summary += `### Top Issues\n\n`;
    topIssues.forEach((f: any, i: number) => {
      const emoji = f.severity === 'critical' ? '🔴' : '🟠';
      summary += `${i + 1}. ${emoji} **${f.ruleId}**: ${f.message}\n`;
      summary += `   File: \`${f.file}\`\n\n`;
    });
  }

  summary += `---\n`;
  summary += `Files scanned: ${metadata.filesScanned || 'unknown'}\n`;
  summary += `Framework: ${metadata.framework || 'unknown'}\n`;
  summary += `Scan time: ${metadata.scanTime ? `${metadata.scanTime}ms` : 'unknown'}`;

  return summary;
}

// Handle tool list request
server.setRequestHandler('tools/list', async () => {
  return {
    tools: [
      {
        name: 'attune_analyze',
        description: 'Run Attune code quality analysis on a project. Detects AI-generated code patterns, security issues, TypeScript errors, framework-specific issues, and best practices. Use this to analyze codebases for quality issues.',
        inputSchema: {
          type: 'object',
          properties: {
            path: {
              type: 'string',
              description: 'Path to the project or file to analyze (default: current directory ".")',
              default: '.'
            },
            flags: {
              type: 'string',
              description: 'Attune flags: --security (security only), --lite (fast mode), --full (comprehensive), --json (JSON output), --verbose (detailed output)',
              default: '--json'
            }
          },
          required: []
        }
      },
      {
        name: 'attune_quick_check',
        description: 'Run a quick Attune check for critical and high severity issues only. Faster than full analysis.',
        inputSchema: {
          type: 'object',
          properties: {
            path: {
              type: 'string',
              description: 'Path to the project or file to analyze',
              default: '.'
            }
          },
          required: []
        }
      },
      {
        name: 'attune_security_scan',
        description: 'Run Attune security scan only - checks for secrets, OWASP vulnerabilities, and security issues.',
        inputSchema: {
          type: 'object',
          properties: {
            path: {
              type: 'string',
              description: 'Path to the project to scan',
              default: '.'
            }
          },
          required: []
        }
      }
    ],
  };
});

// Handle tool call request
server.setRequestHandler('tools/call', async (request) => {
  const { name, arguments: args } = request.params;

  if (name === 'attune_analyze') {
    const path = args.path || '.';
    const flags = args.flags || '';

    const rawResults = await runAttuneAnalysis(path, flags);

    // Try to parse as JSON and summarize
    try {
      const jsonResults = JSON.parse(rawResults);
      const summary = summarizeResults(jsonResults);

      return {
        content: [
          {
            type: 'text',
            text: summary
          },
          {
            type: 'resource',
            resource: {
              uri: 'attune://results.json',
              mimeType: 'application/json',
              text: JSON.stringify(jsonResults, null, 2)
            }
          }
        ],
      };
    } catch {
      // Not JSON, return raw
      return {
        content: [
          {
            type: 'text',
            text: rawResults
          }
        ],
      };
    }
  }

  if (name === 'attune_quick_check') {
    const path = args.path || '.';
    const flags = '--json';

    const rawResults = await runAttuneAnalysis(path, flags);

    try {
      const jsonResults = JSON.parse(rawResults);
      // Filter to only critical and high
      const filtered = {
        ...jsonResults,
        findings: (jsonResults.findings || []).filter(
          (f: any) => f.severity === 'critical' || f.severity === 'high'
        )
      };
      const summary = summarizeResults(filtered);

      return {
        content: [
          {
            type: 'text',
            text: summary
          }
        ],
      };
    } catch {
      return {
        content: [
          {
            type: 'text',
            text: rawResults
          }
        ],
      };
    }
  }

  if (name === 'attune_security_scan') {
    const path = args.path || '.';
    const flags = '--security --json';

    const rawResults = await runAttuneAnalysis(path, flags);

    try {
      const jsonResults = JSON.parse(rawResults);
      const summary = summarizeResults(jsonResults);

      return {
        content: [
          {
            type: 'text',
            text: '🔒 **Security Scan Results**\n\n' + summary
          }
        ],
      };
    } catch {
      return {
        content: [
          {
            type: 'text',
            text: rawResults
          }
        ],
      };
    }
  }

  throw new Error(`Unknown tool: ${name}`);
});

// Start the server
async function main() {
  const transport = new StdioServerTransport();

  await server.connect(transport);

  console.error(`🤖 ${SERVER_NAME} v${SERVER_VERSION} running on stdio`);
  console.error('Ready to accept MCP requests...');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
