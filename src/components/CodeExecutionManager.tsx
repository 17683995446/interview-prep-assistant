import { useState, useCallback } from 'react';
import { useCodeExecution } from '@/hooks/useCodeExecution';
import CodeResultDisplay from '@/components/CodeExecutionResult';
import CodeEditor from '@/components/CodeEditor';
import { ProgrammingLanguage } from '@/services/codeRunner';
import { Play, RotateCcw, History } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TestCase {
  id: string;
  input: string;
  expected: string;
  description?: string;
}

interface CodeExecutionManagerProps {
  initialCode?: string;
  initialLanguage?: ProgrammingLanguage;
  testCases?: TestCase[];
  onCodeChange?: (code: string) => void;
  onLanguageChange?: (language: ProgrammingLanguage) => void;
  showEditor?: boolean;
  showResult?: boolean;
  height?: string;
  className?: string;
}

const defaultTestCases: TestCase[] = [
  {
    id: '1',
    input: '[2, 7, 11, 15], 9',
    expected: '[0, 1]',
    description: '基础测试'
  },
  {
    id: '2',
    input: '[3, 2, 4], 6',
    expected: '[1, 2]',
    description: '中间元素测试'
  },
  {
    id: '3',
    input: '[3, 3], 6',
    expected: '[0, 1]',
    description: '重复元素测试'
  }
];

