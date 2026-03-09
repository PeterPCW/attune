import { FrameworkPlugin, Framework } from '../../types/index.js';

export const frameworkPlugins: FrameworkPlugin[] = [
  {
    name: 'nextjs',
    patterns: [],
    detectors: {
      files: ['next.config.js', 'next.config.ts', 'next.config.mjs'],
      packageNames: ['next']
    },
    metadata: {
      testFiles: ['*.test.ts', '*.test.tsx', '*.spec.ts', '*.spec.tsx'],
      configFiles: ['next.config.*'],
      entryPoints: ['app/**/*.tsx', 'pages/**/*.tsx']
    }
  },
  {
    name: 'react',
    patterns: [],
    detectors: {
      files: ['vite.config.ts', 'vite.config.js'],
      packageNames: ['react', '@vitejs/plugin-react']
    },
    metadata: {
      testFiles: ['*.test.tsx', '*.spec.tsx'],
      configFiles: ['vite.config.ts', 'vite.config.js'],
      entryPoints: ['src/App.tsx', 'src/main.tsx']
    }
  },
  {
    name: 'vue',
    patterns: [],
    detectors: {
      files: ['vite.config.ts', 'vite.config.js', 'vue.config.js'],
      packageNames: ['vue', '@vitejs/plugin-vue']
    },
    metadata: {
      testFiles: ['*.spec.ts', '*.spec.vue'],
      configFiles: ['vite.config.ts', 'vue.config.js'],
      entryPoints: ['src/App.vue']
    }
  },
  {
    name: 'nuxt',
    patterns: [],
    detectors: {
      files: ['nuxt.config.ts', 'nuxt.config.js'],
      packageNames: ['nuxt', '@nuxt/*']
    },
    metadata: {
      testFiles: ['*.test.ts', '*.spec.ts'],
      configFiles: ['nuxt.config.ts'],
      entryPoints: ['app.vue', 'pages/**/*.vue', 'server/**/*.ts']
    }
  },
  {
    name: 'svelte',
    patterns: [],
    detectors: {
      files: ['svelte.config.js', 'vite.config.ts'],
      packageNames: ['svelte', '@sveltejs/*']
    },
    metadata: {
      testFiles: ['*.test.ts', '*.spec.ts'],
      configFiles: ['svelte.config.js', 'vite.config.ts'],
      entryPoints: ['src/main.ts', 'src/App.svelte']
    }
  },
  {
    name: 'remix',
    patterns: [],
    detectors: {
      files: ['remix.config.js', 'vite.config.ts'],
      packageNames: ['@remix-run/*', 'remix']
    },
    metadata: {
      testFiles: ['*.test.ts', '*.spec.ts'],
      configFiles: ['remix.config.js'],
      entryPoints: ['app/routes/**/*.tsx', 'app/root.tsx']
    }
  },
  {
    name: 'astro',
    patterns: [],
    detectors: {
      files: ['astro.config.mjs', 'astro.config.js'],
      packageNames: ['astro']
    },
    metadata: {
      testFiles: ['*.test.ts', '*.spec.ts'],
      configFiles: ['astro.config.mjs'],
      entryPoints: ['src/pages/**/*.astro', 'src/components/**/*.astro']
    }
  },
  {
    name: 'solidjs',
    patterns: [],
    detectors: {
      files: ['vite.config.ts'],
      packageNames: ['solid-js', 'solid-js/web', 'vite-plugin-solid']
    },
    metadata: {
      testFiles: ['*.test.ts', '*.spec.ts'],
      configFiles: ['vite.config.ts'],
      entryPoints: ['src/index.tsx', 'src/App.tsx']
    }
  },
  {
    name: 'express',
    patterns: [],
    detectors: {
      files: [],
      packageNames: ['express']
    },
    metadata: {
      testFiles: ['*.test.ts', '*.spec.ts'],
      configFiles: [],
      entryPoints: ['src/index.ts', 'src/app.ts', 'server.ts']
    }
  },
  {
    name: 'fastify',
    patterns: [],
    detectors: {
      files: [],
      packageNames: ['fastify']
    },
    metadata: {
      testFiles: ['*.test.ts', '*.spec.ts'],
      configFiles: [],
      entryPoints: ['src/index.ts', 'src/server.ts']
    }
  }
];

export function detectFramework(packageJson: Record<string, unknown>): Framework {
  const deps = {
    ...packageJson.dependencies,
    ...packageJson.devDependencies
  };

  // Priority order for detection
  if (deps.next) return 'nextjs';
  if (deps.nuxt) return 'nuxt';
  if (deps['@remix-run/core'] || deps['@remix-run/react'] || deps.remix) return 'remix';
  if (deps.astro) return 'astro';
  if (deps['solid-js']) return 'solidjs';
  if (deps.vue && !deps.nuxt) return 'vue';
  if (deps.svelte) return 'svelte';
  if (deps.react) {
    return 'react';
  }
  if (deps.express) return 'express';
  if (deps.fastify) return 'fastify';

  return 'nodejs';
}
