# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.8.0] - 2026-03-08

### Overview
Attune is a local-first CLI tool for comprehensive code quality checks. It scans your codebase against 448 built-in rules and outputs detailed reports in multiple formats (Terminal, JSON, HTML, Markdown, SARIF).

### Features
- **448 built-in rules** covering security, performance, accessibility, architecture, error handling, and framework-specific patterns
- **31 AST-based helper functions** for pattern matching to enable checks beyond the capabilities of the JSON rules set
- Multi-format output: Terminal, JSON, HTML, Markdown, SARIF
- Framework auto-detection (React, Next.js, Vue, Svelte, Angular, Nuxt, Astro, Express, Fastify, tRPC, etc.)
- Custom `.attuneignore` and `.attunerc` support
- Configuration args to override default limits and reporting such as: `--max-file-size` (default: 1MB), `--max-findings <n>` (default: 10), and `--public-safe` (redact paths and secrets for public sharing) among many others

### CLI Commands
- `attune analyze` - Run code quality scans
- `--full` - Run all checks
- `--security` - Security-only scanning
- `--architecture` - Architecture-focused scanning
- `--performance` - Performance-focused scanning
- `--html` - Generate HTML report with visualization