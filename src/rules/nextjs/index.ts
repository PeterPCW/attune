import { BaseRule } from '../base-rule.js';
import { Finding, AnalysisContext, Category, Severity, Framework, Recommendation } from '../../types/index.js';

const NEXT_SERVER_COMPONENT_CLIENT: Recommendation = {
  title: 'Move client code to client component',
  description: 'useState/useEffect can only be used in Client Components. Add "use client" or refactor.',
  library: 'Next.js'
};

const NEXT_CLIENT_DIRECTIVE: Recommendation = {
  title: 'Remove unnecessary "use client" directive',
  description: '"use client" makes the component a Client Component. Use only if you need hooks or browser APIs.',
  library: 'Next.js'
};

const NEXT_SERVER_DIRECTIVE: Recommendation = {
  title: 'Add "use server" for server actions',
  description: 'Server actions should be marked with "use server" directive.',
  library: 'Next.js'
};

const NEXT_MISSING_CACHE: Recommendation = {
  title: 'Add cache option to fetch',
  description: 'fetch() without cache option may cause unnecessary fetches.',
  library: 'Next.js'
};

const NEXT_CACHE_DYNAMIC: Recommendation = {
  title: 'Configure cache for dynamic data',
  description: 'Dynamic data should have explicit cache configuration.',
  library: 'Next.js'
};

const NEXT_LAYOUT_STATE: Recommendation = {
  title: 'Don\'t use state in shared layout',
  description: 'State in shared layouts causes all pages to re-render. Move state to client components.',
  library: 'Next.js'
};

const NEXT_METADATA_DYNAMIC: Recommendation = {
  title: 'Use generateMetadata for dynamic metadata',
  description: 'Dynamic metadata should use generateMetadata function.',
  library: 'Next.js'
};

const NEXT_IMAGE_UNOPTIMIZED: Recommendation = {
  title: 'Configure next/image optimization',
  description: 'next/image should have proper optimization configuration.',
  library: 'next/image'
};

const NEXT_FONT_GOOGLE: Recommendation = {
  title: 'Use next/font for Google Fonts',
  description: 'Use next/font/google for optimized font loading.',
  library: 'next/font'
};

const NEXT_DYNAMIC_IMPORT: Recommendation = {
  title: 'Use dynamic imports for heavy components',
  description: 'Heavy components should be lazy loaded with dynamic imports.',
  library: 'Next.js'
};

const NEXT_PARALLEL_ROUTE_MISSING: Recommendation = {
  title: 'Add default component for parallel routes',
  description: 'Parallel routes need a default.tsx to handle unmatched slots.',
  library: 'Next.js'
};

class ServerComponentClientRule extends BaseRule {
  id = 'NEXT_SERVER_COMPONENT_CLIENT';
  name = 'useState/useEffect in Server Component';
  category: Category = 'architecture';
  severity: Severity = 'critical';
  frameworks: Framework[] = ['nextjs'];
  recommendation = NEXT_SERVER_COMPONENT_CLIENT;

