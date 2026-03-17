import React, { useRef, useState } from 'react';
import Markdown from 'react-markdown';
import { format } from 'date-fns';
import { ExternalLink, Clock, Share2, Mail, TrendingUp, TrendingDown, Minus, AlertTriangle, Info, BarChart3, Activity, Download, Loader2, Shield, Fingerprint, Globe2, FileText, Bookmark, ChevronRight, Twitter, Linkedin, Copy, Check } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ReportViewProps {
  report: {
    id?: string;
    title: string;
    summary?: string;
    content: string;
    createdAt: string;
    sources?: string[];
    sentimentScore?: number;
    riskLevel?: 'Low' | 'Medium' | 'High';
    imageUrl?: string;
    keyMetrics?: Array<{ label: string; value: string; trend: 'up' | 'down' | 'neutral' }>;
    articleSummaries?: Array<{ title: string; summary: string }>;
    marketTrendData?: Array<{ date: string; value: number }>;
    reportType?: 'traditional' | 'nexus';
  };
  onEmail?: () => void;
  onShare?: () => void;
  darkMode?: boolean;
  searchQuery?: string;
  allReports?: any[];
  onSelectReport?: (report: any) => void;
}

export const ReportView: React.FC<ReportViewProps> = ({ 
  report, 
  onEmail, 
  onShare, 
  darkMode, 
  searchQuery,
  allReports = [],
  onSelectReport
}) => {
  const reportRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [scrubbedData, setScrubbedData] = useState<{ date: string, value: number } | null>(null);
  const [isArchiveDropdownOpen, setIsArchiveDropdownOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const shareLinks = {
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(`Intelligence Briefing: ${report.title}`)}&url=${encodeURIComponent(window.location.href)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`,
    email: `mailto:?subject=${encodeURIComponent(`Intelligence Briefing: ${report.title}`)}&body=${encodeURIComponent(`Check out this intelligence report from Meridian: ${window.location.href}`)}`
  };

  const cleanText = (text: string = '') => {
    return text.replace(/\\n/g, '\n').replace(/\s*\\n\s*/g, '\n');
  };

  const HighlightedText = ({ text }: { text: string }) => {
    const cleanedText = cleanText(text);
    if (!searchQuery || !searchQuery.trim()) return <>{cleanedText}</>;
    const escapedQuery = searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const parts = cleanedText.split(new RegExp(`(${escapedQuery})`, 'gi'));
    return (
      <>
        {parts.map((part, i) => 
          part.toLowerCase() === searchQuery.toLowerCase() ? (
            <mark key={i} className="bg-emerald-500/30 text-emerald-900 dark:text-emerald-100 rounded-sm px-1 font-bold">
              {part}
            </mark>
          ) : (
            part
          )
        )}
      </>
    );
  };

  const highlightChildren = (children: any): any => {
    return React.Children.map(children, (child) => {
      if (typeof child === 'string') return <HighlightedText text={child} />;
      if (React.isValidElement(child) && (child.props as any).children) {
        return React.cloneElement(child, {
          children: highlightChildren((child.props as any).children),
        } as any);
      }
      return child;
    });
  };

  const components = {
    p: ({ children }: any) => <p>{highlightChildren(children)}</p>,
    h1: ({ children }: any) => <h1>{highlightChildren(children)}</h1>,
    h2: ({ children }: any) => <h2>{highlightChildren(children)}</h2>,
    h3: ({ children }: any) => <h3>{highlightChildren(children)}</h3>,
    li: ({ children }: any) => <li>{highlightChildren(children)}</li>,
    strong: ({ children }: any) => <strong>{highlightChildren(children)}</strong>,
    em: ({ children }: any) => <em>{highlightChildren(children)}</em>,
    a: ({ children, href }: any) => <a href={href} target="_blank" rel="noopener noreferrer">{highlightChildren(children)}</a>,
  };

  const getSentimentColor = (score: number) => {
    if (score > 60) return 'text-emerald-500';
    if (score < 40) return 'text-red-500';
    return 'text-amber-500';
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'High': return 'text-red-500';
      case 'Medium': return 'text-amber-500';
      default: return 'text-emerald-500';
    }
  };

  const handleDownload = async () => {
    if (!reportRef.current) return;
    setIsDownloading(true);
    try {
      // Small delay to ensure any animations are settled
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const element = reportRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: darkMode ? '#0a0a0a' : '#fcfcfc',
        windowWidth: element.scrollWidth,
        windowHeight: element.scrollHeight,
        onclone: (clonedDoc) => {
          // 1. Remove all existing style/link tags in the clone to prevent parsing errors
          clonedDoc.querySelectorAll('style, link[rel="stylesheet"]').forEach(el => el.remove());

          // 2. Re-inject sanitized CSS from the original document
          Array.from(document.styleSheets).forEach(sheet => {
            try {
              let cssText = '';
              const rules = sheet.cssRules || (sheet as any).rules;
              if (rules) {
                for (let i = 0; i < rules.length; i++) {
                  cssText += rules[i].cssText + '\n';
                }
              }
              
              // Aggressively replace modern color functions with safe fallbacks
              const sanitized = cssText
                .replace(/oklch\([^)]+\)/g, '#808080')
                .replace(/oklab\([^)]+\)/g, '#808080');
              
              const styleTag = clonedDoc.createElement('style');
              styleTag.textContent = sanitized;
              clonedDoc.head.appendChild(styleTag);
            } catch (e) {
              // For cross-origin sheets (like Google Fonts), we can't read rules
              // but they usually don't use oklch/oklab, so we can re-add them
              if (sheet.href) {
                const link = clonedDoc.createElement('link');
                link.rel = 'stylesheet';
                link.href = sheet.href;
                clonedDoc.head.appendChild(link);
              }
            }
          });

          // 3. Inject critical UI variable overrides
          const varOverride = clonedDoc.createElement('style');
          varOverride.innerHTML = `
            :root {
              --color-emerald-500: #10b981 !important;
              --color-emerald-600: #059669 !important;
              --color-emerald-400: #34d399 !important;
              --color-red-500: #ef4444 !important;
              --color-amber-500: #f59e0b !important;
              --color-slate-500: #64748b !important;
              --color-slate-900: #0f172a !important;
            }
            * {
              -webkit-print-color-adjust: exact !important;
              color-adjust: exact !important;
            }
          `;
          clonedDoc.head.appendChild(varOverride);

          // 4. Scrub inline styles as a final safety measure
          clonedDoc.querySelectorAll('*').forEach(el => {
            const htmlEl = el as HTMLElement;
            if (htmlEl.style) {
              try {
                for (let i = 0; i < htmlEl.style.length; i++) {
                  const prop = htmlEl.style[i];
                  const val = htmlEl.style.getPropertyValue(prop);
                  if (val && (val.includes('oklch') || val.includes('oklab'))) {
                    htmlEl.style.setProperty(prop, '#808080', 'important');
                  }
                }
              } catch (e) {
                // Ignore style access errors
              }
            }
          });
        }
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [canvas.width, canvas.height]
      });
      
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save(`${report.title.replace(/\s+/g, '_')}_Meridian_Intelligence.pdf`);
      
      // We don't have direct access to showNotification here, but we can log it
      console.log('PDF Downloaded successfully');
    } catch (error) {
      console.error('Download failed:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      ref={reportRef} 
      className={`max-w-6xl mx-auto ${darkMode ? 'bg-[#0a0a0a] text-white border-white/5' : 'bg-[#fcfcfc] text-[#1a1a1a] border-black/5'} shadow-2xl rounded-[2rem] md:rounded-[4rem] border overflow-hidden transition-all duration-700 relative`}
    >
      {/* Dossier Header Strip */}
      <div className="h-2 w-full bg-gradient-to-r from-emerald-500 via-emerald-400 to-emerald-600" />
      
      <div className="flex flex-col lg:flex-row min-h-screen">
        {/* Left Sidebar - Metadata & Controls */}
        <aside className={`lg:w-80 border-b lg:border-b-0 lg:border-r ${darkMode ? 'border-white/5 bg-white/[0.02]' : 'border-black/5 bg-black/[0.01]'} p-6 md:p-8 lg:p-12 flex flex-col justify-between`}>
          <div>
            <div className="flex items-center justify-between lg:block mb-8 lg:mb-12">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
                  <Shield size={16} className="md:size-5" />
                </div>
                <div>
                  <h2 className="text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] leading-none text-black dark:text-white">Meridian</h2>
                  <p className="text-[8px] uppercase tracking-widest opacity-40 mt-1">Grade: Alpha-7</p>
                </div>
              </div>
              
                <div className="lg:hidden flex gap-2">
                  <button 
                    onClick={handleDownload}
                    disabled={isDownloading}
                    className={`p-2 rounded-lg border ${darkMode ? 'border-white/10 bg-white/5' : 'border-black/10 bg-white'}`}
                  >
                    {isDownloading ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
                  </button>
                  <button 
                    onClick={() => setIsShareModalOpen(true)}
                    className={`p-2 rounded-lg border ${darkMode ? 'border-white/10 bg-white/5' : 'border-black/10 bg-white'}`}
                  >
                    <Share2 size={14} />
                  </button>
                </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-1 gap-6 lg:gap-10">
              <section>
                <label className="text-[9px] md:text-[10px] uppercase tracking-[0.2em] font-bold opacity-30 mb-3 md:mb-4 block">Classification</label>
                <div className="flex flex-col gap-2 md:gap-3">
                  <div className={`flex items-center justify-between px-3 md:px-4 py-2 md:py-3 rounded-xl border ${darkMode ? 'border-white/5 bg-white/5' : 'border-black/5 bg-white'} shadow-sm`}>
                    <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest opacity-60">Status</span>
                    <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-emerald-500">Verified</span>
                  </div>
                  <div className={`flex items-center justify-between px-3 md:px-4 py-2 md:py-3 rounded-xl border ${darkMode ? 'border-white/5 bg-white/5' : 'border-black/5 bg-white'} shadow-sm`}>
                    <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest opacity-60">Priority</span>
                    <span className={`text-[9px] md:text-[10px] font-bold uppercase tracking-widest ${report.riskLevel === 'High' ? 'text-red-500' : 'text-amber-500'}`}>
                      {report.riskLevel || 'Standard'}
                    </span>
                  </div>
                </div>
              </section>

              <section>
                <label className="text-[9px] md:text-[10px] uppercase tracking-[0.2em] font-bold opacity-30 mb-3 md:mb-4 block">Temporal Data</label>
                <div className="space-y-2">
                  <div className="flex items-center gap-3 opacity-60">
                    <Clock className="w-3 h-3 md:w-3.5 md:h-3.5" />
                    <span className="text-[10px] md:text-xs font-medium">{format(new Date(report.createdAt), 'MMM d, yyyy · HH:mm')}</span>
                  </div>
                  <div className="flex items-center gap-3 opacity-60">
                    <Fingerprint className="w-3 h-3 md:w-3.5 md:h-3.5" />
                    <span className="text-[9px] md:text-[10px] font-mono uppercase tracking-tighter truncate">HASH: {Math.random().toString(36).substring(7).toUpperCase()}</span>
                  </div>
                </div>
              </section>

              <section className="hidden lg:block">
                <label className="text-[10px] uppercase tracking-[0.2em] font-bold opacity-30 mb-4 block">Actions</label>
                <div className="grid grid-cols-3 gap-3" data-html2canvas-ignore="true">
                  <button 
                    onClick={handleDownload}
                    disabled={isDownloading}
                    className={`aspect-square flex flex-col items-center justify-center gap-2 rounded-2xl border transition-all ${darkMode ? 'border-white/10 hover:bg-white/5' : 'border-black/10 hover:bg-black/5'} group`}
                  >
                    {isDownloading ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} className="group-hover:text-emerald-500 transition-colors" />}
                    <span className="text-[8px] uppercase font-bold tracking-widest">PDF</span>
                  </button>
                  <button 
                    onClick={onEmail}
                    className={`aspect-square flex flex-col items-center justify-center gap-2 rounded-2xl border transition-all ${darkMode ? 'border-white/10 hover:bg-white/5' : 'border-black/10 hover:bg-black/5'} group`}
                  >
                    <Mail size={16} className="group-hover:text-emerald-500 transition-colors" />
                    <span className="text-[8px] uppercase font-bold tracking-widest">Mail</span>
                  </button>
                  <button 
                    onClick={() => setIsShareModalOpen(true)}
                    className={`aspect-square flex flex-col items-center justify-center gap-2 rounded-2xl border transition-all ${darkMode ? 'border-white/10 hover:bg-white/5' : 'border-black/10 hover:bg-black/5'} group`}
                  >
                    <Share2 size={16} className="group-hover:text-emerald-500 transition-colors" />
                    <span className="text-[8px] uppercase font-bold tracking-widest">Link</span>
                  </button>
                </div>
              </section>
            </div>
          </div>

          <div className="hidden lg:block mt-12 pt-12 border-t border-black/5 dark:border-white/5">
              <div className="flex items-center gap-3 opacity-20 grayscale hover:grayscale-0 transition-all cursor-default">
                <Globe2 size={24} />
                <div className="vertical-text text-[8px] font-bold">MERIDIAN GLOBAL NETWORK</div>
              </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 p-6 md:p-12 lg:p-24 overflow-y-auto">
          {/* Header Section */}
          <header className="mb-12 md:mb-20">
            <div className="flex items-center gap-4 mb-6 md:mb-8">
              <div className="h-[1px] flex-1 bg-black/10 dark:bg-white/10" />
              <span className="text-[8px] md:text-[10px] uppercase tracking-[0.4em] font-bold opacity-30 text-center">Strategic Intelligence Briefing</span>
              <div className="h-[1px] flex-1 bg-black/10 dark:bg-white/10" />
            </div>

            <h1 className="serif text-3xl md:text-5xl lg:text-7xl font-light leading-[1.1] mb-8 md:mb-12 tracking-tight">
              <HighlightedText text={report.title} />
            </h1>

            {report.summary && (
              <div className="relative pl-6 md:pl-0">
                <div className="absolute left-0 md:-left-10 top-0 bottom-0 w-[2px] bg-emerald-500/30" />
                <p className="serif text-lg md:text-2xl lg:text-3xl font-light leading-relaxed italic-small opacity-80 max-w-4xl whitespace-pre-wrap">
                  <HighlightedText text={report.summary} />
                </p>
              </div>
            )}
          </header>

          {/* Visual Data Section */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-12 md:gap-16 mb-16 md:mb-24">
            <div className="xl:col-span-8">
              {report.imageUrl && (
                <div className="rounded-2xl md:rounded-[2.5rem] overflow-hidden border border-black/5 dark:border-white/5 shadow-2xl mb-8 md:mb-12 group relative">
                  <img 
                    src={report.imageUrl} 
                    alt={report.title} 
                    className="w-full aspect-[16/9] object-cover group-hover:scale-105 transition-transform duration-1000"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-4 md:p-8">
                    <p className="text-white text-[8px] md:text-xs font-medium tracking-widest uppercase">Satellite Imagery Analysis · Ref: {Math.floor(Math.random() * 99999)}</p>
                  </div>
                </div>
              )}

              {report.marketTrendData && report.marketTrendData.length > 0 && (
                <section className={`p-6 md:p-12 rounded-2xl md:rounded-[2.5rem] border ${darkMode ? 'bg-white/[0.02] border-white/5' : 'bg-black/[0.01] border-black/5'}`}>
                  <div className="flex justify-between items-end mb-8 md:mb-10">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <h3 className="text-[9px] md:text-[10px] uppercase tracking-[0.2em] font-bold opacity-40">Market Pulse Analytics</h3>
                    </div>
                    {scrubbedData && (
                      <div className="text-right">
                        <p className="text-[8px] md:text-[10px] uppercase tracking-widest opacity-40 font-mono">{scrubbedData.date}</p>
                        <p className="text-xl md:text-3xl font-light tracking-tighter text-emerald-500 mono">{scrubbedData.value.toFixed(1)}%</p>
                      </div>
                    )}
                  </div>
                  <div className="h-[200px] md:h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart 
                        data={report.marketTrendData}
                        onMouseMove={(e: any) => e.activePayload && setScrubbedData(e.activePayload[0].payload)}
                        onMouseLeave={() => setScrubbedData(null)}
                      >
                        <defs>
                          <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={darkMode ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)"} />
                        <XAxis 
                          dataKey="date" 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fontSize: 8, fill: darkMode ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.3)", fontWeight: 600 }}
                          dy={10}
                        />
                        <YAxis hide domain={[0, 100]} />
                        <Tooltip content={() => null} />
                        <Area 
                          type="monotone" 
                          dataKey="value" 
                          stroke="#10b981" 
                          strokeWidth={3}
                          fillOpacity={1} 
                          fill="url(#colorValue)" 
                          animationDuration={2000}
                          activeDot={{ r: 5, strokeWidth: 0, fill: '#10b981' }}
                        />
                        {scrubbedData && (
                          <ReferenceLine 
                            x={scrubbedData.date} 
                            stroke={darkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"} 
                            strokeDasharray="4 4" 
                          />
                        )}
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </section>
              )}
            </div>

            <div className="xl:col-span-4 space-y-6 md:space-y-8">
              {/* Key Indicators Dossier */}
              <section className={`p-6 md:p-8 rounded-2xl md:rounded-[2.5rem] border ${darkMode ? 'bg-white/[0.02] border-white/5' : 'bg-black/[0.01] border-black/5'}`}>
                <div className="flex items-center gap-3 mb-6 md:mb-8">
                  <BarChart3 className="w-3.5 h-3.5 md:w-4 md:h-4 opacity-40" />
                  <h3 className="text-[9px] md:text-[10px] uppercase tracking-[0.2em] font-bold opacity-40">Key Indicators</h3>
                </div>
                <div className="space-y-5 md:space-y-6">
                  {report.keyMetrics?.map((metric, i) => (
                    <div key={i} className="group cursor-default">
                      <div className="flex justify-between items-end mb-1.5 md:mb-2">
                        <span className="text-[9px] md:text-[10px] uppercase tracking-widest font-bold opacity-40 group-hover:opacity-100 transition-opacity">
                          <HighlightedText text={metric.label} />
                        </span>
                        <div className={metric.trend === 'up' ? 'text-emerald-500' : metric.trend === 'down' ? 'text-red-500' : 'text-amber-500'}>
                          {metric.trend === 'up' ? <TrendingUp className="w-3 h-3 md:w-3.5 md:h-3.5" /> : metric.trend === 'down' ? <TrendingDown className="w-3 h-3 md:w-3.5 md:h-3.5" /> : <Minus className="w-3 h-3 md:w-3.5 md:h-3.5" />}
                        </div>
                      </div>
                      <div className="text-xl md:text-2xl font-light tracking-tight mono">
                        <HighlightedText text={metric.value} />
                      </div>
                      <div className="h-[2px] w-full bg-black/5 dark:bg-white/5 mt-2 md:mt-3 overflow-hidden">
                        <motion.div 
                          initial={{ x: '-100%' }}
                          animate={{ x: '0%' }}
                          transition={{ duration: 1, delay: i * 0.1 }}
                          className={`h-full w-full ${metric.trend === 'up' ? 'bg-emerald-500' : metric.trend === 'down' ? 'bg-red-500' : 'bg-amber-500'} opacity-30`} 
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Sentiment & Risk Dossier */}
              <section className="grid grid-cols-2 gap-3 md:gap-4">
                <div className={`p-4 md:p-6 rounded-xl md:rounded-[2rem] border ${darkMode ? 'bg-white/[0.02] border-white/5' : 'bg-black/[0.01] border-black/5'} flex flex-col items-center text-center`}>
                  <Activity className="w-4 h-4 md:w-5 md:h-5 opacity-20 mb-3 md:mb-4" />
                  <span className="text-[7px] md:text-[8px] uppercase tracking-[0.2em] font-bold opacity-40 mb-1.5 md:mb-2">Sentiment</span>
                  <span className={`text-lg md:text-2xl font-light mono ${getSentimentColor(report.sentimentScore || 50)}`}>
                    {report.sentimentScore}%
                  </span>
                </div>
                <div className={`p-4 md:p-6 rounded-xl md:rounded-[2rem] border ${darkMode ? 'bg-white/[0.02] border-white/5' : 'bg-black/[0.01] border-black/5'} flex flex-col items-center text-center`}>
                  <AlertTriangle className="w-4 h-4 md:w-5 md:h-5 opacity-20 mb-3 md:mb-4" />
                  <span className="text-[7px] md:text-[8px] uppercase tracking-[0.2em] font-bold opacity-40 mb-1.5 md:mb-2">Risk Level</span>
                  <span className={`text-lg md:text-2xl font-light mono ${getRiskColor(report.riskLevel || 'Low')}`}>
                    {report.riskLevel}
                  </span>
                </div>
              </section>
            </div>
          </div>

          {/* Intelligence Briefings - Dossier Style */}
          <section className="mb-16 md:mb-24">
            <div className="flex items-center gap-4 mb-8 md:mb-12">
              <FileText className="w-4 h-4 md:w-[18px] md:h-[18px] opacity-40" />
              <h3 className="text-[9px] md:text-[10px] uppercase tracking-[0.3em] font-bold opacity-40">Intelligence Dossiers</h3>
              <div className="h-[1px] flex-1 bg-black/5 dark:bg-white/5" />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
              {report.articleSummaries?.map((article, i) => (
                <motion.div 
                  key={i}
                  whileHover={{ y: -5 }}
                  className={`p-6 md:p-10 rounded-2xl md:rounded-[3rem] border transition-all duration-500 group relative overflow-hidden ${darkMode ? 'bg-white/[0.02] border-white/10 hover:border-emerald-500/30' : 'bg-white border-black/5 hover:border-emerald-500/30 shadow-sm hover:shadow-xl'}`}
                >
                  <div className="absolute top-0 right-0 p-6 md:p-8 opacity-5 group-hover:opacity-20 transition-opacity">
                    <Bookmark className="w-[30px] h-[30px] md:w-10 md:h-10" />
                  </div>
                  <div className="flex items-center gap-3 mb-6 md:mb-8">
                    <span className="text-[9px] md:text-[10px] font-mono opacity-30">REF: {Math.floor(Math.random() * 9999)}</span>
                    <div className="w-4 h-[1px] bg-emerald-500" />
                  </div>
                  <h4 className="serif text-xl md:text-2xl font-medium mb-4 md:mb-6 leading-tight group-hover:text-emerald-500 transition-colors whitespace-pre-wrap">
                    <HighlightedText text={article.title} />
                  </h4>
                  <p className="text-xs md:text-sm opacity-60 leading-relaxed font-light whitespace-pre-wrap">
                    <HighlightedText text={article.summary} />
                  </p>
                </motion.div>
              ))}
            </div>
          </section>

          {/* Main Analysis Content */}
          <section className="mb-16 md:mb-24 relative">
             <div className="absolute -left-12 top-0 bottom-0 w-[1px] bg-black/5 dark:bg-white/5 hidden xl:block" />
             <div className={`markdown-body ${darkMode ? 'dark' : ''} max-w-none text-sm md:text-base`}>
                <Markdown components={components}>{report.content}</Markdown>
             </div>
          </section>

          {/* Sources & Footer */}
          {report.sources && report.sources.length > 0 && (
            <footer className={`pt-16 border-t ${darkMode ? 'border-white/10' : 'border-black/10'}`}>
              <div className="flex items-center gap-3 mb-10">
                <Globe2 size={16} className="opacity-40" />
                <h3 className="text-[10px] uppercase tracking-[0.3em] font-bold opacity-40">Source Provenance</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {report.sources.map((source, i) => (
                  <a 
                    key={i} 
                    href={source} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className={`flex items-center gap-4 p-4 rounded-2xl border transition-all group ${darkMode ? 'bg-white/5 border-white/5 hover:bg-white/10' : 'bg-black/5 border-black/5 hover:bg-black/10'}`}
                  >
                    <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500 group-hover:scale-110 transition-transform">
                      <ExternalLink size={14} />
                    </div>
                    <span className="text-[10px] font-medium truncate opacity-60 group-hover:opacity-100 transition-opacity">{source}</span>
                  </a>
                ))}
              </div>
              
              <div className="mt-24 flex flex-col items-center justify-center text-center opacity-20">
                <div className="w-12 h-12 rounded-full border border-current flex items-center justify-center mb-4">
                  <Shield size={20} />
                </div>
                <p className="text-[8px] uppercase tracking-[0.5em] font-bold">End of Intelligence Briefing</p>
                <p className="text-[8px] uppercase tracking-widest mt-2 text-black/60 dark:text-white/40">Meridian Global Intelligence Network · Classified Alpha-7</p>
              </div>

              {/* Archive Transition Dropdown */}
              {allReports.length > 1 && (
                <div className="mt-24 pt-12 border-t border-black/5 dark:border-white/5 flex flex-col items-center">
                  <p className="text-[10px] uppercase tracking-[0.3em] font-bold opacity-30 mb-6">Transition to Archives</p>
                  <div className="relative w-full max-w-md">
                    <button 
                      onClick={() => setIsArchiveDropdownOpen(!isArchiveDropdownOpen)}
                      className={`w-full flex items-center justify-between px-6 py-4 rounded-2xl border transition-all ${darkMode ? 'bg-white/5 border-white/10 hover:bg-white/10' : 'bg-white border-black/10 hover:bg-black/5 shadow-sm'}`}
                    >
                      <span className="text-xs font-medium opacity-60">Select another report...</span>
                      <ChevronRight size={16} className={cn("transition-transform opacity-40", isArchiveDropdownOpen ? "rotate-90" : "")} />
                    </button>
                    
                    <AnimatePresence>
                      {isArchiveDropdownOpen && (
                        <>
                          <div className="fixed inset-0 z-40" onClick={() => setIsArchiveDropdownOpen(false)} />
                          <motion.div 
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            className={`absolute bottom-full left-0 mb-4 w-full max-h-80 overflow-y-auto rounded-3xl shadow-2xl z-50 p-4 border ${darkMode ? 'bg-[#1a1a1a] border-white/10' : 'bg-white border-black/10'} custom-scrollbar`}
                          >
                            <div className="space-y-1">
                              {allReports
                                .filter(r => r.id !== report.id)
                                .map((r) => (
                                  <button 
                                    key={r.id} 
                                    onClick={() => {
                                      onSelectReport?.(r);
                                      setIsArchiveDropdownOpen(false);
                                    }} 
                                    className={`w-full text-left px-4 py-3 rounded-xl text-xs transition-all flex flex-col gap-1 ${darkMode ? 'hover:bg-white/5' : 'hover:bg-black/5'}`}
                                  >
                                    <span className="font-medium truncate">{r.title}</span>
                                    <span className="text-[9px] opacity-40 uppercase tracking-widest">
                                      {format(new Date(r.createdAt), 'MMM d, yyyy')}
                                    </span>
                                  </button>
                                ))}
                            </div>
                          </motion.div>
                        </>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              )}
            </footer>
          )}
        </main>
      </div>
      <AnimatePresence>
        {isShareModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsShareModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className={`relative w-full max-w-sm ${darkMode ? 'bg-[#1a1a1a] border-white/10' : 'bg-white border-black/10'} rounded-[2.5rem] border p-8 premium-shadow`}
            >
              <h3 className="text-xl font-bold dark:text-white mb-6">Share Intelligence</h3>
              
              <div className="grid grid-cols-2 gap-4 mb-8">
                <a 
                  href={shareLinks.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex flex-col items-center justify-center gap-3 p-6 rounded-2xl border transition-all ${darkMode ? 'border-white/5 bg-white/5 hover:bg-white/10' : 'border-black/5 bg-black/5 hover:bg-black/10'}`}
                >
                  <Twitter size={20} className="text-blue-400" />
                  <span className="text-[10px] uppercase font-bold tracking-widest opacity-60">Twitter</span>
                </a>
                <a 
                  href={shareLinks.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex flex-col items-center justify-center gap-3 p-6 rounded-2xl border transition-all ${darkMode ? 'border-white/5 bg-white/5 hover:bg-white/10' : 'border-black/5 bg-black/5 hover:bg-black/10'}`}
                >
                  <Linkedin size={20} className="text-blue-600" />
                  <span className="text-[10px] uppercase font-bold tracking-widest opacity-60">LinkedIn</span>
                </a>
                <a 
                  href={shareLinks.email}
                  className={`flex flex-col items-center justify-center gap-3 p-6 rounded-2xl border transition-all ${darkMode ? 'border-white/5 bg-white/5 hover:bg-white/10' : 'border-black/5 bg-black/5 hover:bg-black/10'}`}
                >
                  <Mail size={20} className="text-emerald-500" />
                  <span className="text-[10px] uppercase font-bold tracking-widest opacity-60">Email</span>
                </a>
                <button 
                  onClick={handleCopyLink}
                  className={`flex flex-col items-center justify-center gap-3 p-6 rounded-2xl border transition-all ${darkMode ? 'border-white/5 bg-white/5 hover:bg-white/10' : 'border-black/5 bg-black/5 hover:bg-black/10'}`}
                >
                  {copied ? <Check size={20} className="text-emerald-500" /> : <Copy size={20} className="opacity-40" />}
                  <span className="text-[10px] uppercase font-bold tracking-widest opacity-60">{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              <button 
                onClick={() => setIsShareModalOpen(false)}
                className="w-full py-4 rounded-xl bg-black/5 dark:bg-white/5 text-[10px] font-bold uppercase tracking-widest dark:text-white hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
              >
                Close
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
