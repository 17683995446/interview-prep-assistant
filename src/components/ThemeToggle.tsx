import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import { motion } from 'framer-motion';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-xl transition-all duration-300 hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-cyan-400/30"
      aria-label="切换主题"
    >
      <div className="relative w-6 h-6">
        <motion.div
          initial={false}
          animate={{
            opacity: isDark ? 1 : 0,
            scale: isDark ? 1 : 0.5,
            rotate: isDark ? 0 : -90
          }}
          transition={{ duration: 0.3 }}
          className="absolute inset-0"
        >
          <Moon className="w-6 h-6 text-yellow-300" />
        </motion.div>
        <motion.div
          initial={false}
          animate={{
            opacity: isDark ? 0 : 1,
            scale: isDark ? 0.5 : 1,
            rotate: isDark ? 90 : 0
          }}
          transition={{ duration: 0.3 }}
          className="absolute inset-0"
        >
          <Sun className="w-6 h-6 text-orange-400" />
        </motion.div>
      </div>
    </button>
  );
}
