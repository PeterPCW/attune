import { describe, it, expect, beforeEach } from 'vitest';
import { Finding, AnalysisContext, SourceFile } from '../types/index';
import {
  findPythonFunctionWithoutErrorHandling,
  findMutableDefaultArguments,
  findBroadExceptionHandling,
  findTypeVsIsinstance,
  findNoneComparison,
  findFileWithoutContextManager,
  findDjangoNPlusOne,
  findDjangoMissingTransaction,
  findFastAPISyncDbInAsync,
  findFastAPIMissingResponseModel,
  findFlaskAppAtModuleLevel,
  findSQLAlchemyNPlusOne,
  findCeleryTaskWithoutTimeLimit,
} from '../rules/python/python-helpers';

describe('Python Helper: findPythonFunctionWithoutErrorHandling', () => {
  let mockContext: AnalysisContext;

  beforeEach(() => {
    mockContext = {
      projectRoot: '/test',
      framework: 'django',
      files: [],
      packageJson: null,
    };
  });

  it('should find async functions with I/O without try-except', () => {
    const files: SourceFile[] = [
      {
        path: '/test/views.py',
        content: `
async def fetch_data():
    response = requests.get('/api/data')
    return response.json()
`
      },
    ];
    mockContext.files = files;

    const findings = findPythonFunctionWithoutErrorHandling(mockContext, {
      message: 'Function missing error handling'
    });

    expect(findings.length).toBeGreaterThan(0);
    expect(findings[0].category).toBe('error-handling');
  });

  it('should not flag functions with try-except', () => {
    const files: SourceFile[] = [
      {
        path: '/test/views.py',
        content: `
async def fetch_data():
    try:
        response = requests.get('/api/data')
        return response.json()
    except Exception as e:
        logger.error(e)
        return None
`
      },
    ];
    mockContext.files = files;

    const findings = findPythonFunctionWithoutErrorHandling(mockContext, {
      message: 'Function missing error handling'
    });

    expect(findings.length).toBe(0);
  });

  it('should not flag functions without I/O', () => {
    const files: SourceFile[] = [
      {
        path: '/test/utils.py',
        content: `
def add_numbers(a, b):
    return a + b
`
      },
    ];
    mockContext.files = files;

    const findings = findPythonFunctionWithoutErrorHandling(mockContext, {
      message: 'Function missing error handling'
    });

    expect(findings.length).toBe(0);
  });
});

describe('Python Helper: findMutableDefaultArguments', () => {
  let mockContext: AnalysisContext;

  beforeEach(() => {
    mockContext = {
      projectRoot: '/test',
      framework: 'django',
      files: [],
      packageJson: null,
    };
  });

  it('should find mutable default arguments', () => {
    const files: SourceFile[] = [
      {
        path: '/test/views.py',
        content: `
def process_items(items=[]):
    for item in items:
        print(item)
`
      },
    ];
    mockContext.files = files;

    const findings = findMutableDefaultArguments(mockContext, {
      message: 'Mutable default argument'
    });

    expect(findings.length).toBeGreaterThan(0);
    expect(findings[0].category).toBe('maintainability');
  });

  it('should find dict mutable defaults', () => {
    const files: SourceFile[] = [
      {
        path: '/test/views.py',
        content: `
def add_item(item, data={}):
    data[item] = item
`
      },
    ];
    mockContext.files = files;

    const findings = findMutableDefaultArguments(mockContext, {
      message: 'Mutable default argument'
    });

    expect(findings.length).toBeGreaterThan(0);
  });

  it('should not flag None defaults', () => {
    const files: SourceFile[] = [
      {
        path: '/test/views.py',
        content: `
def process_items(items=None):
    if items is None:
        items = []
`
      },
    ];
    mockContext.files = files;

    const findings = findMutableDefaultArguments(mockContext, {
      message: 'Mutable default argument'
    });

    expect(findings.length).toBe(0);
  });
});

