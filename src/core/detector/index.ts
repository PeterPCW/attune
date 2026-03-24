import { readFileSync, existsSync, readdirSync, statSync } from 'fs';
import { join } from 'path';
import { Framework, PackageJson, ProjectType } from '../../types/index.js';
import { frameworkPlugins, detectFramework } from './frameworks.js';

export class FrameworkDetector {
  private projectRoot: string;
  private _projectType?: ProjectType;

  constructor(projectRoot: string) {
    this.projectRoot = projectRoot;
  }

  detect(): Framework {
    // First check for Python projects (no package.json but has Python files)
    const pythonFramework = this.detectPythonFramework();
    if (pythonFramework) {
      return pythonFramework;
    }

    // Then check for JavaScript/TypeScript projects
    const packageJson = this.getPackageJson();
    if (!packageJson) {
      console.warn('No package.json found, defaulting to nodejs');
      return 'nodejs';
    }

    return detectFramework(packageJson);
  }

  /**
   * Detect primary language based on file extensions
   * Returns 'python', 'typescript', or 'javascript'
   */
  detectLanguage(): 'python' | 'typescript' | 'javascript' {
    // Check for Python files
    const hasPython = this.hasFilesWithExtension(this.projectRoot, ['.py']);
    if (hasPython) {
      return 'python';
    }

    // Check for TypeScript files
    const hasTypescript = this.hasFilesWithExtension(this.projectRoot, ['.ts', '.tsx']);
    if (hasTypescript) {
      return 'typescript';
    }

    // Check for JavaScript files
    const hasJavascript = this.hasFilesWithExtension(this.projectRoot, ['.js', '.jsx', '.mjs', '.cjs']);
    if (hasJavascript) {
      return 'javascript';
    }

    // Default to javascript for nodejs projects
    return 'javascript';
  }

  /**
   * Recursively check if directory has files with any of the given extensions
   */
  private hasFilesWithExtension(dir: string, extensions: string[], maxDepth = 3, currentDepth = 0): boolean {
    if (currentDepth > maxDepth) return false;

    try {
      const entries = readdirSync(dir, { withFileTypes: true });

      for (const entry of entries) {
        // Skip node_modules, .git, dist, etc.
        if (entry.isDirectory()) {
          const skipDirs = ['node_modules', '.git', 'dist', 'build', '.next', '.nuxt', '__pycache__', '.venv', 'venv', 'test-repos', 'coverage'];
          if (skipDirs.includes(entry.name)) continue;

          const result = this.hasFilesWithExtension(join(dir, entry.name), extensions, maxDepth, currentDepth + 1);
          if (result) return true;
        } else if (entry.isFile()) {
          const ext = entry.name.substring(entry.name.lastIndexOf('.'));
          if (extensions.includes(ext)) {
            return true;
          }
        }
      }
    } catch {
      // Ignore permission errors
    }

    return false;
  }

