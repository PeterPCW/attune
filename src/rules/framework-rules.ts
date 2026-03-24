/**
 * Framework Rule Imports
 *
 * Maps framework names to their TypeScript rule loaders.
 * These have complex detection logic that can't be expressed in JSON.
 *
 * Lazy loading ensures they're only imported when the framework is detected.
 */

import type { DetectionRule } from '../types/index.js';

type RuleLoader = () => DetectionRule[];

/**
 * Get framework rule loaders for all supported frameworks
 * Each loader returns an array of DetectionRule for that framework
 */
export async function getFrameworkRuleLoaders(): Promise<Record<string, RuleLoader>> {
  return {
    // JavaScript/TypeScript frameworks
    react: async () => {
      const { ReactRules } = await import('./react/index.js');
      return ReactRules.getRules();
    },
    nextjs: async () => {
      const { NextjsRules } = await import('./nextjs/index.js');
      return NextjsRules.getRules();
    },
    vue: async () => {
      const { VueRules } = await import('./vue/index.js');
      return VueRules.getRules();
    },
    nuxt: async () => {
      const { NuxtRules } = await import('./nuxt/index.js');
      return NuxtRules.getRules();
    },
    svelte: async () => {
      const { SvelteRules } = await import('./svelte/index.js');
      return SvelteRules.getRules();
    },
    remix: async () => {
      const { RemixRules } = await import('./remix/index.js');
      return RemixRules.getRules();
    },
    astro: async () => {
      const { AstroRules } = await import('./astro/index.js');
      return AstroRules.getRules();
    },
    solidjs: async () => {
      const { SolidjsRules } = await import('./solidjs/index.js');
      return SolidjsRules.getRules();
    },
    angular: async () => {
      const { AngularRules } = await import('./angular/index.js');
      return AngularRules.getRules();
    },

    // Node.js frameworks
    express: async () => {
      const { ExpressRules } = await import('./express/index.js');
      return ExpressRules.getRules();
    },
    fastify: async () => {
      const { FastifyRules } = await import('./fastify/index.js');
      return FastifyRules.getRules();
    },
    trpc: async () => {
      const { TrpcRules } = await import('./trpc/index.js');
      return TrpcRules.getRules();
    },

    // Python frameworks (some export arrays, some export classes)
    python: async () => {
      const mod = await import('./python/index.js');
      return mod.pythonRules || mod.default || [];
    },
    django: async () => {
      const mod = await import('./django/index.js');
      return mod.DjangoRules?.getRules ? mod.DjangoRules.getRules() : (mod.djangoRules || mod.default || []);
    },
    fastapi: async () => {
      const mod = await import('./fastapi/index.js');
      return mod.FastapiRules?.getRules ? mod.FastapiRules.getRules() : (mod.default || []);
    },
    flask: async () => {
      const mod = await import('./flask/index.js');
      return mod.FlaskRules?.getRules ? mod.FlaskRules.getRules() : (mod.default || []);
    },
    sqlalchemy: async () => {
      const mod = await import('./sqlalchemy/index.js');
      return mod.SqlalchemyRules?.getRules ? mod.SqlalchemyRules.getRules() : (mod.default || []);
    },
    celery: async () => {
      const mod = await import('./celery/index.js');
      return mod.CeleryRules?.getRules ? mod.CeleryRules.getRules() : (mod.default || []);
    },
  };
}
