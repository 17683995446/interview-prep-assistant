import { useState } from 'react';
import { Share2, Twitter, Facebook, Linkedin, Copy, Check, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShareData } from '@/types';
import { useTheme } from '@/hooks/useTheme';

interface ShareButtonProps {
  shareData: ShareData;
  className?: string;
}

export default function ShareButton({ shareData, className = '' }: ShareButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const { isDark } = useTheme();

  const shareUrl = window.location.href;
  const shareText = `${shareData.title}\n${shareData.description}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const shareToTwitter = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(url, '_blank');
  };

  const shareToFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank');
  };

  const shareToLinkedin = () => {
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
    window.open(url, '_blank');
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareData.title,
          text: shareData.description,
          url: shareUrl
        });
      } catch (err) {
        console.log('Share cancelled');
      }
    }
  };

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`p-3 rounded-xl transition-all duration-300 flex items-center gap-2 ${
          isDark 
            ? 'bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white' 
            : 'bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900'
        }`}
      >
        <Share2 className="w-5 h-5" />
        <span className="font-medium">分享</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* 背景遮罩 */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-40"
            />
            
            {/* 分享面板 */}
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className={`absolute right-0 top-full mt-3 z-50 w-80 rounded-2xl glass-effect border ${
                isDark ? 'border-white/10' : 'border-slate-200'
              } p-4 shadow-2xl`}
            >
              {/* 关闭按钮 */}
              <button
                onClick={() => setIsOpen(false)}
                className={`absolute top-3 right-3 p-1.5 rounded-lg transition-colors ${
                  isDark 
                    ? 'hover:bg-white/10 text-gray-400' 
                    : 'hover:bg-slate-100 text-slate-500'
                }`}
              >
                <X className="w-4 h-4" />
              </button>

              {/* 标题 */}
              <div className="mb-4 pr-8">
                <h3 className={`text-lg font-bold mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  分享给朋友
                </h3>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>
                  {shareData.description}
                </p>
              </div>

              {/* 分享卡片预览 */}
              <div className={`mb-4 p-4 rounded-xl ${
                isDark ? 'bg-gradient-to-br from-cyan-500/10 to-pink-500/10 border border-cyan-500/20' : 'bg-gradient-to-br from-cyan-50 to-pink-50 border border-cyan-100'
              }`}>
                <p className={`font-semibold ${isDark ? 'text-cyan-300' : 'text-cyan-700'}`}>
                  {shareData.title}
                </p>
              </div>

              {/* 社交分享按钮 */}
              <div className="grid grid-cols-4 gap-3 mb-4">
                <button
                  onClick={shareToTwitter}
                  className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-blue-500/10 transition-colors group"
                >
                  <div className="w-10 h-10 rounded-full bg-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Twitter className="w-5 h-5 text-white" />
                  </div>
                  <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>Twitter</span>
                </button>

                <button
                  onClick={shareToFacebook}
                  className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-blue-600/10 transition-colors group"
                >
                  <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Facebook className="w-5 h-5 text-white" />
                  </div>
                  <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>Facebook</span>
                </button>

                <button
                  onClick={shareToLinkedin}
                  className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-blue-700/10 transition-colors group"
                >
                  <div className="w-10 h-10 rounded-full bg-blue-700 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Linkedin className="w-5 h-5 text-white" />
                  </div>
                  <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>LinkedIn</span>
                </button>

                <button
                  onClick={handleCopy}
                  className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-gray-500/10 transition-colors group"
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform ${
                    copied ? 'bg-green-500' : isDark ? 'bg-gray-600' : 'bg-slate-600'
                  }`}>
                    {copied ? (
                      <Check className="w-5 h-5 text-white" />
                    ) : (
                      <Copy className="w-5 h-5 text-white" />
                    )}
                  </div>
                  <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>
                    {copied ? '已复制' : '复制链接'}
                  </span>
                </button>
              </div>

              {/* 原生分享 */}
              {navigator.share && (
                <button
                  onClick={handleNativeShare}
                  className={`w-full py-3 rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-2 ${
                    isDark 
                      ? 'bg-gradient-to-r from-cyan-500/20 to-pink-500/20 hover:from-cyan-500/30 hover:to-pink-500/30 text-white border border-cyan-500/30' 
                      : 'bg-gradient-to-r from-cyan-500 to-pink-500 hover:from-cyan-600 hover:to-pink-600 text-white'
                  }`}
                >
                  <Share2 className="w-5 h-5" />
                  更多分享方式
                </button>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
