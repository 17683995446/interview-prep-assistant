import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('开始题库去重...\n');

const jsonPath = path.join(__dirname, '../src/data/questions_generated.json');
const jsonQuestions = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

const tsPath = path.join(__dirname, '../src/data/questions.ts');
const tsContent = fs.readFileSync(tsPath, 'utf-8');
const questionsMatch = tsContent.match(/export const questions: Question\[\] = \[([\s\S]*?)\];/);

let tsQuestions = [];
if (questionsMatch) {
  const questionsCode = '[' + questionsMatch[1] + ']';
  tsQuestions = eval(questionsCode);
}

console.log(`原始JSON题库: ${jsonQuestions.length} 题`);
console.log(`原始TS题库: ${tsQuestions.length} 题`);

const seen = new Map();
const duplicates = [];

function normalizeQuestion(q) {
  return {
    description: q.description.trim(),
    category: q.category,
    title: q.title?.trim() || '',
    options: q.options ? [...q.options].sort().join('|') : '',
    correctAnswer: q.correctAnswer?.toString() || ''
  };
}

function similarity(q1, q2) {
  const n1 = normalizeQuestion(q1);
  const n2 = normalizeQuestion(q2);
  
  if (n1.description === n2.description && n1.category === n2.category) {
    return 1.0;
  }
  
  const desc1 = n1.description.toLowerCase();
  const desc2 = n2.description.toLowerCase();
  
  let matches = 0;
  let total = Math.max(desc1.length, desc2.length);
  
  for (let i = 0; i < Math.min(desc1.length, desc2.length); i++) {
    if (desc1[i] === desc2[i]) matches++;
  }
  
  return matches / total;
}

function deduplicateByExactMatch(questions) {
  const seen = new Map();
  const unique = [];
  const duplicates = [];

  for (const q of questions) {
    const key = `${q.category}|${q.description}|${q.correctAnswer}`;
    
    if (seen.has(key)) {
      const existing = seen.get(key);
      if (qualityScore(q) > qualityScore(existing)) {
        duplicates.push({ original: existing, replacement: q, reason: 'higher quality' });
        unique[unique.indexOf(existing)] = q;
        seen.set(key, q);
      } else {
        duplicates.push({ original: q, reason: 'duplicate' });
      }
    } else {
      seen.set(key, q);
      unique.push(q);
    }
  }

  return { unique, duplicates };
}

function qualityScore(q) {
  let score = 0;
  
  if (q.solution && q.solution.length > 10) score += 30;
  if (q.explanation && q.explanation.length > 30) score += 30;
  if (q.tags && q.tags.length > 0) score += 10;
  if (q.title && q.title.length > 5) score += 10;
  if (q.testCases && q.testCases.length > 0) score += 20;
  
  return score;
}

const { unique: uniqueFromJson, duplicates: jsonDuplicates } = deduplicateByExactMatch(jsonQuestions);

console.log(`\nJSON去重后: ${uniqueFromJson.length} 题 (移除 ${jsonDuplicates.length} 题)`);

const combined = [...uniqueFromJson];
const existingIds = new Set(uniqueFromJson.map(q => q.id));

tsQuestions.forEach(q => {
  if (!existingIds.has(q.id)) {
    combined.push(q);
  }
});

console.log(`合并后总数: ${combined.length} 题`);

const { unique: finalUnique, duplicates: finalDuplicates } = deduplicateByExactMatch(combined);

console.log(`\n最终去重后: ${finalUnique.length} 题 (移除 ${finalDuplicates.length} 题)`);

finalUnique.forEach((q, i) => {
  q.id = (i + 1).toString();
});

const report = {
  original: {
    json: jsonQuestions.length,
    typescript: tsQuestions.length,
    total: jsonQuestions.length + tsQuestions.length
  },
  afterDedup: {
    jsonOnly: uniqueFromJson.length,
    combined: combined.length,
    final: finalUnique.length
  },
  removed: {
    duplicates: finalDuplicates.length,
    lowQuality: 0
  },
  byCategory: {},
  byDifficulty: {},
  byQuestionType: {}
};

finalUnique.forEach(q => {
  report.byCategory[q.category] = (report.byCategory[q.category] || 0) + 1;
  report.byDifficulty[q.difficulty] = (report.byDifficulty[q.difficulty] || 0) + 1;
  report.byQuestionType[q.questionType] = (report.byQuestionType[q.questionType] || 0) + 1;
});

const qualityStats = {
  hasDetailedSolution: 0,
  hasDetailedExplanation: 0,
  hasTestCases: 0,
  total: finalUnique.length
};

finalUnique.forEach(q => {
  if (q.solution && q.solution.length > 20) qualityStats.hasDetailedSolution++;
  if (q.explanation && q.explanation.length > 50) qualityStats.hasDetailedExplanation++;
  if (q.testCases && q.testCases.length > 0) qualityStats.hasTestCases++;
});

report.quality = {
  detailedSolution: `${((qualityStats.hasDetailedSolution / qualityStats.total) * 100).toFixed(2)}%`,
  detailedExplanation: `${((qualityStats.hasDetailedExplanation / qualityStats.total) * 100).toFixed(2)}%`,
  hasTestCases: `${((qualityStats.hasTestCases / qualityStats.total) * 100).toFixed(2)}%`
};

report.recommendations = [];
if (finalUnique.length < 3000) {
  report.recommendations.push(`题库不足，建议补充 ${3000 - finalUnique.length} 题`);
}
if (qualityStats.hasTestCases === 0) {
  report.recommendations.push('建议为编程题添加测试用例');
}
if (qualityStats.hasDetailedSolution < qualityStats.total * 0.7) {
  report.recommendations.push('建议提升solution的详细程度');
}

console.log('\n去重报告:');
console.log(JSON.stringify(report, null, 2));

fs.writeFileSync(
  path.join(__dirname, 'deduplication_report.json'),
  JSON.stringify(report, null, 2),
  'utf-8'
);

fs.writeFileSync(
  path.join(__dirname, 'deduplicated_questions.json'),
  JSON.stringify(finalUnique, null, 2),
  'utf-8'
);

console.log('\n' + '='.repeat(60));
console.log('去重完成!');
console.log(`最终题库: ${finalUnique.length} 题`);
console.log('报告已保存到: scripts/deduplication_report.json');
console.log('去重后题库已保存到: scripts/deduplicated_questions.json');
console.log('='.repeat(60));

process.exit(0);
