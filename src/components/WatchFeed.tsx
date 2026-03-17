import React from 'react';
import { motion } from 'motion/react';
import { Plus, ShieldAlert, TrendingUp, Activity, Landmark, Droplets } from 'lucide-react';
import { cn } from '../lib/utils';

interface Entity {
  id: string;
  name: string;
  subtext: string;
  category: string;
  status: 'HOSTILE' | 'ESCALATING' | 'NEUTRAL' | 'ACTIVE';
  flag?: string;
  icon?: React.ReactNode;
}

const ENTITIES: Entity[] = [
  {
    id: '1',
    name: 'Russia · Kremlin',
    subtext: 'State actor · Defence posture',
    category: 'Geopolitics',
    status: 'HOSTILE',
    flag: '🇷🇺'
  },
  {
    id: '2',
    name: 'China · PRC',
    subtext: 'State actor · Taiwan Strait',
    category: 'Geopolitics',
    status: 'ESCALATING',
    flag: '🇨🇳'
  },
  {
    id: '3',
    name: 'US Federal Reserve',
    subtext: 'Monetary policy · Rate path',
    category: 'Finance',
    status: 'NEUTRAL',
    icon: <Landmark size={20} className="text-blue-400" />
  },
  {
    id: '4',
    name: 'OPEC+',
    subtext: 'Energy · Supply decisions',
    category: 'Commodities',
    status: 'ACTIVE',
    icon: <Droplets size={20} className="text-cyan-400" />
  }
];

interface WatchFeedProps {
  entities: Entity[];
  onAddEntity?: () => void;
  onEntityClick?: (name: string) => void;
}

export const WatchFeed: React.FC<WatchFeedProps> = ({ entities, onAddEntity, onEntityClick }) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-[10px] uppercase tracking-[0.3em] font-bold text-[#D4AF37]">Watch Feed</h3>
        <span className="text-[10px] uppercase tracking-widest opacity-40 dark:text-white/40">{entities.length} Entities Monitored</span>
      </div>

      <div className="glass border border-black/5 dark:border-white/5 rounded-2xl md:rounded-[2rem] overflow-hidden premium-shadow">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse min-w-[300px]">
            <thead>
              <tr className="border-b border-black/5 dark:border-white/5 bg-black/[0.02] dark:bg-white/[0.02]">
                <th className="text-left py-4 px-4 md:px-6 text-[9px] uppercase tracking-widest font-bold opacity-40">Entity</th>
                <th className="hidden sm:table-cell text-left py-4 px-4 md:px-6 text-[9px] uppercase tracking-widest font-bold opacity-40">Posture</th>
                <th className="text-right py-4 px-4 md:px-6 text-[9px] uppercase tracking-widest font-bold opacity-40">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 dark:divide-white/5">
              {entities.map((entity) => (
                <tr 
                  key={entity.id} 
                  className="group hover:bg-black/[0.03] dark:hover:bg-white/[0.03] transition-all cursor-pointer"
                  onClick={() => onEntityClick?.(entity.name)}
                >
                  <td className="py-4 px-4 md:px-6">
                    <div className="flex items-center gap-3 md:gap-4">
                      <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl apple-icon-bg flex items-center justify-center text-lg md:text-xl group-hover:scale-110 transition-transform duration-500 flex-shrink-0">
                        {entity.flag || entity.icon}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-[10px] md:text-[11px] font-bold dark:text-white group-hover:text-emerald-500 transition-colors truncate">{entity.name}</span>
                        <span className="text-[8px] md:text-[9px] opacity-40 dark:text-white/40 truncate max-w-[100px] md:max-w-[150px]">{entity.subtext}</span>
                      </div>
                    </div>
                  </td>
                  <td className="hidden sm:table-cell py-4 px-4 md:px-6">
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        "w-1.5 h-1.5 rounded-full ring-4",
                        entity.status === 'HOSTILE' ? "bg-red-500 ring-red-500/10" :
                        entity.status === 'ESCALATING' ? "bg-amber-500 ring-amber-500/10" :
                        entity.status === 'ACTIVE' ? "bg-emerald-500 ring-emerald-500/10" :
                        "bg-slate-400 ring-slate-400/10"
                      )} />
                      <span className="text-[10px] font-medium opacity-60 dark:text-white/60">{entity.category}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4 md:px-6 text-right">
                    <span className={cn(
                      "px-1.5 py-0.5 md:px-2 md:py-1 rounded-md text-[7px] md:text-[8px] font-bold uppercase tracking-widest border",
                      entity.status === 'HOSTILE' ? "text-red-500 border-red-500/20 bg-red-500/5" :
                      entity.status === 'ESCALATING' ? "text-amber-500 border-amber-500/20 bg-amber-500/5" :
                      entity.status === 'ACTIVE' ? "text-emerald-500 border-emerald-500/20 bg-emerald-500/5" :
                      "text-slate-500 border-slate-500/20 bg-slate-500/5"
                    )}>
                      {entity.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      <button 
        onClick={onAddEntity}
        className="w-full py-2 px-4 border border-dashed border-black/10 dark:border-white/10 rounded-xl flex items-center justify-center gap-2 opacity-40 hover:opacity-100 transition-opacity group"
      >
        <Plus size={12} />
        <span className="text-[9px] uppercase tracking-widest font-bold">Add entity</span>
      </button>
    </div>
  );
};
