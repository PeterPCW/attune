import { describe, it, expect } from 'vitest';
import { AnalysisContext } from '../types/index.js';
import { AccessibilityRules } from '../rules/accessibility/index.js';
import { ComplexityRules } from '../rules/complexity/index.js';
import { AiPatternRules } from '../rules/ai-patterns/index.js';
import { ErrorHandlingRules } from '../rules/error-handling/index.js';
import { ApiRules } from '../rules/api/index.js';
import { FormRules } from '../rules/forms/index.js';
import { MvcRules } from '../rules/mvc/index.js';
import { LoggingRules } from '../rules/logging/index.js';
import { StateRules } from '../rules/state/index.js';
import { CliRules } from '../rules/cli/index.js';

const createContext = (framework: string, files: { path: string; content: string }[]): AnalysisContext => ({
  projectRoot: '/test',
  framework: framework as any,
  files,
  packageJson: null
});

describe('Core Rules - Accessibility', () => {
  const rules = AccessibilityRules.getRules();
  const ruleIds = rules.map(r => r.id);

  it('should have ACCESS_LINK_TEXT rule', () => {
    expect(ruleIds).toContain('ACCESS_LINK_TEXT');
  });

  it('should have ACCESS_COLOR_CONTRAST rule', () => {
    expect(ruleIds).toContain('ACCESS_COLOR_CONTRAST');
  });

  it('should have ACCESS_FOCUS_INDICATOR rule', () => {
    expect(ruleIds).toContain('ACCESS_FOCUS_INDICATOR');
  });

  it('should have ACCESS_SKIP_LINK rule', () => {
    expect(ruleIds).toContain('ACCESS_SKIP_LINK');
  });

  it('should have ACCESS_LANG_ATTRIBUTE rule', () => {
    expect(ruleIds).toContain('ACCESS_LANG_ATTRIBUTE');
  });

  it('should have ACCESS_FORM_LABEL rule', () => {
    expect(ruleIds).toContain('ACCESS_FORM_LABEL');
  });

  it('should have ACCESS_KBD_NAV rule', () => {
    expect(ruleIds).toContain('ACCESS_KBD_NAV');
  });

  it('should have ACCESS_LIVE_REGION rule', () => {
    expect(ruleIds).toContain('ACCESS_LIVE_REGION');
  });

  it('should have A11Y_REDUCED_MOTION rule', () => {
    expect(ruleIds).toContain('A11Y_REDUCED_MOTION');
  });

  it('should have A11Y_TIMEOUT_SHORT rule', () => {
    expect(ruleIds).toContain('A11Y_TIMEOUT_SHORT');
  });

  it('should have A11Y_ERROR_UNCLEAR rule', () => {
    expect(ruleIds).toContain('A11Y_ERROR_UNCLEAR');
  });

  // Test detection on basic patterns
  it('should detect img without alt', () => {
    const rule = rules.find(r => r.id === 'ACCESS_IMG_ALT')!;
    const context = createContext('react', [{
      path: '/test/Component.tsx',
      content: '<img src="photo.jpg" />'
    }]);
    const findings = rule.detect(context);
    expect(findings.length).toBeGreaterThan(0);
  });

  it('should detect button without aria-label', () => {
    const rule = rules.find(r => r.id === 'ACCESS_ARIA_LABEL')!;
    const context = createContext('react', [{
      path: '/test/Component.tsx',
      content: '<button onClick={onClick}></button>'
    }]);
    const findings = rule.detect(context);
    expect(findings.length).toBeGreaterThan(0);
  });
});

describe('Core Rules - Complexity', () => {
  const rules = ComplexityRules.getRules();
  const ruleIds = rules.map(r => r.id);

  it('should have COMP_NESTING rule', () => {
    expect(ruleIds).toContain('COMP_NESTING');
  });

  it('should have COMP_PARAMS rule', () => {
    expect(ruleIds).toContain('COMP_PARAMS');
  });

  it('should have COMP_GLOBAL_STATE rule', () => {
    expect(ruleIds).toContain('COMP_GLOBAL_STATE');
  });

  it('should have COMP_CIRCULAR rule', () => {
    expect(ruleIds).toContain('COMP_CIRCULAR');
  });

  it('should have COMP_DEAD_CODE rule', () => {
    expect(ruleIds).toContain('COMP_DEAD_CODE');
  });

  // Test some detections
  it('should detect too many parameters', () => {
    const rule = rules.find(r => r.id === 'COMP_PARAMS')!;
    const context = createContext('nodejs', [{
      path: '/test/func.ts',
      content: 'function foo(a, b, c, d, e, f) { return a + b; }'
    }]);
    const findings = rule.detect(context);
    expect(findings.length).toBeGreaterThan(0);
  });

  it('should detect global state', () => {
    const rule = rules.find(r => r.id === 'COMP_GLOBAL_STATE')!;
    const context = createContext('nodejs', [{
      path: '/test/global.ts',
      content: 'global.config = {};'
    }]);
    const findings = rule.detect(context);
    expect(findings.length).toBeGreaterThan(0);
  });

  it('should detect empty catch', () => {
    const rule = rules.find(r => r.id === 'COMP_EMPTY_CATCH')!;
    const context = createContext('nodejs', [{
      path: '/test/err.ts',
      content: 'try { doStuff(); } catch (e) { }'
    }]);
    const findings = rule.detect(context);
    expect(findings.length).toBeGreaterThan(0);
  });
});