  /**
   * Detect project type based on WHAT the project DOES, not how it's built.
   * Independent of framework/language - those are detected separately.
   */
  detectProjectType(): ProjectType {
    if (this._projectType) {
      return this._projectType;
    }

    const packageJson = this.getPackageJson();

    // Check project files to determine what the project DOES
    const hasPublicDir = existsSync(join(this.projectRoot, 'public'));
    const hasViewsDir = existsSync(join(this.projectRoot, 'views')) ||
                        existsSync(join(this.projectRoot, 'templates'));
    const hasModelsDir = existsSync(join(this.projectRoot, 'models'));
    const hasRoutesDir = existsSync(join(this.projectRoot, 'routes')) ||
                         existsSync(join(this.projectRoot, 'api'));
    const hasPagesDir = existsSync(join(this.projectRoot, 'pages')) ||
                        existsSync(join(this.projectRoot, 'app')); // Next.js app dir

    // Check for key project files
    const hasManagePy = existsSync(join(this.projectRoot, 'manage.py'));
    const hasServerPy = existsSync(join(this.projectRoot, 'server.py')) ||
                        existsSync(join(this.projectRoot, 'main.py')) ||
                        existsSync(join(this.projectRoot, 'app.py'));
    const hasIndexHtml = existsSync(join(this.projectRoot, 'public', 'index.html')) ||
                         existsSync(join(this.projectRoot, 'index.html'));
    const hasApiRoutes = existsSync(join(this.projectRoot, 'api', 'routes')) ||
                         existsSync(join(this.projectRoot, 'routes', 'api'));

    // SaaS indicators: database models + auth/users patterns
    // (regardless of framework - could be Django, Rails, Express, etc.)
    if (hasModelsDir || hasManagePy) {
      // Django typically has models/, migrations/, settings.py
      const hasMigrations = existsSync(join(this.projectRoot, 'migrations')) ||
                            existsSync(join(this.projectRoot, 'migrate'));
      const hasSettings = existsSync(join(this.projectRoot, 'settings.py')) ||
                          existsSync(join(this.projectRoot, 'project', 'settings.py'));

      if (hasMigrations || hasSettings || hasManagePy) {
        // Has database models - likely SaaS or webapp with DB
        // Check if it's API-only (no templates/pages)
        if (!hasViewsDir && !hasPagesDir && !hasPublicDir) {
          // API-only backend - could be SaaS backend or standalone API
          // Check for auth/user models to differentiate from generic API
          const hasAuth = existsSync(join(this.projectRoot, 'accounts')) ||
                          existsSync(join(this.projectRoot, 'users')) ||
                          existsSync(join(this.projectRoot, 'models', 'user'));
          if (hasAuth || hasManagePy) {
            this._projectType = 'saas';
            return 'saas';
          }
        }
        // Has views/pages - full-stack webapp
        if (hasViewsDir || hasPagesDir) {
          this._projectType = 'saas';
          return 'saas';
        }
        // Default to saas for Django-like projects with models
        this._projectType = 'saas';
        return 'saas';
      }
    }

    // Desktop app: has electron, tauri configs
    if (packageJson) {
      const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
      if (this.hasDesktopDeps(deps)) {
        this._projectType = 'desktop';
        return 'desktop';
      }

      // Mobile app: has react-native, expo, flutter
      if (this.hasMobileDeps(deps)) {
        this._projectType = 'mobile';
        return 'mobile';
      }
    }

    // CLI: has bin field (user-facing command line tool)
    if (packageJson?.bin) {
      // Check if it's a dev tool (eslint, prettier, etc.)
      if (this.isDevTool(packageJson)) {
        this._projectType = 'devtool';
        return 'devtool';
      }
      this._projectType = 'cli';
      return 'cli';
    }

    // Webapp: serves HTML/pages
    if (hasPublicDir || hasViewsDir || hasPagesDir || hasIndexHtml) {
      this._projectType = 'webapp';
      return 'webapp';
    }

    // API server: has routes but no pages/views
    if (hasRoutesDir || hasApiRoutes || hasServerPy) {
      // Could be SaaS backend or standalone API
      // Check for auth patterns
      if (packageJson) {
        const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
        if (this.hasAuthDeps(deps) || this.hasDatabaseDeps(deps)) {
          this._projectType = 'saas';
          return 'saas';
        }
      }
    }

    // Library: has peerDependencies or is meant to be imported
    // Also check for packages meant to be imported (has exports field)
    if (packageJson?.peerDependencies && Object.keys(packageJson.peerDependencies).length > 0) {
      this._projectType = 'library';
      return 'library';
    }

    // Check for library indicators: exports, types, or main pointing to compiled code
    if (packageJson?.exports || packageJson?.types || packageJson?.typings ||
        (packageJson?.main && packageJson.main.includes('dist/'))) {
      this._projectType = 'library';
      return 'library';
    }

    // Dev tool: check by name even without bin
    if (packageJson && this.isDevTool(packageJson)) {
      this._projectType = 'devtool';
      return 'devtool';
    }

    // CLI (without bin): has CLI dependencies but no UI
    // But first check if it's a web framework (has web dependencies)
    if (packageJson && this.hasCliDependencies(packageJson)) {
      const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
      // If has web/frontend deps, it's likely not a CLI tool
      if (this.hasFrontendDeps(deps)) {
        // Skip CLI detection - it's a web framework
      } else {
        this._projectType = 'cli';
        return 'cli';
      }
    }

    // Default to library
    this._projectType = 'library';
    return 'library';
  }

