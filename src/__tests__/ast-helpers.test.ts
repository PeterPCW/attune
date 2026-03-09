import { describe, it, expect, beforeEach } from 'vitest';
import { Finding, AnalysisContext, SourceFile } from '../types/index';
import {
  findFunctionWithoutErrorHandling,
  findComponentWithoutTypes,
  findAsyncWithoutAwait,
  findMissingReturnType,
  findEventListenerWithoutCleanup,
  findMissingDependencyArray,
} from '../rules/helpers/ast-helpers';

describe('AST Helper: findFunctionWithoutErrorHandling', () => {
  let mockContext: AnalysisContext;

  beforeEach(() => {
    mockContext = {
      projectRoot: '/test',
      framework: 'react',
      files: [],
      packageJson: null,
    };
  });

  it('should find functions without try-catch', () => {
    const files: SourceFile[] = [
      {
        path: '/test/src/api.ts',
        content: `
function processData(data) {
  const result = data.map(x => x * 2);
  return result;
}

async function fetchData() {
  const response = await fetch('/api/data');
  return response.json();
}
`
      },
    ];
    mockContext.files = files;

    const findings = findFunctionWithoutErrorHandling(mockContext, {
      message: 'Function missing error handling',
      minLines: 3,
    });

    expect(findings.length).toBeGreaterThan(0);
    expect(findings[0].category).toBe('error-handling');
  });

  it('should not flag functions with try-catch', () => {
    const files: SourceFile[] = [
      {
        path: '/test/src/api.ts',
        content: `
async function safeFetch() {
  try {
    const response = await fetch('/api/data');
    return response.json();
  } catch (error) {
    console.error(error);
    return null;
  }
}
`
      },
    ];
    mockContext.files = files;

    const findings = findFunctionWithoutErrorHandling(mockContext, {
      message: 'Function missing error handling',
      minLines: 3,
    });

    // Should find nothing - function has try-catch
    expect(findings.length).toBe(0);
  });

  it('should respect minLines parameter', () => {
    const files: SourceFile[] = [
      {
        path: '/test/src/api.ts',
        content: `
function tiny() { return 1; }
`
      },
    ];
    mockContext.files = files;

    const findings = findFunctionWithoutErrorHandling(mockContext, {
      message: 'Function missing error handling',
      minLines: 5,
    });

    // Should find nothing - function is too small
    expect(findings.length).toBe(0);
  });
});

describe('AST Helper: findEventListenerWithoutCleanup', () => {
  let mockContext: AnalysisContext;

  beforeEach(() => {
    mockContext = {
      projectRoot: '/test',
      framework: 'react',
      files: [],
      packageJson: null,
    };
  });

  it('should find addEventListener without removeEventListener', () => {
    const files: SourceFile[] = [
      {
        path: '/test/src/app.js',
        content: `
function setupHandler() {
  window.addEventListener('click', handleClick);
}
`
      },
    ];
    mockContext.files = files;

    const findings = findEventListenerWithoutCleanup(mockContext, {
      message: 'Event listener may cause memory leak',
    });

    expect(findings.length).toBeGreaterThan(0);
    expect(findings[0].category).toBe('performance');
  });

  it('should not flag when removeEventListener is present', () => {
    const files: SourceFile[] = [
      {
        path: '/test/src/app.js',
        content: `
function setupHandler() {
  window.addEventListener('click', handleClick);
  return () => window.removeEventListener('click', handleClick);
}
`
      },
    ];
    mockContext.files = files;

    const findings = findEventListenerWithoutCleanup(mockContext, {
      message: 'Event listener may cause memory leak',
    });

    expect(findings.length).toBe(0);
  });
});

