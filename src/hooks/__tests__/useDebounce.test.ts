import { renderHook, act } from '@testing-library/react';
import { useState } from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useDebounce } from '@/hooks/useDebounce';

describe('useDebounce Hook 测试', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it('应该延迟更新值', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 500 } }
    );

    expect(result.current).toBe('initial');

    rerender({ value: 'updated', delay: 500 });

    expect(result.current).toBe('initial');

    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(result.current).toBe('updated');
  });

  it('应该使用默认延迟时间 300ms', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value),
      { initialProps: { value: 'initial' } }
    );

    expect(result.current).toBe('initial');

    rerender({ value: 'updated' });

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(result.current).toBe('updated');
  });

  it('应该正确处理数字类型的值', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 0, delay: 300 } }
    );

    expect(result.current).toBe(0);

    rerender({ value: 100, delay: 300 });

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(result.current).toBe(100);
  });

  it('应该正确处理对象类型的值', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: { key: 'initial' }, delay: 300 } }
    );

    expect(result.current).toEqual({ key: 'initial' });

    rerender({ value: { key: 'updated' }, delay: 300 });

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(result.current).toEqual({ key: 'updated' });
  });

  it('应该正确处理数组类型的值', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: [1, 2, 3], delay: 300 } }
    );

    expect(result.current).toEqual([1, 2, 3]);

    rerender({ value: [4, 5, 6], delay: 300 });

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(result.current).toEqual([4, 5, 6]);
  });

  it('应该在值未变化时不触发更新', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 300 } }
    );

    expect(result.current).toBe('initial');

    rerender({ value: 'initial', delay: 300 });

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(result.current).toBe('initial');
  });

  it('应该处理快速连续的值变化', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 300 } }
    );

    expect(result.current).toBe('initial');

    rerender({ value: 'value1', delay: 300 });
    rerender({ value: 'value2', delay: 300 });
    rerender({ value: 'value3', delay: 300 });

    expect(result.current).toBe('initial');

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(result.current).toBe('value3');
  });

  it('应该支持不同的延迟时间', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 100 } }
    );

    rerender({ value: 'updated', delay: 200 });

    act(() => {
      vi.advanceTimersByTime(100);
    });

    expect(result.current).toBe('initial');

    act(() => {
      vi.advanceTimersByTime(100);
    });

    expect(result.current).toBe('updated');
  });

  it('应该在卸载时清理定时器', () => {
    const clearTimeoutSpy = vi.spyOn(global, 'clearTimeout');
    
    const { result, rerender, unmount } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 300 } }
    );

    rerender({ value: 'updated', delay: 300 });

    unmount();

    expect(clearTimeoutSpy).toHaveBeenCalled();
  });

  it('应该处理布尔类型的值', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: false, delay: 300 } }
    );

    expect(result.current).toBe(false);

    rerender({ value: true, delay: 300 });

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(result.current).toBe(true);
  });

  it('应该处理空值和空字符串', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: '', delay: 300 } }
    );

    expect(result.current).toBe('');

    rerender({ value: 'text', delay: 300 });

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(result.current).toBe('text');

    rerender({ value: '', delay: 300 });

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(result.current).toBe('');
  });

  it('应该与 useState 一起使用', () => {
    const { result } = renderHook(() => {
      const [value, setValue] = useState('initial');
      const debouncedValue = useDebounce(value, 300);
      return { value, debouncedValue, setValue };
    });

    expect(result.current.value).toBe('initial');
    expect(result.current.debouncedValue).toBe('initial');

    act(() => {
      result.current.setValue('updated');
    });

    expect(result.current.value).toBe('updated');
    expect(result.current.debouncedValue).toBe('initial');

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(result.current.debouncedValue).toBe('updated');
  });

  it('应该正确重置延迟', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 500 } }
    );

    rerender({ value: 'updated1', delay: 500 });
    
    act(() => {
      vi.advanceTimersByTime(200);
    });

    expect(result.current).toBe('initial');

    rerender({ value: 'updated2', delay: 500 });

    act(() => {
      vi.advanceTimersByTime(200);
    });

    expect(result.current).toBe('initial');

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(result.current).toBe('updated2');
  });
});
