export type ProgrammingLanguage = 'python' | 'javascript' | 'typescript' | 'java' | 'cpp';

export interface CodeExecutionRequest {
  code: string;
  language: ProgrammingLanguage;
  testCases?: string[];
}

export interface TestResult {
  caseNumber: number;
  input: string;
  expected: string;
  actual: string;
  passed: boolean;
  executionTime: number;
}

export interface CodeExecutionResult {
  success: boolean;
  output: string;
  error?: string;
  executionTime: number;
  memory?: number;
  testResults?: TestResult[];
  status: 'idle' | 'running' | 'success' | 'error' | 'timeout';
}

interface PistonExecuteRequest {
  language: string;
  version: string;
  files: { content: string }[];
  stdin?: string;
  args?: string[];
  run_timeout?: number;
  compile_timeout?: number;
}

interface PistonExecuteResponse {
  language: string;
  version: string;
  run: {
    stdout: string;
    stderr: string;
    code: number;
    signal: string | null;
    output: string;
  };
  compile?: {
    stdout: string;
    stderr: string;
    code: number;
    signal: string | null;
    output: string;
  };
}

const PISTON_API_URL = 'https://emkc.org/api/v2/piston';

const LANGUAGE_CONFIG: Record<ProgrammingLanguage, { pistonLang: string; version: string; fileName: string }> = {
  python: { pistonLang: 'python', version: '3.10.0', fileName: 'main.py' },
  javascript: { pistonLang: 'javascript', version: '18.15.0', fileName: 'main.js' },
  typescript: { pistonLang: 'typescript', version: '5.0.3', fileName: 'main.ts' },
  java: { pistonLang: 'java', version: '15.0.2', fileName: 'Main.java' },
  cpp: { pistonLang: 'cpp', version: '10.2.0', fileName: 'main.cpp' }
};

const EXECUTION_TIMEOUT = 5000;
const COMPILE_TIMEOUT = 5000;

class CodeRunnerService {
  private cache: Map<string, CodeExecutionResult> = new Map();

  private getCacheKey(code: string, language: ProgrammingLanguage): string {
    return `${language}:${this.hashCode(code)}`;
  }

  private hashCode(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash.toString(36);
  }

  private getCachedResult(key: string): CodeExecutionResult | undefined {
    return this.cache.get(key);
  }

  private setCachedResult(key: string, result: CodeExecutionResult): void {
    if (this.cache.size > 100) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }
    this.cache.set(key, result);
  }

  async executeCode(request: CodeExecutionRequest): Promise<CodeExecutionResult> {
    const cacheKey = this.getCacheKey(request.code, request.language);
    const cachedResult = this.getCachedResult(cacheKey);
    if (cachedResult) {
      return cachedResult;
    }

    const config = LANGUAGE_CONFIG[request.language];
    const startTime = performance.now();

    try {
      const result = await this.executeWithPiston(request, config);
      const executionTime = performance.now() - startTime;

      const finalResult: CodeExecutionResult = {
        ...result,
        executionTime,
        status: result.success ? 'success' : 'error'
      };

      this.setCachedResult(cacheKey, finalResult);
      return finalResult;
    } catch (error) {
      const executionTime = performance.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : '未知错误';

      if (errorMessage.includes('timeout') || errorMessage.includes('Timeout')) {
        const timeoutResult: CodeExecutionResult = {
          success: false,
          output: '',
          error: '执行超时，请检查代码是否有无限循环',
          executionTime,
          status: 'timeout'
        };
        this.setCachedResult(cacheKey, timeoutResult);
        return timeoutResult;
      }

      const errorResult: CodeExecutionResult = {
        success: false,
        output: '',
        error: errorMessage,
        executionTime,
        status: 'error'
      };
      this.setCachedResult(cacheKey, errorResult);
      return errorResult;
    }
  }

  private async executeWithPiston(
    request: CodeExecutionRequest,
    config: { pistonLang: string; version: string; fileName: string }
  ): Promise<{ success: boolean; output: string; error?: string }> {
    const { code } = request;

    const executeRequest: PistonExecuteRequest = {
      language: config.pistonLang,
      version: config.version,
      files: [{ content: code }],
      run_timeout: EXECUTION_TIMEOUT,
      compile_timeout: COMPILE_TIMEOUT
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), EXECUTION_TIMEOUT + 1000);

    try {
      const response = await fetch(`${PISTON_API_URL}/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(executeRequest),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`API 请求失败: ${response.status} ${response.statusText}`);
      }

      const data: PistonExecuteResponse = await response.json();

      if (data.run.stderr && data.run.stderr.trim()) {
        return {
          success: false,
          output: '',
          error: this.formatError(data.run.stderr)
        };
      }

      if (data.run.code !== 0) {
        return {
          success: false,
          output: '',
          error: data.run.output || data.run.stderr || '执行失败'
        };
      }

      return {
        success: true,
        output: data.run.stdout.trim()
      };
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error('执行超时');
        }
        throw error;
      }
      throw new Error('未知错误');
    }
  }

  private formatError(error: string): string {
    const lines = error.split('\n');
    const formattedLines = lines.map(line => {
      if (line.includes('Error:') || line.includes('error:')) {
        return `❌ ${line.trim()}`;
      }
      return line;
    });

    return formattedLines.join('\n');
  }

  async executeWithTestCases(
    code: string,
    language: ProgrammingLanguage,
    testCases: Array<{ input: string; expected: string }>
  ): Promise<CodeExecutionResult> {
    const executionResult = await this.executeCode({ code, language });

    if (!executionResult.success) {
      return {
        ...executionResult,
        testResults: []
      };
    }

    const testResults: TestResult[] = testCases.map((testCase, index) => {
      const passed = executionResult.output.includes(testCase.expected);
      return {
        caseNumber: index + 1,
        input: testCase.input,
        expected: testCase.expected,
        actual: executionResult.output,
        passed,
        executionTime: executionResult.executionTime
      };
    });

    return {
      ...executionResult,
      testResults
    };
  }

  clearCache(): void {
    this.cache.clear();
  }

  getSupportedLanguages(): ProgrammingLanguage[] {
    return Object.keys(LANGUAGE_CONFIG) as ProgrammingLanguage[];
  }

  getLanguageInfo(language: ProgrammingLanguage): { name: string; version: string; fileName: string } {
    const config = LANGUAGE_CONFIG[language];
    const names: Record<ProgrammingLanguage, string> = {
      python: 'Python',
      javascript: 'JavaScript',
      typescript: 'TypeScript',
      java: 'Java',
      cpp: 'C++'
    };

    return {
      name: names[language],
      version: config.version,
      fileName: config.fileName
    };
  }
}

export const codeRunner = new CodeRunnerService();
export default codeRunner;
