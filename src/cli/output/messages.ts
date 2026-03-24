import chalk from 'chalk';
import { Finding } from '../../types/index.js';

/**
 * Show welcome message on first run
 */
export function showWelcomeMessage(): void {
  console.log(`
╔══════════════════════════════════════════════════════════════════╗
║                    👋 Welcome to Attune!                        ║
╠══════════════════════════════════════════════════════════════════╣
║                                                                  ║
║  Attune analyzes your code for quality issues:                   ║
║    • Security vulnerabilities                                   ║
║    • Code quality & best practices                              ║
║    • Framework-specific patterns                                 ║
║    • Performance & accessibility                                 ║
║                                                                  ║
║  Quick start:                                                   ║
║    attune analyze .                    # Scan current project    ║
║    attune analyze . --security        # Security only           ║
║    attune analyze . --html            # HTML report             ║
║                                                                  ║
║  Configuration:                                                 ║
║    .attunerc                           # Your preferences       ║
║    .attuneignore                      # Files to skip          ║
║                                                                  ║
╚══════════════════════════════════════════════════════════════════╝
  `);
}

/**
 * Show smart suggestions based on findings
 */
export function showSmartSuggestions(findings: Finding[]): void {
  const hasSecurity = findings.some(f => f.category === 'security');
  const hasErrors = findings.some(f => f.category === 'error-handling');
  const hasA11y = findings.some(f => f.category === 'accessibility');

  if (!findings.length) {
    console.log(chalk.green('\n✨ Great progress! No issues found.'));
    return;
  }

  console.log(chalk.yellow('\n✨ Great progress! Only a few issues to fix.'));

  console.log(chalk.gray('\n💡 Quick Tips:'));

  if (hasSecurity) {
    console.log(chalk.gray(`   🔒 Run security-only scan: attune analyze . --security`));
    console.log(chalk.gray(`      Or check for secrets: attune analyze . --json | grep -i secret`));
  }

  if (hasErrors || hasA11y) {
    console.log(chalk.gray(`   📖 Full report: attune analyze . --html for shareable HTML`));
  }

  const highSeverityCount = findings.filter(f => f.severity === 'critical' || f.severity === 'high').length;
  if (highSeverityCount > 0) {
    console.log(chalk.gray(`   🔴 High priority: ${highSeverityCount} critical/high issues`));
  }
}