import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDuration(ms: number) {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60 * 1000) return `${(ms / 1000).toFixed(1)}s`;
  if (ms < 60 * 60 * 1000) return `${Math.floor(ms / 60 / 1000)}min`;
  return `${(ms / 60 / 60 / 1000).toFixed(1)}h`;
}

export function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
}

export function formatPercent(value: number): string {
  return `${(value * 100).toFixed(0)}%`;
}

export function getDifficultyColor(difficulty: 'easy' | 'medium' | 'hard') {
  const colors = {
    easy: 'bg-green-500/20 text-green-400 border-green-500/30',
    medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    hard: 'bg-red-500/20 text-red-400 border-red-500/30',
  };
  return colors[difficulty];
}

export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number,
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export function formatDate(date: Date | string): string {
  const d = new Date(date);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  
  if (diff < 60 * 1000) return '刚刚';
  if (diff < 60 * 60 * 1000) return `${Math.floor(diff / 60 / 1000)} 分钟前`;
  if (diff < 24 * 60 * 60 * 1000) return `${Math.floor(diff / 60 / 60 / 1000)} 小时前`;
  if (diff < 7 * 24 * 60 * 60 * 1000) return `${Math.floor(diff / 24 / 60 / 60 / 1000)} 天前`;
  
  return d.toLocaleDateString('zh-CN');
}

export function getCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    'algorithms': '算法',
    'machine-learning': '机器学习',
    'deep-learning': '深度学习',
    'system-design': '系统设计',
    'data-structures': '数据结构',
    'python': 'Python',
    'sql': 'SQL',
  };
  return labels[category] || category;
}
