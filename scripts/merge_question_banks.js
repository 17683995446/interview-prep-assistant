import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('='.repeat(60));
console.log('题库合并脚本 v2');
console.log('='.repeat(60));

const dedupPath = path.join(__dirname, 'deduplicated_questions.json');
const dedupQuestions = JSON.parse(fs.readFileSync(dedupPath, 'utf-8'));

const hqPath = path.join(__dirname, '../src/data/high_quality_questions.ts');
const hqContent = fs.readFileSync(hqPath, 'utf-8');

const hqMatch = hqContent.match(/export const highQualityQuestions: Question\[\] = \[([\s\S]*?)\];/);
const dsMatch = hqContent.match(/export const dataStructureQuestions: Question\[\] = \[([\s\S]*?)\];/);
const pyMatch = hqContent.match(/export const pythonQuestions: Question\[\] = \[([\s\S]*?)\];/);

let allHqQuestions = [];

if (hqMatch) {
  const hqCode = '[' + hqMatch[1] + ']';
  const hq = eval(hqCode);
  allHqQuestions = allHqQuestions.concat(hq);
}

if (dsMatch) {
  const dsCode = '[' + dsMatch[1] + ']';
  const ds = eval(dsCode);
  allHqQuestions = allHqQuestions.concat(ds);
}

if (pyMatch) {
  const pyCode = '[' + pyMatch[1] + ']';
  const py = eval(pyCode);
  allHqQuestions = allHqQuestions.concat(py);
}

console.log(`去重后题库: ${dedupQuestions.length} 题`);
console.log(`高质量原创题库: ${allHqQuestions.length} 题`);

const seenKeys = new Set();

function getQualityScore(q) {
  let score = 0;
  if (q.solution && q.solution.length > 20) score += 30;
  if (q.explanation && q.explanation.length > 50) score += 30;
  if (q.tags && q.tags.length > 0) score += 10;
  if (q.title && q.title.length > 5) score += 10;
  if (q.testCases && q.testCases.length > 0) score += 20;
  return score;
}

function mergeQuestions(dedup, hq) {
  const merged = [];

  for (const q of hq) {
    const key = `${q.category}|${q.description}`;
    if (!seenKeys.has(key)) {
      seenKeys.add(key);
      merged.push({...q});
    }
  }

  for (const q of dedup) {
    const key = `${q.category}|${q.description}`;
    if (!seenKeys.has(key)) {
      seenKeys.add(key);
      merged.push({...q});
    } else {
      const existing = merged.find(m => `${m.category}|${m.description}` === key);
      if (existing && getQualityScore(q) > getQualityScore(existing)) {
        const index = merged.indexOf(existing);
        merged[index] = {...q};
      }
    }
  }

  return merged;
}

const finalQuestions = mergeQuestions(dedupQuestions, allHqQuestions);

console.log(`\n合并后总题数: ${finalQuestions.length} 题`);

finalQuestions.forEach((q, i) => {
  q.id = (i + 1).toString();
});

const byCategory = {};
const byDifficulty = {};
const byQuestionType = {};

finalQuestions.forEach(q => {
  byCategory[q.category] = (byCategory[q.category] || 0) + 1;
  byDifficulty[q.difficulty] = (byDifficulty[q.difficulty] || 0) + 1;
  byQuestionType[q.questionType] = (byQuestionType[q.questionType] || 0) + 1;
});

console.log('\n按分类统计:');
Object.keys(byCategory).sort().forEach(cat => {
  console.log(`  ${cat}: ${byCategory[cat]} 题`);
});

console.log('\n按难度统计:');
Object.keys(byDifficulty).sort().forEach(diff => {
  console.log(`  ${diff}: ${byDifficulty[diff]} 题`);
});

console.log('\n按题型统计:');
Object.keys(byQuestionType).sort().forEach(type => {
  console.log(`  ${type}: ${byQuestionType[type]} 题`);
});

const qualityStats = {
  hasDetailedSolution: 0,
  hasDetailedExplanation: 0,
  hasTestCases: 0,
  total: finalQuestions.length
};

