import { readFileSync, existsSync, readdirSync, statSync } from 'fs';
import { join } from 'path';
import { Framework, PackageJson } from '../../types/index.js';
import { frameworkPlugins, detectFramework } from './frameworks.js';

export class FrameworkDetector {
  private projectRoot: string;

  constructor(projectRoot: string) {
    this.projectRoot = projectRoot;
  }

  detect(): Framework {
    const packageJson = this.getPackageJson();
    if (!packageJson) {
      console.warn('No package.json found, defaulting to nodejs');
      return 'nodejs';
    }

    return detectFramework(packageJson);
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
