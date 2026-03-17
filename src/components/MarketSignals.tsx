import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '../lib/utils';

interface MarketItem {
  ticker: string;
  name: string;
  value: string;
  change: number;
  sparkline: number[];
}

interface MarketSignalsProps {
  markets: MarketItem[];
  analysis: string;
  darkMode: boolean;
  compact?: boolean;
  onSignalClick?: (ticker: string, name: string) => void;
}

export const MarketSignals: React.FC<MarketSignalsProps> = ({ markets, analysis, darkMode, compact, onSignalClick }) => {
  return (
    <div className={cn("space-y-8", compact && "space-y-4")}>
      <div className="flex items-center justify-between">
        <h3 className="text-[10px] uppercase tracking-[0.3em] font-bold text-[#D4AF37]">Market Signals</h3>
        {!compact && <span className="text-[10px] uppercase tracking-widest opacity-40 dark:text-white/40">Refreshed 07:30 UTC</span>}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <tbody className="divide-y divide-black/5 dark:divide-white/5">
            {markets.map((market) => (
              <tr 
                key={market.ticker} 
                className="group hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors cursor-pointer"
                onClick={() => onSignalClick?.(market.ticker, market.name)}
              >
                <td className={cn("py-6 px-4", compact && "py-3 px-2")}>
                  <div className="flex flex-col">
                    <span className="mono text-sm font-bold dark:text-white tracking-wider group-hover:text-emerald-500 transition-colors">{market.ticker}</span>
                    <span className="text-[10px] opacity-40 dark:text-white/40 group-hover:text-emerald-500/60 transition-colors">{market.name}</span>
                  </div>
                </td>
                <td className={cn("py-6 px-4", compact && "py-3 px-2")}>
                  <div className={cn("w-24 sm:w-32 h-6 sm:h-8", compact && "w-16 sm:w-20 h-4 sm:h-6")}>
                    <svg viewBox="0 0 100 30" className="w-full h-full overflow-visible">
                      <polyline
                        fill="none"
                        stroke={market.change > 0 ? '#10b981' : market.change < 0 ? '#ef4444' : '#94a3b8'}
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        points={market.sparkline.map((v, i) => `${(i / (market.sparkline.length - 1)) * 100},${30 - (v * 30)}`).join(' ')}
                      />
                    </svg>
                  </div>
                </td>
                <td className={cn("py-6 px-4 text-right", compact && "py-3 px-2")}>
                  <span className="mono text-sm font-medium dark:text-white">{market.value}</span>
                </td>
                <td className={cn("py-6 px-4 text-right", compact && "py-3 px-2")}>
                  <div className={`flex items-center justify-end gap-1.5 font-bold text-[11px] ${
                    market.change > 0 ? 'text-emerald-500' : market.change < 0 ? 'text-red-500' : 'text-slate-400'
                  }`}>
                    <span>{market.change > 0 ? '+' : ''}{market.change}%</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Meridian Macro Read Card */}
      {!compact && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="p-6 md:p-10 rounded-2xl md:rounded-[2.5rem] glass premium-shadow relative overflow-hidden group"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
          <div className="relative z-10 space-y-4 md:space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl apple-icon-bg text-emerald-500">
                <Sparkles size={14} />
              </div>
              <h4 className="text-[10px] uppercase tracking-[0.3em] font-bold text-[#D4AF37]">Meridian Macro Read</h4>
            </div>

            <p className="serif text-lg sm:text-xl md:text-3xl font-light italic leading-relaxed dark:text-white/90">
              {analysis}
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
};