describe('Core Rules - AI Patterns', () => {
  const rules = AiPatternRules.getRules();
  const ruleIds = rules.map(r => r.id);

  it('should have AI_EFFECT_SPAGHETTI rule', () => {
    expect(ruleIds).toContain('AI_EFFECT_SPAGHETTI');
  });

  it('should have AI_PROP_DRILLING rule', () => {
    expect(ruleIds).toContain('AI_PROP_DRILLING');
  });

  it('should have AI_GENERIC_ERROR rule', () => {
    expect(ruleIds).toContain('AI_GENERIC_ERROR');
  });

  it('should have AI_GENERIC_TOAST rule', () => {
    expect(ruleIds).toContain('AI_GENERIC_TOAST');
  });

  it('should have AI_NO_TESTS rule', () => {
    expect(ruleIds).toContain('AI_NO_TESTS');
  });
});

describe('Core Rules - Error Handling', () => {
  const rules = ErrorHandlingRules.getRules();
  const ruleIds = rules.map(r => r.id);

  it('should have ERR_NO_ERROR_HANDLING rule', () => {
    expect(ruleIds).toContain('ERR_NO_ERROR_HANDLING');
  });

  it('should have ERR_PROMISE_CATCH rule', () => {
    expect(ruleIds).toContain('ERR_PROMISE_CATCH');
  });

  it('should have ERR_NO_ERROR_BOUNDARY rule', () => {
    expect(ruleIds).toContain('ERR_NO_ERROR_BOUNDARY');
  });

  it('should have ERR_THROW_IN_CALLBACK rule', () => {
    expect(ruleIds).toContain('ERR_THROW_IN_CALLBACK');
  });

  it('should have ERR_ASYNC_NO_AWAIT rule', () => {
    expect(ruleIds).toContain('ERR_ASYNC_NO_AWAIT');
  });

  it('should detect swallowed errors', () => {
    const rule = rules.find(r => r.id === 'ERR_SWALLOW_ERRORS')!;
    const context = createContext('nodejs', [{
      path: '/test/err.ts',
      content: 'try { doStuff(); } catch (e) { }'
    }]);
    const findings = rule.detect(context);
    expect(findings.length).toBeGreaterThan(0);
  });
});

describe('Core Rules - API', () => {
  const rules = ApiRules.getRules();
  const ruleIds = rules.map(r => r.id);

  it('should have API_NO_ERROR_TYPE rule', () => {
    expect(ruleIds).toContain('API_NO_ERROR_TYPE');
  });

  it('should have API_NO_PAGINATION rule', () => {
    expect(ruleIds).toContain('API_NO_PAGINATION');
  });

  it('should have API_NO_RATE_LIMIT rule', () => {
    expect(ruleIds).toContain('API_NO_RATE_LIMIT');
  });

  it('should have API_SENSITIVE_HEADER rule', () => {
    expect(ruleIds).toContain('API_SENSITIVE_HEADER');
  });
});

describe('Core Rules - Forms', () => {
  const rules = FormRules.getRules();
  const ruleIds = rules.map(r => r.id);

  it('should have FORM_NO_VALIDATION rule', () => {
    expect(ruleIds).toContain('FORM_NO_VALIDATION');
  });

  it('should have FORM_SUBMIT_PREVENT rule', () => {
    expect(ruleIds).toContain('FORM_SUBMIT_PREVENT');
  });

  it('should detect form without validation', () => {
    const rule = rules.find(r => r.id === 'FORM_NO_VALIDATION')!;
    const context = createContext('react', [{
      path: '/test/Form.tsx',
      content: '<form><input type="text" /></form>'
    }]);
    const findings = rule.detect(context);
    expect(findings.length).toBeGreaterThan(0);
  });
});

describe('Core Rules - MVC', () => {
  const rules = MvcRules.getRules();
  const ruleIds = rules.map(r => r.id);

  it('should have MVC_BUSINESS_IN_CONTROLLER rule', () => {
    expect(ruleIds).toContain('MVC_BUSINESS_IN_CONTROLLER');
  });

  it('should have MVC_FAT_MODEL rule', () => {
    expect(ruleIds).toContain('MVC_FAT_MODEL');
  });
});

describe('Core Rules - Logging', () => {
  const rules = LoggingRules.getRules();
  const ruleIds = rules.map(r => r.id);

  it('should have LOG_SENSITIVE rule', () => {
    expect(ruleIds).toContain('LOG_SENSITIVE');
  });

  it('should have LOG_CONSOLE_LOG rule', () => {
    expect(ruleIds).toContain('LOG_CONSOLE_LOG');
  });
});

describe('Core Rules - State', () => {
  const rules = StateRules.getRules();
  const ruleIds = rules.map(r => r.id);

  it('should have STATE_GLOBAL_MUTATION rule', () => {
    expect(ruleIds).toContain('STATE_GLOBAL_MUTATION');
  });

  it('should have STATE_USE_STATE_ARRAY rule', () => {
    expect(ruleIds).toContain('STATE_USE_STATE_ARRAY');
  });
});

describe('Core Rules - CLI', () => {
  const rules = CliRules.getRules();
  const ruleIds = rules.map(r => r.id);

  it('should have CLI_NO_OUTPUT rule', () => {
    expect(ruleIds).toContain('CLI_NO_OUTPUT');
  });

  it('should have CLI_NO_ERROR_HANDLING rule', () => {
    expect(ruleIds).toContain('CLI_NO_ERROR_HANDLING');
  });

  it('should have CLI_NO_HELP rule', () => {
    expect(ruleIds).toContain('CLI_NO_HELP');
  });

  it('should have CLI_NO_VERSION rule', () => {
    expect(ruleIds).toContain('CLI_NO_VERSION');
  });

  it('should have CLI_PARSER_MISSING rule', () => {
    expect(ruleIds).toContain('CLI_PARSER_MISSING');
  });
});
