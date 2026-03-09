import { BaseRule } from '../base-rule.js';
import { Finding, AnalysisContext, Category, Severity, Framework, Recommendation } from '../../types/index.js';
import { join } from 'path';
import { existsSync, readFileSync } from 'fs';

const TEST_COVERAGE_CONFIG: Recommendation = {
  title: 'Add test coverage configuration',
  description: 'Configure test coverage to track code quality. Add coverage configuration to your test runner.',
  library: 'vitest, jest'
};

const TEST_COVERAGE_THRESHOLDS: Recommendation = {
  title: 'Set minimum coverage thresholds',
  description: 'Add coverage thresholds to enforce minimum code coverage standards in CI.',
  library: 'vitest, jest'
};

const TEST_COVERAGE_LOW: Recommendation = {
  title: 'Improve test coverage',
  description: 'Test coverage is below recommended threshold. Aim for 80%+ coverage.',
  library: 'vitest, jest'
};

class TestCoverageConfigRule extends BaseRule {
  id = 'TEST_COVERAGE_CONFIG';
  name = 'Missing test coverage configuration';
  category: Category = 'testing';
  severity: Severity = 'medium';
  frameworks: Framework[] = [];
  recommendation = TEST_COVERAGE_CONFIG;

  detect(context: AnalysisContext): Finding[] {
    const findings: Finding[] = [];

    // Check for test configuration files
    const hasVitestConfig = context.files.some(f =>
      f.path.includes('vitest.config.') ||
      f.path.includes('vite.config.') && f.content.includes('vitest')
    );
    const hasJestConfig = context.files.some(f =>
      f.path.includes('jest.config.') ||
      f.path.includes('.jest.js') ||
      f.path.includes('jest.setup')
    );
    const hasCypressConfig = context.files.some(f =>
      f.path.includes('cypress.config.') ||
      f.path.includes('cypress.json')
    );
    const hasPlaywrightConfig = context.files.some(f =>
      f.path.includes('playwright.config.') ||
      f.path.includes('playwright.config.ts')
    );

    if (!hasVitestConfig && !hasJestConfig && !hasCypressConfig && !hasPlaywrightConfig) {
      // No test framework config found
      for (const file of context.files) {
        if (file.path.endsWith('package.json')) {
          const hasTestScript = file.content.includes('"test"') || file.content.includes('"test:');
          if (hasTestScript) {
            findings.push(this.createFinding(
              context,
              file.path,
              1,
              'Test script found but no test coverage configuration detected - add vitest or jest coverage config',
              'package.json'
            ));
          }
        }
      }
    }

    return findings;
  }
}

class TestCoverageThresholdsRule extends BaseRule {
  id = 'TEST_COVERAGE_THRESHOLDS';
  name = 'Missing coverage thresholds';
  category: Category = 'testing';
  severity: Severity = 'low';
  frameworks: Framework[] = [];
  recommendation = TEST_COVERAGE_THRESHOLDS;

  detect(context: AnalysisContext): Finding[] {
    const findings: Finding[] = [];

    // Find vitest config
    const vitestConfig = context.files.find(f =>
      f.path.includes('vitest.config.')
    );

    if (vitestConfig) {
      // Check if coverage is configured
      const hasCoverage = vitestConfig.content.includes('coverage:');
      const hasThresholds = vitestConfig.content.includes('thresholds:');

      if (hasCoverage && !hasThresholds) {
        findings.push(this.createFinding(
          context,
          vitestConfig.path,
          1,
          'Coverage is configured but no thresholds set - add thresholds to enforce minimum coverage',
          vitestConfig.path
        ));
      }
    }

    // Find jest config
    const jestConfig = context.files.find(f =>
      f.path.includes('jest.config.')
    );

    if (jestConfig) {
      const hasCollectCoverage = jestConfig.content.includes('collectCoverage');
      const hasCoverageThreshold = jestConfig.content.includes('coverageThreshold');

      if (hasCollectCoverage && !hasCoverageThreshold) {
        findings.push(this.createFinding(
          context,
          jestConfig.path,
          1,
          'Coverage is configured but no thresholds set - add coverageThreshold to enforce minimum coverage',
          jestConfig.path
        ));
      }
    }

    return findings;
  }
}

class TestCoverageLowRule extends BaseRule {
  id = 'TEST_COVERAGE_LOW';
  name = 'Test coverage below threshold';
  category: Category = 'testing';
  severity: Severity = 'medium';
  frameworks: Framework[] = [];
  recommendation = TEST_COVERAGE_LOW;
  metadata = { requiresCoverageJson: true };