  private isDevTool(pkg: PackageJson): boolean {
    // Check for dev tool patterns in name or dependencies
    const name = pkg.name?.toLowerCase() || '';
    const deps = { ...pkg.dependencies, ...pkg.devDependencies };

    // Strict dev tool patterns - use word boundaries to avoid false matches
    // e.g., "vitest" should not match "vite"
    const exactDevTools = ['jest', 'mocha', 'cypress', 'playwright', 'eslint', 'prettier', 'webpack', 'rollup', 'esbuild', 'swc', 'babel', 'lint-staged', 'husky', 'turbo'];
    const isExactDevTool = exactDevTools.some(p => name === p || name === `@${p}/`);

    // For vite, check it's not vitest
    const hasVite = deps['vite'] || deps['vite/'];
    const hasVitest = deps['vitest'] || deps['vitest/'];

    return isExactDevTool || (hasVite && !hasVitest);
  }

  private hasMobileDeps(deps: Record<string, string>): boolean {
    const mobileDeps = [
      'react-native', 'expo', '@react-native', 'expo-modules-core',
      'flutter', '@flutter', 'dart-sass',
      'ionic', 'capactior', 'cordova'
    ];
    return mobileDeps.some(dep => deps[dep]);
  }

  private hasDesktopDeps(deps: Record<string, string>): boolean {
    const desktopDeps = [
      'electron', '@electron', 'tauri', '@tauri', 'nw.js', 'neutralino'
    ];
    return desktopDeps.some(dep => deps[dep]);
  }

  private hasCliDependencies(pkg: PackageJson): boolean {
    const cliDeps = [
      'commander', 'yargs', 'meow', 'gluegun', 'oclif', 'ink', 'clipanion'
    ];
    const deps = { ...pkg.dependencies, ...pkg.devDependencies };
    return cliDeps.some(dep => deps[dep]);
  }

  private hasFrontendDeps(deps: Record<string, string>): boolean {
    const frontendDeps = [
      'react', 'vue', 'angular', 'svelte', 'next', 'nuxt', 'astro',
      '@vitejs/plugin-vue', '@angular/core', 'solid-js', 'remix'
    ];
    return frontendDeps.some(dep => deps[dep]);
  }

  private hasDatabaseDeps(deps: Record<string, string>): boolean {
    const dbDeps = [
      'pg', 'mysql', 'mysql2', 'mongoose', 'sequelize', 'typeorm',
      'prisma', 'drizzle-orm', 'knex', 'better-sqlite3', 'oracledb',
      'sqlalchemy', 'django', 'flask', 'fastapi'
    ];
    return dbDeps.some(dep => deps[dep]);
  }

  private hasAuthDeps(deps: Record<string, string>): boolean {
    const authDeps = [
      'passport', 'next-auth', 'auth0', 'clerk', 'supabase',
      'firebase', 'jsonwebtoken', 'bcrypt', 'argon2', 'django-allauth'
    ];
    return authDeps.some(dep => deps[dep]);
  }

  private hasPaymentDeps(deps: Record<string, string>): boolean {
    const paymentDeps = [
      'stripe', 'paypal', 'braintree', 'adyen', 'square',
      'razorpay', 'swell-js', 'chargify', 'recurring'
    ];
    return paymentDeps.some(dep => deps[dep]);
  }

