import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { User, Users, Shield, TrendingUp, TrendingDown, Minus, Search, Sparkles, Filter, ChevronRight, Calendar } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface EntityTrackerProps {
  reports: any[];
  darkMode: boolean;
  followedEntities: string[];
  onToggleFollow: (name: string) => void;
  onEntityClick?: (name: string, type: string) => void;
}

export const EntityTracker: React.FC<EntityTrackerProps> = ({ reports, darkMode, followedEntities, onToggleFollow, onEntityClick }) => {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [filterType, setFilterType] = React.useState<'All' | 'Followed'>('All');

  const entityMentions = useMemo(() => {
    const mentions: { [key: string]: { name: string; type: string; count: number; sentimentSum: number; reports: any[] } } = {};

    reports.forEach(report => {
      if (report.entities) {
        report.entities.forEach((entity: any) => {
          if (!mentions[entity.name]) {
            mentions[entity.name] = {
              name: entity.name,
              type: entity.type,
              count: 0,
              sentimentSum: 0,
              reports: []
            };
          }
          mentions[entity.name].count += 1;
          mentions[entity.name].sentimentSum += report.sentimentScore;
          mentions[entity.name].reports.push({
            id: report.id,
            title: report.title,
            sentiment: report.sentimentScore,
            date: report.createdAt
          });
        });
      }
    });

    return Object.values(mentions)
      .map(m => ({
        ...m,
        avgSentiment: m.sentimentSum / m.count
      }))
      .sort((a, b) => b.count - a.count);
  }, [reports]);

  const filteredEntities = entityMentions.filter(e => {
    const matchesSearch = e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         e.type.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterType === 'All' || followedEntities.includes(e.name);
    return matchesSearch && matchesFilter;
  });

  const [selectedEntity, setSelectedEntity] = React.useState<string | null>(null);
  const activeEntity = filteredEntities.find(e => e.name === selectedEntity) || filteredEntities[0];

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6">
        <div>
          <h3 className="serif text-2xl md:text-3xl font-light dark:text-white">Geopolitical Entity Tracker</h3>
          <p className="text-[10px] md:text-xs uppercase tracking-widest opacity-40 mt-1 dark:text-white/40">Monitoring strategic actors across the intelligence cycle</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 md:gap-4">
          <div className="flex bg-black/5 dark:bg-white/5 p-1 rounded-xl border border-black/5 dark:border-white/5">
            <button 
              onClick={() => setFilterType('All')}
              className={cn(
                "flex-1 sm:flex-none px-3 md:px-4 py-2 rounded-lg text-[9px] md:text-[10px] font-bold uppercase tracking-widest transition-all",
                filterType === 'All' ? "bg-white dark:bg-white/10 shadow-sm dark:text-white" : "opacity-40 hover:opacity-100 dark:text-white"
              )}
            >
              All Actors
            </button>
            <button 
              onClick={() => setFilterType('Followed')}
              className={cn(
                "flex-1 sm:flex-none px-3 md:px-4 py-2 rounded-lg text-[9px] md:text-[10px] font-bold uppercase tracking-widest transition-all",
                filterType === 'Followed' ? "bg-white dark:bg-white/10 shadow-sm dark:text-white" : "opacity-40 hover:opacity-100 dark:text-white"
              )}
            >
              Followed ({followedEntities.length})
            </button>
          </div>
          <div className="relative w-full md:w-64">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-black/30 dark:text-white/30" size={14} />
            <input 
              type="text" 
              placeholder="Search actors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-white/5 border border-black/5 dark:border-white/5 text-xs focus:ring-2 focus:ring-black dark:focus:ring-white transition-all"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
        {/* Entity List */}
        <div className="lg:col-span-4 space-y-3 max-h-[400px] lg:max-h-[calc(100vh-20rem)] overflow-y-auto custom-scrollbar pr-2">
          {filteredEntities.map((entity, i) => (
            <motion.div
              key={entity.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => setSelectedEntity(entity.name)}
              className={cn(
                "p-4 rounded-2xl border transition-all cursor-pointer group relative",
                selectedEntity === entity.name || (!selectedEntity && i === 0)
                  ? "bg-black text-white dark:bg-white dark:text-black border-transparent shadow-xl scale-[1.02]"
                  : "bg-white dark:bg-white/5 border-black/5 dark:border-white/5 hover:border-black/20 dark:hover:border-white/20"
              )}
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "p-1.5 rounded-lg",
                    selectedEntity === entity.name || (!selectedEntity && i === 0)
                      ? "bg-white/20 text-white dark:bg-black/20 dark:text-black"
                      : entity.type === 'Person' ? "bg-blue-500/10 text-blue-500" :
                        entity.type === 'Organization' ? "bg-emerald-500/10 text-emerald-500" :
                        "bg-purple-500/10 text-purple-500"
                  )}>
                    {entity.type === 'Person' ? <User size={14} /> : 
                     entity.type === 'Organization' ? <Users size={14} /> : 
                     <Shield size={14} />}
                  </div>
                  <div 
                    className="cursor-pointer group/name"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEntityClick?.(entity.name, entity.type);
                    }}
                  >
                    <h4 className="font-bold text-xs group-hover/name:text-emerald-500 transition-colors">{entity.name}</h4>
                    <span className="text-[8px] uppercase tracking-widest font-bold opacity-40">{entity.type}</span>
                  </div>
                </div>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleFollow(entity.name);
                  }}
                  className={cn(
                    "p-1.5 rounded-lg transition-colors",
                    followedEntities.includes(entity.name)
                      ? "bg-emerald-500 text-white"
                      : "bg-black/5 dark:bg-white/10 text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white"
                  )}
                >
                  <Sparkles size={12} className={followedEntities.includes(entity.name) ? "animate-pulse" : ""} />
                </button>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-current/10">
                <div className="flex items-center gap-3">
                  <div className="flex flex-col">
                    <span className="text-[8px] uppercase font-bold opacity-40">Mentions</span>
                    <span className="text-xs font-light">{entity.count}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[8px] uppercase font-bold opacity-40">Sentiment</span>
                    <div className={cn(
                      "flex items-center gap-0.5 text-xs font-bold",
                      entity.avgSentiment > 60 ? "text-emerald-500" :
                      entity.avgSentiment < 40 ? "text-red-500" :
                      "text-amber-500"
                    )}>
                      {Math.round(entity.avgSentiment)}%
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
          
          {filteredEntities.length === 0 && (
            <div className="py-12 text-center opacity-20">
              <Search size={32} className="mx-auto mb-3" />
              <p className="text-[10px] uppercase tracking-widest font-bold">No actors found</p>
            </div>
          )}
        </div>

        {/* Mention Feed */}
        <div className="lg:col-span-8">
          <div className="bg-white dark:bg-white/5 rounded-[2.5rem] border border-black/5 dark:border-white/5 p-8 h-full">
            {activeEntity ? (
              <>
                <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4 mb-8 md:mb-10">
                  <div>
                    <h4 
                      className="serif text-2xl md:text-3xl font-light dark:text-white cursor-pointer hover:text-emerald-500 hover:underline decoration-emerald-500/30 underline-offset-8 transition-all"
                      onClick={() => onEntityClick?.(activeEntity.name, activeEntity.type)}
                    >
                      {activeEntity.name}
                    </h4>
                    <p className="text-[9px] md:text-[10px] uppercase tracking-[0.3em] font-bold opacity-40 dark:text-white/40">Intelligence Mention Timeline</p>
                  </div>
                  <div className="flex items-center gap-4 md:gap-6">
                    <div className="text-left md:text-right">
                      <p className="text-[8px] uppercase font-bold opacity-40 dark:text-white/40">Total Signals</p>
                      <p className="text-xl md:text-2xl font-light dark:text-white tabular-nums">{activeEntity.count}</p>
                    </div>
                    <div className="text-left md:text-right">
                      <p className="text-[8px] uppercase font-bold opacity-40 dark:text-white/40">Risk Profile</p>
                      <p className={cn(
                        "text-xl md:text-2xl font-light tabular-nums",
                        activeEntity.avgSentiment < 40 ? "text-red-500" : "text-emerald-500"
                      )}>{Math.round(100 - activeEntity.avgSentiment)}%</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-6 md:space-y-8">
                  {activeEntity.reports.map((report, i) => (
                    <motion.div
                      key={report.id + i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="relative pl-8 md:pl-10 border-l border-black/5 dark:border-white/5 pb-8 md:pb-10 last:pb-0 group"
                    >
                      <div className="absolute left-[-4px] top-0 w-2 h-2 rounded-full bg-black/20 dark:bg-white/20 group-hover:bg-emerald-500 transition-colors" />
                      <div className="flex justify-between items-start mb-2 md:mb-3">
                        <span className="text-[9px] md:text-[10px] uppercase tracking-widest font-bold opacity-40 dark:text-white/40">
                          {new Date(report.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                        <div className={cn(
                          "px-2 md:px-3 py-0.5 md:py-1 rounded-full text-[8px] md:text-[10px] font-bold",
                          report.sentiment > 60 ? "bg-emerald-500/10 text-emerald-500" :
                          report.sentiment < 40 ? "bg-red-500/10 text-red-500" :
                          "bg-amber-500/10 text-amber-500"
                        )}>
                          {report.sentiment}% Sentiment
                        </div>
                      </div>
                      <h5 className="font-semibold text-base md:text-lg dark:text-white mb-2 md:mb-3 group-hover:text-emerald-500 transition-colors cursor-pointer">{report.title}</h5>
                      <p className="text-xs md:text-sm opacity-60 dark:text-white/60 leading-relaxed max-w-2xl">
                        Strategic intelligence indicates {activeEntity.name} is a key driver in this development, with implications for regional stability and market transmission.
                      </p>
                    </motion.div>
                  ))}
                </div>
              </>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center opacity-20">
                <Users size={64} className="mb-6" />
                <p className="text-sm uppercase tracking-widest font-bold">Select an actor to view timeline</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