  detect(context: AnalysisContext): Finding[] {
    const findings: Finding[] = [];

    if (context.framework !== 'nextjs') return findings;

    const hookPatterns = [/useState\s*\(/, /useEffect\s*\(/, /useCallback\s*\(/, /useMemo\s*\(/];

    for (const file of context.files) {
      if (!file.path.endsWith('.tsx')) continue;

      // Skip app directory files (they're server by default) unless they have "use client"
      if (file.path.includes('/app/') && !file.content.includes('"use client"')) {
        const content = file.content;

        for (const pattern of hookPatterns) {
          if (pattern.test(content)) {
            findings.push(this.createFinding(
              context,
              file.path,
              1,
              'Hooks used in Server Component - add "use client" or move to client component',
              'useState/useEffect in app/ directory'
            ));
            break;
          }
        }
      }
    }

    return findings;
  }
}

class UnnecessaryClientDirective extends BaseRule {
  id = 'NEXT_CLIENT_DIRECTIVE';
  name = 'Unnecessary "use client" directive';
  category: Category = 'performance';
  severity: Severity = 'medium';
  frameworks: Framework[] = ['nextjs'];
  recommendation = NEXT_CLIENT_DIRECTIVE;

  detect(context: AnalysisContext): Finding[] {
    const findings: Finding[] = [];

    if (context.framework !== 'nextjs') return findings;

    for (const file of context.files) {
      if (!file.path.endsWith('.tsx')) continue;

      const content = file.content;

      if (content.includes('"use client"') || content.includes("'use client'")) {
        const hasHooks = /use(State|Effect|Callback|Memo|Ref|Context)\s*\(/.test(content);
        const hasBrowser = /\bdocument\b|\bwindow\b|\blocation\b/.test(content);

        if (!hasHooks && !hasBrowser) {
          findings.push(this.createFinding(
            context,
            file.path,
            1,
            'Unnecessary "use client" directive - component could be Server Component',
            '"use client" without hooks or browser APIs'
          ));
        }
      }
    }

    return findings;
  }
}

class ServerDirectiveRule extends BaseRule {
  id = 'NEXT_SERVER_DIRECTIVE';
  name = 'Missing "use server" for server actions';
  category: Category = 'architecture';
  severity: Severity = 'medium';
  frameworks: Framework[] = ['nextjs'];
  recommendation = NEXT_SERVER_DIRECTIVE;

  detect(context: AnalysisContext): Finding[] {
    const findings: Finding[] = [];

    if (context.framework !== 'nextjs') return findings;

    for (const file of context.files) {
      if (!file.path.endsWith('.ts')) continue;

      const content = file.content;

      // Check for server action patterns without "use server"
      if (content.includes('action') && !content.includes('"use server"') && !content.includes("'use server'")) {
        if (content.includes('async') && content.includes('formData')) {
          findings.push(this.createFinding(
            context,
            file.path,
            1,
            'Server action should be marked with "use server" directive',
            'Missing "use server"'
          ));
          break;
        }
      }
    }

    return findings;
  }
}

class MissingCacheRule extends BaseRule {
  id = 'NEXT_MISSING_CACHE';
  name = 'fetch() without cache option';
  category: Category = 'performance';
  severity: Severity = 'medium';
  frameworks: Framework[] = ['nextjs'];
  recommendation = NEXT_MISSING_CACHE;

  detect(context: AnalysisContext): Finding[] {
    const findings: Finding[] = [];

    if (context.framework !== 'nextjs') return findings;

    for (const file of context.files) {
      const content = file.content;

      // Look for fetch without cache
      if (content.includes('fetch(') && !content.includes('cache:') && file.path.includes('/app/')) {
        findings.push(this.createFinding(
          context,
          file.path,
          1,
          'fetch() without cache option in Server Component - add cache configuration',
          'Missing cache option'
        ));
        break;
      }
    }

    return findings;
  }
}

class CacheDynamicRule extends BaseRule {
  id = 'NEXT_CACHE_DYNAMIC';
  name = 'Dynamic data without cache config';
  category: Category = 'performance';
  severity: Severity = 'low';
  frameworks: Framework[] = ['nextjs'];
  recommendation = NEXT_CACHE_DYNAMIC;

  detect(context: AnalysisContext): Finding[] {
    const findings: Finding[] = [];

    if (context.framework !== 'nextjs') return findings;

    return findings;
  }
}

class LayoutStateRule extends BaseRule {
  id = 'NEXT_LAYOUT_STATE';
  name = 'State in shared layout';
  category: Category = 'performance';
  severity: Severity = 'medium';
  frameworks: Framework[] = ['nextjs'];
  recommendation = NEXT_LAYOUT_STATE;

  detect(context: AnalysisContext): Finding[] {
    const findings: Finding[] = [];

    if (context.framework !== 'nextjs') return findings;

    for (const file of context.files) {
      if (!file.path.includes('/app/') || !file.path.includes('layout.tsx')) continue;

      const content = file.content;

      if (content.includes('useState') || content.includes('useReducer')) {
        findings.push(this.createFinding(
          context,
          file.path,
          1,
          'State in shared layout causes all pages to re-render - move to client component',
          'useState in layout'
        ));
        break;
      }
    }

    return findings;
  }
}

class MetadataDynamicRule extends BaseRule {
  id = 'NEXT_METADATA_DYNAMIC';
  name = 'Dynamic metadata without generate';
  category: Category = 'performance';
  severity: Severity = 'low';
  frameworks: Framework[] = ['nextjs'];
  recommendation = NEXT_METADATA_DYNAMIC;

  detect(context: AnalysisContext): Finding[] {
    const findings: Finding[] = [];

    if (context.framework !== 'nextjs') return findings;

    return findings;
  }
}

class ImageOptimizedRule extends BaseRule {
  id = 'NEXT_IMAGE_UNOPTIMIZED';
  name = 'next/image without optimization config';
  category: Category = 'performance';
  severity: Severity = 'low';
  frameworks: Framework[] = ['nextjs'];
  recommendation = NEXT_IMAGE_UNOPTIMIZED;

  detect(context: AnalysisContext): Finding[] {
    const findings: Finding[] = [];

    if (context.framework !== 'nextjs') return findings;

    return findings;
  }
}

class FontGoogleRule extends BaseRule {
  id = 'NEXT_FONT_GOOGLE';
  name = 'Google Fonts without optimization';
  category: Category = 'performance';
  severity: Severity = 'low';
  frameworks: Framework[] = ['nextjs'];
  recommendation = NEXT_FONT_GOOGLE;

  detect(context: AnalysisContext): Finding[] {
    const findings: Finding[] = [];

    if (context.framework !== 'nextjs') return findings;

    for (const file of context.files) {
      if (file.path.includes('layout') || file.path.includes('page')) {
        const content = file.content;
        if (content.includes('<link') && content.includes('fonts.googleapis.com')) {
          findings.push(this.createFinding(
            context,
            file.path,
            1,
            'Google Fonts loaded without optimization - use next/font/google',
            'External font link'
          ));
          break;
        }
      }
    }

    return findings;
  }
}

class DynamicImportRule extends BaseRule {
  id = 'NEXT_DYNAMIC_IMPORT';
  name = 'Missing dynamic imports for heavy components';
  category: Category = 'performance';
  severity: Severity = 'medium';
  frameworks: Framework[] = ['nextjs'];
  recommendation = NEXT_DYNAMIC_IMPORT;

  detect(context: AnalysisContext): Finding[] {
    const findings: Finding[] = [];

    if (context.framework !== 'nextjs') return findings;

    return findings;
  }
}

class ParallelRouteMissingRule extends BaseRule {
  id = 'NEXT_PARALLEL_ROUTE_MISSING';
  name = 'Parallel route without default.tsx';
  category: Category = 'architecture';
  severity: Severity = 'medium';
  frameworks: Framework[] = ['nextjs'];
  recommendation = NEXT_PARALLEL_ROUTE_MISSING;

  detect(context: AnalysisContext): Finding[] {
    const findings: Finding[] = [];

    if (context.framework !== 'nextjs') return findings;

    return findings;
  }
}

export class NextjsRules {
  static getRules() {
    return [
      new ServerComponentClientRule(),
      new UnnecessaryClientDirective(),
      new ServerDirectiveRule(),
      new MissingCacheRule(),
      new CacheDynamicRule(),
      new LayoutStateRule(),
      new MetadataDynamicRule(),
      new ImageOptimizedRule(),
      new FontGoogleRule(),
      new DynamicImportRule(),
      new ParallelRouteMissingRule()
    ];
  }
}
