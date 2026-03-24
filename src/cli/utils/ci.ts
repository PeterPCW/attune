/**
 * Check if we're running in a CI environment
 */
export function isCI(): boolean {
  // Check common CI environment variables
  return !!(
    process.env.CI ||
    process.env.CONTINUOUS_INTEGRATION ||
    process.env.GITHUB_ACTIONS ||
    process.env.GITLAB_CI ||
    process.env.CIRCLECI ||
    process.env.TRAVIS ||
    process.env.JENKINS ||
    process.env.BUILDKITE ||
    process.env.APPVEYOR ||
    process.env.CODEBUILD ||
    process.env.CI === 'true'
  );
}