  /**
   * Detect Python-based frameworks by looking for Python project files
   */
  private detectPythonFramework(): Framework | null {
    const projectRoot = this.projectRoot;

    // Check for Python project indicators
    const hasPyprojectToml = existsSync(join(projectRoot, 'pyproject.toml'));
    const hasSetupPy = existsSync(join(projectRoot, 'setup.py'));
    const hasRequirementsTxt = existsSync(join(projectRoot, 'requirements.txt'));
    const hasPipfile = existsSync(join(projectRoot, 'Pipfile'));
    const hasPoetryLock = existsSync(join(projectRoot, 'poetry.lock'));
    const hasManagePy = existsSync(join(projectRoot, 'manage.py'));

    // Check for Django in pyproject.toml
    if (hasPyprojectToml) {
      try {
        const content = readFileSync(join(projectRoot, 'pyproject.toml'), 'utf-8');
        if (content.includes('Framework :: Django') || content.includes('"django"') || content.includes("'django'")) {
          return 'django';
        }
        // Check description for Django CMS
        if (content.includes('Django') && content.includes('CMS')) {
          return 'django';
        }
      } catch {
        // Ignore read errors
      }
    }

    // Check for Django by looking for settings.py or manage.py
    if (hasManagePy) {
      const settingsFiles = ['settings.py', 'settings'];
      for (const sf of settingsFiles) {
        if (existsSync(join(projectRoot, sf)) || existsSync(join(projectRoot, 'project', sf))) {
          return 'django';
        }
      }
      // If manage.py exists but no settings found, still likely Django
      return 'django';
    }

    // Check for FastAPI
    const mainPy = existsSync(join(projectRoot, 'main.py'));
    const appPy = existsSync(join(projectRoot, 'app.py'));
    if (mainPy || appPy) {
      // Check content for FastAPI imports
      const possibleFiles = [join(projectRoot, 'main.py'), join(projectRoot, 'app.py')];
      for (const pf of possibleFiles) {
        if (existsSync(pf)) {
          try {
            const content = readFileSync(pf, 'utf-8');
            if (content.includes('from fastapi import') || content.includes('import fastapi')) {
              return 'fastapi';
            }
          } catch {
            // Ignore read errors
          }
        }
      }
    }

    // Check for Flask
    if (appPy) {
      const appPath = join(projectRoot, 'app.py');
      try {
        const content = readFileSync(appPath, 'utf-8');
        if (content.includes('from flask import') || content.includes('import flask')) {
          return 'flask';
        }
      } catch {
        // Ignore read errors
      }
    }

    // Check for SQLAlchemy
    const hasModelsPy = existsSync(join(projectRoot, 'models.py'));
    if (hasModelsPy) {
      try {
        const content = readFileSync(join(projectRoot, 'models.py'), 'utf-8');
        if (content.includes('from sqlalchemy import') || content.includes('import sqlalchemy')) {
          return 'sqlalchemy';
        }
      } catch {
        // Ignore read errors
      }
    }

    // Check for Celery
    const hasCeleryConfig = existsSync(join(projectRoot, 'celery.py')) ||
                           existsSync(join(projectRoot, 'celeryconfig.py'));
    if (hasCeleryConfig) {
      return 'celery';
    }

    // If any Python project file exists, return python as generic
    if (hasPyprojectToml || hasSetupPy || hasRequirementsTxt || hasPipfile || hasPoetryLock) {
      return 'python';
    }

    return null;
  }

  getPackageJson(): PackageJson | null {
    const packageJsonPath = join(this.projectRoot, 'package.json');

    if (!existsSync(packageJsonPath)) {
      return null;
    }

    try {
      const content = readFileSync(packageJsonPath, 'utf-8');
      const parsed = JSON.parse(content);
      return {
        name: parsed.name || '',
        version: parsed.version || '0.0.0',
        dependencies: parsed.dependencies || {},
        devDependencies: parsed.devDependencies || {},
        scripts: parsed.scripts || {}
      };
    } catch (error) {
      console.warn('Failed to parse package.json:', error);
      return null;
    }
  }

  getProjectFiles(extensions: string[] = ['.ts', '.tsx', '.js', '.jsx', '.vue', '.svelte']): string[] {
    const files: string[] = [];
    const srcDir = join(this.projectRoot, 'src');

    if (!existsSync(srcDir)) {
      return files;
    }

    this.walkDir(srcDir, files, extensions);
    return files;
  }

  private walkDir(dir: string, files: string[], extensions: string[]): void {
    if (!existsSync(dir)) return;

    let entries: string[];
    try {
      entries = readdirSync(dir);
    } catch {
      return;
    }

    for (const entry of entries) {
      const fullPath = join(dir, entry);
      let stat: ReturnType<typeof statSync> | null = null;

      try {
        stat = statSync(fullPath);
      } catch {
        continue;
      }

      if (stat && stat.isDirectory() && !entry.startsWith('.') && entry !== 'node_modules') {
        this.walkDir(fullPath, files, extensions);
      } else if (stat && stat.isFile()) {
        const ext = entry.substring(entry.lastIndexOf('.'));
        if (extensions.includes(ext)) {
          files.push(fullPath);
        }
      }
    }
  }
}

export function createDetector(projectRoot: string): FrameworkDetector {
  return new FrameworkDetector(projectRoot);
}
