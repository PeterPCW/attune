import chalk from 'chalk';
import { getScanErrors } from '../../core/scanner/index.js';

/**
 * Set up graceful shutdown handlers
 */
export function setupGracefulShutdown(): void {
  // Handle SIGINT (Ctrl+C)
  process.on('SIGINT', () => {
    try {
      console.log(chalk.yellow('\n\n⚠️  Scan interrupted by user'));

      // Report any partial findings
      const errors = getScanErrors();
      if (errors.length > 0) {
        console.log(chalk.gray(`   Partial scan completed with ${errors.length} issues before interruption`));
      }

      console.log(chalk.gray('   Run again to complete scan'));
    } catch (err) {
      // Ignore errors during shutdown
    }
    process.exit(130);
  });

  // Handle SIGTERM (e.g., docker stop, kill)
  process.on('SIGTERM', () => {
    try {
      console.log(chalk.yellow('\n\n⚠️  Scan terminated'));

      const errors = getScanErrors();
      if (errors.length > 0) {
        console.log(chalk.gray(`   Partial scan completed with ${errors.length} issues before termination`));
      }
    } catch (err) {
      // Ignore errors during shutdown
    }
    process.exit(143);
  });
}