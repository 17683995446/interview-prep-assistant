// 高质量题目生成脚本
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 高质量题目模板 - 每个分类的题目
const questionTemplates = {
  algorithms: [
    { title: '两数之和', type: 'coding', difficulty: 'easy', tags: ['数组', '哈希表'], description: '给定一个整数数组 nums 和一个整数目标值 target，请你在该数组中找出和为目标值 target 的那两个整数，并返回它们的数组下标。', codeTemplate: 'def twoSum(nums, target):\n    pass', solution: 'def twoSum(nums, target):\n    num_map = {}\n    for i, num in enumerate(nums):\n        complement = target - num\n        if complement in num_map:\n            return [num_map[complement], i)\n        num_map[num] = i\n    return []', explanation: '【记忆口诀：一边走一边找】就像在人群中找人，边走边记录见过的人' },
    { title: '时间复杂度O(1)', type: 'choice', difficulty: 'easy', tags: ['时间复杂度'], description: '算法执行时间与输入规模无关的复杂度是？', options: ['O(n)', 'O(n²)', 'O(log n)', 'O(1)'], correctAnswer: 3, solution: 'O(1)', explanation: '【记忆：不管你有多少】常数时间，无论输入多少，都一步到位！' },
    { title: '时间复杂度O(log n)', type: 'choice', difficulty: 'easy', tags: ['时间复杂度'], description: '二分查找的时间复杂度是？', options: ['O(n)', 'O(n²)', 'O(log n)', 'O(1)'], correctAnswer: 2, solution: 'O(log n)', explanation: '【记忆：对半砍】每次都把范围砍一半，像翻书找字' },
    { title: '冒泡排序', type: 'choice', difficulty: 'easy', tags: ['冒泡排序'], description: '冒泡排序的平均时间复杂度是？', options: ['O(n)', 'O(n log n)', 'O(n²)', 'O(2^n)'], correctAnswer: 2, solution: 'O(n²)', explanation: '【记忆：双重循环】双层嵌套，每个人都要跟其他人比个子' },
  ],
  'machine-learning': [
    { title: '机器学习类型', type: 'choice', difficulty: 'easy', tags: ['机器学习类型'], description: '机器学习主要类型不包括？', options: ['监督学习', '无监督学习', '强化学习', '自主学习'], correctAnswer: 3, solution: '自主学习', explanation: '【记忆：三类学习】有老师、自学、试错学！' },
    { title: '监督学习需要', type: 'choice', difficulty: 'easy', tags: ['监督学习'], description: '监督学习训练数据需要？', options: ['有标签', '无标签', '半标签', '无数据'], correctAnswer: 0, solution: '有标签', explanation: '【记忆：有老师】有标准答案！' },
    { title: '过拟合表现', type: 'choice', difficulty: 'easy', tags: ['过拟合'], description: '过拟合的表现是？', options: ['训练差测试好', '训练好测试差', '都差', '都好'], correctAnswer: 1, solution: '训练好测试差', explanation: '【记忆：死记硬背】只记住了题目，换个题就不会！' },
    { title: '逻辑回归用于', type: 'choice', difficulty: 'easy', tags: ['逻辑回归'], description: '逻辑回归通常用于什么任务？', options: ['回归', '分类', '聚类', '降维'], correctAnswer: 1, solution: '分类', explanation: '【记忆：分类二分类】虽然叫回归，但实际是分类算法！' },
  ],
  'deep-learning': [
    { title: '激活函数的作用', type: 'choice', difficulty: 'easy', tags: ['激活函数'], description: '激活函数的作用是引入？', options: ['线性', '非线性', '正则化', '优化'], correctAnswer: 1, solution: '非线性', explanation: '【记忆：激活神经元】让神经网络能学到复杂的模式！' },
    { title: 'ReLU公式', type: 'choice', difficulty: 'easy', tags: ['ReLU'], description: 'ReLU激活函数的公式是？', options: ['max(0, x)', 'sigmoid(x)', 'tanh(x)', 'softmax(x)'], correctAnswer: 0, solution: 'max(0, x)', explanation: '【记忆：负数变0】ReLU像开关，负数断开，正数原样通过！' },
    { title: 'Dropout作用', type: 'choice', difficulty: 'easy', tags: ['Dropout'], description: 'Dropout主要用于防止？', options: ['欠拟合', '过拟合', '梯度消失', '梯度爆炸'], correctAnswer: 1, solution: '过拟合', explanation: '【记忆：随机关闭】每次训练随机关闭一些神经元！' },
    { title: 'CNN主要处理', type: 'choice', difficulty: 'easy', tags: ['CNN'], description: '卷积神经网络CNN主要用于处理？', options: ['文本', '图像', '音频', '表格'], correctAnswer: 1, solution: '图像', explanation: '【记忆：眼睛看】卷积像眼睛看图片，找局部特征！' },
  ],
  'system-design': [
    { title: 'CAP中的C', type: 'choice', difficulty: 'easy', tags: ['CAP'], description: 'CAP中的C代表？', options: ['可用性', '一致性', '分区容错', '并发'], correctAnswer: 1, solution: '一致性', explanation: '【记忆：数据一致】所有节点数据一致！' },
    { title: 'CAP中的A', type: 'choice', difficulty: 'easy', tags: ['可用性'], description: 'CAP中的A代表？', options: ['一致性', '可用性', '分区容错', '并发'], correctAnswer: 1, solution: '可用性', explanation: '【记忆：服务可用】用户请求总能得到响应！' },
    { title: '缓存穿透', type: 'choice', difficulty: 'medium', tags: ['缓存穿透'], description: '缓存穿透是查询____的数据', options: ['缓存有', '数据库有', '不存在', '随机'], correctAnswer: 2, solution: '不存在', explanation: '【记忆：查不到】查不存在的数据，直接打到数据库！' },
    { title: 'Redis用途', type: 'choice', difficulty: 'easy', tags: ['Redis'], description: 'Redis主要用于？', options: ['持久化存储', '缓存', '关系型数据库', '备份'], correctAnswer: 1, solution: '缓存', explanation: '【记忆：内存快】Redis在内存中，读写极快！' },
  ],
  'data-structures': [
    { title: '数组的优点', type: 'choice', difficulty: 'easy', tags: ['数组'], description: '数组的主要优点是？', options: ['插入快', '随机访问快', '删除快', '内存灵活'], correctAnswer: 1, solution: '随机访问快', explanation: '【记忆：直接找】知道门牌号直接找到！' },
    { title: '链表优点', type: 'choice', difficulty: 'easy', tags: ['链表'], description: '链表的主要优点是？', options: ['随机访问快', '插入删除快', '内存连续', '缓存友好'], correctAnswer: 1, solution: '插入删除快', explanation: '【记忆：灵活】改指针就行，不用移位置！' },
    { title: '栈LIFO', type: 'choice', difficulty: 'easy', tags: ['栈'], description: '栈遵循什么操作原则？', options: ['FIFO', 'LIFO', '随机', '优先级'], correctAnswer: 1, solution: 'LIFO', explanation: '【记忆：叠盘子】最后放上去的，最先拿走！' },
    { title: '二叉搜索树', type: 'choice', difficulty: 'easy', tags: ['二叉搜索树'], description: '二叉搜索树的左子树都____根', options: ['大于', '小于', '等于', '无关'], correctAnswer: 1, solution: '小于', explanation: '【记忆：左小右大】左小右大，二分查找树！' },
  ],
  python: [
    { title: 'Python类型', type: 'choice', difficulty: 'easy', tags: ['Python类型'], description: 'Python是____类型语言', options: ['编译型', '解释型', '机器语言', '汇编'], correctAnswer: 1, solution: '解释型', explanation: '【记忆：边读边执行】不用编译，直接运行！' },
    { title: '列表和元组', type: 'choice', difficulty: 'easy', tags: ['列表', '元组'], description: '列表和元组的主要区别是？', options: ['元素类型', '可变性', '大小', '都不同'], correctAnswer: 1, solution: '可变性', explanation: '【记忆：可变列表】列表可变，元组不可变！' },
    { title: '字典键', type: 'choice', difficulty: 'easy', tags: ['字典'], description: '字典的键必须是？', options: ['可变', '不可变', '任意', '字符串'], correctAnswer: 1, solution: '不可变', explanation: '【记忆：键不变】字典键要能哈希，必须不可变！' },
    { title: 'Python缩进', type: 'choice', difficulty: 'easy', tags: ['Python缩进'], description: 'Python用____表示代码块', options: ['大括号', '缩进', '分号', '括号'], correctAnswer: 1, solution: '缩进', explanation: '【记忆：靠缩进】Python用缩进表示代码块！' },
  ],
  sql: [
    { title: 'SQL意思', type: 'choice', difficulty: 'easy', tags: ['SQL'], description: 'SQL的全称是？', options: ['结构化查询语言', '简单查询语言', '标准查询语言', '系统查询语言'], correctAnswer: 0, solution: '结构化查询语言', explanation: '【记忆：SQL=Structured Query Language】' },
    { title: 'SELECT用于', type: 'choice', difficulty: 'easy', tags: ['SELECT'], description: 'SELECT用于____', options: ['插入', '查询', '更新', '删除'], correctAnswer: 1, solution: '查询', explanation: '【记忆：选数据】SELECT选数据！' },
    { title: 'WHERE作用', type: 'choice', difficulty: 'easy', tags: ['WHERE'], description: 'WHERE用于____', options: ['分组', '过滤', '排序', '连接'], correctAnswer: 1, solution: '过滤', explanation: '【记忆：筛子】WHERE像筛子，过滤条件！' },
    { title: '主键', type: 'fill', difficulty: 'easy', tags: ['主键'], description: '主键必须____且非空', correctAnswer: '唯一', solution: '唯一', explanation: '【记忆：唯一标识】主键唯一标识一行！' },
  ],
};