  detect(context: AnalysisContext): Finding[] {
    const findings: Finding[] = [];

    // Try to read coverage file directly from common locations
    // This is needed because the analyzer ignores the coverage directory
    const possibleCoveragePaths = [
      join(context.projectRoot, 'coverage/coverage-final.json'),
      join(context.projectRoot, 'coverage/coverage.json'),
      join(context.projectRoot, '.nyc_output/out.json'),
    ];

    for (const coveragePath of possibleCoveragePaths) {
      try {
        if (existsSync(coveragePath)) {
          const coverageContent = readFileSync(coveragePath, 'utf-8');

          // Check if it's a valid coverage report
          const hasVitestFormat = coverageContent.includes('"statementMap"') && coverageContent.includes('"s"');
          const hasIstanbulFormat = coverageContent.includes('"allFiles"');
          const hasTotalFormat = coverageContent.includes('"total"');

          if (hasVitestFormat || hasIstanbulFormat || hasTotalFormat) {
            const coverage = JSON.parse(coverageContent);

            // Handle different coverage formats
            let totalStatements = 0;
            let coveredStatements = 0;
            let totalBranches = 0;
            let coveredBranches = 0;
            let totalFunctions = 0;
            let coveredFunctions = 0;
            let totalLines = 0;
            let coveredLines = 0;

            // Vitest format: each key is a file path with {s, b, f, statementMap, ...}
            if (!coverage.all && !coverage.total && hasVitestFormat) {
              for (const [filePath, fileData] of Object.entries(coverage)) {
                if (typeof fileData !== 'object' || fileData === null) continue;
                const fd = fileData as Record<string, any>;

                // Skip aggregate "all" entries
                if (fd.all === true) continue;

                // Statements (s)
                if (fd.s) {
                  Object.values(fd.s).forEach((v) => {
                    totalStatements++;
                    if (typeof v === 'number' && v > 0) coveredStatements++;
                  });
                }

                // Lines - same as statements in most cases
                if (fd.s) {
                  Object.values(fd.s).forEach((v) => {
                    totalLines++;
                    if (typeof v === 'number' && v > 0) coveredLines++;
                  });
                }

                // Branches (b)
                if (fd.b) {
                  Object.values(fd.b).forEach((branch) => {
                    if (Array.isArray(branch)) {
                      branch.forEach((b) => {
                        totalBranches++;
                        if (typeof b === 'number' && b > 0) coveredBranches++;
                      });
                    }
                  });
                }

                // Functions (f)
                if (fd.f) {
                  Object.values(fd.f).forEach((v) => {
                    totalFunctions++;
                    if (typeof v === 'number' && v > 0) coveredFunctions++;
                  });
                }
              }
            } else if (coverage.all || coverage.total) {
              // Istanbul/NYC or vitest with --coverage.summaryJson
              const data = coverage.all || coverage.total;
              if (data.s) {
                Object.values(data.s).forEach((v) => {
                  totalStatements++;
                  if (typeof v === 'number' && v > 0) coveredStatements++;
                });
              }
              if (data.b) {
                Object.values(data.b).forEach((branch) => {
                  if (Array.isArray(branch)) {
                    branch.forEach((b) => {
                      totalBranches++;
                      if (typeof b === 'number' && b > 0) coveredBranches++;
                    });
                  }
                });
              }
              if (data.f) {
                Object.values(data.f).forEach((v) => {
                  totalFunctions++;
                  if (typeof v === 'number' && v > 0) coveredFunctions++;
                });
              }
              if (data.s) {
                Object.values(data.s).forEach((v) => {
                  totalLines++;
                  if (typeof v === 'number' && v > 0) coveredLines++;
                });
              }
            }

            // Calculate percentages
            const stmtCoverage = totalStatements > 0 ? (coveredStatements / totalStatements) * 100 : 0;
            const branchCoverage = totalBranches > 0 ? (coveredBranches / totalBranches) * 100 : 0;
            const funcCoverage = totalFunctions > 0 ? (coveredFunctions / totalFunctions) * 100 : 0;
            const lineCoverage = totalLines > 0 ? (coveredLines / totalLines) * 100 : 0;

            // Check if any coverage metric is below threshold
            // Updated to 80% as per project requirements
            const threshold = 80;
            if (stmtCoverage < threshold || branchCoverage < threshold ||
                funcCoverage < threshold || lineCoverage < threshold) {
              findings.push(this.createFinding(
                context,
                coveragePath,
                1,
                `Test coverage below ${threshold}% - statements: ${stmtCoverage.toFixed(1)}%, branches: ${branchCoverage.toFixed(1)}%, functions: ${funcCoverage.toFixed(1)}%, lines: ${lineCoverage.toFixed(1)}%`,
                `Coverage: s=${stmtCoverage.toFixed(1)}% b=${branchCoverage.toFixed(1)}% f=${funcCoverage.toFixed(1)}% l=${lineCoverage.toFixed(1)}%`
              ));
            }

            return findings;
          }
        }
      } catch {
        // Try next path
      }
    }

    return findings;
  }
}

export class TestingRules {
  static getRules() {
    return [
      new TestCoverageConfigRule(),
      new TestCoverageThresholdsRule(),
      new TestCoverageLowRule()
    ];
  }
}
