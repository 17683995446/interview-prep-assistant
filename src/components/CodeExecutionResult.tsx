import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { CheckCircle, XCircle, Loader2, Clock, Copy, Check, Terminal, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CodeExecutionResult, TestResult } from '@/services/codeRunner';
import { useState, useMemo } from 'react';

interface CodeExecutionResultProps {
  result: CodeExecutionResult | null;
  isRunning?: boolean;
  showDetails?: boolean;
  onRetry?: () => void;
}

export default function CodeResultDisplay({
  result,
  isRunning = false,
  showDetails = true,
  onRetry
}: CodeExecutionResultProps) {
  const [copied, setCopied] = useState(false);

  const statusConfig = useMemo(() => {
    if (isRunning) {
      return {
        icon: Loader2,
        label: '运行中',
        color: 'text-blue-400',
        borderColor: 'border-blue-500/30',
        bgColor: 'bg-blue-500/10',
        animate: true
      };
    }

    if (!result) {
      return {
        icon: Terminal,
        label: '等待执行',
        color: 'text-gray-400',
        borderColor: 'border-gray-500/30',
        bgColor: 'bg-gray-500/10',
        animate: false
      };
    }

    switch (result.status) {
      case 'success':
        return {
          icon: CheckCircle,
          label: '执行成功',
          color: 'text-green-400',
          borderColor: 'border-green-500/30',
          bgColor: 'bg-green-500/10',
          animate: false
        };
      case 'error':
        return {
          icon: XCircle,
          label: '执行失败',
          color: 'text-red-400',
          borderColor: 'border-red-500/30',
          bgColor: 'bg-red-500/10',
          animate: false
        };
      case 'timeout':
        return {
          icon: AlertTriangle,
          label: '执行超时',
          color: 'text-yellow-400',
          borderColor: 'border-yellow-500/30',
          bgColor: 'bg-yellow-500/10',
          animate: false
        };
      default:
        return {
          icon: Terminal,
          label: '未知状态',
          color: 'text-gray-400',
          borderColor: 'border-gray-500/30',
          bgColor: 'bg-gray-500/10',
          animate: false
        };
    }
  }, [result, isRunning]);

  const handleCopyOutput = async () => {
    if (!result?.output) return;

    try {
      await navigator.clipboard.writeText(result.output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('复制失败:', err);
    }
  };

  const formatExecutionTime = (ms: number): string => {
    if (ms < 1000) {
      return `${Math.round(ms)}ms`;
    }
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const StatusIcon = statusConfig.icon;

  return (
    <div className={cn(
      'rounded-xl border transition-all duration-300 overflow-hidden',
      statusConfig.borderColor,
      statusConfig.bgColor
    )}>
      {/* Status Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
        <div className="flex items-center gap-2">
          <StatusIcon className={cn(
            'w-5 h-5',
            statusConfig.color,
            statusConfig.animate && 'animate-spin'
          )} />
          <span className={cn('text-sm font-medium', statusConfig.color)}>
            {statusConfig.label}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {result && (
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <Clock className="w-3.5 h-3.5" />
              <span>{formatExecutionTime(result.executionTime)}</span>
              {result.memory && (
                <>
                  <span>•</span>
                  <span>{result.memory}KB</span>
                </>
              )}
            </div>
          )}

          {onRetry && !isRunning && (
            <button
              onClick={onRetry}
              className="px-3 py-1 text-xs font-medium text-gray-300 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
            >
              重新运行
            </button>
          )}
        </div>
      </div>

      {/* Output Section */}
      {showDetails && (
        <div className="p-4 space-y-4">
          {/* Main Output */}
          {result?.output && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                  输出结果
                </h4>
                <button
                  onClick={handleCopyOutput}
                  className="flex items-center gap-1 px-2 py-1 text-xs text-gray-400 hover:text-white hover:bg-white/10 rounded transition-colors"
                >
                  {copied ? (
                    <>
                      <Check className="w-3 h-3" />
                      <span>已复制</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>复制</span>
                    </>
                  )}
                </button>
              </div>

              <div className="rounded-lg bg-[#0d1117] border border-white/10 overflow-hidden">
                <SyntaxHighlighter
                  language="text"
                  style={vscDarkPlus}
                  customStyle={{
                    margin: 0,
                    padding: '1rem',
                    fontSize: '13px',
                    lineHeight: '1.6',
                    background: 'transparent'
                  }}
                  wrapLongLines
                >
                  {result.output}
                </SyntaxHighlighter>
              </div>
            </div>
          )}

          {/* Error Message */}
          {result?.error && (
            <div className="space-y-2">
              <h4 className="text-xs font-medium text-red-400 uppercase tracking-wide">
                错误信息
              </h4>

              <div className="rounded-lg bg-red-500/10 border border-red-500/20 overflow-hidden">
                <div className="p-4">
                  {result.error.split('\n').map((line, index) => (
                    <div
                      key={index}
                      className={cn(
                        'font-mono text-sm leading-6',
                        line.startsWith('❌') ? 'text-red-400 font-medium' : 'text-gray-300'
                      )}
                    >
                      {line.startsWith('❌') ? (
                        <span className="mr-2">{line}</span>
                      ) : (
                        line
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Test Results */}
          {result?.testResults && result.testResults.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                  测试用例结果
                </h4>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-green-400">
                    {result.testResults.filter(t => t.passed).length} 通过
                  </span>
                  <span className="text-gray-600">•</span>
                  <span className="text-xs text-red-400">
                    {result.testResults.filter(t => !t.passed).length} 失败
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                {result.testResults.map((testResult, index) => (
                  <TestResultCard key={index} testResult={testResult} />
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {!result && !isRunning && (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Terminal className="w-12 h-12 text-gray-600 mb-3" />
              <p className="text-sm text-gray-400">点击运行按钮执行代码</p>
              <p className="text-xs text-gray-500 mt-1">
                Ctrl + Enter 或点击运行按钮
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function TestResultCard({ testResult }: { testResult: TestResult }) {
  const ResultIcon = testResult.passed ? CheckCircle : XCircle;
  const iconColor = testResult.passed ? 'text-green-400' : 'text-red-400';
  const borderColor = testResult.passed ? 'border-green-500/20' : 'border-red-500/20';
  const bgColor = testResult.passed ? 'bg-green-500/5' : 'bg-red-500/5';

  return (
    <div className={cn(
      'rounded-lg border p-3 transition-colors',
      borderColor,
      bgColor
    )}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2 flex-1">
          <ResultIcon className={cn('w-4 h-4 mt-0.5', iconColor)} />
          <div className="flex-1 min-w-0">
            <div className="text-xs font-medium text-gray-300 mb-2">
              测试用例 #{testResult.caseNumber}
            </div>

            <div className="space-y-2 text-xs">
              <div>
                <span className="text-gray-500">输入: </span>
                <span className="text-gray-300 font-mono">{testResult.input}</span>
              </div>
              <div>
                <span className="text-gray-500">期望: </span>
                <span className="text-green-400 font-mono">{testResult.expected}</span>
              </div>
              <div>
                <span className="text-gray-500">实际: </span>
                <span className={cn(
                  'font-mono',
                  testResult.passed ? 'text-green-400' : 'text-red-400'
                )}>
                  {testResult.actual}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="text-xs text-gray-500">
          {Math.round(testResult.executionTime)}ms
        </div>
      </div>
    </div>
  );
}
