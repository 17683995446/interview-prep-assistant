import { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { Trophy, Target, TrendingUp, AlertTriangle, BookOpen, Zap } from 'lucide-react';
import { useAppStore } from '@/store';
import { Question } from '@/types';

// 图表颜色
const COLORS = ['#06b6d4', '#ec4899', '#a855f7', '#10b981', '#f59e0b', '#ef4444'];

// 格式化时间
const formatTime = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) {
    return `${hours}小时${minutes}分钟`;
  }
  return `${minutes}分钟`;
};

// 自定义Tooltip
interface TooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-900 border border-gray-700 rounded-lg p-3 shadow-xl">
        <p className="text-gray-300 text-sm mb-2">{label}</p>
        {payload.map((entry, index: number) => (
          <p key={index} style={{ color: entry.color }} className="text-sm">
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// 学习进度折线图组件
const ProgressLineChart = () => {
  const { getDailyRecords } = useAppStore();
  const records = getDailyRecords();

  const chartData = useMemo(() => {
    // 获取最近30天的数据
    const last30Days = [...records].slice(-30);
    return last30Days.map(record => ({
      date: record.date.slice(5), // 只显示月-日
      完成题目: record.questionsCompleted,
      学习时长: Math.round(record.timeSpent / 60), // 转换为分钟
      准确率: Math.round(record.accuracy * 100)
    }));
  }, [records]);

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        暂无学习数据，开始学习后将显示进度图表
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
        <XAxis dataKey="date" stroke="#9ca3af" />
        <YAxis stroke="#9ca3af" />
        <Tooltip content={<CustomTooltip />} />
        <Legend wrapperStyle={{ color: '#9ca3af' }} />
        <Line type="monotone" dataKey="完成题目" stroke="#06b6d4" strokeWidth={2} dot={{ fill: '#06b6d4' }} />
        <Line type="monotone" dataKey="学习时长" stroke="#ec4899" strokeWidth={2} dot={{ fill: '#ec4899' }} />
        <Line type="monotone" dataKey="准确率" stroke="#10b981" strokeWidth={2} dot={{ fill: '#10b981' }} />
      </LineChart>
    </ResponsiveContainer>
  );
};

// 分类进度饼图组件
const CategoryPieChart = () => {
  const { getCategoryProgress } = useAppStore();
  const categoryProgress = getCategoryProgress();

  const chartData = useMemo(() => {
    return categoryProgress.map(cp => ({
      name: cp.category,
      value: cp.completed,
      total: cp.total
    }));
  }, [categoryProgress]);

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        暂无分类数据
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          outerRadius={100}
          fill="#8884d8"
          dataKey="value"
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
      </PieChart>
    </ResponsiveContainer>
  );
};

// 能力雷达图组件
const AbilityRadarChart = () => {
  const { getCategoryProgress } = useAppStore();
  const categoryProgress = getCategoryProgress();

  const chartData = useMemo(() => {
    return categoryProgress.map(cp => ({
      subject: cp.category,
      A: Math.round(cp.accuracy * 100),
      fullMark: 100
    }));
  }, [categoryProgress]);

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        暂无能力数据
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <RadarChart data={chartData}>
        <PolarGrid stroke="#374151" />
        <PolarAngleAxis dataKey="subject" stroke="#9ca3af" />
        <PolarRadiusAxis stroke="#9ca3af" />
        <Radar name="准确率" dataKey="A" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.6} />
        <Tooltip content={<CustomTooltip />} />
      </RadarChart>
    </ResponsiveContainer>
  );
};

