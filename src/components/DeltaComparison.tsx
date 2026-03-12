import React from 'react';
import { motion } from 'motion/react';
import Markdown from 'react-markdown';
import { ArrowLeft, TrendingUp, TrendingDown, Minus, Zap, ShieldAlert, Activity } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface DeltaReport {
  title: string;
  summary: string;
  content: string;
  evolutionScore: number;
  changeMagnitude: "Minor" | "Moderate" | "Significant" | "Transformative";
}

interface DeltaComparisonProps {
  reportA: any;
  reportB: any;
  delta: DeltaReport;
  onBack: () => void;
  darkMode: boolean;
}

export const DeltaComparison: React.FC<DeltaComparisonProps> = ({ reportA, reportB, delta, onBack, darkMode }) => {
  return (
    <div className="max-w-5xl mx-auto space-y-12 pb-24">
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest opacity-40 hover:opacity-100 transition-opacity dark:text-white"
      >
        <ArrowLeft size={14} />
        Back to Intelligence
      </button>

      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-bold uppercase tracking-widest">
            Delta Analysis
          </div>
          <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
            delta.changeMagnitude === 'Transformative' ? 'bg-red-500/10 text-red-500' :
            delta.changeMagnitude === 'Significant' ? 'bg-orange-500/10 text-orange-500' :
            'bg-blue-500/10 text-blue-500'
          }`}>
            {delta.changeMagnitude} Change
          </div>
        </div>
        <h1 className="serif text-5xl md:text-7xl font-light leading-tight tracking-tight dark:text-white">
          {delta.title}
        </h1>
        <p className="text-lg opacity-60 dark:text-white/60 max-w-3xl leading-relaxed">
          {delta.summary}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white dark:bg-white/5 p-8 rounded-3xl border border-black/5 dark:border-white/5 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-black/5 dark:bg-white/5">
              <Activity size={18} className="dark:text-white" />
            </div>
            <h4 className="text-xs font-bold uppercase tracking-widest opacity-40 dark:text-white/40">Evolution Score</h4>
          </div>
          <div className="flex items-end gap-3">
            <span className={`text-6xl font-light tracking-tighter ${
              delta.evolutionScore > 0 ? 'text-emerald-500' : 
              delta.evolutionScore < 0 ? 'text-red-500' : 
              'dark:text-white'
            }`}>
              {delta.evolutionScore > 0 ? '+' : ''}{delta.evolutionScore}
            </span>
            <div className="mb-2">
              {delta.evolutionScore > 0 ? <TrendingUp className="text-emerald-500" /> : 
               delta.evolutionScore < 0 ? <TrendingDown className="text-red-500" /> : 
               <Minus className="opacity-40" />}
            </div>
          </div>
          <p className="text-[10px] uppercase tracking-widest font-bold opacity-30 mt-4 dark:text-white/30">Sentiment Delta</p>
        </div>

        <div className="md:col-span-2 bg-black text-white dark:bg-white dark:text-black p-8 rounded-3xl shadow-2xl flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <h4 className="text-xs font-bold uppercase tracking-widest opacity-40">Comparative Context</h4>
              <p className="serif text-xl italic-small">Analyzing the shift from {new Date(reportA.createdAt).toLocaleDateString()} to {new Date(reportB.createdAt).toLocaleDateString()}</p>
            </div>
            <Zap size={24} className="opacity-20" />
          </div>
          <div className="grid grid-cols-2 gap-8 mt-8">
            <div>
              <p className="text-[10px] uppercase tracking-widest font-bold opacity-40 mb-1">Baseline</p>
              <p className="text-sm font-medium truncate">{reportA.title}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest font-bold opacity-40 mb-1">Current State</p>
              <p className="text-sm font-medium truncate">{reportB.title}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="prose prose-lg dark:prose-invert max-w-none serif-prose">
        <div className="markdown-body">
          <Markdown>{delta.content}</Markdown>
        </div>
      </div>
    </div>
  );
};
