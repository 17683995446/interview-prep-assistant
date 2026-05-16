import { useEffect, useState } from 'react';
import { useAppStore, achievements } from '@/store';
import { Trophy, X } from 'lucide-react';

export default function AchievementNotification() {
  const { newAchievements, clearNewAchievements } = useAppStore();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (newAchievements.length > 0) {
      setCurrentIndex(0);
      setIsVisible(true);
    }
  }, [newAchievements.length]);

  useEffect(() => {
    if (isVisible && newAchievements[currentIndex]) {
      const timer = setTimeout(() => {
        if (currentIndex < newAchievements.length - 1) {
          setCurrentIndex(prev => prev + 1);
        } else {
          setIsVisible(false);
          setTimeout(() => {
            clearNewAchievements();
          }, 500);
        }
      }, 4000);

      return () => clearTimeout(timer);
    }
  }, [isVisible, currentIndex, newAchievements, clearNewAchievements]);

  const currentAchievementId = newAchievements[currentIndex];
  const currentAchievement = achievements.find(a => a.id === currentAchievementId);

  if (!isVisible || !currentAchievement) return null;

  return (
    <div className="fixed top-24 right-4 z-50 pointer-events-auto">
      <div className="animate-slide-in glass-effect rounded-2xl p-6 border border-yellow-500/30 shadow-2xl max-w-sm">
        <div className="flex items-start gap-4">
          {/* 成就图标 */}
          <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${currentAchievement.color} flex items-center justify-center text-3xl flex-shrink-0`}>
            {currentAchievement.icon}
          </div>

          {/* 内容 */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Trophy className="w-5 h-5 text-yellow-400" />
              <span className="text-yellow-400 text-sm font-bold uppercase tracking-wider">
                成就解锁！
              </span>
            </div>
            <h3 className="text-xl font-bold text-white mb-1">
              {currentAchievement.name}
            </h3>
            <p className="text-gray-400 text-sm">
              {currentAchievement.description}
            </p>
          </div>

          {/* 关闭按钮 */}
          <button
            onClick={() => {
              if (currentIndex < newAchievements.length - 1) {
                setCurrentIndex(prev => prev + 1);
              } else {
                setIsVisible(false);
                setTimeout(() => {
                  clearNewAchievements();
                }, 500);
              }
            }}
            className="text-gray-500 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