describe('Python Helper: findBroadExceptionHandling', () => {
  let mockContext: AnalysisContext;

  beforeEach(() => {
    mockContext = {
      projectRoot: '/test',
      framework: 'python',
      files: [],
      packageJson: null,
    };
  });

  it('should find bare except clauses', () => {
    const files: SourceFile[] = [
      {
        path: '/test/utils.py',
        content: `
def risky_operation():
    try:
        do_something()
    except:
        print("error")
`
      },
    ];
    mockContext.files = files;

    const findings = findBroadExceptionHandling(mockContext, {
      message: 'Broad exception catch'
    });

    expect(findings.length).toBeGreaterThan(0);
  });

  it('should find except Exception without specific handling', () => {
    const files: SourceFile[] = [
      {
        path: '/test/utils.py',
        content: `
def risky_operation():
    try:
        do_something()
    except Exception:
        print("error")
`
      },
    ];
    mockContext.files = files;

    const findings = findBroadExceptionHandling(mockContext, {
      message: 'Broad exception catch'
    });

    expect(findings.length).toBeGreaterThan(0);
  });

  it('should not flag specific exception handling', () => {
    const files: SourceFile[] = [
      {
        path: '/test/utils.py',
        content: `
def risky_operation():
    try:
        do_something()
    except ValueError as e:
        handle_value_error(e)
    except IOError as e:
        handle_io_error(e)
`
      },
    ];
    mockContext.files = files;

    const findings = findBroadExceptionHandling(mockContext, {
      message: 'Broad exception catch'
    });

    expect(findings.length).toBe(0);
  });
});

describe('Python Helper: findNoneComparison', () => {
  let mockContext: AnalysisContext;

  beforeEach(() => {
    mockContext = {
      projectRoot: '/test',
      framework: 'python',
      files: [],
      packageJson: null,
    };
  });

  it('should find == None comparisons', () => {
    const files: SourceFile[] = [
      {
        path: '/test/utils.py',
        content: `
if value == None:
    do_something()
`
      },
    ];
    mockContext.files = files;

    const findings = findNoneComparison(mockContext, {
      message: 'Using == None'
    });

    expect(findings.length).toBeGreaterThan(0);
  });

  it('should find != None comparisons', () => {
    const files: SourceFile[] = [
      {
        path: '/test/utils.py',
        content: `
if value != None:
    do_something()
`
      },
    ];
    mockContext.files = files;

    const findings = findNoneComparison(mockContext, {
      message: 'Using == None'
    });

    expect(findings.length).toBeGreaterThan(0);
  });

  it('should not flag is None', () => {
    const files: SourceFile[] = [
      {
        path: '/test/utils.py',
        content: `
if value is None:
    do_something()
`
      },
    ];
    mockContext.files = files;

    const findings = findNoneComparison(mockContext, {
      message: 'Using == None'
    });

    expect(findings.length).toBe(0);
  });
});

describe('Python Helper: findTypeVsIsinstance', () => {
  let mockContext: AnalysisContext;

  beforeEach(() => {
    mockContext = {
      projectRoot: '/test',
      framework: 'python',
      files: [],
      packageJson: null,
    };
  });

  it('should find type() == comparison', () => {
    const files: SourceFile[] = [
      {
        path: '/test/utils.py',
        content: `
if type(value) == str:
    do_something()
`
      },
    ];
    mockContext.files = files;

    const findings = findTypeVsIsinstance(mockContext, {
      message: 'Using type() instead of isinstance()'
    });

    expect(findings.length).toBeGreaterThan(0);
  });

  it('should find type() is comparison', () => {
    const files: SourceFile[] = [
      {
        path: '/test/utils.py',
        content: `
if type(value) is str:
    do_something()
`
      },
    ];
    mockContext.files = files;

    const findings = findTypeVsIsinstance(mockContext, {
      message: 'Using type() instead of isinstance()'
    });

    expect(findings.length).toBeGreaterThan(0);
  });

  it('should not flag isinstance()', () => {
    const files: SourceFile[] = [
      {
        path: '/test/utils.py',
        content: `
if isinstance(value, str):
    do_something()
`
      },
    ];
    mockContext.files = files;

    const findings = findTypeVsIsinstance(mockContext, {
      message: 'Using type() instead of isinstance()'
    });

    expect(findings.length).toBe(0);
  });
});

describe('Python Helper: findFileWithoutContextManager', () => {
  let mockContext: AnalysisContext;

  beforeEach(() => {
    mockContext = {
      projectRoot: '/test',
      framework: 'python',
      files: [],
      packageJson: null,
    };
  });

  it('should find files opened without context manager', () => {
    const files: SourceFile[] = [
      {
        path: '/test/utils.py',
        content: `
def read_file():
    f = open('file.txt')
    data = f.read()
    return data
`
      },
    ];
    mockContext.files = files;

    const findings = findFileWithoutContextManager(mockContext, {
      message: 'File without context manager'
    });

    expect(findings.length).toBeGreaterThan(0);
  });

  it('should not flag files opened with context manager', () => {
    const files: SourceFile[] = [
      {
        path: '/test/utils.py',
        content: `
def read_file():
    with open('file.txt') as f:
        return f.read()
`
      },
    ];
    mockContext.files = files;

    const findings = findFileWithoutContextManager(mockContext, {
      message: 'File without context manager'
    });

    expect(findings.length).toBe(0);
  });
});