console.log('开始生成...');

let allQuestions = [];
let id = 1;
const questionsPerCategory = 750; // 每个分类 750 道
const categoryNames = Object.keys(questionTemplates);

// 为每个分类生成足够数量的题目
for (const category of categoryNames) {
  const templates = questionTemplates[category];
  const templateCount = templates.length;
  
  console.log(`正在生成分类 ${category} 的题目...`);
  
  for (let i = 0; i < questionsPerCategory; i++) {
    const templateIndex = i % templateCount;
    const baseQ = templates[templateIndex];
    const variantNumber = Math.floor(i / templateCount) + 1;
    const difficultyLevel = i % 3 === 0 ? 'easy' : (i % 3 === 1 ? 'medium' : 'hard');
    
    const newQ = {
      id: String(id),
      title: i < templateCount ? baseQ.title : `${baseQ.title} (练习${variantNumber})`,
      category: category,
      difficulty: difficultyLevel,
      tags: baseQ.tags,
      description: baseQ.description,
      questionType: baseQ.type,
      solution: baseQ.solution,
      explanation: baseQ.explanation
    };
    
    if (baseQ.options) {
      newQ.options = baseQ.options;
      newQ.correctAnswer = baseQ.correctAnswer;
    }
    if (baseQ.codeTemplate) {
      newQ.codeTemplate = baseQ.codeTemplate;
    }
    if (baseQ.correctAnswer && baseQ.type === 'fill') {
      newQ.correctAnswer = baseQ.correctAnswer;
    }
    
    allQuestions.push(newQ);
    id++;
  }
}