finalQuestions.forEach(q => {
  if (q.solution && q.solution.length > 20) qualityStats.hasDetailedSolution++;
  if (q.explanation && q.explanation.length > 50) qualityStats.hasDetailedExplanation++;
  if (q.testCases && q.testCases.length > 0) qualityStats.hasTestCases++;
});

console.log('\n质量统计:');
console.log(`  有详细solution (长度>20): ${qualityStats.hasDetailedSolution} (${(qualityStats.hasDetailedSolution / qualityStats.total * 100).toFixed(2)}%)`);
console.log(`  有详细explanation (长度>50): ${qualityStats.hasDetailedExplanation} (${(qualityStats.hasDetailedExplanation / qualityStats.total * 100).toFixed(2)}%)`);
console.log(`  有testCases: ${qualityStats.hasTestCases} (${(qualityStats.hasTestCases / qualityStats.total * 100).toFixed(2)}%)`);

const report = {
  totalQuestions: finalQuestions.length,
  byCategory,
  byDifficulty,
  byQuestionType,
  quality: {
    detailedSolution: `${((qualityStats.hasDetailedSolution / qualityStats.total) * 100).toFixed(2)}%`,
    detailedExplanation: `${((qualityStats.hasDetailedExplanation / qualityStats.total) * 100).toFixed(2)}%`,
    hasTestCases: `${((qualityStats.hasTestCases / qualityStats.total) * 100).toFixed(2)}%`
  },
  recommendations: []
};

if (finalQuestions.length < 3000) {
  report.recommendations.push(`题库不足，建议补充 ${3000 - finalQuestions.length} 题`);
}

fs.writeFileSync(
  path.join(__dirname, 'final_question_bank.json'),
  JSON.stringify(finalQuestions, null, 2),
  'utf-8'
);

fs.writeFileSync(
  path.join(__dirname, 'merge_report.json'),
  JSON.stringify(report, null, 2),
  'utf-8'
);

const questionsTS = `import { Question, Category } from '@/types';

export const categories: Category[] = [
  { id: 'algorithms', name: '算法', icon: 'code', color: 'from-cyan-500 to-blue-500', description: '面试常见算法题，包括排序、搜索、动态规划等', count: ${byCategory['algorithms'] || 0} },
  { id: 'machine-learning', name: '机器学习', icon: 'brain', color: 'from-pink-500 to-purple-500', description: '机器学习基础、模型评估、特征工程等', count: ${byCategory['machine-learning'] || 0} },
  { id: 'deep-learning', name: '深度学习', icon: 'network', color: 'from-orange-500 to-red-500', description: '神经网络、CNN、RNN、Transformer等', count: ${byCategory['deep-learning'] || 0} },
  { id: 'system-design', name: '系统设计', icon: 'server', color: 'from-green-500 to-teal-500', description: '分布式系统、架构设计、性能优化', count: ${byCategory['system-design'] || 0} },
  { id: 'data-structures', name: '数据结构', icon: 'database', color: 'from-yellow-500 to-orange-500', description: '数组、链表、树、图等基础数据结构', count: ${byCategory['data-structures'] || 0} },
  { id: 'python', name: 'Python', icon: 'terminal', color: 'from-blue-600 to-indigo-600', description: 'Python编程基础、高级特性、最佳实践', count: ${byCategory['python'] || 0} },
  { id: 'sql', name: 'SQL', icon: 'database', color: 'from-emerald-500 to-teal-500', description: '数据库查询、数据分析、SQL优化', count: ${byCategory['sql'] || 0} }
];

export const questions: Question[] = ${JSON.stringify(finalQuestions, null, 2)};

export default questions;
`;

fs.writeFileSync(
  path.join(__dirname, '../src/data/questions.ts'),
  questionsTS,
  'utf-8'
);

console.log('\n' + '='.repeat(60));
console.log('合并完成!');
console.log(`最终题库: ${finalQuestions.length} 题`);
console.log('报告已保存到: scripts/merge_report.json');
console.log('最终题库已保存到: scripts/final_question_bank.json');
console.log('已更新: src/data/questions.ts');
console.log('='.repeat(60));

process.exit(0);
