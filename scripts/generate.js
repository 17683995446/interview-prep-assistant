// 生成5500道题目的脚本
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 类别配置
const categories = [
  { id: 'algorithms', name: '算法', count: 1000 },
  { id: 'machine-learning', name: '机器学习', count: 1000 },
  { id: 'deep-learning', name: '深度学习', count: 1000 },
  { id: 'system-design', name: '系统设计', count: 500 },
  { id: 'data-structures', name: '数据结构', count: 1000 },
  { id: 'python', name: 'Python', count: 500 },
  { id: 'sql', name: 'SQL', count: 500 }
];

// 题目内容模板
const templates = {
  'algorithms': [
    { type: 'choice', title: '算法题目', tags: ['数组', '哈希表'], options: ['选项A', '选项B', '选项C', '选项D'] },
    { type: 'fill', title: '算法填空题', tags: ['动态规划', '排序'] }
  ],
  'machine-learning': [
    { type: 'choice', title: '机器学习题目', tags: ['监督学习', '分类'], options: ['选项A', '选项B', '选项C', '选项D'] },
    { type: 'fill', title: 'ML填空题', tags: ['特征工程', '模型评估'] }
  ],
  'deep-learning': [
    { type: 'fill', title: '深度学习题目', tags: ['神经网络', '激活函数'] },
    { type: 'choice', title: 'DL选择题', tags: ['CNN', 'RNN'], options: ['选项A', '选项B', '选项C', '选项D'] }
  ],
  'system-design': [
    { type: 'fill', title: '系统设计题目', tags: ['分布式系统', 'CAP定理'] }
  ],
  'data-structures': [
    { type: 'choice', title: '数据结构题目', tags: ['数组', '链表'], options: ['数组', '链表', '栈', '队列'] },
    { type: 'fill', title: 'DS填空题', tags: ['树', '图'] }
  ],
  'python': [
    { type: 'fill', title: 'Python题目', tags: ['列表', '字典'] },
    { type: 'choice', title: 'Python选择题', tags: ['语法', '装饰器'], options: ['选项A', '选项B', '选项C', '选项D'] }
  ],
  'sql': [
    { type: 'fill', title: 'SQL题目', tags: ['SELECT', '查询'] },
    { type: 'choice', title: 'SQL选择题', tags: ['JOIN', '索引'], options: ['选项A', '选项B', '选项C', '选项D'] }
  ]
};

let questionId = 1;
let questions = [];

const baseQuestion = {
  id: '1',
  title: '两数之和',
  category: 'algorithms',
  difficulty: 'easy',
  tags: ['数组', '哈希表'],
  description: '给定一个整数数组 nums 和一个整数目标值 target，请你在该数组中找出和为目标值 target 的那两个整数，并返回它们的数组下标。',
  questionType: 'coding',
  codeTemplate: `def twoSum(nums, target):\n    pass`,
  solution: `def twoSum(nums, target):\n    num_map = {}\n    for i, num in enumerate(nums):\n        complement = target - num\n        if complement in num_map:\n            return [num_map[complement], i]\n        num_map[num] = i\n    return []`,
  explanation: '使用哈希表存储已遍历的数字及其下标，时间复杂度O(n)。'
};

questions.push(baseQuestion);

// 生成题目
categories.forEach(cat => {
  for (let i = 0; i < cat.count; i++) {
    const template = templates[cat.id][i % templates[cat.id].length];
    const difficulty = ['easy', 'medium', 'hard'][i % 3];
    const question = {
      id: String(questionId + 1),
      title: `${cat.name}题目 ${i + 1}`,
      category: cat.id,
      difficulty: difficulty,
      tags: template.tags,
      description: `这是第 ${i + 1} 道${cat.name}题目，考察${template.tags.join('、')}的知识。`,
      questionType: template.type,
      solution: '这是题解内容。',
      explanation: '这是题目解释。'
    };
    
    if (template.type === 'choice') {
      question.options = template.options;
      question.correctAnswer = i % 4;
    } else if (template.type === 'fill') {
      question.correctAnswer = '这是正确答案';
    } else {
      question.codeTemplate = `def example(): pass`;
    }
    
    questions.push(question);
    questionId++;
  }
});

// 生成最终的TypeScript文件
let content = `import { Question, Category } from '@/types';

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
`;

// 添加题目
questions.forEach((q, idx) => {
  let parts = [];
  parts.push(`  id: '${q.id}'`);
  parts.push(`  title: \`${q.title}\``);
  parts.push(`  category: '${q.category}'`);
  parts.push(`  difficulty: '${q.difficulty}'`);
  parts.push(`  tags: ['${q.tags.join("', '")}']`);
  parts.push(`  description: \`${q.description}\``);
  parts.push(`  questionType: '${q.questionType}'`);
  
  if (q.options) {
    parts.push(`  options: ['${q.options.join("', '")}']`);
  }
  if (q.correctAnswer !== undefined) {
    if (typeof q.correctAnswer === 'number') {
      parts.push(`  correctAnswer: ${q.correctAnswer}`);
    } else {
      parts.push(`  correctAnswer: \`${q.correctAnswer}\``);
    }
  }
  if (q.codeTemplate) {
    parts.push(`  codeTemplate: \`${q.codeTemplate}\``);
  }
  parts.push(`  solution: \`${q.solution}\``);
  parts.push(`  explanation: \`${q.explanation}\``);
  
  content += `  {\n${parts.join(',\n')}\n  }${idx < questions.length - 1 ? ',' : ''}\n`;
});

content += `];`;

// 写入文件
fs.writeFileSync(path.join(__dirname, '../src/data/questions.ts'), content, 'utf-8');
console.log(`成功生成 ${questions.length} 道题目！`);