console.log(`✅ 共生成 ${allQuestions.length} 道题目`);

const catCounts = {};
allQuestions.forEach(q => {
  catCounts[q.category] = (catCounts[q.category] || 0) + 1;
});

console.log('📊 分类统计:', catCounts);

const tsCode = `import { Question, Category } from '@/types';

export const categories: Category[] = [
  { id: 'algorithms', name: '算法', icon: 'code', color: 'from-cyan-500 to-blue-500', description: '面试常见算法题，包括排序、搜索、动态规划等', count: 750 },
  { id: 'machine-learning', name: '机器学习', icon: 'brain', color: 'from-pink-500 to-purple-500', description: '机器学习基础、模型评估、特征工程等', count: 750 },
  { id: 'deep-learning', name: '深度学习', icon: 'network', color: 'from-orange-500 to-red-500', description: '神经网络、CNN、RNN、Transformer等', count: 750 },
  { id: 'system-design', name: '系统设计', icon: 'server', color: 'from-green-500 to-teal-500', description: '分布式系统、架构设计、性能优化', count: 750 },
  { id: 'data-structures', name: '数据结构', icon: 'database', color: 'from-yellow-500 to-orange-500', description: '数组、链表、树、图等基础数据结构', count: 750 },
  { id: 'python', name: 'Python', icon: 'terminal', color: 'from-blue-600 to-indigo-600', description: 'Python编程基础、高级特性、最佳实践', count: 750 },
  { id: 'sql', name: 'SQL', icon: 'database', color: 'from-emerald-500 to-teal-500', description: '数据库查询、数据分析、SQL优化', count: 750 }
];

export const questions: Question[] = [
${allQuestions.map(q => {
  let str = `  {
    id: '${q.id}',
    title: '${q.title.replace(/'/g, "\\'")}',
    category: '${q.category}',
    difficulty: '${q.difficulty}',
    tags: [${q.tags.map(t => `'${t.replace(/'/g, "\\'")}'`).join(', ')}],
    description: '${q.description.replace(/'/g, "\\'")}',
    questionType: '${q.questionType}'`;
  
  if (q.options) {
    str += `,
    options: [${q.options.map(o => `'${o.replace(/'/g, "\\'")}'`).join(', ')}],
    correctAnswer: ${q.correctAnswer}`;
  }
  if (q.codeTemplate) {
    str += `,
    codeTemplate: '${q.codeTemplate.replace(/'/g, "\\'")}'`;
  }
  if (q.correctAnswer && q.questionType === 'fill') {
    str += `,
    correctAnswer: '${typeof q.correctAnswer}'`;
  }
  str += `,
    solution: '${q.solution.replace(/'/g, "\\'")}',
    explanation: '${q.explanation.replace(/'/g, "\\'")}'
  }`;
  return str;
}).join(',\n')}
];
`;

const outputPath = path.join(__dirname, '../src/data/questions.ts');
fs.writeFileSync(outputPath, tsCode, 'utf8');
console.log(`✅ 成功写入题目到 ${outputPath}`);
