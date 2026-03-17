import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Newspaper, ExternalLink, ChevronRight, Loader2, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '../lib/utils';

interface NewsItem {
  title: string;
  link: string;
  pubDate: string;
  contentSnippet: string;
}

interface NewsSource {
  source: string;
  items: NewsItem[];
  error?: boolean;
}

export const NewsFeed = ({ darkMode }: { darkMode: boolean }) => {
  const [feeds, setFeeds] = useState<NewsSource[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedSource, setExpandedSource] = useState<string | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(true);

  const fetchFeeds = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/feeds');
      const data = await response.json();
      setFeeds(data);
    } catch (error) {
      console.error('Failed to fetch news feeds:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeeds();
    const interval = setInterval(fetchFeeds, 10 * 60 * 1000); // Refresh every 10 mins
    return () => clearInterval(interval);
  }, []);

  if (loading && feeds.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setIsCollapsed(!isCollapsed)}>
            <h3 className="text-[10px] uppercase tracking-[0.3em] font-bold text-[#D4AF37]">Intelligence Feed</h3>
            {isCollapsed ? <ChevronDown size={12} className="text-[#D4AF37]" /> : <ChevronUp size={12} className="text-[#D4AF37]" />}
          </div>
          <Loader2 size={12} className="animate-spin opacity-40" />
        </div>
        <AnimatePresence>
          {!isCollapsed && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden space-y-3"
            >
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-16 bg-black/5 dark:bg-white/5 rounded-xl animate-pulse" />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => setIsCollapsed(!isCollapsed)}>
          <h3 className="text-[10px] uppercase tracking-[0.3em] font-bold text-[#D4AF37]">Intelligence Feed</h3>
          {isCollapsed ? <ChevronDown size={12} className="text-[#D4AF37]" /> : <ChevronUp size={12} className="text-[#D4AF37]" />}
        </div>
        <button 
          onClick={fetchFeeds}
          disabled={loading}
          className="p-1 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors"
        >
          <RefreshCw size={12} className={cn("opacity-40", loading && "animate-spin")} />
        </button>
      </div>

      <AnimatePresence>
        {!isCollapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden space-y-3"
          >
            {feeds.map((source) => (
              <div 
                key={source.source}
                className="glass border border-black/5 dark:border-white/5 rounded-2xl overflow-hidden premium-shadow transition-all"
              >
                <button
                  onClick={() => setExpandedSource(expandedSource === source.source ? null : source.source)}
                  className="w-full flex items-center justify-between p-4 hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg apple-icon-bg text-emerald-500">
                      <Newspaper size={14} />
                    </div>
                    <div className="text-left">
                      <span className="text-[10px] font-bold uppercase tracking-widest dark:text-white">{source.source.replace('_', ' ')}</span>
                      {source.items[0] && (
                        <p className="text-[11px] opacity-60 dark:text-white/60 line-clamp-1 mt-0.5">{source.items[0].title}</p>
                      )}
                    </div>
                  </div>
                  <ChevronRight 
                    size={14} 
                    className={cn("opacity-40 transition-transform duration-300", expandedSource === source.source && "rotate-90")} 
                  />
                </button>

                <AnimatePresence>
                  {expandedSource === source.source && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="p-4 pt-0 space-y-3 border-t border-black/5 dark:border-white/5">
                        {source.items.map((item, idx) => (
                          <div key={idx} className="group space-y-1">
                            <a 
                              href={item.link} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="flex items-start justify-between gap-2 group"
                            >
                              <span className="text-xs font-medium dark:text-white group-hover:text-emerald-500 transition-colors leading-relaxed">
                                {item.title}
                              </span>
                              <ExternalLink size={12} className="opacity-0 group-hover:opacity-40 transition-opacity flex-shrink-0 mt-1" />
                            </a>
                            <p className="text-[10px] opacity-40 dark:text-white/40 leading-relaxed">
                              {item.contentSnippet}
                            </p>
                            <div className="text-[8px] uppercase tracking-widest opacity-30 font-bold">
                              {new Date(item.pubDate).toLocaleDateString()}
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
