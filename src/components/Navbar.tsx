import { Link, useLocation } from 'react-router-dom';
import { Home, BookOpen, Trophy, Code2, AlertCircle, Award, Target, TrendingUp, Users, Database } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import { useTheme } from '@/hooks/useTheme';
import { useAppStore } from '@/store';

export default function Navbar() {
  const location = useLocation();
  const { isDark } = useTheme();
  const { achievements: userAchievements } = useAppStore();

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { path: '/', icon: Home, label: '首页' },
    { path: '/questions', icon: BookOpen, label: '题库' },
    { path: '/demo', icon: Code2, label: '代码评测' },
    { path: '/interview', icon: Target, label: '模拟面试' },
    { path: '/mistakes', icon: AlertCircle, label: '错题本' },
    { path: '/progress', icon: Trophy, label: '进度' },
    { path: '/dashboard', icon: TrendingUp, label: '仪表盘' },
    { path: '/ranking', icon: Users, label: '排行榜' },
    { path: '/achievements', icon: Award, label: '成就', badge: userAchievements.length },
    { path: '/data', icon: Database, label: '数据管理' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-effect backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-pink-500 flex items-center justify-center neon-glow">
              <Code2 className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-pink-400 bg-clip-text text-transparent">
              InterviewPro
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-all duration-300 relative ${
                  isActive(item.path)
                    ? 'bg-gradient-to-r from-cyan-500/20 to-pink-500/20 border border-cyan-400/30 text-cyan-300'
                    : isDark
                    ? 'text-gray-400 hover:text-white hover:bg-white/5'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-900/5'
                }`}
              >
                <item.icon className="w-4 h-4" />
                <span className="font-medium">{item.label}</span>
                {item.badge && item.badge > 0 && (
                  <span className="absolute -top-1 -right-1 bg-pink-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </Link>
            ))}
            <ThemeToggle />
          </div>

          <div className="md:hidden flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`p-3 rounded-xl transition-all duration-300 relative ${
                  isActive(item.path)
                    ? 'bg-gradient-to-r from-cyan-500/20 to-pink-500/20 border border-cyan-400/30 text-cyan-300'
                    : isDark
                    ? 'text-gray-400 hover:text-white hover:bg-white/5'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-900/5'
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.badge && item.badge > 0 && (
                  <span className="absolute -top-1 -right-1 bg-pink-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </Link>
            ))}
            <ThemeToggle />
          </div>
        </div>
      </div>
    </nav>
  );
}
