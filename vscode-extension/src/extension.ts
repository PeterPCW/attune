import * as vscode from 'vscode';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as path from 'path';

const execAsync = promisify(exec);

let diagnosticCollection: vscode.DiagnosticCollection;

export function activate(context: vscode.ExtensionContext) {
  // Create diagnostic collection for problems
  diagnosticCollection = vscode.languages.createDiagnosticCollection('attune');

  // Register analyze project command
  const analyzeCommand = vscode.commands.registerCommand('attune.analyze', async () => {
    await runAttuneAnalysis(vscode.workspace.rootPath || '.');
  });

  // Register analyze file command
  const analyzeFileCommand = vscode.commands.registerCommand('attune.analyzeFile', async () => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      vscode.window.showWarningMessage('No file open');
      return;
    }

    const filePath = editor.document.uri.fsPath;
    await runAttuneAnalysis(filePath);
  });

  // Register analyze folder command
  const analyzeFolderCommand = vscode.commands.registerCommand('attune.analyzeFolder', async (uri: vscode.Uri) => {
    const folderPath = uri?.fsPath || vscode.workspace.rootPath || '.';
    await runAttuneAnalysis(folderPath);
  });

  // Check configuration for auto-run
  const config = vscode.workspace.getConfiguration('attune');

  if (config.get('runOnOpen', false)) {
    // Run on workspace open
    vscode.workspace.onDidOpenTextDocument(() => {
      if (vscode.workspace.rootPath) {
        runAttuneAnalysis(vscode.workspace.rootPath);
      }
    });
  }

  context.subscriptions.push(
    analyzeCommand,
    analyzeFileCommand,
    analyzeFolderCommand,
    diagnosticCollection
  );

  // Show welcome message
  vscode.window.showInformationMessage('Attune extension activated! Run "Attune: Analyze Project" to scan your code.');
}

async function runAttuneAnalysis(targetPath: string) {
  const config = vscode.workspace.getConfiguration('attune');
  const liteMode = config.get('liteMode', true);

  const statusItem = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Left,
    100
  );
  statusItem.text = '$(loading~spin) Attune scanning...';
  statusItem.show();

  try {
    // Build attune command
    const liteFlag = liteMode ? '--lite' : '';
    const command = `npx attune analyze "${targetPath}" ${liteFlag} --json --no-paths`;

    vscode.window.showInformationMessage(`Running Attune analysis on ${targetPath}...`);

    const { stdout } = await execAsync(command, {
      cwd: vscode.workspace.rootPath || process.cwd(),
      timeout: 120000
    });

    // Parse results
    let results: any;
    try {
      results = JSON.parse(stdout);
    } catch {
      vscode.window.showWarningMessage('Attune output could not be parsed');
      statusItem.text = '$(error) Attune error';
      return;
    }

    const findings = results.findings || [];
    const filesScanned = results.metadata?.filesScanned || 0;

    // Update status bar
    statusItem.text = `$(check) Attune: ${findings.length} issues`;

    // Show results
    if (findings.length === 0) {
      vscode.window.showInformationMessage(`Attune: No issues found in ${filesScanned} files!`);
    } else {
      const severityCounts = getSeverityCounts(findings);
      vscode.window.showInformationMessage(
        `Attune: ${severityCounts.critical} critical, ${severityCounts.high} high, ${severityCounts.medium} medium, ${severityCounts.low} low`
      );

      // Show problems panel
      vscode.commands.executeCommand('workbench.action.showProblems');
    }

    // Clear previous diagnostics
    diagnosticCollection.clear();

    // Add findings to problems (only for current file if analyzing single file)
    for (const finding of findings) {
      const filePath = finding.file;
      if (!filePath) continue;

      const uri = vscode.Uri.file(filePath);
      const document = await vscode.workspace.openTextDocument(uri).catch(() => null);

      if (document) {
        const line = Math.max(0, (finding.line || 1) - 1);
        const range = new vscode.Range(line, 0, line, 1000);

        const severity = mapSeverity(finding.severity);
        const diagnostic = new vscode.Diagnostic(
          range,
          `[${finding.ruleId}] ${finding.message}`,
          severity
        );

        diagnosticCollection.set(uri, [...(diagnosticCollection.get(uri) || []), diagnostic]);
      }
    }

  } catch (error: any) {
    statusItem.text = '$(error) Attune failed';

    if (error.message?.includes('ENOENT')) {
      vscode.window.showErrorMessage('Attune not found. Install with: npm install -g attune');
    } else {
      vscode.window.showWarningMessage(`Attune analysis completed with issues: ${error.message}`);
    }
  }
}

function getSeverityCounts(findings: any[]): { critical: number; high: number; medium: number; low: number } {
  return {
    critical: findings.filter(f => f.severity === 'critical').length,
    high: findings.filter(f => f.severity === 'high').length,
    medium: findings.filter(f => f.severity === 'medium').length,
    low: findings.filter(f => f.severity === 'low').length,
  };
}

function mapSeverity(severity: string): vscode.DiagnosticSeverity {
  switch (severity) {
    case 'critical':
      return vscode.DiagnosticSeverity.Error;
    case 'high':
      return vscode.DiagnosticSeverity.Warning;
    case 'medium':
      return vscode.DiagnosticSeverity.Warning;
    case 'low':
      return vscode.DiagnosticSeverity.Information;
    default:
      return vscode.DiagnosticSeverity.Hint;
  }
}

export function deactivate() {
  if (diagnosticCollection) {
    diagnosticCollection.dispose();
  }
}
