import { useState, useEffect, useRef, useMemo } from 'react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { cn } from '@/lib/utils'
import { Play, RotateCcw, Copy, Check, ChevronDown } from 'lucide-react'

type ProgrammingLanguage = 'python' | 'javascript' | 'typescript' | 'java' | 'cpp'

interface CodeEditorProps {
  code: string
  onChange: (code: string) => void
  language?: ProgrammingLanguage
  readOnly?: boolean
  height?: string
  onRun?: () => void
  isRunning?: boolean
  executionResult?: any
}

// 代码模板库
const codeTemplates: Record<ProgrammingLanguage, string[]> = {
  python: [
    `def solution(nums, target):
    """
    解题函数
    参数:
        nums: List[int] - 输入数组
        target: int - 目标值
    返回:
        List[int] - 结果
    """
    pass

# 测试用例
if __name__ == "__main__":
    nums = [2, 7, 11, 15]
    target = 9
    print(solution(nums, target))`,
    `class Solution:
    def method(self, param):
        pass`,
    `def binary_search(nums, target):
    left, right = 0, len(nums) - 1
    while left <= right:
        mid = (left + right) // 2
        if nums[mid] == target:
            return mid
        elif nums[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    return -1`
  ],
  javascript: [
    `/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
function solution(nums, target) {
    // 你的代码
    const map = new Map();
    for (let i = 0; i < nums.length; i++) {
        const complement = target - nums[i];
        if (map.has(complement)) {
            return [map.get(complement), i];
        }
        map.set(nums[i], i);
    }
    return [];
}

// 测试
console.log(solution([2, 7, 11, 15], 9));`,
    `function binarySearch(nums, target) {
    let left = 0, right = nums.length - 1;
    while (left <= right) {
        const mid = Math.floor((left + right) / 2);
        if (nums[mid] === target) return mid;
        if (nums[mid] < target) left = mid + 1;
        else right = mid - 1;
    }
    return -1;
}`,
    `class Solution {
    method(param) {
        // 你的代码
    }
}`
  ],
  typescript: [
    `/**
 * @param nums - 输入数组
 * @param target - 目标值
 * @returns 索引数组
 */
function solution(nums: number[], target: number): number[] {
    const map = new Map<number, number>();
    for (let i = 0; i < nums.length; i++) {
        const complement = target - nums[i];
        if (map.has(complement)) {
            return [map.get(complement)!, i];
        }
        map.set(nums[i], i);
    }
    return [];
}

// 测试
console.log(solution([2, 7, 11, 15], 9));`,
    `interface ListNode {
    val: number;
    next: ListNode | null;
}

function reverseList(head: ListNode | null): ListNode | null {
    let prev: ListNode | null = null;
    let curr = head;
    while (curr !== null) {
        const next = curr.next;
        curr.next = prev;
        prev = curr;
        curr = next;
    }
    return prev;
}`,
    `class Solution {
    method(param: string): number {
        // 你的代码
        return 0;
    }
}`
  ],
  java: [
    `class Solution {
    /**
     * 解题方法
     * @param nums 输入数组
     * @param target 目标值
     * @return 结果
     */
    public int[] solution(int[] nums, int target) {
        Map<Integer, Integer> map = new HashMap<>();
        for (int i = 0; i < nums.length; i++) {
            int complement = target - nums[i];
            if (map.containsKey(complement)) {
                return new int[] { map.get(complement), i };
            }
            map.put(nums[i], i);
        }
        return new int[] {};
    }
    
    public static void main(String[] args) {
        Solution sol = new Solution();
        int[] result = sol.solution(new int[]{2, 7, 11, 15}, 9);
        System.out.println(Arrays.toString(result));
    }
}`,
    `class ListNode {
    int val;
    ListNode next;
    ListNode(int x) { val = x; }
}

class Solution {
    public ListNode reverseList(ListNode head) {
        ListNode prev = null;
        ListNode curr = head;
        while (curr != null) {
            ListNode next = curr.next;
            curr.next = prev;
            prev = curr;
            curr = next;
        }
        return prev;
    }
}`,
    `class Solution {
    public int binarySearch(int[] nums, int target) {
        int left = 0, right = nums.length - 1;
        while (left <= right) {
            int mid = (left + right) / 2;
            if (nums[mid] == target) return mid;
            if (nums[mid] < target) left = mid + 1;
            else right = mid - 1;
        }
        return -1;
    }
}`
  ],
  cpp: [
    `#include <iostream>
#include <vector>
#include <unordered_map>
using namespace std;

class Solution {
public:
    /**
     * 两数之和
     * @param nums 输入数组
     * @param target 目标值
     * @return 索引数组
     */
    vector<int> twoSum(vector<int>& nums, int target) {
        unordered_map<int, int> map;
        for (int i = 0; i < nums.size(); i++) {
            int complement = target - nums[i];
            if (map.find(complement) != map.end()) {
                return {map[complement], i};
            }
            map[nums[i]] = i;
        }
        return {};
    }
};

int main() {
    Solution sol;
    vector<int> nums = {2, 7, 11, 15};
    vector<int> result = sol.twoSum(nums, 9);
    cout << "[" << result[0] << "," << result[1] << "]" << endl;
    return 0;
}`,
    `struct ListNode {
    int val;
    ListNode* next;
    ListNode(int x) : val(x), next(NULL) {}
};

class Solution {
public:
    ListNode* reverseList(ListNode* head) {
        ListNode* prev = NULL;
        ListNode* curr = head;
        while (curr != NULL) {
            ListNode* next = curr->next;
            curr->next = prev;
            prev = curr;
            curr = next;
        }
        return prev;
    }
};`,
    `#include <vector>
using namespace std;

class Solution {
public:
    int binarySearch(vector<int>& nums, int target) {
        int left = 0, right = nums.size() - 1;
        while (left <= right) {
            int mid = left + (right - left) / 2;
            if (nums[mid] == target) return mid;
            if (nums[mid] < target) left = mid + 1;
            else right = mid - 1;
        }
        return -1;
    }
};`
  ]
}

