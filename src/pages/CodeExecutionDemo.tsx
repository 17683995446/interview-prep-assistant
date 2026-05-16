import { useState, useCallback } from 'react';
import CodeExecutionManager from '@/components/CodeExecutionManager';
import { ProgrammingLanguage } from '@/services/codeRunner';
import { Code2, Play, BookOpen, Zap, Trophy, Settings, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Problem {
  id: string;
  title: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  description: string;
  templates: Record<ProgrammingLanguage, string>;
  testCases: Array<{ input: string; expected: string; description: string }>;
}

const problems: Problem[] = [
  {
    id: 'two-sum',
    title: '两数之和',
    difficulty: 'easy',
    category: '数组',
    description: '给定一个整数数组 nums 和一个整数目标值 target，请你在该数组中找出和为目标值 target 的那两个整数，并返回它们的数组下标。',
    templates: {
      python: `def solution(nums, target):
    """
    解题函数
    参数:
        nums: List[int] - 输入数组
        target: int - 目标值
    返回:
        List[int] - 两个数的索引
    """
    hash_map = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in hash_map:
            return [hash_map[complement], i]
        hash_map[num] = i
    return []

# 测试用例
if __name__ == "__main__":
    result = solution([2, 7, 11, 15], 9)
    print(result)`,
      javascript: `/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
function solution(nums, target) {
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
console.log(JSON.stringify(solution([2, 7, 11, 15], 9)));`,
      typescript: `/**
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
console.log(JSON.stringify(solution([2, 7, 11, 15], 9)));`,
      java: `class Solution {
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
        String result = Arrays.toString(sol.solution(new int[]{2, 7, 11, 15}, 9));
        System.out.println(result);
    }
}`,
      cpp: `#include <iostream>
#include <vector>
#include <unordered_map>
using namespace std;

class Solution {
public:
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
}`
    },
    testCases: [
      { input: '[2, 7, 11, 15], 9', expected: '[0, 1]', description: '基础测试' },
      { input: '[3, 2, 4], 6', expected: '[1, 2]', description: '中间元素' },
      { input: '[3, 3], 6', expected: '[0, 1]', description: '重复元素' }
    ]
  },
  {
    id: 'reverse-string',
    title: '反转字符串',
    difficulty: 'easy',
    category: '字符串',
    description: '编写一个函数，其作用是将输入的字符串反转过来。输入字符串以字符数组 char[] 的形式给出。',
    templates: {
      python: `def solution(s):
    """
    反转字符串
    """
    return s[::-1]

# 测试
print(solution("hello"))`,
      javascript: `function solution(s) {
    return s.split('').reverse().join('');
}

// 测试
console.log(solution("hello"));`,
      typescript: `function solution(s: string): string {
    return s.split('').reverse().join('');
}

// 测试
console.log(solution("hello"));`,
      java: `class Solution {
    public String solution(String s) {
        return new StringBuilder(s).reverse().toString();
    }
    
    public static void main(String[] args) {
        Solution sol = new Solution();
        System.out.println(sol.solution("hello"));
    }
}`,
      cpp: `#include <iostream>
#include <string>
#include <algorithm>
using namespace std;

class Solution {
public:
    string solution(string s) {
        reverse(s.begin(), s.end());
        return s;
    }
};

int main() {
    Solution sol;
    cout << sol.solution("hello") << endl;
    return 0;
}`
    },
    testCases: [
      { input: '"hello"', expected: '"olleh"', description: '基础测试' },
      { input: '"world"', expected: '"dlrow"', description: '元音测试' },
      { input: '"a"', expected: '"a"', description: '单字符' }
    ]
  },
  {
    id: 'binary-search',
    title: '二分查找',
    difficulty: 'easy',
    category: '查找',
    description: '给定一个 n 个元素有序的（升序）整型数组 nums 和一个目标值 target，写一个函数搜索 nums 中的 target，如果目标值存在返回下标，否则返回 -1。',
    templates: {
      python: `def solution(nums, target):
    """
    二分查找
    """
    left, right = 0, len(nums) - 1
    while left <= right:
        mid = (left + right) // 2
        if nums[mid] == target:
            return mid
        elif nums[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    return -1

# 测试
print(solution([1, 3, 5, 7, 9], 5))`,
      javascript: `function solution(nums, target) {
    let left = 0, right = nums.length - 1;
    while (left <= right) {
        const mid = Math.floor((left + right) / 2);
        if (nums[mid] === target) return mid;
        if (nums[mid] < target) left = mid + 1;
        else right = mid - 1;
    }
    return -1;
}

// 测试
console.log(solution([1, 3, 5, 7, 9], 5));`,
      typescript: `function solution(nums: number[], target: number): number {
    let left = 0, right = nums.length - 1;
    while (left <= right) {
        const mid = Math.floor((left + right) / 2);
        if (nums[mid] === target) return mid;
        if (nums[mid] < target) left = mid + 1;
        else right = mid - 1;
    }
    return -1;
}

// 测试
console.log(solution([1, 3, 5, 7, 9], 5));`,
      java: `class Solution {
    public int solution(int[] nums, int target) {
        int left = 0, right = nums.length - 1;
        while (left <= right) {
            int mid = left + (right - left) / 2;
            if (nums[mid] == target) return mid;
            if (nums[mid] < target) left = mid + 1;
            else right = mid - 1;
        }
        return -1;
    }
    
    public static void main(String[] args) {
        Solution sol = new Solution();
        System.out.println(sol.solution(new int[]{1, 3, 5, 7, 9}, 5));
    }
}`,
      cpp: `#include <iostream>
#include <vector>
using namespace std;

class Solution {
public:
    int solution(vector<int>& nums, int target) {
        int left = 0, right = nums.size() - 1;
        while (left <= right) {
            int mid = left + (right - left) / 2;
            if (nums[mid] == target) return mid;
            if (nums[mid] < target) left = mid + 1;
            else right = mid - 1;
        }
        return -1;
    }
};

int main() {
    Solution sol;
    vector<int> nums = {1, 3, 5, 7, 9};
    cout << sol.solution(nums, 5) << endl;
    return 0;
}`
    },
    testCases: [
      { input: '[1, 3, 5, 7, 9], 5', expected: '2', description: '存在元素' },
      { input: '[1, 3, 5, 7, 9], 6', expected: '-1', description: '不存在' },
      { input: '[1], 1', expected: '0', description: '单元素' }
    ]
  }
];

const languageLabels: Record<ProgrammingLanguage, string> = {
  python: 'Python',
  javascript: 'JavaScript',
  typescript: 'TypeScript',
  java: 'Java',
  cpp: 'C++'
};

const difficultyColors = {
  easy: 'text-green-400 bg-green-500/10',
  medium: 'text-yellow-400 bg-yellow-500/10',
  hard: 'text-red-400 bg-red-500/10'
};

export default function CodeExecutionDemo() {
  const [selectedProblem, setSelectedProblem] = useState<Problem>(problems[0]);
  const [selectedLanguage, setSelectedLanguage] = useState<ProgrammingLanguage>('python');
  const [code, setCode] = useState(selectedProblem.templates.python);
  const [showProblemList, setShowProblemList] = useState(true);

  const handleProblemChange = useCallback((problem: Problem) => {
    setSelectedProblem(problem);
    setCode(problem.templates[selectedLanguage]);
  }, [selectedLanguage]);

  const handleLanguageChange = useCallback((language: ProgrammingLanguage) => {
    setSelectedLanguage(language);
    setCode(selectedProblem.templates[language]);
  }, [selectedProblem]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Header */}
      <div className="border-b border-white/10 bg-black/20 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg">
                <Code2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">代码评测沙箱</h1>
                <p className="text-xs text-gray-400">在线代码执行与测试</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-lg">
                <Zap className="w-4 h-4 text-yellow-400" />
                <span className="text-sm text-gray-300">Piston API</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-lg">
                <Trophy className="w-4 h-4 text-purple-400" />
                <span className="text-sm text-gray-300">支持 5 种语言</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar - Problem List */}
          <div className={cn(
            'lg:col-span-1 space-y-4',
            !showProblemList && 'hidden lg:block'
          )}>
            <div className="bg-[#161b22] rounded-xl border border-white/10 p-4">
              <div className="flex items-center gap-2 mb-4">
                <BookOpen className="w-5 h-5 text-cyan-400" />
                <h2 className="text-lg font-semibold text-white">题目列表</h2>
              </div>

              <div className="space-y-2">
                {problems.map((problem) => (
                  <button
                    key={problem.id}
                    onClick={() => handleProblemChange(problem)}
                    className={cn(
                      'w-full text-left p-3 rounded-lg border transition-all',
                      selectedProblem.id === problem.id
                        ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400'
                        : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10'
                    )}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium">{problem.title}</span>
                      <ChevronRight className="w-4 h-4" />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        'px-2 py-0.5 text-xs font-medium rounded',
                        difficultyColors[problem.difficulty]
                      )}>
                        {problem.difficulty === 'easy' && '简单'}
                        {problem.difficulty === 'medium' && '中等'}
                        {problem.difficulty === 'hard' && '困难'}
                      </span>
                      <span className="text-xs text-gray-500">{problem.category}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Features */}
            <div className="bg-[#161b22] rounded-xl border border-white/10 p-4">
              <div className="flex items-center gap-2 mb-4">
                <Settings className="w-5 h-5 text-purple-400" />
                <h2 className="text-lg font-semibold text-white">功能特性</h2>
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-green-500/10 rounded-lg">
                    <Play className="w-4 h-4 text-green-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-white">实时执行</h3>
                    <p className="text-xs text-gray-400 mt-0.5">支持 5 种编程语言</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-500/10 rounded-lg">
                    <Zap className="w-4 h-4 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-white">性能统计</h3>
                    <p className="text-xs text-gray-400 mt-0.5">执行时间与内存监控</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 bg-purple-500/10 rounded-lg">
                    <Trophy className="w-4 h-4 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-white">测试用例</h3>
                    <p className="text-xs text-gray-400 mt-0.5">多测试用例验证</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Area */}
          <div className="lg:col-span-3 space-y-6">
            {/* Problem Description */}
            <div className="bg-[#161b22] rounded-xl border border-white/10 p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold text-white mb-2">
                    {selectedProblem.title}
                  </h2>
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      'px-2 py-1 text-xs font-medium rounded',
                      difficultyColors[selectedProblem.difficulty]
                    )}>
                      {selectedProblem.difficulty === 'easy' && '简单'}
                      {selectedProblem.difficulty === 'medium' && '中等'}
                      {selectedProblem.difficulty === 'hard' && '困难'}
                    </span>
                    <span className="px-2 py-1 text-xs font-medium bg-white/10 text-gray-300 rounded">
                      {selectedProblem.category}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setShowProblemList(!showProblemList)}
                  className="lg:hidden px-3 py-2 text-sm text-gray-300 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                >
                  {showProblemList ? '隐藏题目' : '显示题目'}
                </button>
              </div>

              <p className="text-gray-300 leading-relaxed">
                {selectedProblem.description}
              </p>

              {/* Test Cases Preview */}
              <div className="mt-4 pt-4 border-t border-white/10">
                <h3 className="text-sm font-medium text-white mb-3">测试用例</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {selectedProblem.testCases.map((tc, index) => (
                    <div
                      key={index}
                      className="p-3 bg-white/5 rounded-lg border border-white/10"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-gray-400">
                          测试 #{index + 1}
                        </span>
                        <span className="text-xs text-gray-500">{tc.description}</span>
                      </div>
                      <div className="space-y-1 text-xs">
                        <div>
                          <span className="text-gray-500">输入: </span>
                          <span className="text-gray-300 font-mono">{tc.input}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">期望: </span>
                          <span className="text-green-400 font-mono">{tc.expected}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Language Selector */}
            <div className="bg-[#161b22] rounded-xl border border-white/10 p-4">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-gray-300">选择语言:</span>
                <div className="flex items-center gap-2">
                  {(['python', 'javascript', 'typescript', 'java', 'cpp'] as ProgrammingLanguage[]).map((lang) => (
                    <button
                      key={lang}
                      onClick={() => handleLanguageChange(lang)}
                      className={cn(
                        'px-4 py-2 text-sm font-medium rounded-lg transition-all',
                        selectedLanguage === lang
                          ? 'bg-gradient-to-r border border-white/20 text-white shadow-lg'
                          : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                      )}
                      style={selectedLanguage === lang ? {
                        backgroundImage: `linear-gradient(to right, var(--tw-gradient-stops))`,
                        background: 'linear-gradient(to right, rgb(59, 130, 246), rgb(6, 182, 212))'
                      } : {}}
                    >
                      {languageLabels[lang]}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Code Execution Manager */}
            <CodeExecutionManager
              initialCode={code}
              initialLanguage={selectedLanguage}
              testCases={selectedProblem.testCases.map((tc, index) => ({
                id: String(index + 1),
                input: tc.input,
                expected: tc.expected,
                description: tc.description
              }))}
              onCodeChange={setCode}
              onLanguageChange={handleLanguageChange}
              showEditor={true}
              showResult={true}
              height="500px"
            />

            {/* Usage Tips */}
            <div className="bg-[#161b22] rounded-xl border border-white/10 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">使用说明</h3>
              
              <div className="space-y-4 text-sm text-gray-300">
                <div>
                  <h4 className="font-medium text-white mb-2">🎯 运行代码</h4>
                  <p>点击运行按钮或使用快捷键 <code className="px-2 py-1 bg-white/10 rounded text-cyan-400">Ctrl + Enter</code> 来执行代码。</p>
                </div>

                <div>
                  <h4 className="font-medium text-white mb-2">📝 支持的语言</h4>
                  <p>Python、JavaScript、TypeScript、Java、C++</p>
                </div>

                <div>
                  <h4 className="font-medium text-white mb-2">⏱️ 执行限制</h4>
                  <p>每个代码执行任务的最大超时时间为 5 秒，内存限制为 256MB。</p>
                </div>

                <div>
                  <h4 className="font-medium text-white mb-2">🧪 测试用例</h4>
                  <p>系统会自动运行预设的测试用例，并显示每个用例的通过/失败状态。</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
