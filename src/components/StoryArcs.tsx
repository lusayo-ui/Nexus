import React from 'react';
import { motion } from 'motion/react';
import { Zap, AlertCircle, TrendingUp } from 'lucide-react';

interface StoryArc {
  id: string;
  title: string;
  category: string;
  summary: string;
  date: string;
  updateCount: number;
  priority: 'High' | 'Medium' | 'Low';
  isActive: boolean;
}

interface StoryArcsProps {
  arcs: StoryArc[];
  darkMode: boolean;
  onArcClick?: (arc: StoryArc) => void;
}

export const StoryArcs: React.FC<StoryArcsProps> = ({ arcs, darkMode, onArcClick }) => {
  return (
    <div className="relative pl-8 space-y-8">
      {/* Vertical Connecting Line */}
      <div className="absolute left-[11px] top-4 bottom-4 w-[1px] bg-black/10 dark:bg-white/10" />

      {arcs.map((arc, i) => (
        <motion.div
          key={arc.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.1 }}
          className={cn(
            "relative group cursor-pointer transition-all duration-300",
            onArcClick && "hover:translate-x-2"
          )}
          onClick={() => onArcClick?.(arc)}
        >
          {/* Timeline Dot */}
          <div className={`absolute -left-[27px] top-1.5 w-4 h-4 rounded-full border-2 border-[#D4AF37] z-10 transition-all duration-500 ${
            arc.isActive 
              ? 'bg-[#D4AF37] shadow-[0_0_20px_rgba(212,175,55,0.8)]' 
              : 'bg-white dark:bg-[#0a0a0a]'
          } group-hover:scale-150 group-hover:border-white dark:group-hover:border-black`} />

          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="text-[8px] uppercase tracking-[0.2em] font-bold text-emerald-500">
                {arc.category}
              </span>
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5">
                <Zap size={8} className="text-black/40 dark:text-white/40" />
                <span className="text-[8px] font-bold opacity-60 dark:text-white/60">{arc.updateCount} Updates</span>
              </div>
            </div>

            <h4 className="serif text-lg md:text-xl font-light leading-tight dark:text-white group-hover:text-emerald-500 group-hover:underline decoration-emerald-500/30 underline-offset-4 transition-all">
              {arc.title}
            </h4>

            <p className="text-xs leading-relaxed opacity-60 dark:text-white/60 max-w-2xl line-clamp-2">
              {arc.summary}
            </p>

            <div className="flex items-center gap-4 pt-1">
              <span className="text-[9px] font-bold opacity-30 dark:text-white/30 uppercase tracking-widest">
                {arc.date}
              </span>
              {arc.isActive && (
                <div className="flex items-center gap-1.5 text-emerald-500">
                  <TrendingUp size={10} className="animate-pulse" />
                  <span className="text-[8px] font-bold uppercase tracking-widest">Active</span>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

const cn = (...inputs: any[]) => inputs.filter(Boolean).join(' ');