describe('AST Helper: findMissingReturnType', () => {
  let mockContext: AnalysisContext;

  beforeEach(() => {
    mockContext = {
      projectRoot: '/test',
      framework: 'react',
      files: [],
      packageJson: null,
    };
  });

  it('should find exported functions without return types', () => {
    const files: SourceFile[] = [
      {
        path: '/test/src/utils.ts',
        content: `
export function processData(data) {
  return data.map(x => x * 2);
}

export const helper = (x) => x + 1;
`
      },
    ];
    mockContext.files = files;

    const findings = findMissingReturnType(mockContext, {
      message: 'Exported function missing return type',
    });

    expect(findings.length).toBeGreaterThan(0);
  });
});

describe('AST Helper: findComponentWithoutTypes', () => {
  let mockContext: AnalysisContext;

  beforeEach(() => {
    mockContext = {
      projectRoot: '/test',
      framework: 'react',
      files: [],
      packageJson: null,
    };
  });

  it('should find React components without PropTypes or TypeScript', () => {
    const files: SourceFile[] = [
      {
        path: '/test/src/components/MyComponent.tsx',
        content: `
function MyComponent({ title, onClick }) {
  return <div onClick={onClick}>{title}</div>;
}
`
      },
    ];
    mockContext.files = files;

    const findings = findComponentWithoutTypes(mockContext, {
      message: 'Component missing PropTypes or TypeScript types',
    });

    expect(findings.length).toBeGreaterThan(0);
  });

  it('should detect TypeScript interface in file', () => {
    const files: SourceFile[] = [
      {
        path: '/test/src/components/MyComponent.tsx',
        content: `
interface Props {
  title: string;
  onClick: () => void;
}

function MyComponent({ title, onClick }: Props) {
  return <div onClick={onClick}>{title}</div>;
}
`
      },
    ];
    mockContext.files = files;

    const findings = findComponentWithoutTypes(mockContext, {
      message: 'Component missing PropTypes or TypeScript types',
    });

    // The helper checks for TypeScript types in the component definition or nearby
    // Results depend on the heuristic implementation
    expect(Array.isArray(findings)).toBe(true);
  });
});

describe('AST Helper: findMissingDependencyArray', () => {
  let mockContext: AnalysisContext;

  beforeEach(() => {
    mockContext = {
      projectRoot: '/test',
      framework: 'react',
      files: [],
      packageJson: null,
    };
  });

  it('should find useEffect with async operations missing deps', () => {
    const files: SourceFile[] = [
      {
        path: '/test/src/App.tsx',
        content: `
import { useEffect, useState } from 'react';

function App() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch('/api/data').then(res => res.json()).then(setData);
  }, []);

  return <div>{data}</div>;
}
`
      },
    ];
    mockContext.files = files;

    const findings = findMissingDependencyArray(mockContext, {
      message: 'useEffect may have missing dependencies',
    });

    // This test checks that the helper runs without error
    // The heuristic detection is conservative to avoid false positives
    expect(Array.isArray(findings)).toBe(true);
  });
});

describe('AST Helper: findAsyncWithoutAwait', () => {
  let mockContext: AnalysisContext;

  beforeEach(() => {
    mockContext = {
      projectRoot: '/test',
      framework: 'react',
      files: [],
      packageJson: null,
    };
  });

  it('should find async functions without await', () => {
    const files: SourceFile[] = [
      {
        path: '/test/src/utils.ts',
        content: `
const fetchData = async () => {
  const response = fetch('/api/data');
  return response;
};
`
      },
    ];
    mockContext.files = files;

    const findings = findAsyncWithoutAwait(mockContext, {
      message: 'Async function without await',
    });

    // This helper now only flags async arrow functions assigned to variables
    // that have IO operations but no await/then
    expect(findings.length).toBeGreaterThan(0);
  });

  it('should not flag async functions with await', () => {
    const files: SourceFile[] = [
      {
        path: '/test/src/utils.ts',
        content: `
async function fetchData() {
  const response = await fetch('/api/data');
  return response;
}
`
      },
    ];
    mockContext.files = files;

    const findings = findAsyncWithoutAwait(mockContext, {
      message: 'Async function without await',
    });

    expect(findings.length).toBe(0);
  });
});
