import React, { useRef, useState } from 'react';
import Markdown from 'react-markdown';
import { format } from 'date-fns';
import { ExternalLink, Clock, Share2, Mail, TrendingUp, TrendingDown, Minus, AlertTriangle, Info, BarChart3, Activity, Download, Loader2 } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Brush, ReferenceLine } from 'recharts';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface ReportViewProps {
  report: {
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
}

export const ReportView: React.FC<ReportViewProps> = ({ report, onEmail, onShare, darkMode, searchQuery }) => {
  const reportRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const HighlightedText = ({ text }: { text: string }) => {
    if (!searchQuery || !searchQuery.trim()) return <>{text}</>;
    
    // Escape special regex characters
    const escapedQuery = searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const parts = text.split(new RegExp(`(${escapedQuery})`, 'gi'));
    
    return (
      <>
        {parts.map((part, i) => 
          part.toLowerCase() === searchQuery.toLowerCase() ? (
            <mark key={i} className="bg-emerald-500/30 text-emerald-900 dark:text-emerald-100 rounded-sm px-0.5 border-b-2 border-emerald-500">
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
      if (typeof child === 'string') {
        return <HighlightedText text={child} />;
      }
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
    if (score > 60) return darkMode ? 'text-emerald-400 bg-emerald-900/20 border-emerald-800/30' : 'text-emerald-600 bg-emerald-50 border-emerald-100';
    if (score < 40) return darkMode ? 'text-red-400 bg-red-900/20 border-red-800/30' : 'text-red-600 bg-red-50 border-red-100';
    return darkMode ? 'text-amber-400 bg-amber-900/20 border-amber-800/30' : 'text-amber-600 bg-amber-50 border-amber-100';
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'High': return darkMode ? 'text-red-400 bg-red-900/20 border-red-800/30' : 'text-red-600 bg-red-50 border-red-100';
      case 'Medium': return darkMode ? 'text-amber-400 bg-amber-900/20 border-amber-800/30' : 'text-amber-600 bg-amber-50 border-amber-100';
      default: return darkMode ? 'text-emerald-400 bg-emerald-900/20 border-emerald-800/30' : 'text-emerald-600 bg-emerald-50 border-emerald-100';
    }
  };

  const handleDownload = async () => {
    if (!reportRef.current) return;
    setIsDownloading(true);
    try {
      const element = reportRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: darkMode ? '#0a0a0a' : '#fcfcfc'
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [canvas.width, canvas.height]
      });
      
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save(`${report.title.replace(/\s+/g, '_')}_Aura_Intelligence.pdf`);
    } catch (error) {
      console.error('Download failed:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  const [scrubbedData, setScrubbedData] = useState<{ date: string, value: number } | null>(null);

  return (
    <div ref={reportRef} className={`max-w-5xl mx-auto ${darkMode ? 'bg-[#0a0a0a] text-white border-white/5' : 'bg-[#fcfcfc] text-[#1a1a1a] border-black/5'} shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)] rounded-[3rem] border overflow-hidden transition-all duration-500`}>
      {report.imageUrl && (
        <div className="w-full h-[30rem] overflow-hidden relative group">
          <img 
            src={report.imageUrl} 
            alt={report.title} 
            className="w-full h-full object-cover scale-105 group-hover:scale-100 transition-transform duration-1000"
            referrerPolicy="no-referrer"
          />
          <div className={`absolute inset-0 bg-gradient-to-t ${darkMode ? 'from-[#0a0a0a]' : 'from-[#fcfcfc]'} via-transparent to-transparent opacity-90`} />
        </div>
      )}

      <div className={`p-8 md:p-20 ${report.imageUrl ? '-mt-32' : 'mt-0'} relative z-10`}>
        <header className={`mb-16 border-b ${darkMode ? 'border-white/10' : 'border-black/10'} pb-12`}>
          <div className="flex justify-between items-start mb-8">
            <div className="flex flex-col gap-1">
              <span className={`text-[10px] uppercase tracking-[0.3em] font-bold ${darkMode ? 'text-white/40' : 'text-black/40'}`}>
                Intelligence Report
              </span>
              <span className={`text-xs font-medium ${darkMode ? 'text-white/60' : 'text-black/60'}`}>
                {format(new Date(report.createdAt), 'MMMM d, yyyy')}
              </span>
            </div>
            <div className="flex gap-4">
              <button 
                onClick={handleDownload}
                disabled={isDownloading}
                className={`w-12 h-12 flex items-center justify-center ${darkMode ? 'bg-white/10 hover:bg-white/20 border-white/10' : 'bg-black/5 hover:bg-black/10 border-black/10'} rounded-full border transition-all shadow-sm disabled:opacity-50`}
                title="Download PDF"
              >
                {isDownloading ? <Loader2 size={20} className={`animate-spin ${darkMode ? 'text-white' : 'text-black'}`} /> : <Download size={20} className={darkMode ? 'text-white' : 'text-black'} />}
              </button>
              {onEmail && (
                <button 
                  onClick={onEmail}
                  className={`w-12 h-12 flex items-center justify-center ${darkMode ? 'bg-white/10 hover:bg-white/20 border-white/10' : 'bg-black/5 hover:bg-black/10 border-black/10'} rounded-full border transition-all shadow-sm`}
                  title="Email Report"
                >
                  <Mail size={20} className={darkMode ? 'text-white' : 'text-black'} />
                </button>
              )}
              {onShare && (
                <button 
                  onClick={onShare}
                  className={`w-12 h-12 flex items-center justify-center ${darkMode ? 'bg-white/10 hover:bg-white/20 border-white/10' : 'bg-black/5 hover:bg-black/10 border-black/10'} rounded-full border transition-all shadow-sm`}
                  title="Share Report"
                >
                  <Share2 size={20} className={darkMode ? 'text-white' : 'text-black'} />
                </button>
              )}
            </div>
          </div>
          
          <h1 className="serif text-4xl md:text-6xl font-light leading-[1.05] mb-12 tracking-tight break-words">
            <HighlightedText text={report.title} />
          </h1>

          <div className="flex flex-wrap gap-4 items-center">
            {report.reportType === 'nexus' && (
              <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest px-4 py-2 rounded-full border bg-black text-white dark:bg-white dark:text-black border-transparent shadow-lg animate-pulse">
                <TrendingUp size={12} />
                <span>Nexus Intelligence</span>
              </div>
            )}
            <div className={`flex items-center gap-2 ${darkMode ? 'text-white/60 bg-white/5 border-white/5' : 'text-black/60 bg-white/50 border-black/5'} text-[11px] font-bold uppercase tracking-widest px-4 py-2 rounded-full border`}>
              <Clock size={12} />
              <span>12 min read</span>
            </div>
            {report.riskLevel && (
              <div className={`flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest px-4 py-2 rounded-full border ${getRiskColor(report.riskLevel)}`}>
                <AlertTriangle size={12} />
                <span>Risk: {report.riskLevel}</span>
              </div>
            )}
            {report.sentimentScore !== undefined && (
              <div className={`flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest px-4 py-2 rounded-full border ${getSentimentColor(report.sentimentScore)}`}>
                <Activity size={12} />
                <span>Sentiment: {report.sentimentScore}%</span>
              </div>
            )}
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-20">
          <div className="lg:col-span-7">
            {report.summary && (
              <section className="mb-12">
                <div className={`flex items-center gap-2 mb-6 ${darkMode ? 'text-white/40' : 'text-black/40'}`}>
                  <Info size={16} />
                  <h3 className="text-[10px] uppercase tracking-[0.2em] font-bold">Executive Summary</h3>
                </div>
                <p className="serif text-3xl md:text-4xl font-light leading-snug italic-small opacity-90 border-l-4 border-emerald-500/20 pl-10 py-4 mb-8">
                  <HighlightedText text={report.summary} />
                </p>
              </section>
            )}

            {report.marketTrendData && report.marketTrendData.length > 0 && (
              <section className="mb-12">
                <div className="flex justify-between items-end mb-6">
                  <div className={`flex items-center gap-2 ${darkMode ? 'text-white/40' : 'text-black/40'}`}>
                    <BarChart3 size={16} />
                    <h3 className="text-[10px] uppercase tracking-[0.2em] font-bold">Market Pulse Trend</h3>
                  </div>
                  {scrubbedData && (
                    <div className="text-right animate-in fade-in slide-in-from-right-4 duration-300">
                      <p className={`text-[10px] uppercase tracking-widest ${darkMode ? 'text-white/40' : 'text-black/40'}`}>{scrubbedData.date}</p>
                      <p className="text-2xl font-light tracking-tighter text-emerald-500">{scrubbedData.value.toFixed(1)}%</p>
                    </div>
                  )}
                </div>
                <div className={`h-[320px] w-full ${darkMode ? 'bg-white/5' : 'bg-black/5'} rounded-3xl p-6 border ${darkMode ? 'border-white/5' : 'border-black/5'} relative group`}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart 
                      data={report.marketTrendData}
                      onMouseMove={(e: any) => {
                        if (e.activePayload && e.activePayload.length > 0) {
                          setScrubbedData(e.activePayload[0].payload);
                        }
                      }}
                      onMouseLeave={() => setScrubbedData(null)}
                    >
                      <defs>
                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={darkMode ? "#10b981" : "#059669"} stopOpacity={0.4}/>
                          <stop offset="95%" stopColor={darkMode ? "#10b981" : "#059669"} stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={darkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"} />
                      <XAxis 
                        dataKey="date" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fontSize: 10, fill: darkMode ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.4)" }}
                        dy={10}
                      />
                      <YAxis hide domain={[0, 100]} />
                      <Tooltip 
                        content={() => null} // We use custom display above
                      />
                      <Area 
                        type="monotone" 
                        dataKey="value" 
                        stroke={darkMode ? "#10b981" : "#059669"} 
                        strokeWidth={4}
                        fillOpacity={1} 
                        fill="url(#colorValue)" 
                        animationDuration={1500}
                        activeDot={{ r: 6, strokeWidth: 0, fill: '#10b981' }}
                      />
                      {scrubbedData && (
                        <ReferenceLine 
                          x={scrubbedData.date} 
                          stroke={darkMode ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.2)"} 
                          strokeDasharray="3 3" 
                        />
                      )}
                      <Brush 
                        dataKey="date" 
                        height={30} 
                        stroke={darkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}
                        fill={darkMode ? "rgba(0,0,0,0.2)" : "rgba(255,255,255,0.5)"}
                        travellerWidth={10}
                        gap={5}
                      >
                        <AreaChart>
                          <Area type="monotone" dataKey="value" stroke="#10b981" fill="#10b981" fillOpacity={0.1} />
                        </AreaChart>
                      </Brush>
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </section>
            )}
          </div>

          <div className="lg:col-span-5">
            {report.keyMetrics && report.keyMetrics.length > 0 && (
              <section className="mb-12">
                <h3 className={`text-[10px] uppercase tracking-[0.2em] font-bold ${darkMode ? 'text-white/40' : 'text-black/40'} mb-6`}>Key Market Indicators</h3>
                <div className="grid grid-cols-1 gap-3">
                  {report.keyMetrics.map((metric, i) => (
                    <div key={i} className={`${darkMode ? 'bg-white/5 border-white/5' : 'bg-white border-black/5'} p-5 rounded-2xl border shadow-sm flex items-center justify-between group hover:border-emerald-500/30 transition-all`}>
                      <div>
                        <p className={`text-[10px] uppercase tracking-wider ${darkMode ? 'text-white/40' : 'text-black/40'} mb-1`}>
                          <HighlightedText text={metric.label} />
                        </p>
                        <span className="text-xl font-semibold tracking-tight">
                          <HighlightedText text={metric.value} />
                        </span>
                      </div>
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        metric.trend === 'up' ? 'bg-emerald-500/10 text-emerald-500' : 
                        metric.trend === 'down' ? 'bg-red-500/10 text-red-500' : 
                        'bg-amber-500/10 text-amber-500'
                      }`}>
                        {metric.trend === 'up' && <TrendingUp size={18} />}
                        {metric.trend === 'down' && <TrendingDown size={18} />}
                        {metric.trend === 'neutral' && <Minus size={18} />}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>

        {report.articleSummaries && report.articleSummaries.length > 0 && (
          <section className="mb-20">
            <h3 className={`text-[10px] uppercase tracking-[0.2em] font-bold ${darkMode ? 'text-white/40' : 'text-black/40'} mb-8`}>Intelligence Briefings</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {report.articleSummaries.map((article, i) => (
                <div key={i} className={`${darkMode ? 'bg-white/5 border-white/10' : 'bg-white border-black/5'} p-10 rounded-[2.5rem] border shadow-sm hover:shadow-2xl transition-all duration-500 group`}>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-[1px] bg-emerald-500" />
                    <span className="text-[10px] uppercase tracking-[0.2em] font-bold opacity-40">Briefing {i + 1}</span>
                  </div>
                  <h4 className="serif text-2xl font-medium mb-6 leading-tight group-hover:text-emerald-500 transition-colors">
                    <HighlightedText text={article.title} />
                  </h4>
                  <p className="text-base opacity-60 leading-relaxed font-light">
                    <HighlightedText text={article.summary} />
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        <div className={`markdown-body ${darkMode ? 'dark' : ''} max-w-none break-words`}>
          <Markdown components={components}>{report.content}</Markdown>
        </div>

        {report.sources && report.sources.length > 0 && (
          <footer className={`mt-24 pt-12 border-t ${darkMode ? 'border-white/10' : 'border-black/10'}`}>
            <h3 className={`text-[10px] uppercase tracking-[0.2em] font-bold ${darkMode ? 'text-white/40' : 'text-black/40'} mb-8`}>Intelligence Sources</h3>
            <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {report.sources.map((source, i) => (
                <li key={i} className={`flex items-center gap-3 text-xs ${darkMode ? 'text-white/40 hover:text-white' : 'text-black/40 hover:text-black'} transition-colors group`}>
                  <div className={`w-8 h-8 flex items-center justify-center rounded-lg ${darkMode ? 'bg-white/5' : 'bg-black/5'} group-hover:bg-emerald-500/20 group-hover:text-emerald-500 transition-all`}>
                    <ExternalLink size={14} />
                  </div>
                  <a href={source} target="_blank" rel="noopener noreferrer" className="truncate underline underline-offset-4 decoration-current/20 hover:decoration-current transition-all">
                    {source}
                  </a>
                </li>
              ))}
            </ul>
          </footer>
        )}
      </div>
    </div>
  );
};
