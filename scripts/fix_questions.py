#!/usr/bin/env python3
"""
修复生成的题目文件
"""
import json
import re

# 读取原始生成的题目
with open('/workspace/src/data/questions_generated.json', 'r', encoding='utf-8') as f:
    generated_questions = json.load(f)

# 统计各类别题目数
def count_by_category(questions):
    counts = {
        'algorithms': 0,
        'machine-learning': 0,
        'deep-learning': 0,
        'system-design': 0,
        'data-structures': 0,
        'python': 0,
        'sql': 0
    }
    for q in questions:
        if q['category'] in counts:
            counts[q['category']] += 1
    return counts

generated_counts = count_by_category(generated_questions)

# 初始count
initial_counts = {
    'algorithms': 60,
    'machine-learning': 70,
    'deep-learning': 60,
    'system-design': 50,
    'data-structures': 50,
    'python': 55,
    'sql': 55
}

# 更新count
final_counts = {}
for key in initial_counts:
    final_counts[key] = initial_counts[key] + generated_counts.get(key, 0)

print(f"生成题目: {len(generated_questions)} 道")
print("\n各类别统计:")
for key in final_counts:
    print(f"{key}: {final_counts[key]} 道")

# 将生成的题目转换为TypeScript格式（正确处理数值类型）
def convert_to_ts(q):
    parts = []
    for key, value in q.items():
        if key in ['options', 'tags'] and isinstance(value, list):
            if value:
                value_str = "['" + "', '".join(value) + "']"
            else:
                value_str = '[]'
        elif isinstance(value, str):
            # 转义反引号
            value_str = f'`{value.replace("`", "\\`")}`'
        elif isinstance(value, bool):
            value_str = str(value).lower()
        elif value is None:
            continue  # 跳过None值
        else:
            # 数值保持原样
            value_str = str(value)
        parts.append(f'{key}: {value_str}')
    return '  { ' + ', '.join(parts) + ' }'

ts_questions = [convert_to_ts(q) for q in generated_questions]

# 重新生成整个文件，直接使用正确的方式
new_categories = f'''import {{ Question, Category }} from '@/types';

export const categories: Category[] = [
  {{ id: 'algorithms', name: '算法', icon: 'code', color: 'from-cyan-500 to-blue-500', description: '面试常见算法题，包括排序、搜索、动态规划等', count: {final_counts['algorithms']} }},
  {{ id: 'machine-learning', name: '机器学习', icon: 'brain', color: 'from-pink-500 to-purple-500', description: '机器学习基础、模型评估、特征工程等', count: {final_counts['machine-learning']} }},
  {{ id: 'deep-learning', name: '深度学习', icon: 'network', color: 'from-orange-500 to-red-500', description: '神经网络、CNN、RNN、Transformer等', count: {final_counts['deep-learning']} }},
  {{ id: 'system-design', name: '系统设计', icon: 'server', color: 'from-green-500 to-teal-500', description: '分布式系统、架构设计、性能优化', count: {final_counts['system-design']} }},
  {{ id: 'data-structures', name: '数据结构', icon: 'database', color: 'from-yellow-500 to-orange-500', description: '数组、链表、树、图等基础数据结构', count: {final_counts['data-structures']} }},
  {{ id: 'python', name: 'Python', icon: 'terminal', color: 'from-blue-600 to-indigo-600', description: 'Python编程基础、高级特性、最佳实践', count: {final_counts['python']} }},
  {{ id: 'sql', name: 'SQL', icon: 'database', color: 'from-emerald-500 to-teal-500', description: '数据库查询、数据分析、SQL优化', count: {final_counts['sql']} }}
];

export const questions: Question[] = [
'''

# 现在需要读取原始的题目（不含生成的）
with open('/workspace/src/data/questions.ts', 'r', encoding='utf-8') as f:
    raw_content = f.read()

# 提取原始题目的部分
# 找到第一个 { id: '1', 到 export const questions 结束前
start_idx = raw_content.find("  { id: '1'")
end_idx = raw_content.find("];", raw_content.find("export const questions"))

original_questions_part = raw_content[start_idx:end_idx].strip()
if original_questions_part.endswith(','):
    original_questions_part = original_questions_part[:-1].strip()

# 写入新文件
with open('/workspace/src/data/questions.ts', 'w', encoding='utf-8') as f:
    f.write(new_categories)
    f.write(original_questions_part)
    if len(original_questions_part) > 0 and not original_questions_part.endswith(','):
        f.write(',\n')
    f.write(',\n'.join(ts_questions))
    f.write('\n];\n')

print("\n修复完成！")
