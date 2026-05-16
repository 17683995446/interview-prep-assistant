import { useState, useCallback, useRef } from 'react';
import { codeRunner, CodeExecutionResult, ProgrammingLanguage } from '@/services/codeRunner';

interface UseCodeExecutionReturn {
  executeCode: (code: string, language: ProgrammingLanguage) => Promise<CodeExecutionResult | null>;
  result: CodeExecutionResult | null;
  isRunning: boolean;
  error: string | null;
  cancel: () => void;
  clearResult: () => void;
  clearCache: () => void;
}

export function useCodeExecution(): UseCodeExecutionReturn {
  const [result, setResult] = useState<CodeExecutionResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);

  const executeCode = useCallback(async (
    code: string,
    language: ProgrammingLanguage
  ): Promise<CodeExecutionResult | null> => {
    if (!code.trim()) {
      setError('代码不能为空');
      return null;
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    setIsRunning(true);
    setError(null);

    try {
      const executionResult = await codeRunner.executeCode({
        code,
        language
      });

      setResult(executionResult);

      if (!executionResult.success && executionResult.error) {
        setError(executionResult.error);
      } else {
        setError(null);
      }

      return executionResult;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '未知错误';
      setError(errorMessage);

      const errorResult: CodeExecutionResult = {
        success: false,
        output: '',
        error: errorMessage,
        executionTime: 0,
        status: 'error'
      };
      setResult(errorResult);

      return errorResult;
    } finally {
      setIsRunning(false);
    }
  }, []);

  const cancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsRunning(false);
      setError('执行已取消');
    }
  }, []);

  const clearResult = useCallback(() => {
    setResult(null);
    setError(null);
  }, []);

  const clearCache = useCallback(() => {
    codeRunner.clearCache();
  }, []);

  return {
    executeCode,
    result,
    isRunning,
    error,
    cancel,
    clearResult,
    clearCache
  };
}

export interface UseCodeExecutionWithHistoryReturn extends UseCodeExecutionReturn {
  history: CodeExecutionResult[];
  addToHistory: (result: CodeExecutionResult) => void;
  clearHistory: () => void;
}

export function useCodeExecutionWithHistory(): UseCodeExecutionWithHistoryReturn {
  const [history, setHistory] = useState<CodeExecutionResult[]>([]);

  const codeExecution = useCodeExecution();

  const addToHistory = useCallback((result: CodeExecutionResult) => {
    setHistory(prev => {
      const newHistory = [result, ...prev].slice(0, 10);
      return newHistory;
    });
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
  }, []);

  const executeCodeWithHistory = useCallback(async (
    code: string,
    language: ProgrammingLanguage
  ) => {
    const result = await codeExecution.executeCode(code, language);
    if (result) {
      addToHistory(result);
    }
    return result;
  }, [codeExecution, addToHistory]);

  return {
    ...codeExecution,
    executeCode: executeCodeWithHistory,
    history,
    addToHistory,
    clearHistory
  };
}
