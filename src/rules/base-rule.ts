import { DetectionRule, Finding, AnalysisContext, Category, Severity, Recommendation, Framework } from '../types/index.js';

export abstract class BaseRule implements DetectionRule {
  abstract id: string;
  abstract name: string;
  abstract category: Category;
  abstract severity: Severity;
  abstract frameworks: Framework[];
  abstract recommendation: Recommendation;

  detect(context: AnalysisContext): Finding[] {
    return [];
  }

  protected createFinding(
    context: AnalysisContext,
    file: string,
    line: number,
    message: string,
    code?: string
  ): Finding {
    return {
      id: `${this.id}-${file}-${line}`,
      ruleId: this.id,
      severity: this.severity,
      category: this.category,
      framework: this.frameworks.length === 1 ? this.frameworks[0] : undefined,
      file,
      line,
      message,
      code,
      recommendation: this.recommendation
    };
  }
}
