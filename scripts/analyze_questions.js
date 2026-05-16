import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const questionsPath = path.join(__dirname, '../src/data/questions.ts');
const content = fs.readFileSync(questionsPath, 'utf-8');

const questionsMatch = content.match(/export const questions: Question\[\] = \[([\s\S]*?)\];/);

if (!questionsMatch) {
  console.error('无法解析questions数组');
  process.exit(1);
}

const questionsCode = '[' + questionsMatch[1] + ']';

const questions = eval(questionsCode);

console.log('='.repeat(60));
console.log('题库分析报告');
console.log('='.repeat(60));
console.log(`\n总题目数: ${questions.length}`);

const byCategory = {};
const byDifficulty = {};
const byQuestionType = {};
const byTag = {};
let hasSolution = 0;
let hasExplanation = 0;
let hasExamples = 0;
const duplicates = [];

questions.forEach((q, index) => {
  byCategory[q.category] = (byCategory[q.category] || 0) + 1;
  byDifficulty[q.difficulty] = (byDifficulty[q.difficulty] || 0) + 1;
  byQuestionType[q.questionType] = (byQuestionType[q.questionType] || 0) + 1;

  if (q.solution && q.solution.length > 10) hasSolution++;
  if (q.explanation && q.explanation.length > 20) hasExplanation++;
  if (q.testCases && q.testCases.length > 0) hasExamples++;

  if (q.tags) {
    q.tags.forEach(tag => {
      byTag[tag] = (byTag[tag] || 0) + 1;
    });
  }

  for (let i = index + 1; i < questions.length; i++) {
    const q2 = questions[i];
    if (q.description === q2.description && q.category === q2.category) {
      duplicates.push({
        q1: { id: q.id, title: q.title },
        q2: { id: q2.id, title: q2.title }
      });
    }
  }
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

console.log('\n按标签统计 (前20个):');
Object.entries(byTag)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 20)
  .forEach(([tag, count]) => {
    console.log(`  ${tag}: ${count} 题`);
  });

console.log('\n质量统计:');
console.log(`  有详细solution (长度>10): ${hasSolution} (${(hasSolution / questions.length * 100).toFixed(2)}%)`);
console.log(`  有详细explanation (长度>20): ${hasExplanation} (${(hasExplanation / questions.length * 100).toFixed(2)}%)`);
console.log(`  有testCases: ${hasExamples} (${(hasExamples / questions.length * 100).toFixed(2)}%)`);

console.log('\n重复题目:');
if (duplicates.length === 0) {
  console.log('  未发现完全重复的题目');
} else {
  console.log(`  发现 ${duplicates.length} 对重复题目:`);
  duplicates.slice(0, 10).forEach((dup, i) => {
    console.log(`    ${i + 1}. ${dup.q1.id} "${dup.q1.title}" <-> ${dup.q2.id} "${dup.q2.title}"`);
  });
  if (duplicates.length > 10) {
    console.log(`    ... 还有 ${duplicates.length - 10} 对`);
  }
}

const report = {
  total: questions.length,
  byCategory,
  byDifficulty,
  byQuestionType,
  byTag: Object.fromEntries(
    Object.entries(byTag)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 50)
  ),
  quality: {
    hasSolution: ((hasSolution / questions.length) * 100).toFixed(2),
    hasExplanation: ((hasExplanation / questions.length) * 100).toFixed(2),
    hasExamples: ((hasExamples / questions.length) * 100).toFixed(2)
  },
  duplicatesCount: duplicates.length,
  duplicates: duplicates.slice(0, 50)
};

fs.writeFileSync(
  path.join(__dirname, 'question_analysis_report.json'),
  JSON.stringify(report, null, 2),
  'utf-8'
);

console.log('\n' + '='.repeat(60));
console.log('详细报告已保存到: scripts/question_analysis_report.json');
console.log('='.repeat(60));

process.exit(0);
