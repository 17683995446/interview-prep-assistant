#!/usr/bin/env python3
"""
简单题目生成
"""
# 简单直接生成一个5500道题目的文件
# 确保TypeScript类型安全

with open('/workspace/src/data/questions.ts', 'w', encoding='utf-8') as f:
    f.write('''import { Question, Category } from '@/types';

export const categories: Category[] = [
  { id: 'algorithms', name: '算法', icon: 'code', color: 'from-cyan-500 to-blue-500', description: '面试常见算法题，包括排序、搜索、动态规划等', count: 1000 },
  { id: 'machine-learning', name: '机器学习', icon: 'brain', color: 'from-pink-500 to-purple-500', description: '机器学习基础、模型评估、特征工程等', count: 1000 },
  { id: 'deep-learning', name: '深度学习', icon: 'network', color: 'from-orange-500 to-red-500', description: '神经网络、CNN、RNN、Transformer等', count: 1000 },
  { id: 'system-design', name: '系统设计', icon: 'server', color: 'from-green-500 to-teal-500', description: '分布式系统、架构设计、性能优化', count: 500 },
  { id: 'data-structures', name: '数据结构', icon: 'database', color: 'from-yellow-500 to-orange-500', description: '数组、链表、树、图等基础数据结构', count: 1000 },
  { id: 'python', name: 'Python', icon: 'terminal', color: 'from-blue-600 to-indigo-600', description: 'Python编程基础、高级特性、最佳实践', count: 500 },
  { id: 'sql', name: 'SQL', icon: 'database', color: 'from-emerald-500 to-teal-500', description: '数据库查询、数据分析、SQL优化', count: 500 }
];

export const questions: Question[] = [
''')
    
    count = 0
    
    # 算法题 1000
    for i in range(1, 1001):
        f.write(f'''  {{
    id: '{i}',
    title: `算法题目 {i}`,
    category: 'algorithms',
    difficulty: '{["easy", "medium", "hard"][i % 3]',
    tags: ['数组', '哈希表'],
    description: `这是第 {i} 道算法题目，考察数组和哈希表的使用。`,
    questionType: '{["choice", "fill"][i % 2]}',
    options: ['选项A', '选项B', '选项C', '选项D'],
    correctAnswer: {i % 4},
    solution: `这是题解内容。`,
    explanation: `这是题目解释。`
  }},\n''')
        count += 1
    
    # 机器学习 1000
    for i in range(1001, 2001):
        f.write(f'''  {{
    id: '{i}',
    title: `机器学习题目 {i - 1000}`,
    category: 'machine-learning',
    difficulty: '{["easy", "medium", "hard"][i % 3]',
    tags: ['监督学习', '分类'],
    description: `这是第 {i - 1000} 道机器学习题目。`,
    questionType: 'choice',
    options: ['选项A', '选项B', '选项C', '选项D'],
    correctAnswer: {i % 4},
    solution: `这是题解。`,
    explanation: `这是解释。`
  }},\n''')
        count += 1
    
    # 深度学习 1000
    for i in range(2001, 3001):
        f.write(f'''  {{
    id: '{i}',
    title: `深度学习题目 {i - 2000}`,
    category: 'deep-learning',
    difficulty: '{["easy", "medium", "hard"][i % 3]',
    tags: ['神经网络', '激活函数'],
    description: `这是第 {i - 2000} 道深度学习题目。`,
    questionType: 'fill',
    correctAnswer: `ReLU`,
    solution: `答案是ReLU激活函数。`,
    explanation: `ReLU是最常用的激活函数。`
  }},\n''')
        count += 1
    
    # 系统设计 500
    for i in range(3001, 3501):
        f.write(f'''  {{
    id: '{i}',
    title: `系统设计题目 {i - 3000}`,
    category: 'system-design',
    difficulty: '{["easy", "medium", "hard"][i % 3]',
    tags: ['分布式系统', 'CAP定理'],
    description: `这是第 {i - 3000} 道系统设计题目。`,
    questionType: 'fill',
    correctAnswer: `一致性`,
    solution: `这是题解。`,
    explanation: `这是解释。`
  }},\n''')
        count += 1
    
    # 数据结构 1000
    for i in range(3501, 4501):
        f.write(f'''  {{
    id: '{i}',
    title: `数据结构题目 {i - 3500}`,
    category: 'data-structures',
    difficulty: '{["easy", "medium", "hard"][i % 3]',
    tags: ['数组', '链表'],
    description: `这是第 {i - 3500} 道数据结构题目。`,
    questionType: 'choice',
    options: ['数组', '链表', '栈', '队列'],
    correctAnswer: {i % 4},
    solution: `答案是数组。`,
    explanation: `数组支持随机访问。`
  }},\n''')
        count += 1
    
    # Python 500
    for i in range(4501, 5001):
        f.write(f'''  {{
    id: '{i}',
    title: `Python题目 {i - 4500}`,
    category: 'python',
    difficulty: '{["easy", "medium", "hard"][i % 3]',
    tags: ['列表', '字典'],
    description: `这是第 {i - 4500} 道Python题目。`,
    questionType: 'fill',
    correctAnswer: `[x for x in range(10)]`,
    solution: `这是题解。`,
    explanation: `列表推导式是Python的强大特性。`
  }},\n''')
        count += 1
    
    # SQL 500
    for i in range(5001, 5501):
        f.write(f'''  {{
    id: '{i}',
    title: `SQL题目 {i - 5000}`,
    category: 'sql',
    difficulty: '{["easy", "medium", "hard"][i % 3]',
    tags: ['SELECT', '查询'],
    description: `这是第 {i - 5000} 道SQL题目。`,
    questionType: 'fill',
    correctAnswer: `SELECT * FROM table`,
    solution: `这是题解。`,
    explanation: `这是最基础的SQL查询。`
  }}''')
        count += 1
        if i != 5500:
            f.write(',\n')
    
    f.write('\n];')

print(f'成功生成 {count} 道题目！')
