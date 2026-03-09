import { BaseRule } from '../base-rule.js';
import { Finding, AnalysisContext, Category, Severity, Framework, Recommendation } from '../../types/index.js';

const PERF_BIG_BUNDLE: Recommendation = {
  title: 'Code splitting for large bundles',
  description: 'Large bundles hurt load time. Use dynamic imports for code splitting.',
  library: 'Webpack, Vite'
};

const PERF_SYNCHRONOUS: Recommendation = {
  title: 'Avoid synchronous operations',
  description: 'Use async/await for I/O operations to avoid blocking.',
  library: 'Node.js'
};

const PERF_MEMORY_LEAK: Recommendation = {
  title: 'Check for potential memory leaks',
  description: 'Global variables and uncached arrays can cause memory leaks.',
  library: 'Node.js'
};

const PERF_IMMUTABLE: Recommendation = {
  title: 'Prefer immutability',
  description: 'Mutating objects creates side effects. Use immutable patterns.',
  library: 'Immer, immutable.js'
};

const PERF_REGEX: Recommendation = {
  title: 'Optimize regex patterns',
  description: 'Inefficient regex can slow down execution. Compile regexes outside loops.',
  library: 'Performance'
};

const PERF_CACHING: Recommendation = {
  title: 'Add caching for expensive operations',
  description: 'Expensive operations should be cached.',
  library: 'Performance'
};

const PERF_DEBOUNCE: Recommendation = {
  title: 'Debounce frequent events',
  description: 'Frequent events like scroll/resize should be debounced.',
  library: 'lodash.debounce'
};

const PERF_IMAGES: Recommendation = {
  title: 'Optimize images',
  description: 'Images should be optimized and lazy loaded.',
  library: 'next/image, vite-imagetools'
};

const PERF_LIST_VIRTUALIZATION: Recommendation = {
  title: 'Virtualize long lists',
  description: 'Long lists should use virtualization for performance.',
  library: 'react-window, vue-virtual-scroller'
};

const PERF_PRELOAD: Recommendation = {
  title: 'Preload critical resources',
  description: 'Critical resources should be preloaded.',
  library: 'HTML preload'
};

const PERF_WEB_WORKER: Recommendation = {
  title: 'Offload to web worker',
  description: 'Heavy computations should be moved to web workers.',
  library: 'Web Workers'
};

const PERF_DEPENDENCIES: Recommendation = {
  title: 'Check for heavy dependencies',
  description: 'Heavy dependencies impact bundle size. Consider alternatives.',
  library: 'Bundle analysis'
};

class BigBundleRule extends BaseRule {
  id = 'PERF_BIG_BUNDLE';
  name = 'Large bundle size';
  category: Category = 'performance';
  severity: Severity = 'medium';
  frameworks: Framework[] = ['react', 'nextjs', 'vue', 'svelte'];
  recommendation = PERF_BIG_BUNDLE;

  detect(context: AnalysisContext): Finding[] {
    const findings: Finding[] = [];
    const frameworks = ['react', 'nextjs', 'vue', 'svelte'];

    if (!frameworks.includes(context.framework)) return findings;

    for (const file of context.files) {
      const lineCount = file.content.split('\n').length;
      // Flag very large component files
      if (lineCount > 500) {
        findings.push(this.createFinding(
          context,
          file.path,
          1,
          `Large file (${lineCount} lines) - consider splitting`,
          `${lineCount} lines`
        ));
      }
    }

    return findings;
  }
}

class SyncOperationRule extends BaseRule {
  id = 'PERF_SYNCHRONOUS';
  name = 'Synchronous file operations';
  category: Category = 'performance';
  severity: Severity = 'medium';
  frameworks: Framework[] = ['nodejs', 'express', 'fastify'];
  recommendation = PERF_SYNCHRONOUS;

  detect(context: AnalysisContext): Finding[] {
    const findings: Finding[] = [];

    const frameworks = ['nodejs', 'express', 'fastify'];
    if (!frameworks.includes(context.framework)) return findings;

    for (const file of context.files) {
      // Skip rule definition files, core library files, and CLI to avoid false positives
      if (file.path.includes('/rules/') || file.path.includes('/src/core/') || file.path.includes('/src/cli/')) continue;

      const content = file.content;

      // Look for sync file operations
      if (content.includes('readFileSync') || content.includes('writeFileSync') || content.includes('existsSync')) {
        findings.push(this.createFinding(
          context,
          file.path,
          1,
          'Synchronous file operation - use async version instead',
          'readFileSync/writeFileSync'
        ));
      }
    }

    return findings;
  }
}

class MemoryLeakRule extends BaseRule {
  id = 'PERF_MEMORY_LEAK';
  name = 'Potential memory leak';
  category: Category = 'performance';
  severity: Severity = 'high';
  frameworks: Framework[] = [];
  recommendation = PERF_MEMORY_LEAK;

  detect(context: AnalysisContext): Finding[] {
    const findings: Finding[] = [];

    for (const file of context.files) {
      // Skip rule definition files
      if (file.path.includes('/rules/')) continue;

      const content = file.content;

      // Look for global variables being mutated
      if (content.includes('global.') || content.includes('globalThis.')) {
        findings.push(this.createFinding(
          context,
          file.path,
          1,
          'Global variable mutation - can cause memory leaks',
          'global. or globalThis.'
        ));
      }
    }

    return findings;
  }
}

