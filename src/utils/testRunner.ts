import { ProgrammingLanguage, TestResult } from '@/services/codeRunner';

export interface ParsedTestCase {
  name: string;
  input: string;
  expected: string;
  functionCall: string;
  assertions: Assertion[];
}

export interface Assertion {
  type: 'assert' | 'console.assert' | 'test';
  actual: string;
  expected: string;
  passed: boolean;
}

export interface TestReport {
  totalTests: number;
  passedTests: number;
  failedTests: number;
  totalTime: number;
  results: TestResult[];
  errors: string[];
}

const PYTHON_TEST_PATTERN = /def (test_\w+)\s*\([^)]*\):[\s\S]*?(?=\n(?:def |class |$))/g;
const PYTHON_ASSERT_PATTERN = /assert\s+(.+?)(?:==|!=|is\s+)(.+?)(?:\s*[,)\n]|$)/g;

const JAVASCRIPT_TEST_PATTERN = /(?:function\s+)?(test_\w+)\s*\([^)]*\)\s*{[\s\S]*?(?=\n(?:function|const|let|class|}))/g;
const JAVASCRIPT_ASSERT_PATTERN = /console\.assert\s*\((.+?),\s*["'](.+?)["']\)/g;

const JAVA_TEST_PATTERN = /@Test[\s\S]*?void\s+(test_\w+)\s*\([^)]*\)\s*{[\s\S]*?(?=\n\s*(?:@Test|@Before|@After|class |$))/g;
const JAVA_ASSERT_PATTERN = /assert(?:Equals|True|False)\s*\((.+?),\s*(.+?)\)/g;

const CPP_TEST_PATTERN = /(?:void|TEST)\s+(\w+)\s*\([^)]*\)\s*{[\s\S]*?(?=\n\s*(?:void|TEST|class |$))/g;
const CPP_ASSERT_PATTERN = /assert\s*\((.+?)\s*(?:==|!=|>=|<=|>|<)\s*(.+?)\)/g;

class TestRunner {
  private parsePythonTests(code: string): ParsedTestCase[] {
    const tests: ParsedTestCase[] = [];
    const matches = code.matchAll(PYTHON_TEST_PATTERN);

    for (const match of matches) {
      const testName = match[1];
      const testBody = match[0];
      
      const assertions: Assertion[] = [];
      const assertMatches = testBody.matchAll(PYTHON_ASSERT_PATTERN);
      
      for (const assertMatch of assertMatches) {
        assertions.push({
          type: 'assert',
          actual: assertMatch[1].trim(),
          expected: assertMatch[2].trim(),
          passed: false
        });
      }

      const input = this.extractPythonInput(testBody);
      const expected = assertions.length > 0 ? assertions[0].expected : '';

      tests.push({
        name: testName,
        input,
        expected,
        functionCall: this.extractPythonFunctionCall(testBody),
        assertions
      });
    }

    return tests;
  }

  private parseJavaScriptTests(code: string): ParsedTestCase[] {
    const tests: ParsedTestCase[] = [];
    const matches = code.matchAll(JAVASCRIPT_TEST_PATTERN);

    for (const match of matches) {
      const testName = match[1];
      const testBody = match[0];
      
      const assertions: Assertion[] = [];
      const assertMatches = testBody.matchAll(JAVASCRIPT_ASSERT_PATTERN);
      
      for (const assertMatch of assertMatches) {
        assertions.push({
          type: 'console.assert',
          actual: assertMatch[1].trim(),
          expected: assertMatch[2].trim(),
          passed: false
        });
      }

      const input = this.extractJavaScriptInput(testBody);
      const expected = assertions.length > 0 ? assertions[0].expected : '';

      tests.push({
        name: testName,
        input,
        expected,
        functionCall: this.extractJavaScriptFunctionCall(testBody),
        assertions
      });
    }

    return tests;
  }

  private parseTypeScriptTests(code: string): ParsedTestCase[] {
    return this.parseJavaScriptTests(code);
  }

  private parseJavaTests(code: string): ParsedTestCase[] {
    const tests: ParsedTestCase[] = [];
    const matches = code.matchAll(JAVA_TEST_PATTERN);

    for (const match of matches) {
      const testName = match[1];
      const testBody = match[0];
      
      const assertions: Assertion[] = [];
      const assertMatches = testBody.matchAll(JAVA_ASSERT_PATTERN);
      
      for (const assertMatch of assertMatches) {
        assertions.push({
          type: 'assert',
          actual: assertMatch[1].trim(),
          expected: assertMatch[2].trim(),
          passed: false
        });
      }

      const input = this.extractJavaInput(testBody);
      const expected = assertions.length > 0 ? assertions[0].expected : '';

      tests.push({
        name: testName,
        input,
        expected,
        functionCall: this.extractJavaFunctionCall(testBody),
        assertions
      });
    }

    return tests;
  }

  private parseCppTests(code: string): ParsedTestCase[] {
    const tests: ParsedTestCase[] = [];
    const matches = code.matchAll(CPP_TEST_PATTERN);

    for (const match of matches) {
      const testName = match[1];
      const testBody = match[0];
      
      const assertions: Assertion[] = [];
      const assertMatches = testBody.matchAll(CPP_ASSERT_PATTERN);
      
      for (const assertMatch of assertMatches) {
        assertions.push({
          type: 'assert',
          actual: assertMatch[1].trim(),
          expected: assertMatch[2].trim(),
          passed: false
        });
      }

      const input = this.extractCppInput(testBody);
      const expected = assertions.length > 0 ? assertions[0].expected : '';

      tests.push({
        name: testName,
        input,
        expected,
        functionCall: this.extractCppFunctionCall(testBody),
        assertions
      });
    }

    return tests;
  }

  private extractPythonInput(testBody: string): string {
    const printMatch = testBody.match(/print\s*\(\s*(.+?)\s*\)/);
    if (printMatch) {
      return printMatch[1].trim();
    }
    return '';
  }

  private extractJavaScriptInput(testBody: string): string {
    const consoleMatch = testBody.match(/console\.(?:log|assert)\s*\(\s*(.+?)\s*\)/);
    if (consoleMatch) {
      return consoleMatch[1].trim();
    }
    return '';
  }

  private extractJavaInput(testBody: string): string {
    const printMatch = testBody.match(/System\.out\.println\s*\(\s*(.+?)\s*\)/);
    if (printMatch) {
      return printMatch[1].trim();
    }
    return '';
  }

  private extractCppInput(testBody: string): string {
    const printMatch = testBody.match(/cout\s*<<\s*(.+?)\s*;/);
    if (printMatch) {
      return printMatch[1].trim();
    }
    return '';
  }

  private extractPythonFunctionCall(testBody: string): string {
    const callMatch = testBody.match(/(solution|\w+)\s*\([^)]*\)/);
    return callMatch ? callMatch[0] : '';
  }

  private extractJavaScriptFunctionCall(testBody: string): string {
    const callMatch = testBody.match(/(?:solution|\w+)\s*\([^)]*\)/);
    return callMatch ? callMatch[0] : '';
  }

  private extractJavaFunctionCall(testBody: string): string {
    const callMatch = testBody.match(/sol\.\w+\s*\([^)]*\)/);
    return callMatch ? callMatch[0] : '';
  }

  private extractCppFunctionCall(testBody: string): string {
    const callMatch = testBody.match(/sol\.\w+\s*\([^)]*\)/);
    return callMatch ? callMatch[0] : '';
  }

  parseTestCases(code: string, language: ProgrammingLanguage): ParsedTestCase[] {
    switch (language) {
      case 'python':
        return this.parsePythonTests(code);
      case 'javascript':
        return this.parseJavaScriptTests(code);
      case 'typescript':
        return this.parseTypeScriptTests(code);
      case 'java':
        return this.parseJavaTests(code);
      case 'cpp':
        return this.parseCppTests(code);
      default:
        return [];
    }
  }

  generateTestReport(
    parsedTests: ParsedTestCase[],
    executionOutput: string,
    executionTime: number
  ): TestReport {
    const results: TestResult[] = [];
    const errors: string[] = [];
    let passedTests = 0;
    let failedTests = 0;

    parsedTests.forEach((test, index) => {
      const outputLines = executionOutput.split('\n').filter(line => line.trim());
      const actualOutput = outputLines[index] || '';

      const passed = this.compareOutputs(actualOutput, test.expected);
      
      if (passed) {
        passedTests++;
      } else {
        failedTests++;
      }

      results.push({
        caseNumber: index + 1,
        input: test.input,
        expected: test.expected,
        actual: actualOutput,
        passed,
        executionTime: executionTime / parsedTests.length
      });
    });

    return {
      totalTests: parsedTests.length,
      passedTests,
      failedTests,
      totalTime: executionTime,
      results,
      errors
    };
  }

  private compareOutputs(actual: string, expected: string): boolean {
    const normalizeOutput = (str: string): string => {
      const step1 = str.replace(/\s+/g, '');
      const step2 = step1.split('[').join('').split(']').join('');
      const step3 = step2.split('{').join('').split('}').join('');
      return step3.toLowerCase();
    };

    const normalizedActual = normalizeOutput(actual);
    const normalizedExpected = normalizeOutput(expected);

    if (normalizedActual === normalizedExpected) {
      return true;
    }

    try {
      const actualParsed = JSON.parse(actual);
      const expectedParsed = JSON.parse(expected);
      return JSON.stringify(actualParsed) === JSON.stringify(expectedParsed);
    } catch {
      return false;
    }
  }

  generateTestCode(
    solutionFunction: string,
    testCases: Array<{ input: string; expected: string }>,
    language: ProgrammingLanguage
  ): string {
    switch (language) {
      case 'python':
        return this.generatePythonTests(solutionFunction, testCases);
      case 'javascript':
        return this.generateJavaScriptTests(solutionFunction, testCases);
      case 'typescript':
        return this.generateTypeScriptTests(solutionFunction, testCases);
      case 'java':
        return this.generateJavaTests(solutionFunction, testCases);
      case 'cpp':
        return this.generateCppTests(solutionFunction, testCases);
      default:
        return '';
    }
  }

  private generatePythonTests(
    solutionFunction: string,
    testCases: Array<{ input: string; expected: string }>
  ): string {
    const tests = testCases.map((tc, index) => `
def test_case_${index + 1}():
    result = solution(${tc.input})
    assert result == ${tc.expected}, f"Expected ${tc.expected}, got {result}"
    print(${tc.expected})
`).join('\n');

    return `${solutionFunction}

${tests}

if __name__ == "__main__":
${testCases.map((_, index) => `    test_case_${index + 1}()`).join('\n')}
`;
  }

  private generateJavaScriptTests(
    solutionFunction: string,
    testCases: Array<{ input: string; expected: string }>
  ): string {
    const tests = testCases.map((tc, index) => `
function test_case_${index + 1}() {
  const result = solution(${tc.input});
  console.assert(JSON.stringify(result) === JSON.stringify(${tc.expected}), 
    'Expected ${tc.expected}, got ' + JSON.stringify(result));
  console.log(JSON.stringify(${tc.expected}));
}
`).join('\n');

    return `${solutionFunction}

${tests}

${testCases.map((_, index) => `test_case_${index + 1}();`).join('\n')}
`;
  }

  private generateTypeScriptTests(
    solutionFunction: string,
    testCases: Array<{ input: string; expected: string }>
  ): string {
    return this.generateJavaScriptTests(solutionFunction, testCases);
  }

  private generateJavaTests(
    solutionFunction: string,
    testCases: Array<{ input: string; expected: string }>
  ): string {
    const tests = testCases.map((tc, index) => `
    @Test
    void test_case_${index + 1}() {
        int[] result = sol.solution(${tc.input});
        assertEquals("${tc.expected}", Arrays.toString(result));
        System.out.println(Arrays.toString(result));
    }
`).join('\n');

    return `${solutionFunction}

public class TestRunner {
${tests}
}
`;
  }

  private generateCppTests(
    solutionFunction: string,
    testCases: Array<{ input: string; expected: string }>
  ): string {
    return `${solutionFunction}

int main() {
${testCases.map((_, index) => `    test_case_${index + 1}();`).join('\n')}
    return 0;
}
`;
  }

  validateTestFormat(code: string, language: ProgrammingLanguage): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!code || !code.trim()) {
      errors.push('代码不能为空');
      return { valid: false, errors };
    }

    const testCount = this.parseTestCases(code, language).length;
    if (testCount === 0) {
      errors.push('未找到测试用例，请确保代码包含 test_case_* 函数');
    }

    switch (language) {
      case 'python':
        if (!code.includes('def test_')) {
          errors.push('Python 代码需要包含 test_* 函数');
        }
        break;
      case 'javascript':
      case 'typescript':
        if (!code.includes('test_') && !code.includes('function test_')) {
          errors.push('JavaScript/TypeScript 代码需要包含 test_* 函数');
        }
        break;
      case 'java':
        if (!code.includes('@Test') || !code.includes('void test_')) {
          errors.push('Java 代码需要包含 @Test 注解和 test_* 方法');
        }
        break;
      case 'cpp':
        if (!code.includes('test_')) {
          errors.push('C++ 代码需要包含 test_* 函数');
        }
        break;
    }

    return { valid: errors.length === 0, errors };
  }
}

export const testRunner = new TestRunner();
export default testRunner;
