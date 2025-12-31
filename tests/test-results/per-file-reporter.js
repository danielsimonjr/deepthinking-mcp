const fs = require('fs');
const path = require('path');

/**
 * Custom Vitest 4.x reporter with multiple modes:
 * - summary: Only generate summary reports (JSON + HTML)
 * - debug: Generate reports only for failed test files (JSON + HTML)
 * - all: Generate reports for all test files (JSON + HTML) - audit mode
 *
 * Set mode via VITEST_REPORT_MODE environment variable (default: 'all')
 *
 * Output structure:
 *   tests/test-results/
 *   ├── json/           # Per-file JSON reports
 *   ├── html/           # Per-file HTML reports
 *   └── summary/        # Summary files (JSON + HTML)
 */
class PerFileReporter {
  constructor() {
    this.baseDir = 'tests/test-results';
    this.jsonDir = path.join(this.baseDir, 'json');
    this.htmlDir = path.join(this.baseDir, 'html');
    this.summaryDir = path.join(this.baseDir, 'summary');
    this.mode = process.env.VITEST_REPORT_MODE || 'all';
  }

  onInit(ctx) {
    // Ensure output directories exist
    [this.jsonDir, this.htmlDir, this.summaryDir].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  /**
   * Vitest 4.x uses onTestRunEnd
   */
  onTestRunEnd(testModules, unhandledErrors, reason) {
    if (!testModules || testModules.length === 0) return;

    const timestamp = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

    // Collect all test data
    const fileReports = [];
    for (const testModule of testModules) {
      const filePath = testModule.moduleId || '';
      let testName = path.basename(filePath);
      testName = testName.replace(/\.(test|spec)\.(ts|js|tsx|jsx)$/, '');

      const tests = this.collectTests(testModule.children);
      const hasFailed = tests.some(t => t.state === 'failed');
      const status = hasFailed ? 'FAIL' : 'PASS';

      const report = {
        name: filePath,
        testName,
        timestamp: new Date().toISOString(),
        status,
        duration: testModule.collectDuration ?? 0,
        tests,
        summary: {
          total: tests.length,
          passed: tests.filter(t => t.state === 'passed').length,
          failed: tests.filter(t => t.state === 'failed').length,
          skipped: tests.filter(t => t.state === 'skipped').length,
        }
      };

      fileReports.push(report);
    }

    // Generate reports based on mode
    if (this.mode === 'summary') {
      // Summary mode: only generate summary reports
      this.writeSummaryReports(fileReports, unhandledErrors, timestamp);
    } else if (this.mode === 'debug') {
      // Debug mode: only generate reports for failed files
      const failedReports = fileReports.filter(r => r.status === 'FAIL');
      failedReports.forEach(report => {
        this.writeFileReport(report, timestamp);
      });
      this.writeSummaryReports(fileReports, unhandledErrors, timestamp);
    } else {
      // All mode (audit): generate reports for all files
      fileReports.forEach(report => {
        this.writeFileReport(report, timestamp);
      });
      this.writeSummaryReports(fileReports, unhandledErrors, timestamp);
    }
  }

  /**
   * Write individual file report (JSON + HTML)
   */
  writeFileReport(report, timestamp) {
    const { testName, status } = report;
    const baseName = `${testName}-${timestamp}-${status}`;

    // Write JSON
    const jsonPath = path.join(this.jsonDir, `${baseName}.json`);
    fs.writeFileSync(jsonPath, JSON.stringify(report, null, 2));

    // Write HTML
    const htmlPath = path.join(this.htmlDir, `${baseName}.html`);
    fs.writeFileSync(htmlPath, this.generateFileHtml(report));
  }

  /**
   * Write summary reports (JSON + HTML)
   */
  writeSummaryReports(fileReports, unhandledErrors, timestamp) {
    const allTests = fileReports.flatMap(r => r.tests);
    const totalTests = allTests.length;
    const passedTests = allTests.filter(t => t.state === 'passed').length;
    const failedTests = allTests.filter(t => t.state === 'failed').length;
    const skippedTests = allTests.filter(t => t.state === 'skipped').length;
    const overallStatus = failedTests > 0 || (unhandledErrors?.length > 0) ? 'FAIL' : 'PASS';

    const summary = {
      timestamp: new Date().toISOString(),
      status: overallStatus,
      mode: this.mode,
      totalFiles: fileReports.length,
      summary: {
        total: totalTests,
        passed: passedTests,
        failed: failedTests,
        skipped: skippedTests,
      },
      passRate: totalTests > 0 ? ((passedTests / totalTests) * 100).toFixed(1) + '%' : '0%',
      unhandledErrors: unhandledErrors?.length ?? 0,
      files: fileReports.map(r => ({
        name: r.testName,
        file: path.basename(r.name),
        status: r.status,
        tests: r.summary.total,
        passed: r.summary.passed,
        failed: r.summary.failed,
        skipped: r.summary.skipped,
      }))
    };

    const baseName = `test-summary-${timestamp}-${overallStatus}`;

    // Write JSON summary
    const jsonPath = path.join(this.summaryDir, `${baseName}.json`);
    fs.writeFileSync(jsonPath, JSON.stringify(summary, null, 2));

    // Write HTML summary
    const htmlPath = path.join(this.summaryDir, `${baseName}.html`);
    fs.writeFileSync(htmlPath, this.generateSummaryHtml(summary, fileReports));
  }

  /**
   * Collect all test cases from children, flattening nested suites
   */
  collectTests(children, parentName = '') {
    if (!children) return [];

    const tests = [];
    for (const child of children) {
      const fullName = parentName ? `${parentName} > ${child.name}` : child.name;

      if (child.type === 'test') {
        const result = typeof child.result === 'function' ? child.result() : child.result;
        const state = result?.state ?? 'pending';
        tests.push({
          name: child.name,
          fullName: fullName,
          state: state,
          duration: result?.duration ?? 0,
          errors: result?.errors?.map(e => ({
            message: e.message,
            stack: e.stack,
          })) ?? [],
        });
      }

      if (child.children) {
        tests.push(...this.collectTests(child.children, fullName));
      }
    }
    return tests;
  }

  /**
   * Generate HTML for individual test file report
   */
  generateFileHtml(report) {
    const statusColor = report.status === 'PASS' ? '#22c55e' : '#ef4444';
    const statusBg = report.status === 'PASS' ? '#dcfce7' : '#fef2f2';

    const testRows = report.tests.map(test => {
      const stateColor = test.state === 'passed' ? '#22c55e' :
                         test.state === 'failed' ? '#ef4444' :
                         test.state === 'skipped' ? '#f59e0b' : '#9ca3af';
      const stateIcon = test.state === 'passed' ? '✓' :
                        test.state === 'failed' ? '✗' :
                        test.state === 'skipped' ? '⊘' : '○';

      let errorHtml = '';
      if (test.errors && test.errors.length > 0) {
        errorHtml = `
          <tr>
            <td colspan="4" style="background: #fef2f2; padding: 8px 16px;">
              <pre style="margin: 0; font-size: 12px; color: #dc2626; white-space: pre-wrap; word-break: break-word;">${this.escapeHtml(test.errors.map(e => e.message).join('\n'))}</pre>
            </td>
          </tr>`;
      }

      return `
        <tr>
          <td style="padding: 8px 16px;"><span style="color: ${stateColor}; font-weight: bold;">${stateIcon}</span></td>
          <td style="padding: 8px 16px;">${this.escapeHtml(test.fullName)}</td>
          <td style="padding: 8px 16px; text-transform: capitalize; color: ${stateColor};">${test.state}</td>
          <td style="padding: 8px 16px; text-align: right;">${test.duration.toFixed(2)}ms</td>
        </tr>${errorHtml}`;
    }).join('');

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Test Report: ${this.escapeHtml(report.testName)}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f8fafc; padding: 24px; }
    .container { max-width: 1200px; margin: 0 auto; }
    .header { background: white; border-radius: 8px; padding: 24px; margin-bottom: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    .status-badge { display: inline-block; padding: 4px 12px; border-radius: 4px; font-weight: bold; background: ${statusBg}; color: ${statusColor}; }
    .summary-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 16px; margin-top: 16px; }
    .summary-card { background: #f1f5f9; padding: 16px; border-radius: 8px; text-align: center; }
    .summary-value { font-size: 24px; font-weight: bold; }
    .summary-label { font-size: 12px; color: #64748b; text-transform: uppercase; }
    .tests-table { background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    table { width: 100%; border-collapse: collapse; }
    th { background: #f1f5f9; padding: 12px 16px; text-align: left; font-weight: 600; font-size: 12px; text-transform: uppercase; color: #64748b; }
    tr:not(:last-child) { border-bottom: 1px solid #e2e8f0; }
    .meta { color: #64748b; font-size: 14px; margin-top: 8px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <h1 style="font-size: 24px;">${this.escapeHtml(report.testName)}</h1>
        <span class="status-badge">${report.status}</span>
      </div>
      <p class="meta">${this.escapeHtml(report.name)}</p>
      <p class="meta">Generated: ${report.timestamp}</p>

      <div class="summary-grid">
        <div class="summary-card">
          <div class="summary-value">${report.summary.total}</div>
          <div class="summary-label">Total</div>
        </div>
        <div class="summary-card" style="color: #22c55e;">
          <div class="summary-value">${report.summary.passed}</div>
          <div class="summary-label">Passed</div>
        </div>
        <div class="summary-card" style="color: #ef4444;">
          <div class="summary-value">${report.summary.failed}</div>
          <div class="summary-label">Failed</div>
        </div>
        <div class="summary-card" style="color: #f59e0b;">
          <div class="summary-value">${report.summary.skipped}</div>
          <div class="summary-label">Skipped</div>
        </div>
      </div>
    </div>

    <div class="tests-table">
      <table>
        <thead>
          <tr>
            <th style="width: 40px;"></th>
            <th>Test Name</th>
            <th style="width: 100px;">State</th>
            <th style="width: 100px; text-align: right;">Duration</th>
          </tr>
        </thead>
        <tbody>
          ${testRows}
        </tbody>
      </table>
    </div>
  </div>
</body>
</html>`;
  }

  /**
   * Generate HTML for summary report
   */
  generateSummaryHtml(summary, fileReports) {
    const statusColor = summary.status === 'PASS' ? '#22c55e' : '#ef4444';
    const statusBg = summary.status === 'PASS' ? '#dcfce7' : '#fef2f2';

    const fileRows = summary.files.map(file => {
      const fileStatusColor = file.status === 'PASS' ? '#22c55e' : '#ef4444';
      const fileStatusBg = file.status === 'PASS' ? '#dcfce7' : '#fef2f2';

      return `
        <tr>
          <td style="padding: 12px 16px;">${this.escapeHtml(file.name)}</td>
          <td style="padding: 12px 16px;"><span style="display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; background: ${fileStatusBg}; color: ${fileStatusColor};">${file.status}</span></td>
          <td style="padding: 12px 16px; text-align: center;">${file.tests}</td>
          <td style="padding: 12px 16px; text-align: center; color: #22c55e;">${file.passed}</td>
          <td style="padding: 12px 16px; text-align: center; color: #ef4444;">${file.failed}</td>
          <td style="padding: 12px 16px; text-align: center; color: #f59e0b;">${file.skipped}</td>
        </tr>`;
    }).join('');

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Test Summary Report</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f8fafc; padding: 24px; }
    .container { max-width: 1200px; margin: 0 auto; }
    .header { background: white; border-radius: 8px; padding: 24px; margin-bottom: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    .status-badge { display: inline-block; padding: 4px 12px; border-radius: 4px; font-weight: bold; background: ${statusBg}; color: ${statusColor}; }
    .summary-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 16px; margin-top: 16px; }
    .summary-card { background: #f1f5f9; padding: 16px; border-radius: 8px; text-align: center; }
    .summary-value { font-size: 28px; font-weight: bold; }
    .summary-label { font-size: 12px; color: #64748b; text-transform: uppercase; }
    .files-table { background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    table { width: 100%; border-collapse: collapse; }
    th { background: #f1f5f9; padding: 12px 16px; text-align: left; font-weight: 600; font-size: 12px; text-transform: uppercase; color: #64748b; }
    tr:not(:last-child) { border-bottom: 1px solid #e2e8f0; }
    .meta { color: #64748b; font-size: 14px; margin-top: 8px; }
    .mode-badge { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 12px; background: #e0e7ff; color: #4f46e5; margin-left: 8px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <h1 style="font-size: 24px;">Test Summary<span class="mode-badge">${summary.mode} mode</span></h1>
        <span class="status-badge">${summary.status}</span>
      </div>
      <p class="meta">Generated: ${summary.timestamp}</p>
      <p class="meta">Pass Rate: <strong>${summary.passRate}</strong></p>

      <div class="summary-grid">
        <div class="summary-card">
          <div class="summary-value">${summary.totalFiles}</div>
          <div class="summary-label">Test Files</div>
        </div>
        <div class="summary-card">
          <div class="summary-value">${summary.summary.total}</div>
          <div class="summary-label">Total Tests</div>
        </div>
        <div class="summary-card" style="color: #22c55e;">
          <div class="summary-value">${summary.summary.passed}</div>
          <div class="summary-label">Passed</div>
        </div>
        <div class="summary-card" style="color: #ef4444;">
          <div class="summary-value">${summary.summary.failed}</div>
          <div class="summary-label">Failed</div>
        </div>
        <div class="summary-card" style="color: #f59e0b;">
          <div class="summary-value">${summary.summary.skipped}</div>
          <div class="summary-label">Skipped</div>
        </div>
      </div>
    </div>

    <div class="files-table">
      <table>
        <thead>
          <tr>
            <th>Test File</th>
            <th style="width: 80px;">Status</th>
            <th style="width: 80px; text-align: center;">Total</th>
            <th style="width: 80px; text-align: center;">Passed</th>
            <th style="width: 80px; text-align: center;">Failed</th>
            <th style="width: 80px; text-align: center;">Skipped</th>
          </tr>
        </thead>
        <tbody>
          ${fileRows}
        </tbody>
      </table>
    </div>
  </div>
</body>
</html>`;
  }

  /**
   * Escape HTML special characters
   */
  escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}

module.exports = PerFileReporter;
module.exports.default = PerFileReporter;
