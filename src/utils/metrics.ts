/**
 * Key metrics for Attune analysis
 */
export interface AnalysisMetrics {
  // Timing metrics
  totalScanTimeMs: number;
  fileScanTimeMs: number;
  ruleExecutionTimeMs: number;

  // Count metrics
  filesScanned: number;
  filesChanged?: number;
  rulesRun: number;
  rulesPassed: number;
  rulesFailed: number;
  totalFindings: number;

  // Finding severity breakdown
  criticalFindings: number;
  highFindings: number;
  mediumFindings: number;
  lowFindings: number;
  infoFindings: number;

  // Cache metrics
  cacheEnabled: boolean;
  cacheHits?: number;
  cacheMisses?: number;

  // Framework info
  framework: string;
  projectType: string;
}

/**
 * Timing metrics collector
 */
export class MetricsCollector {
  private startTime: number = 0;
  private fileScanStart: number = 0;
  private ruleExecutionStart: number = 0;

  private _filesScanned = 0;
  private _rulesRun = 0;
  private _rulesPassed = 0;
  private _rulesFailed = 0;
  private _totalFindings = 0;
  private _criticalFindings = 0;
  private _highFindings = 0;
  private _mediumFindings = 0;
  private _lowFindings = 0;
  private _infoFindings = 0;

  private _cacheEnabled = false;
  private _cacheHits = 0;
  private _cacheMisses = 0;
  private _filesChanged = 0;

  private _framework = '';
  private _projectType = '';

  /**
   * Start overall timing
   */
  start(): void {
    this.startTime = Date.now();
  }

  /**
   * Start file scanning phase
   */
  startFileScan(): void {
    this.fileScanStart = Date.now();
  }

  /**
   * End file scanning phase
   */
  endFileScan(): void {
    this.fileScanStart = 0;
  }

  /**
   * Start rule execution phase
   */
  startRuleExecution(): void {
    this.ruleExecutionStart = Date.now();
  }

  /**
   * End rule execution phase
   */
  endRuleExecution(): void {
    this.ruleExecutionStart = 0;
  }

  /**
   * Record files scanned
   */
  setFilesScanned(count: number): void {
    this._filesScanned = count;
  }

  /**
   * Record files changed (for incremental scans)
   */
  setFilesChanged(count: number): void {
    this._filesChanged = count;
  }

  /**
   * Record rules run
   */
  setRulesRun(count: number): void {
    this._rulesRun = count;
  }

  /**
   * Record rules passed
   */
  setRulesPassed(count: number): void {
    this._rulesPassed = count;
  }

  /**
   * Record rules failed
   */
  setRulesFailed(count: number): void {
    this._rulesFailed = count;
  }

  /**
   * Record total findings
   */
  setTotalFindings(count: number): void {
    this._totalFindings = count;
  }

  /**
   * Record findings by severity
   */
  setFindingsBySeverity(critical: number, high: number, medium: number, low: number, info: number): void {
    this._criticalFindings = critical;
    this._highFindings = high;
    this._mediumFindings = medium;
    this._lowFindings = low;
    this._infoFindings = info;
  }

  /**
   * Enable cache metrics
   */
  enableCache(enabled: boolean): void {
    this._cacheEnabled = enabled;
  }

  /**
   * Record cache hits
   */
  recordCacheHit(): void {
    this._cacheHits++;
  }

  /**
   * Record cache misses
   */
  recordCacheMiss(): void {
    this._cacheMisses++;
  }

  /**
   * Set framework info
   */
  setFrameworkInfo(framework: string, projectType: string): void {
    this._framework = framework;
    this._projectType = projectType;
  }

  /**
   * Get all metrics
   */
  getMetrics(): AnalysisMetrics {
    const totalTime = Date.now() - this.startTime;
    const fileScanTime = this.fileScanStart > 0 ? Date.now() - this.fileScanStart : 0;
    const ruleExecutionTime = this.ruleExecutionStart > 0 ? Date.now() - this.ruleExecutionStart : 0;

    return {
      totalScanTimeMs: totalTime,
      fileScanTimeMs: fileScanTime,
      ruleExecutionTimeMs: ruleExecutionTime,
      filesScanned: this._filesScanned,
      filesChanged: this._filesChanged > 0 ? this._filesChanged : undefined,
      rulesRun: this._rulesRun,
      rulesPassed: this._rulesPassed,
      rulesFailed: this._rulesFailed,
      totalFindings: this._totalFindings,
      criticalFindings: this._criticalFindings,
      highFindings: this._highFindings,
      mediumFindings: this._mediumFindings,
      lowFindings: this._lowFindings,
      infoFindings: this._infoFindings,
      cacheEnabled: this._cacheEnabled,
      cacheHits: this._cacheEnabled ? this._cacheHits : undefined,
      cacheMisses: this._cacheEnabled ? this._cacheMisses : undefined,
      framework: this._framework,
      projectType: this._projectType,
    };
  }

  /**
   * Get metrics as formatted string
   */
  toString(): string {
    const m = this.getMetrics();
    const cacheHits = m.cacheHits ?? 0;
    const cacheMisses = m.cacheMisses ?? 0;
    const hitRate = m.cacheEnabled && (cacheHits + cacheMisses) > 0
      ? ((cacheHits / (cacheHits + cacheMisses)) * 100).toFixed(1)
      : '0.0';

    return `
Analysis Metrics:
=================
Timing:
  Total: ${m.totalScanTimeMs}ms
  File Scan: ${m.fileScanTimeMs}ms
  Rule Execution: ${m.ruleExecutionTimeMs}ms

Counts:
  Files Scanned: ${m.filesScanned}${m.filesChanged ? ` (${m.filesChanged} changed)` : ''}
  Rules Run: ${m.rulesRun} (${m.rulesPassed} passed, ${m.rulesFailed} failed)

Findings:
  Critical: ${m.criticalFindings}
  High: ${m.highFindings}
  Medium: ${m.mediumFindings}
  Low: ${m.lowFindings}
  Info: ${m.infoFindings}
  Total: ${m.totalFindings}

${m.cacheEnabled ? `Cache:
  Hits: ${cacheHits}
  Misses: ${cacheMisses}
  Hit Rate: ${hitRate}%

` : ''}Framework: ${m.framework}
Project Type: ${m.projectType}
`;
  }

  /**
   * Get metrics as JSON
   */
  toJSON(): AnalysisMetrics {
    return this.getMetrics();
  }
}

/**
 * Global metrics collector instance
 */
let globalMetrics: MetricsCollector | null = null;

/**
 * Get the global metrics collector
 */
export function getMetrics(): MetricsCollector {
  if (!globalMetrics) {
    globalMetrics = new MetricsCollector();
  }
  return globalMetrics;
}

/**
 * Reset global metrics
 */
export function resetMetrics(): void {
  globalMetrics = new MetricsCollector();
}
