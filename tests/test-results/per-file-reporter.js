const fs = require('fs');
const path = require('path');

/**
 * Custom Vitest 4.x reporter that generates individual JSON reports per test file.
 * Each report includes: test name, date, and PASS/FAIL status in the filename.
 *
 * Output format: test-results-{testName}-{YYYY-MM-DD}-{PASS|FAIL}.json
 */
class PerFileReporter {
  constructor() {
    this.outputDir = 'tests/test-results';
  }

  onInit(ctx) {
    // Ensure output directory exists
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }

  /**
   * Vitest 4.x uses onTestRunEnd instead of onFinished
   * @param {Array} testModules - Array of TestModule objects
   * @param {Array} unhandledErrors - Unhandled errors during test run
   * @param {string} reason - Reason for test run ending
   */
  onTestRunEnd(testModules, unhandledErrors, reason) {
    if (!testModules || testModules.length === 0) return;

    const timestamp = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

    for (const testModule of testModules) {
      // Extract test filename without path and extension
      const filePath = testModule.moduleId || '';
      let testName = path.basename(filePath);
      testName = testName.replace(/\.(test|spec)\.(ts|js|tsx|jsx)$/, '');

      // Determine PASS/FAIL status by checking the module's state
      const hasFailed = this.moduleHasFailed(testModule);
      const status = hasFailed ? 'FAIL' : 'PASS';

      // Count tests from children
      const tests = this.collectTests(testModule.children);
      const summary = {
        total: tests.length,
        passed: tests.filter(t => t.state === 'passed').length,
        failed: tests.filter(t => t.state === 'failed').length,
        skipped: tests.filter(t => t.state === 'skipped').length,
      };

      // Build report data
      const report = {
        name: filePath,
        testName,
        timestamp: new Date().toISOString(),
        status,
        duration: testModule.collectDuration ?? 0,
        tests: tests.map(t => ({
          name: t.name,
          fullName: t.fullName,
          state: t.state,
          duration: t.duration,
          errors: t.errors,
        })),
        summary
      };

      // Generate filename with test name, date, and status
      const reportFilename = `test-results-${testName}-${timestamp}-${status}.json`;
      const reportPath = path.join(this.outputDir, reportFilename);

      // Write individual report
      fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    }

    // Also create a summary report
    this.writeSummaryReport(testModules, unhandledErrors, timestamp);
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
        // Vitest 4.x: result is a getter function that returns the result object
        const result = typeof child.result === 'function' ? child.result() : child.result;
        const state = result?.state ?? 'pending';
        tests.push({
          name: child.name,
          fullName: fullName,
          state: state,
          duration: result?.duration ?? 0,
          errors: result?.errors?.map(e => e.message) ?? [],
        });
      }

      // Recurse into suites
      if (child.children) {
        tests.push(...this.collectTests(child.children, fullName));
      }
    }
    return tests;
  }

  moduleHasFailed(testModule) {
    const tests = this.collectTests(testModule.children);
    return tests.some(t => t.state === 'failed');
  }

  writeSummaryReport(testModules, unhandledErrors, timestamp) {
    const allTests = testModules.flatMap(m => this.collectTests(m.children));

    const totalTests = allTests.length;
    const passedTests = allTests.filter(t => t.state === 'passed').length;
    const failedTests = allTests.filter(t => t.state === 'failed').length;
    const skippedTests = allTests.filter(t => t.state === 'skipped').length;

    const overallStatus = failedTests > 0 || (unhandledErrors && unhandledErrors.length > 0) ? 'FAIL' : 'PASS';

    const summary = {
      timestamp: new Date().toISOString(),
      status: overallStatus,
      totalFiles: testModules.length,
      summary: {
        total: totalTests,
        passed: passedTests,
        failed: failedTests,
        skipped: skippedTests,
      },
      unhandledErrors: unhandledErrors?.length ?? 0,
      files: testModules.map(m => {
        const tests = this.collectTests(m.children);
        return {
          name: path.basename(m.moduleId || ''),
          status: this.moduleHasFailed(m) ? 'FAIL' : 'PASS',
          tests: tests.length,
          passed: tests.filter(t => t.state === 'passed').length,
          failed: tests.filter(t => t.state === 'failed').length,
        };
      })
    };

    const summaryPath = path.join(this.outputDir, `test-summary-${timestamp}-${overallStatus}.json`);
    fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));
  }
}

module.exports = PerFileReporter;
module.exports.default = PerFileReporter;
