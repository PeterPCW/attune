import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { FrameworkDetector } from '../core/detector/index.js';
import * as fs from 'fs';
import * as path from 'path';

describe('FrameworkDetector', () => {
  const testDir = '/tmp/test-detector';

  beforeEach(() => {
    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir, { recursive: true });
    }
  });

  afterEach(() => {
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
  });

  it('should detect nodejs when no package.json', () => {
    const detector = new FrameworkDetector(testDir);
    const framework = detector.detect();
    expect(framework).toBe('nodejs');
  });

  it('should detect react from dependencies', () => {
    fs.writeFileSync(
      path.join(testDir, 'package.json'),
      JSON.stringify({ dependencies: { react: '^18.0.0' } })
    );
    const detector = new FrameworkDetector(testDir);
    const framework = detector.detect();
    expect(framework).toBe('react');
  });

  it('should detect nextjs from dependencies', () => {
    fs.writeFileSync(
      path.join(testDir, 'package.json'),
      JSON.stringify({ dependencies: { next: '^13.0.0' } })
    );
    const detector = new FrameworkDetector(testDir);
    const framework = detector.detect();
    expect(framework).toBe('nextjs');
  });

  it('should detect vue from dependencies', () => {
    fs.writeFileSync(
      path.join(testDir, 'package.json'),
      JSON.stringify({ dependencies: { vue: '^3.0.0' } })
    );
    const detector = new FrameworkDetector(testDir);
    const framework = detector.detect();
    expect(framework).toBe('vue');
  });

  it('should detect express from dependencies', () => {
    fs.writeFileSync(
      path.join(testDir, 'package.json'),
      JSON.stringify({ dependencies: { express: '^4.0.0' } })
    );
    const detector = new FrameworkDetector(testDir);
    const framework = detector.detect();
    expect(framework).toBe('express');
  });

  it('should prioritize nextjs over react', () => {
    fs.writeFileSync(
      path.join(testDir, 'package.json'),
      JSON.stringify({
        dependencies: {
          react: '^18.0.0',
          next: '^13.0.0'
        }
      })
    );
    const detector = new FrameworkDetector(testDir);
    const framework = detector.detect();
    expect(framework).toBe('nextjs');
  });

  it('should detect nuxt from dependencies', () => {
    fs.writeFileSync(
      path.join(testDir, 'package.json'),
      JSON.stringify({ dependencies: { nuxt: '^3.0.0' } })
    );
    const detector = new FrameworkDetector(testDir);
    const framework = detector.detect();
    expect(framework).toBe('nuxt');
  });

  it('should detect svelte from dependencies', () => {
    fs.writeFileSync(
      path.join(testDir, 'package.json'),
      JSON.stringify({ dependencies: { svelte: '^4.0.0' } })
    );
    const detector = new FrameworkDetector(testDir);
    const framework = detector.detect();
    expect(framework).toBe('svelte');
  });

  it('should detect astro from dependencies', () => {
    fs.writeFileSync(
      path.join(testDir, 'package.json'),
      JSON.stringify({ dependencies: { astro: '^3.0.0' } })
    );
    const detector = new FrameworkDetector(testDir);
    const framework = detector.detect();
    expect(framework).toBe('astro');
  });

  it('should detect fastify from dependencies', () => {
    fs.writeFileSync(
      path.join(testDir, 'package.json'),
      JSON.stringify({ dependencies: { fastify: '^4.0.0' } })
    );
    const detector = new FrameworkDetector(testDir);
    const framework = detector.detect();
    expect(framework).toBe('fastify');
  });

  it('should detect remix from dependencies', () => {
    fs.writeFileSync(
      path.join(testDir, 'package.json'),
      JSON.stringify({ dependencies: { '@remix-run/react': '^2.0.0' } })
    );
    const detector = new FrameworkDetector(testDir);
    const framework = detector.detect();
    expect(framework).toBe('remix');
  });

  it('should detect solidjs from dependencies', () => {
    fs.writeFileSync(
      path.join(testDir, 'package.json'),
      JSON.stringify({ dependencies: { 'solid-js': '^1.0.0' } })
    );
    const detector = new FrameworkDetector(testDir);
    const framework = detector.detect();
    expect(framework).toBe('solidjs');
  });
});