const languageLabels: Record<ProgrammingLanguage, string> = {
  python: 'Python',
  javascript: 'JavaScript',
  typescript: 'TypeScript',
  java: 'Java',
  cpp: 'C++'
}

const languageColors: Record<ProgrammingLanguage, string> = {
  python: 'from-blue-500 to-cyan-500',
  javascript: 'from-yellow-500 to-orange-500',
  typescript: 'from-blue-600 to-blue-800',
  java: 'from-red-500 to-orange-500',
  cpp: 'from-purple-500 to-pink-500'
}

export default function CodeEditor({ 
  code, 
  onChange, 
  language = 'python',
  readOnly = false,
  height = '400px',
  onRun,
  isRunning = false
}: CodeEditorProps) {
  const [isFocused, setIsFocused] = useState(false)
  const [showTemplateMenu, setShowTemplateMenu] = useState(false)
  const [copied, setCopied] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  // 获取当前语言的语法高亮名称
  const syntaxLanguage = useMemo(() => {
    const map: Record<ProgrammingLanguage, string> = {
      python: 'python',
      javascript: 'javascript',
      typescript: 'typescript',
      java: 'java',
      cpp: 'cpp'
    }
    return map[language]
  }, [language])

  // 获取文件扩展名
  const fileExtension = useMemo(() => {
    const map: Record<ProgrammingLanguage, string> = {
      python: '.py',
      javascript: '.js',
      typescript: '.ts',
      java: '.java',
      cpp: '.cpp'
    }
    return map[language]
  }, [language])

  // 获取可用模板
  const availableTemplates = useMemo(() => codeTemplates[language] || [], [language])

  // 滚动同步
  const handleScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    const highlight = e.currentTarget.previousElementSibling as HTMLElement
    if (highlight) {
      highlight.scrollTop = e.currentTarget.scrollTop
      highlight.scrollLeft = e.currentTarget.scrollLeft
    }
  }

  // 键盘事件处理
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault()
      const start = e.currentTarget.selectionStart
      const end = e.currentTarget.selectionEnd
      
      const value = code.substring(0, start) + '  ' + code.substring(end)
      onChange(value)
      
      requestAnimationFrame(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + 2
        }
      })
    }

    // Ctrl/Cmd + Enter 运行代码
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && onRun) {
      e.preventDefault()
      onRun()
    }
  }

  // 复制代码
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('复制失败:', err)
    }
  }

  // 重置代码
  const handleReset = () => {
    if (availableTemplates.length > 0) {
      onChange(availableTemplates[0])
    }
  }

  // 选择模板
  const handleSelectTemplate = (index: number) => {
    if (availableTemplates[index]) {
      onChange(availableTemplates[index])
    }
    setShowTemplateMenu(false)
  }

  // 点击外部关闭菜单
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowTemplateMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className={cn(
      'relative rounded-xl overflow-hidden border transition-all duration-300',
      isFocused ? 'border-cyan-500/50 shadow-lg shadow-cyan-500/10' : 'border-white/10',
      'bg-[#0d1117]'
    )}>
      {/* Editor Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-white/5 bg-[#161b22]">
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500/80" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
            <div className="w-3 h-3 rounded-full bg-green-500/80" />
          </div>
          <span className="text-xs text-gray-400 ml-2">{languageLabels[language]}{fileExtension}</span>
          
          {/* 模板选择器 */}
          {!readOnly && (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setShowTemplateMenu(!showTemplateMenu)}
                className="flex items-center gap-1 px-2 py-1 text-xs text-gray-400 hover:text-white hover:bg-white/10 rounded transition-colors"
              >
                <span>模板</span>
                <ChevronDown className="w-3 h-3" />
              </button>
              
              {showTemplateMenu && (
                <div className="absolute top-full left-0 mt-1 w-64 bg-[#161b22] border border-white/10 rounded-lg shadow-xl z-50 overflow-hidden">
                  <div className="px-3 py-2 text-xs text-gray-500 border-b border-white/5">
                    选择代码模板
                  </div>
                  {availableTemplates.map((template, index) => (
                    <button
                      key={index}
                      onClick={() => handleSelectTemplate(index)}
                      className="w-full px-3 py-2 text-left text-sm text-gray-300 hover:bg-white/10 transition-colors"
                    >
                      <div className="font-medium">{languageLabels[language]} 模板 {index + 1}</div>
                      <div className="text-xs text-gray-500 mt-0.5 line-clamp-1">
                        {template.split('\n')[3]?.replace(/\*/g, '').replace(/\//g, '').trim() || '标准模板'}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {isFocused && (
            <span className="text-xs text-green-400 animate-pulse">● Editing</span>
          )}
          
          {!readOnly && (
            <>
              <button
                onClick={handleCopy}
                className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded transition-colors"
                title="复制代码"
              >
                {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
              </button>
              
              <button
                onClick={handleReset}
                className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded transition-colors"
                title="重置代码"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              
              {onRun && (
                <button
                  onClick={onRun}
                  disabled={isRunning}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                    isRunning
                      ? 'bg-gray-600 cursor-not-allowed'
                      : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:shadow-lg hover:shadow-green-500/20 text-white'
                  )}
                >
                  <Play className="w-3.5 h-3.5" />
                  {isRunning ? '运行中...' : '运行'}
                </button>
              )}
            </>
          )}
        </div>
      </div>
      
      {/* Code Area */}
      <div className="relative" style={{ height: height === 'auto' ? 'auto' : height }}>
        <SyntaxHighlighter
          language={syntaxLanguage}
          style={vscDarkPlus}
          customStyle={{
            margin: 0,
            padding: '1rem',
            height: height === 'auto' ? 'auto' : '100%',
            overflow: height === 'auto' ? 'visible' : 'auto',
            fontSize: '14px',
            lineHeight: '1.6',
            background: 'transparent'
          }}
          showLineNumbers
          lineNumberStyle={{
            minWidth: '2.5rem',
            paddingRight: '1rem',
            textAlign: 'right',
            userSelect: 'none',
            color: '#6e7681'
          }}
          wrapLongLines={false}
        >
          {code || ' '}
        </SyntaxHighlighter>
        
        {!readOnly && height !== 'auto' && (
          <textarea
            ref={textareaRef}
            value={code}
            onChange={(e) => onChange(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onScroll={handleScroll}
            onKeyDown={handleKeyDown}
            spellCheck={false}
            className="absolute inset-0 w-full h-full p-4 bg-transparent text-transparent resize-none focus:outline-none font-mono text-sm leading-6 z-10"
            style={{
              caretColor: '#58a6ff',
              paddingLeft: '4rem',
              lineHeight: '1.6'
            }}
          />
        )}
      </div>
      
      {/* Footer */}
      {!readOnly && (
        <div className="px-4 py-2 border-t border-white/5 bg-[#161b22]">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center gap-4">
              <span>行 {code.split('\n').length}</span>
              <span>字符 {code.length}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={cn(
                'px-2 py-0.5 rounded text-xs font-medium bg-gradient-to-r',
                languageColors[language]
              )}>
                {languageLabels[language]}
              </span>
              <span className="text-gray-600">•</span>
              <span>Ctrl+Enter 运行</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