describe('Python Helper: findDjangoNPlusOne', () => {
  let mockContext: AnalysisContext;

  beforeEach(() => {
    mockContext = {
      projectRoot: '/test',
      framework: 'django',
      files: [],
      packageJson: null,
    };
  });

  it('should find N+1 queries in Django', () => {
    const files: SourceFile[] = [
      {
        path: '/test/views.py',
        content: `
def get_users(request):
    users = User.objects.all()
    for user in users:
        print(user.profile.bio)
`
      },
    ];
    mockContext.files = files;

    const findings = findDjangoNPlusOne(mockContext, {
      message: 'N+1 query detected'
    });

    expect(findings.length).toBeGreaterThan(0);
  });

  it('should not flag when select_related is used', () => {
    const files: SourceFile[] = [
      {
        path: '/test/views.py',
        content: `
def get_users(request):
    users = User.objects.select_related('profile').all()
    for user in users:
        print(user.profile.bio)
`
      },
    ];
    mockContext.files = files;

    const findings = findDjangoNPlusOne(mockContext, {
      message: 'N+1 query detected'
    });

    expect(findings.length).toBe(0);
  });
});

describe('Python Helper: findFastAPISyncDbInAsync', () => {
  let mockContext: AnalysisContext;

  beforeEach(() => {
    mockContext = {
      projectRoot: '/test',
      framework: 'fastapi',
      files: [],
      packageJson: null,
    };
  });

  it('should find sync DB operations in async FastAPI handler', () => {
    const files: SourceFile[] = [
      {
        path: '/test/main.py',
        content: `
from fastapi import FastAPI

app = FastAPI()

@app.get("/users")
async def get_users():
    cursor.execute("SELECT * FROM users")
    return cursor.fetchall()
`
      },
    ];
    mockContext.files = files;

    const findings = findFastAPISyncDbInAsync(mockContext, {
      message: 'Sync DB in async'
    });

    expect(findings.length).toBeGreaterThan(0);
  });

  it('should not flag when async patterns are used', () => {
    const files: SourceFile[] = [
      {
        path: '/test/main.py',
        content: `
from fastapi import FastAPI

app = FastAPI()

@app.get("/users")
async def get_users():
    results = await db.execute("SELECT * FROM users")
    return results
`
      },
    ];
    mockContext.files = files;

    const findings = findFastAPISyncDbInAsync(mockContext, {
      message: 'Sync DB in async'
    });

    expect(findings.length).toBe(0);
  });
});

describe('Python Helper: findFlaskAppAtModuleLevel', () => {
  let mockContext: AnalysisContext;

  beforeEach(() => {
    mockContext = {
      projectRoot: '/test',
      framework: 'flask',
      files: [],
      packageJson: null,
    };
  });

  it('should find Flask app at module level', () => {
    const files: SourceFile[] = [
      {
        path: '/test/app.py',
        content: `
from flask import Flask

app = Flask(__name__)

@app.route('/')
def index():
    return 'Hello'
`
      },
    ];
    mockContext.files = files;

    const findings = findFlaskAppAtModuleLevel(mockContext, {
      message: 'Flask app at module level'
    });

    expect(findings.length).toBeGreaterThan(0);
  });
});

describe('Python Helper: findCeleryTaskWithoutTimeLimit', () => {
  let mockContext: AnalysisContext;

  beforeEach(() => {
    mockContext = {
      projectRoot: '/test',
      framework: 'celery',
      files: [],
      packageJson: null,
    };
  });

  it('should find Celery tasks without time limits', () => {
    const files: SourceFile[] = [
      {
        path: '/test/tasks.py',
        content: `
from celery import app

@app.task
def process_data(data):
    do_something(data)
`
      },
    ];
    mockContext.files = files;

    const findings = findCeleryTaskWithoutTimeLimit(mockContext, {
      message: 'Task without time limit'
    });

    expect(findings.length).toBeGreaterThan(0);
  });

  it('should not flag tasks with time_limit', () => {
    const files: SourceFile[] = [
      {
        path: '/test/tasks.py',
        content: `
from celery import app

@app.task(time_limit=300)
def process_data(data):
    do_something(data)
`
      },
    ];
    mockContext.files = files;

    const findings = findCeleryTaskWithoutTimeLimit(mockContext, {
      message: 'Task without time limit'
    });

    expect(findings.length).toBe(0);
  });
});