// 学习报告组件
const StudyReport = () => {
  const [period, setPeriod] = useState<'week' | 'month' | 'year'>('week');
  const { getStudyReport } = useAppStore();
  const report = getStudyReport(period);

  return (
    <div className="glass-effect rounded-2xl p-6 border border-white/10">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-cyan-400" />
          学习报告
        </h3>
        <div className="flex gap-2">
          {(['week', 'month', 'year'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                period === p
                  ? 'bg-cyan-500 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {p === 'week' ? '周' : p === 'month' ? '月' : '年'}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white/5 rounded-xl p-4">
          <div className="text-gray-400 text-sm mb-1">完成题目</div>
          <div className="text-2xl font-bold text-cyan-400">{report.totalQuestions}</div>
        </div>
        <div className="bg-white/5 rounded-xl p-4">
          <div className="text-gray-400 text-sm mb-1">学习时长</div>
          <div className="text-2xl font-bold text-pink-400">{formatTime(report.totalTime)}</div>
        </div>
        <div className="bg-white/5 rounded-xl p-4">
          <div className="text-gray-400 text-sm mb-1">准确率</div>
          <div className="text-2xl font-bold text-green-400">{Math.round(report.accuracy * 100)}%</div>
        </div>
        <div className="bg-white/5 rounded-xl p-4">
          <div className="text-gray-400 text-sm mb-1">进步</div>
          <div className={`text-2xl font-bold ${report.improvement >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {report.improvement >= 0 ? '+' : ''}{report.improvement.toFixed(1)}%
          </div>
        </div>
      </div>

      {report.strengths.length > 0 && (
        <div className="mb-4">
          <h4 className="text-lg font-semibold text-green-400 mb-2 flex items-center gap-2">
            <Trophy className="w-5 h-5" />
            优势领域
          </h4>
          <div className="flex flex-wrap gap-2">
            {report.strengths.map((strength, index) => (
              <span key={index} className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm">
                {strength}
              </span>
            ))}
          </div>
        </div>
      )}

      {report.weaknesses.length > 0 && (
        <div className="mb-4">
          <h4 className="text-lg font-semibold text-red-400 mb-2 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            需要加强
          </h4>
          <div className="flex flex-wrap gap-2">
            {report.weaknesses.slice(0, 3).map((weakness, index) => (
              <span key={index} className="px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-sm">
                {weakness.category}
              </span>
            ))}
          </div>
        </div>
      )}

      {report.recommendations.length > 0 && (
        <div>
          <h4 className="text-lg font-semibold text-yellow-400 mb-2 flex items-center gap-2">
            <Zap className="w-5 h-5" />
            智能建议
          </h4>
          <ul className="space-y-2">
            {report.recommendations.map((rec, index) => (
              <li key={index} className="text-gray-300 text-sm flex items-start gap-2">
                <span className="text-yellow-400 mt-1">•</span>
                {rec}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

// 智能推荐题目组件
const RecommendedQuestions = () => {
  const { getRecommendedQuestions, markCompleted } = useAppStore();
  const recommended = getRecommendedQuestions(5);

  if (recommended.length === 0) {
    return (
      <div className="glass-effect rounded-2xl p-6 border border-white/10">
        <div className="text-center text-gray-500 py-8">
          暂无推荐题目，继续探索更多题目吧！
        </div>
      </div>
    );
  }

  return (
    <div className="glass-effect rounded-2xl p-6 border border-white/10">
      <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <Target className="w-6 h-6 text-pink-400" />
        为你推荐
      </h3>
      <div className="space-y-3">
        {recommended.map((question: Question) => (
          <div
            key={question.id}
            className="p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
            onClick={() => {
              markCompleted(question.id, 60, true);
            }}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="text-white font-medium mb-1">{question.title}</h4>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <span className="px-2 py-0.5 bg-cyan-500/20 text-cyan-400 rounded">
                    {question.category}
                  </span>
                  <span className={`px-2 py-0.5 rounded ${
                    question.difficulty === 'easy' ? 'bg-green-500/20 text-green-400' :
                    question.difficulty === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-red-500/20 text-red-400'
                  }`}>
                    {question.difficulty === 'easy' ? '简单' : question.difficulty === 'medium' ? '中等' : '困难'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// 主 Dashboard 组件
export default function Dashboard() {
  const { getCategoryProgress } = useAppStore();
  const categoryProgress = getCategoryProgress();

  // 计算总体统计
  const totalQuestions = categoryProgress.reduce((sum, cp) => sum + cp.total, 0);
  const completedQuestions = categoryProgress.reduce((sum, cp) => sum + cp.completed, 0);
  const overallAccuracy = categoryProgress.length > 0
    ? categoryProgress.reduce((sum, cp) => sum + cp.accuracy, 0) / categoryProgress.length
    : 0;

  return (
    <div className="min-h-screen relative">
      <div className="relative z-10 pt-8 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* 页面标题 */}
          <div className="text-center mb-12 fade-in">
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              学习仪表盘
            </h1>
            <p className="text-gray-400">
              全面了解你的学习进度和表现
            </p>
          </div>

          {/* 统计卡片 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="glass-effect rounded-2xl p-6 border border-white/10 hover:border-cyan-500/30 transition-all">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="text-gray-400 text-sm">总题目数</div>
                  <div className="text-2xl font-bold text-white">{totalQuestions}</div>
                </div>
              </div>
            </div>

            <div className="glass-effect rounded-2xl p-6 border border-white/10 hover:border-pink-500/30 transition-all">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center">
                  <Trophy className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="text-gray-400 text-sm">已完成</div>
                  <div className="text-2xl font-bold text-white">{completedQuestions}</div>
                </div>
              </div>
            </div>

            <div className="glass-effect rounded-2xl p-6 border border-white/10 hover:border-green-500/30 transition-all">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-teal-500 flex items-center justify-center">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="text-gray-400 text-sm">准确率</div>
                  <div className="text-2xl font-bold text-white">{Math.round(overallAccuracy * 100)}%</div>
                </div>
              </div>
            </div>

            <div className="glass-effect rounded-2xl p-6 border border-white/10 hover:border-yellow-500/30 transition-all">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="text-gray-400 text-sm">完成率</div>
                  <div className="text-2xl font-bold text-white">
                    {totalQuestions > 0 ? Math.round((completedQuestions / totalQuestions) * 100) : 0}%
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 学习报告 */}
          <div className="mb-8">
            <StudyReport />
          </div>

          {/* 图表区域 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <div className="glass-effect rounded-2xl p-6 border border-white/10">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-cyan-400" />
                学习趋势
              </h3>
              <ProgressLineChart />
            </div>

            <div className="glass-effect rounded-2xl p-6 border border-white/10">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Target className="w-6 h-6 text-pink-400" />
                分类进度
              </h3>
              <CategoryPieChart />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <div className="glass-effect rounded-2xl p-6 border border-white/10">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Zap className="w-6 h-6 text-purple-400" />
                能力雷达
              </h3>
              <AbilityRadarChart />
            </div>

            <RecommendedQuestions />
          </div>
        </div>
      </div>
    </div>
  );
}