class ImmutableRule extends BaseRule {
  id = 'PERF_IMMUTABLE';
  name = 'Mutable object mutation';
  category: Category = 'performance';
  severity: Severity = 'low';
  frameworks: Framework[] = [];
  recommendation = PERF_IMMUTABLE;

  detect(context: AnalysisContext): Finding[] {
    const findings: Finding[] = [];

    for (const file of context.files) {
      // Skip rule definition files to avoid self-detection
      if (file.path.includes('/rules/')) continue;

      // Skip core/analyzer/cli/formatters files - they often collect findings/options into arrays
      if (file.path.includes('/core/') || file.path.includes('/analyzer/') || file.path.includes('/cli/') || file.path.includes('/formatters/')) continue;

      const content = file.content;

      if (content.includes('.push(') || content.includes('.splice(')) {
        findings.push(this.createFinding(
          context,
          file.path,
          1,
          'Array mutation detected - consider immutable patterns',
          '.push() or .splice()'
        ));
        break;
      }
    }

    return findings;
  }
}

class RegexRule extends BaseRule {
  id = 'PERF_REGEX';
  name = 'Inefficient regex in loop';
  category: Category = 'performance';
  severity: Severity = 'medium';
  frameworks: Framework[] = [];
  recommendation = PERF_REGEX;

  detect(context: AnalysisContext): Finding[] {
    const findings: Finding[] = [];

    return findings;
  }
}

class CachingRule extends BaseRule {
  id = 'PERF_CACHING';
  name = 'Missing caching for expensive operations';
  category: Category = 'performance';
  severity: Severity = 'medium';
  frameworks: Framework[] = [];
  recommendation = PERF_CACHING;

  detect(context: AnalysisContext): Finding[] {
    const findings: Finding[] = [];

    return findings;
  }
}

class DebounceRule extends BaseRule {
  id = 'PERF_DEBOUNCE';
  name = 'Undebounced event handler';
  category: Category = 'performance';
  severity: Severity = 'medium';
  frameworks: Framework[] = [];
  recommendation = PERF_DEBOUNCE;

  detect(context: AnalysisContext): Finding[] {
    const findings: Finding[] = [];

    for (const file of context.files) {
      const content = file.content;

      // Look for event listeners without debounce
      if ((content.includes('addEventListener') || content.includes('on(')) &&
          !content.includes('debounce') && !content.includes('throttle')) {
        if (content.includes('scroll') || content.includes('resize') || content.includes('mousemove')) {
          findings.push(this.createFinding(
            context,
            file.path,
            1,
            'Event handler should be debounced/throttled for performance',
            'addEventListener without debounce'
          ));
          break;
        }
      }
    }

    return findings;
  }
}

class ImagesRule extends BaseRule {
  id = 'PERF_IMAGES';
  name = 'Unoptimized images';
  category: Category = 'performance';
  severity: Severity = 'medium';
  frameworks: Framework[] = [];
  recommendation = PERF_IMAGES;

  detect(context: AnalysisContext): Finding[] {
    const findings: Finding[] = [];

    return findings;
  }
}

class ListVirtualizationRule extends BaseRule {
  id = 'PERF_LIST_VIRTUALIZATION';
  name = 'Long list without virtualization';
  category: Category = 'performance';
  severity: Severity = 'medium';
  frameworks: Framework[] = [];
  recommendation = PERF_LIST_VIRTUALIZATION;

  detect(context: AnalysisContext): Finding[] {
    const findings: Finding[] = [];

    return findings;
  }
}

class PreloadRule extends BaseRule {
  id = 'PERF_PRELOAD';
  name = 'Missing resource preload';
  category: Category = 'performance';
  severity: Severity = 'low';
  frameworks: Framework[] = [];
  recommendation = PERF_PRELOAD;

  detect(context: AnalysisContext): Finding[] {
    const findings: Finding[] = [];

    return findings;
  }
}

class WebWorkerRule extends BaseRule {
  id = 'PERF_WEB_WORKER';
  name = 'Heavy computation on main thread';
  category: Category = 'performance';
  severity: Severity = 'medium';
  frameworks: Framework[] = [];
  recommendation = PERF_WEB_WORKER;

  detect(context: AnalysisContext): Finding[] {
    const findings: Finding[] = [];

    return findings;
  }
}

class DependenciesRule extends BaseRule {
  id = 'PERF_DEPENDENCIES';
  name = 'Heavy dependency detected';
  category: Category = 'performance';
  severity: Severity = 'low';
  frameworks: Framework[] = [];
  recommendation = PERF_DEPENDENCIES;

  detect(context: AnalysisContext): Finding[] {
    const findings: Finding[] = [];

    return findings;
  }
}

export class PerformanceRules {
  static getRules() {
    return [
      new BigBundleRule(),
      new SyncOperationRule(),
      new MemoryLeakRule(),
      new ImmutableRule(),
      new RegexRule(),
      new CachingRule(),
      new DebounceRule(),
      new ImagesRule(),
      new ListVirtualizationRule(),
      new PreloadRule(),
      new WebWorkerRule(),
      new DependenciesRule()
    ];
  }
}
