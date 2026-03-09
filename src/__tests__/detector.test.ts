import { describe, it, expect, beforeEach, vi } from 'vitest';
import { FrameworkDetector } from '../core/detector/index.js';
import { detectFramework } from '../core/detector/frameworks.js';
import * as fs from 'fs';
import * as path from 'path';
import { mkdtempSync, writeFileSync, rmSync } from 'fs';
import { tmpdir } from 'os';

describe('FrameworkDetector', () => {
  let testDir: string;

  beforeEach(() => {
    testDir = mkdtempSync(path.join(tmpdir(), 'attune-test-'));
  });

  afterEach(() => {
    rmSync(testDir, { recursive: true, force: true });
  });

  it('should detect Next.js from package.json', () => {
    const pkg = {
      dependencies: { next: '^14.0.0' },
      devDependencies: {}
    };
    writeFileSync(path.join(testDir, 'package.json'), JSON.stringify(pkg));

    const detector = new FrameworkDetector(testDir);
    expect(detector.detect()).toBe('nextjs');
  });

  it('should detect React from package.json', () => {
    const pkg = {
      dependencies: { react: '^18.0.0' },
      devDependencies: { '@vitejs/plugin-react': '^4.0.0' }
    };
    writeFileSync(path.join(testDir, 'package.json'), JSON.stringify(pkg));

    const detector = new FrameworkDetector(testDir);
    expect(detector.detect()).toBe('react');
  });

  it('should detect Vue from package.json', () => {
    const pkg = {
      dependencies: { vue: '^3.0.0' },
      devDependencies: {}
    };
    writeFileSync(path.join(testDir, 'package.json'), JSON.stringify(pkg));

    const detector = new FrameworkDetector(testDir);
    expect(detector.detect()).toBe('vue');
  });

  it('should detect Express from package.json', () => {
    const pkg = {
      dependencies: { express: '^4.0.0' },
      devDependencies: {}
    };
    writeFileSync(path.join(testDir, 'package.json'), JSON.stringify(pkg));

    const detector = new FrameworkDetector(testDir);
    expect(detector.detect()).toBe('express');
  });

  it('should default to nodejs when no package.json', () => {
    const detector = new FrameworkDetector(testDir);
    expect(detector.detect()).toBe('nodejs');
  });

  it('should return null for packageJson when none exists', () => {
    const detector = new FrameworkDetector(testDir);
    expect(detector.getPackageJson()).toBeNull();
  });

  it('should parse package.json correctly', () => {
    const pkg = {
      name: 'test-app',
      version: '1.0.0',
      dependencies: { express: '^4.0.0' },
      devDependencies: { typescript: '^5.0.0' }
    };
    writeFileSync(path.join(testDir, 'package.json'), JSON.stringify(pkg));

    const detector = new FrameworkDetector(testDir);
    const result = detector.getPackageJson();

    expect(result).not.toBeNull();
    expect(result?.name).toBe('test-app');
    expect(result?.version).toBe('1.0.0');
    expect(result?.dependencies).toEqual({ express: '^4.0.0' });
  });

  it('should get project files from src directory', () => {
    // Create src directory with TypeScript files
    const srcDir = path.join(testDir, 'src');
    fs.mkdirSync(srcDir, { recursive: true });
    writeFileSync(path.join(srcDir, 'index.ts'), 'export const x = 1;');
    writeFileSync(path.join(srcDir, 'app.ts'), 'export const y = 2;');

    const detector = new FrameworkDetector(testDir);
    const files = detector.getProjectFiles(['.ts', '.tsx']);

    expect(files.length).toBe(2);
    expect(files.some(f => f.endsWith('index.ts'))).toBe(true);
    expect(files.some(f => f.endsWith('app.ts'))).toBe(true);
  });

  it('should return empty array when no src directory exists', () => {
    const detector = new FrameworkDetector(testDir);
    const files = detector.getProjectFiles();

    expect(files).toEqual([]);
  });

  it('should walk directory recursively', () => {
    // Create nested src directory structure
    const srcDir = path.join(testDir, 'src');
    const componentsDir = path.join(srcDir, 'components');
    fs.mkdirSync(componentsDir, { recursive: true });
    writeFileSync(path.join(srcDir, 'index.ts'), 'export const x = 1;');
    writeFileSync(path.join(componentsDir, 'Button.tsx'), 'export const Button = () => null;');

    const detector = new FrameworkDetector(testDir);
    const files = detector.getProjectFiles(['.ts', '.tsx']);

    expect(files.length).toBe(2);
  });

  it('should exclude node_modules from file scanning', () => {
    const srcDir = path.join(testDir, 'src');
    const nodeModules = path.join(testDir, 'node_modules');
    fs.mkdirSync(srcDir, { recursive: true });
    fs.mkdirSync(nodeModules, { recursive: true });
    writeFileSync(path.join(srcDir, 'index.ts'), 'export const x = 1;');
    writeFileSync(path.join(nodeModules, 'dummy.ts'), '// should not be included');

    const detector = new FrameworkDetector(testDir);
    const files = detector.getProjectFiles(['.ts']);

    expect(files.length).toBe(1);
    // Normalize path separators for cross-platform compatibility
    expect(files[0].replace(/\\/g, '/')).toContain('src/index.ts');
  });
});

describe('detectFramework', () => {
  it('should detect Next.js priority over React', () => {
    expect(detectFramework({ dependencies: { next: '^14.0.0', react: '^18.0.0' }, devDependencies: {} })).toBe('nextjs');
  });

  it('should detect Nuxt priority over Vue', () => {
    expect(detectFramework({ dependencies: { nuxt: '^3.0.0', vue: '^3.0.0' }, devDependencies: {} })).toBe('nuxt');
  });

  it('should detect Astro', () => {
    expect(detectFramework({ dependencies: { astro: '^4.0.0' }, devDependencies: {} })).toBe('astro');
  });

  it('should detect SolidJS', () => {
    expect(detectFramework({ dependencies: { 'solid-js': '^1.8.0' }, devDependencies: {} })).toBe('solidjs');
  });

  it('should detect Fastify', () => {
    expect(detectFramework({ dependencies: { fastify: '^4.0.0' }, devDependencies: {} })).toBe('fastify');
  });

  it('should detect Remix', () => {
    expect(detectFramework({ dependencies: { '@remix-run/react': '^2.0.0' }, devDependencies: {} })).toBe('remix');
  });

  it('should default to nodejs for unknown', () => {
    expect(detectFramework({ dependencies: { lodash: '^4.0.0' }, devDependencies: {} })).toBe('nodejs');
  });
});