export default function CodeExecutionManager({
  initialCode = '',
  initialLanguage = 'python',
  testCases = defaultTestCases,
  onCodeChange,
  onLanguageChange,
  showEditor = true,
  showResult = true,
  height = '400px',
  className
}: CodeExecutionManagerProps) {
  const [code, setCode] = useState(initialCode);
  const [language, setLanguage] = useState<ProgrammingLanguage>(initialLanguage);
  const [showHistory, setShowHistory] = useState(false);

  const {
    executeCode,
    result,
    isRunning,
    clearResult,
    cancel
  } = useCodeExecution();

  const handleCodeChange = useCallback((newCode: string) => {
    setCode(newCode);
    onCodeChange?.(newCode);
  }, [onCodeChange]);

  const handleLanguageChange = useCallback((newLanguage: ProgrammingLanguage) => {
    setLanguage(newLanguage);
    onLanguageChange?.(newLanguage);
  }, [onLanguageChange]);

  const handleRun = useCallback(async () => {
    if (!code.trim()) {
      return;
    }
    await executeCode(code, language);
  }, [code, language, executeCode]);

  const handleReset = useCallback(() => {
    setCode('');
    clearResult();
  }, [clearResult]);

  const handleCancel = useCallback(() => {
    cancel();
  }, [cancel]);

  return (
    <div className={cn('space-y-4', className)}>
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#161b22] rounded-lg border border-white/10">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-medium text-gray-300">代码执行</h3>
          <div className="h-4 w-px bg-white/10" />
          <div className="flex items-center gap-1">
            {['python', 'javascript', 'typescript', 'java', 'cpp'].map((lang) => (
              <button
                key={lang}
                onClick={() => handleLanguageChange(lang as ProgrammingLanguage)}
                className={cn(
                  'px-3 py-1 text-xs font-medium rounded-md transition-colors',
                  language === lang
                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                    : 'text-gray-400 hover:text-white hover:bg-white/10'
                )}
              >
                {lang === 'python' && 'Python'}
                {lang === 'javascript' && 'JavaScript'}
                {lang === 'typescript' && 'TypeScript'}
                {lang === 'java' && 'Java'}
                {lang === 'cpp' && 'C++'}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isRunning ? (
            <button
              onClick={handleCancel}
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-red-400 bg-red-500/10 hover:bg-red-500/20 rounded-lg transition-colors"
            >
              取消
            </button>
          ) : (
            <>
              <button
                onClick={handleReset}
                className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                <span>重置</span>
              </button>

              <button
                onClick={() => setShowHistory(!showHistory)}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-2 text-sm rounded-lg transition-colors',
                  showHistory
                    ? 'text-cyan-400 bg-cyan-500/10'
                    : 'text-gray-400 hover:text-white hover:bg-white/10'
                )}
              >
                <History className="w-4 h-4" />
                <span>历史</span>
              </button>

              <button
                onClick={handleRun}
                disabled={!code.trim()}
                className={cn(
                  'flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg transition-all',
                  code.trim()
                    ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:shadow-lg hover:shadow-green-500/20'
                    : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                )}
              >
                <Play className="w-4 h-4" />
                <span>运行</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Code Editor */}
        {showEditor && (
          <div>
            <div className="mb-2 text-xs text-gray-500">
              代码编辑器 (Ctrl + Enter 运行)
            </div>
            <CodeEditor
              code={code}
              onChange={handleCodeChange}
              language={language}
              onRun={handleRun}
              isRunning={isRunning}
              height={height}
            />
          </div>
        )}

        {/* Execution Result */}
        {showResult && (
          <div>
            <div className="mb-2 text-xs text-gray-500">
              执行结果
            </div>
            <CodeResultDisplay
              result={result}
              isRunning={isRunning}
              onRetry={handleRun}
            />
          </div>
        )}
      </div>

      {/* Test Cases */}
      {testCases.length > 0 && (
        <div className="px-4 py-3 bg-[#161b22] rounded-lg border border-white/10">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-gray-300">测试用例</h4>
            <span className="text-xs text-gray-500">{testCases.length} 个测试用例</span>
          </div>

          <div className="space-y-2">
            {testCases.map((testCase, index) => (
              <div
                key={testCase.id}
                className="flex items-center gap-3 px-3 py-2 bg-white/5 rounded-lg"
              >
                <span className="text-xs font-medium text-gray-500 w-16">
                  #{index + 1}
                </span>
                <div className="flex-1 grid grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-gray-500">输入: </span>
                    <span className="text-gray-300 font-mono">{testCase.input}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">期望: </span>
                    <span className="text-green-400 font-mono">{testCase.expected}</span>
                  </div>
                  {testCase.description && (
                    <div>
                      <span className="text-gray-500">说明: </span>
                      <span className="text-gray-400">{testCase.description}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Performance Metrics */}
      {result && (
        <div className="grid grid-cols-4 gap-4">
          <div className="px-4 py-3 bg-[#161b22] rounded-lg border border-white/10">
            <div className="text-xs text-gray-500 mb-1">执行状态</div>
            <div className={cn(
              'text-sm font-medium',
              result.success ? 'text-green-400' : 'text-red-400'
            )}>
              {result.status === 'success' && '成功'}
              {result.status === 'error' && '失败'}
              {result.status === 'timeout' && '超时'}
            </div>
          </div>

          <div className="px-4 py-3 bg-[#161b22] rounded-lg border border-white/10">
            <div className="text-xs text-gray-500 mb-1">执行时间</div>
            <div className="text-sm font-medium text-gray-300">
              {result.executionTime < 1000
                ? `${Math.round(result.executionTime)}ms`
                : `${(result.executionTime / 1000).toFixed(2)}s`
              }
            </div>
          </div>

          <div className="px-4 py-3 bg-[#161b22] rounded-lg border border-white/10">
            <div className="text-xs text-gray-500 mb-1">内存使用</div>
            <div className="text-sm font-medium text-gray-300">
              {result.memory ? `${result.memory}KB` : 'N/A'}
            </div>
          </div>

          <div className="px-4 py-3 bg-[#161b22] rounded-lg border border-white/10">
            <div className="text-xs text-gray-500 mb-1">测试通过</div>
            <div className="text-sm font-medium text-gray-300">
              {result.testResults
                ? `${result.testResults.filter(t => t.passed).length}/${result.testResults.length}`
                : 'N/A'
              }
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
