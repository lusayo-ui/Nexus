import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ReportView } from './components/ReportView';
import { SkeletonLoader } from './components/SkeletonLoader';
import { GeopoliticalMap } from './components/GeopoliticalMap';
import { RelationshipGraph } from './components/RelationshipGraph';
import { DeltaComparison } from './components/DeltaComparison';
import { generatePremiumReport, generateNexusReport, generateDeltaReport } from './services/geminiService';
import { db, handleFirestoreError, OperationType } from './firebase';
import { collection, addDoc, query, where, orderBy, onSnapshot, limit, serverTimestamp } from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import { Newspaper, Settings, History, LogOut, ChevronRight, Loader2, Sparkles, Globe, TrendingUp, ShieldCheck, Moon, Sun, Search, Filter, Zap, BarChart3, ListChecks, Maximize2, Share2, Map, GitBranch, ArrowRightLeft } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const Dashboard = () => {
  const { user, profile, logout, updateProfile } = useAuth();
  const [reports, setReports] = useState<any[]>([]);
  const [activeReport, setActiveReport] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [reportType, setReportType] = useState<'traditional' | 'nexus'>('traditional');
  const [view, setView] = useState<'latest' | 'history' | 'settings' | 'map' | 'graph' | 'delta'>('latest');
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('aura-dark-mode') === 'true');
  const [searchQuery, setSearchQuery] = useState('');
  const [latestSearchQuery, setLatestSearchQuery] = useState('');
  const [filterTopic, setFilterTopic] = useState('All');
  const [sortBy, setSortBy] = useState<'date' | 'sentiment' | 'risk'>('date');
  const [selectedTopic, setSelectedTopic] = useState<string>('All');
  const [selectedReportsForDelta, setSelectedReportsForDelta] = useState<any[]>([]);
  const [deltaReport, setDeltaReport] = useState<any>(null);
  const [comparedReports, setComparedReports] = useState<{ a: any, b: any } | null>(null);
  const [isComparing, setIsComparing] = useState(false);

  useEffect(() => {
    localStorage.setItem('aura-dark-mode', darkMode.toString());
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
  };

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'reports'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc'),
      limit(10)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const reportsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate()?.toISOString() || new Date().toISOString()
      }));
      setReports(reportsData);
      if (reportsData.length > 0 && !activeReport) {
        setActiveReport(reportsData[0]);
      }
      setIsInitialLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'reports');
      setIsInitialLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const handleGenerate = async () => {
    if (!user) return;
    setIsGenerating(true);
    setGenerationProgress(0);
    
    const messages = [
      "Scanning global market data...",
      "Analyzing geopolitical shifts...",
      "Evaluating economic indicators...",
      "Synthesizing risk assessments...",
      "Drafting executive summary...",
      "Finalizing intelligence briefing..."
    ];
    setLoadingMessage(messages[0]);

    // Simulate progress and cycle messages
    let messageIndex = 0;
    const progressInterval = setInterval(() => {
      setGenerationProgress(prev => {
        if (prev >= 95) return prev;
        const increment = Math.random() * 10;
        const next = Math.min(prev + increment, 95);
        
        // Update message based on progress
        const targetMessageIndex = Math.floor((next / 100) * messages.length);
        if (targetMessageIndex > messageIndex && targetMessageIndex < messages.length) {
          messageIndex = targetMessageIndex;
          setLoadingMessage(messages[messageIndex]);
        }
        
        return next;
      });
    }, 800);

    try {
      const topicsToUse = selectedTopic === 'All' ? (profile?.topics || []) : [selectedTopic];
      const options = {
        length: profile?.reportLength || 'Standard',
        dataPoints: profile?.dataPoints || [],
        analyticalFramework: profile?.analyticalFramework || 'None'
      };
      
      const newReport = reportType === 'traditional' 
        ? await generatePremiumReport(topicsToUse, options)
        : await generateNexusReport(topicsToUse, options);
        
      setGenerationProgress(100);
      setLoadingMessage("Briefing complete.");
      
      const reportDoc = {
        userId: user.uid,
        title: newReport.title,
        summary: newReport.summary,
        content: newReport.content,
        sentimentScore: newReport.sentimentScore,
        riskLevel: newReport.riskLevel,
        imageUrl: newReport.imageUrl,
        keyMetrics: newReport.keyMetrics,
        articleSummaries: newReport.articleSummaries,
        marketTrendData: newReport.marketTrendData,
        sources: newReport.sources,
        geopoliticalRisk: newReport.geopoliticalRisk || [],
        entities: newReport.entities || [],
        reportType: newReport.reportType,
        createdAt: serverTimestamp()
      };
      const docRef = await addDoc(collection(db, 'reports'), reportDoc);
      setActiveReport({ id: docRef.id, ...reportDoc, createdAt: new Date().toISOString() });
      setView('latest');
      showNotification("Intelligence synthesized successfully.");

      // Automatically send email after generation
      await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          reportTitle: newReport.title,
          reportContent: newReport.content
        })
      });
    } catch (error) {
      console.error("Generation failed:", error);
      showNotification("Synthesis failed. Please check your connection.", "error");
    } finally {
      clearInterval(progressInterval);
      setTimeout(() => {
        setIsGenerating(false);
        setGenerationProgress(0);
      }, 500);
    }
  };

  const handleDeltaGenerate = async () => {
    if (selectedReportsForDelta.length !== 2) return;
    setIsComparing(true);
    try {
      const [reportA, reportB] = [...selectedReportsForDelta].sort((a, b) => 
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
      const delta = await generateDeltaReport(reportA, reportB);
      setDeltaReport(delta);
      setComparedReports({ a: reportA, b: reportB });
      setView('delta');
    } catch (error) {
      console.error("Delta generation error:", error);
      showNotification("Failed to generate Delta analysis.", "error");
    } finally {
      setIsComparing(false);
    }
  };

  const toggleReportForDelta = (report: any) => {
    setSelectedReportsForDelta(prev => {
      const isSelected = prev.some(r => r.id === report.id);
      if (isSelected) {
        return prev.filter(r => r.id !== report.id);
      }
      if (prev.length >= 2) {
        return [prev[1], report];
      }
      return [...prev, report];
    });
  };

  const handleEmail = async () => {
    if (!user || !activeReport) return;
    try {
      await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          reportTitle: activeReport.title,
          reportContent: activeReport.content
        })
      });
      showNotification("Intelligence report dispatched to your email.");
    } catch (error) {
      console.error("Email failed:", error);
      showNotification("Failed to dispatch email.", "error");
    }
  };

  const handleShare = async () => {
    if (!activeReport) return;
    const shareData = {
      title: activeReport.title,
      text: `Check out this intelligence report: ${activeReport.title}`,
      url: window.location.href
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        showNotification("Link copied to clipboard.");
      }
    } catch (error) {
      console.error("Share failed:", error);
    }
  };

  const handleTopicToggle = async (topic: string) => {
    if (!profile) return;
    const currentTopics = profile.topics || [];
    const newTopics = currentTopics.includes(topic)
      ? currentTopics.filter((t: string) => t !== topic)
      : [...currentTopics, topic];
    
    await updateProfile({ topics: newTopics });
  };

  const handleTimeChange = async (time: string) => {
    await updateProfile({ deliveryTime: time });
  };

  const handleLengthChange = async (length: string) => {
    await updateProfile({ reportLength: length });
  };

  const handleFrameworkChange = async (framework: string) => {
    await updateProfile({ analyticalFramework: framework });
  };

  const handleDataPointToggle = async (point: string) => {
    if (!profile) return;
    const currentPoints = profile.dataPoints || [];
    const newPoints = currentPoints.includes(point)
      ? currentPoints.filter((p: string) => p !== point)
      : [...currentPoints, point];
    
    await updateProfile({ dataPoints: newPoints });
  };

  const filteredReports = reports.filter(report => {
    const searchTerms = searchQuery.toLowerCase().split(' ').filter(term => term.length > 0);
    const matchesSearch = searchTerms.length === 0 || searchTerms.every(term => 
      report.title.toLowerCase().includes(term) || 
      report.content.toLowerCase().includes(term) ||
      (report.summary && report.summary.toLowerCase().includes(term))
    );
    
    const matchesTopic = filterTopic === 'All' || (report.topics && report.topics.includes(filterTopic));
    return matchesSearch && matchesTopic;
  }).sort((a, b) => {
    if (sortBy === 'date') {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    if (sortBy === 'sentiment') {
      return (b.sentimentScore || 0) - (a.sentimentScore || 0);
    }
    if (sortBy === 'risk') {
      const riskMap = { 'High': 3, 'Medium': 2, 'Low': 1 };
      return (riskMap[b.riskLevel as keyof typeof riskMap] || 0) - (riskMap[a.riskLevel as keyof typeof riskMap] || 0);
    }
    return 0;
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (view === 'settings') return;

      const currentList = view === 'history' ? filteredReports : reports;
      if (currentList.length === 0) return;

      const currentIndex = activeReport 
        ? currentList.findIndex(r => r.id === activeReport.id) 
        : -1;

      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
        e.preventDefault();
        const nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % currentList.length;
        setActiveReport(currentList[nextIndex]);
        if (view !== 'latest') setView('latest');
      } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        e.preventDefault();
        const prevIndex = currentIndex === -1 ? currentList.length - 1 : (currentIndex - 1 + currentList.length) % currentList.length;
        setActiveReport(currentList[prevIndex]);
        if (view !== 'latest') setView('latest');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [view, activeReport, reports, filteredReports]);

  const NavContent = () => (
    <div className="flex flex-col h-full justify-between">
      <div>
        <div className="mb-12 flex justify-between items-start">
          <div>
            <h2 className="serif text-2xl font-light italic-small dark:text-white">Aura Intelligence</h2>
            <p className="text-[10px] uppercase tracking-widest opacity-40 mt-1 dark:text-white/40">Global News Analysis</p>
          </div>
          <button 
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-lg bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
          >
            {darkMode ? <Sun size={16} className="text-white" /> : <Moon size={16} />}
          </button>
        </div>

        <div className="space-y-4">
          {[
            { id: 'latest', label: 'Current Brief', icon: Newspaper },
            { id: 'history', label: 'Archives', icon: History },
            { id: 'map', label: 'Risk Matrix', icon: Map },
            { id: 'graph', label: 'Intelligence Nexus', icon: GitBranch },
            { id: 'settings', label: 'Preferences', icon: Settings },
          ].map((item) => (
            <button 
              key={item.id}
              onClick={() => setView(item.id as any)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-medium",
                view === item.id 
                  ? "bg-black text-white shadow-lg dark:bg-white dark:text-black" 
                  : "hover:bg-black/5 text-black/60 dark:text-white/60 dark:hover:bg-white/5"
              )}
            >
              <item.icon size={18} />
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="pt-8 border-t border-black/5 dark:border-white/5">
        <div className="flex items-center gap-3 mb-6 px-2">
          <img src={user?.photoURL || ''} className="w-8 h-8 rounded-full border border-black/10 dark:border-white/10" alt="" referrerPolicy="no-referrer" />
          <div className="overflow-hidden">
            <p className="text-xs font-semibold truncate dark:text-white">{user?.displayName}</p>
            <p className="text-[10px] opacity-40 truncate dark:text-white/40">{user?.email}</p>
          </div>
        </div>
        <button 
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 transition-all text-sm"
        >
          <LogOut size={18} />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className={cn("min-h-screen flex flex-col md:flex-row transition-colors duration-300", darkMode ? "bg-[#0a0a0a]" : "bg-[#f5f2ed]")}>
      {/* Mobile Header */}
      <header className="md:hidden bg-white dark:bg-[#111] border-b border-black/5 dark:border-white/5 p-4 flex justify-between items-center sticky top-0 z-50 shadow-sm">
        <button 
          onClick={() => setView('latest')}
          className="serif text-xl font-light italic-small dark:text-white"
        >
          Aura Intelligence
        </button>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-lg bg-black/5 dark:bg-white/5"
          >
            {darkMode ? <Sun size={16} className="text-white" /> : <Moon size={16} />}
          </button>
          <img src={user?.photoURL || ''} className="w-8 h-8 rounded-full border border-black/10 dark:border-white/10" alt="" referrerPolicy="no-referrer" />
        </div>
      </header>

      {/* Desktop Sidebar Navigation */}
      <nav className="hidden md:flex w-64 bg-white dark:bg-[#111] border-r border-black/5 dark:border-white/5 p-6 flex-col sticky top-0 h-screen">
        <NavContent />
      </nav>

      {/* Main Content */}
      <main className="flex-1 p-4 pb-24 md:p-12 min-h-0 overflow-y-auto scroll-smooth">
        <AnimatePresence mode="wait">
          {view === 'latest' && (
            <motion.div 
              key="latest"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-8"
            >
              <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-8 mb-12">
                <div className="flex-1 space-y-6">
                  <div>
                    <h3 className="serif text-4xl md:text-5xl font-light dark:text-white tracking-tight">Intelligence Hub</h3>
                    <p className="text-sm text-black/40 dark:text-white/40 mt-3 max-w-xl leading-relaxed">Synthesize premium global intelligence curated for institutional decision makers and executive leadership.</p>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-4">
                    {/* Report Type Toggle */}
                    <div className="flex items-center gap-1 p-1 bg-black/5 dark:bg-white/5 rounded-full w-fit border border-black/5 dark:border-white/5">
                      <button 
                        onClick={() => setReportType('traditional')}
                        className={cn(
                          "px-5 py-2 rounded-full text-[10px] uppercase tracking-[0.2em] font-bold transition-all",
                          reportType === 'traditional' 
                            ? "bg-white dark:bg-white/10 shadow-md text-black dark:text-white" 
                            : "text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white"
                        )}
                      >
                        Traditional
                      </button>
                      <button 
                        onClick={() => setReportType('nexus')}
                        className={cn(
                          "px-5 py-2 rounded-full text-[10px] uppercase tracking-[0.2em] font-bold transition-all flex items-center gap-2",
                          reportType === 'nexus' 
                            ? "bg-black text-white dark:bg-white dark:text-black shadow-lg" 
                            : "text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white"
                        )}
                      >
                        Nexus
                        {reportType === 'nexus' && <TrendingUp size={10} className="animate-pulse" />}
                      </button>
                    </div>

                    {/* Category Selection */}
                    <div className="relative group">
                      <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-black/30 dark:text-white/30 group-hover:text-emerald-500 transition-colors" size={14} />
                      <select 
                        value={selectedTopic}
                        onChange={(e) => setSelectedTopic(e.target.value)}
                        className="pl-10 pr-10 py-2.5 rounded-full bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 text-[10px] uppercase tracking-widest font-bold focus:ring-2 focus:ring-black dark:focus:ring-white appearance-none transition-all cursor-pointer hover:bg-black/10 dark:hover:bg-white/10"
                      >
                        <option value="All">All Focus Areas</option>
                        {profile?.topics?.map((topic: string) => (
                          <option key={topic} value={topic}>{topic}</option>
                        ))}
                      </select>
                      <ChevronRight size={12} className="absolute right-4 top-1/2 -translate-y-1/2 rotate-90 text-black/30 dark:text-white/30 pointer-events-none" />
                    </div>

                    {/* Search Active Report */}
                    {activeReport && !isGenerating && (
                      <div className="relative flex-1 min-w-[240px]">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-black/30 dark:text-white/30" size={14} />
                        <input 
                          type="text" 
                          placeholder="Search in report..."
                          value={latestSearchQuery}
                          onChange={(e) => setLatestSearchQuery(e.target.value)}
                          className="w-full pl-10 pr-4 py-2.5 rounded-full bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 text-xs focus:ring-2 focus:ring-black dark:focus:ring-white transition-all"
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="w-full xl:w-auto">
                  <button 
                    onClick={handleGenerate}
                    disabled={isGenerating}
                    className={cn(
                      "w-full xl:w-auto group relative px-8 py-4 rounded-2xl flex items-center justify-center gap-3 transition-all duration-500 overflow-hidden",
                      isGenerating 
                        ? "bg-black/80 dark:bg-white/80 backdrop-blur-xl scale-[0.98]" 
                        : "bg-black dark:bg-white hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.3)] dark:hover:shadow-[0_20px_40px_-15px_rgba(255,255,255,0.1)] active:scale-95"
                    )}
                  >
                    {/* Apple Intelligence-style glow effect on hover */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none">
                      <div className="absolute inset-[-100%] bg-[conic-gradient(from_0deg,transparent_0%,#3b82f6_20%,#a855f7_40%,#ec4899_60%,#f97316_80%,transparent_100%)] animate-[spin_4s_linear_infinite] opacity-20 blur-2xl" />
                    </div>

                    {/* Subtle inner border */}
                    <div className="absolute inset-0 rounded-2xl border border-white/10 dark:border-black/10 pointer-events-none" />

                    {isGenerating ? (
                      <div className="relative flex items-center gap-3">
                        <Loader2 className="animate-spin text-white dark:text-black" size={18} />
                        <span className="text-sm font-medium tracking-tight text-white dark:text-black">
                          Synthesizing Briefing...
                        </span>
                      </div>
                    ) : (
                      <div className="relative flex items-center gap-3">
                        <div className="relative">
                          <Zap className="text-white dark:text-black group-hover:scale-110 transition-transform duration-500 fill-current" size={18} />
                          <div className="absolute inset-0 blur-md bg-white/40 dark:bg-black/40 scale-150 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <span className="text-sm font-semibold tracking-tight text-white dark:text-black">
                          Synthesize Briefing
                        </span>
                      </div>
                    )}
                  </button>
                </div>
              </div>

              <AnimatePresence mode="wait">
                {isGenerating || isInitialLoading ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.02 }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                  >
                    <SkeletonLoader darkMode={darkMode} progress={generationProgress} message={loadingMessage} />
                  </motion.div>
                ) : activeReport ? (
                  <motion.div
                    key="report"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                  >
                    <ReportView 
                      report={activeReport} 
                      onEmail={handleEmail} 
                      onShare={handleShare} 
                      darkMode={darkMode} 
                      searchQuery={latestSearchQuery}
                    />
                  </motion.div>
                ) : (
                  <motion.div 
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="h-[50vh] flex flex-col items-center justify-center text-center space-y-6 border-2 border-dashed border-black/10 dark:border-white/10 rounded-3xl bg-white/50 dark:bg-white/5"
                  >
                    <div className="p-6 bg-white dark:bg-white/10 rounded-full shadow-inner">
                      <Globe className="text-black/20 dark:text-white/20" size={48} />
                    </div>
                    <div>
                      <h4 className="serif text-2xl font-light dark:text-white">No intelligence reports found</h4>
                      <p className="text-sm text-black/40 dark:text-white/40 mt-2">Initiate your first global briefing to begin.</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {view === 'history' && (
            <motion.div 
              key="history"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-8"
            >
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                <h3 className="serif text-3xl md:text-4xl font-light dark:text-white">Archives</h3>
                <div className="flex flex-wrap gap-4 w-full md:w-auto">
                  <div className="hidden lg:flex items-center gap-2 px-4 py-2 rounded-xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 text-[10px] uppercase tracking-widest font-bold opacity-40">
                    <Zap size={12} />
                    <span>Use Arrow Keys to Navigate</span>
                  </div>
                  <div className="relative flex-1 min-w-[240px]">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-black/30 dark:text-white/30" size={16} />
                    <input 
                      type="text" 
                      placeholder="Search archives..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white dark:bg-white/5 border border-black/5 dark:border-white/5 text-sm focus:ring-2 focus:ring-black dark:focus:ring-white transition-all shadow-sm"
                    />
                    {searchQuery && (
                      <button 
                        onClick={() => setSearchQuery('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] uppercase font-bold text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <div className="relative">
                      <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-black/30 dark:text-white/30" size={14} />
                      <select 
                        value={filterTopic}
                        onChange={(e) => setFilterTopic(e.target.value)}
                        className="pl-9 pr-8 py-3 rounded-2xl bg-white dark:bg-white/5 border border-black/5 dark:border-white/5 text-xs font-medium focus:ring-2 focus:ring-black dark:focus:ring-white appearance-none transition-all cursor-pointer"
                      >
                        <option value="All">All Topics</option>
                        {profile?.topics?.map((topic: string) => (
                          <option key={topic} value={topic}>{topic}</option>
                        ))}
                      </select>
                    </div>
                    <div className="relative">
                      <TrendingUp className="absolute left-3 top-1/2 -translate-y-1/2 text-black/30 dark:text-white/30" size={14} />
                      <select 
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as any)}
                        className="pl-9 pr-8 py-3 rounded-2xl bg-white dark:bg-white/5 border border-black/5 dark:border-white/5 text-xs font-medium focus:ring-2 focus:ring-black dark:focus:ring-white appearance-none transition-all cursor-pointer"
                      >
                        <option value="date">Newest First</option>
                        <option value="sentiment">Highest Sentiment</option>
                        <option value="risk">Highest Risk</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {filteredReports.length > 0 ? filteredReports.map((report) => {
                  const isSelectedForDelta = selectedReportsForDelta.some(r => r.id === report.id);
                  return (
                    <div key={report.id} className="group flex items-center gap-4">
                      <button 
                        onClick={() => toggleReportForDelta(report)}
                        className={cn(
                          "p-3 rounded-xl border transition-all",
                          isSelectedForDelta 
                            ? "bg-emerald-500 border-emerald-500 text-white" 
                            : "bg-white dark:bg-white/5 border-black/5 dark:border-white/5 text-black/20 dark:text-white/20 hover:border-black/20"
                        )}
                        title="Select for Delta Analysis"
                      >
                        <ArrowRightLeft size={16} />
                      </button>
                      <button 
                        onClick={() => { setActiveReport(report); setView('latest'); }}
                        className="flex-1 bg-white dark:bg-white/5 p-6 rounded-2xl border border-black/5 dark:border-white/5 hover:border-black/20 dark:hover:border-white/20 transition-all flex justify-between items-center text-left shadow-sm hover:shadow-md"
                      >
                        <div>
                          <p className="text-[10px] uppercase tracking-widest text-black/40 dark:text-white/40 mb-1">
                            {new Date(report.createdAt).toLocaleDateString()}
                          </p>
                          <h4 className="serif text-lg md:text-xl font-light group-hover:italic-small transition-all dark:text-white">{report.title}</h4>
                        </div>
                        <ChevronRight size={20} className="opacity-20 group-hover:opacity-100 transition-opacity dark:text-white" />
                      </button>
                    </div>
                  );
                }) : (
                  <div className="text-center py-24 bg-white/50 dark:bg-white/5 rounded-3xl border border-dashed border-black/10 dark:border-white/10">
                    <p className="text-black/40 dark:text-white/40 italic">No reports match your criteria.</p>
                  </div>
                )}
              </div>

              {selectedReportsForDelta.length === 2 && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="fixed bottom-12 left-1/2 -translate-x-1/2 z-50"
                >
                  <button 
                    onClick={handleDeltaGenerate}
                    disabled={isComparing}
                    className="bg-black dark:bg-white text-white dark:text-black px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-3 hover:scale-105 transition-transform disabled:opacity-50"
                  >
                    {isComparing ? <Loader2 className="animate-spin" size={18} /> : <Zap size={18} />}
                    <span className="text-sm font-bold uppercase tracking-widest">Generate Delta Analysis</span>
                  </button>
                </motion.div>
              )}
            </motion.div>
          )}

          {view === 'map' && (
            <motion.div 
              key="map"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              className="h-[calc(100vh-12rem)]"
            >
              <GeopoliticalMap 
                data={activeReport?.geopoliticalRisk || []} 
                darkMode={darkMode} 
              />
            </motion.div>
          )}

          {view === 'graph' && (
            <motion.div 
              key="graph"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              className="h-[calc(100vh-12rem)]"
            >
              <RelationshipGraph 
                entities={activeReport?.entities || []} 
                darkMode={darkMode} 
              />
            </motion.div>
          )}

          {view === 'delta' && deltaReport && comparedReports && (
            <motion.div 
              key="delta"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <DeltaComparison 
                reportA={comparedReports.a}
                reportB={comparedReports.b}
                delta={deltaReport} 
                onBack={() => setView('history')}
                darkMode={darkMode} 
              />
            </motion.div>
          )}

          {view === 'settings' && (
            <motion.div 
              key="settings"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="max-w-2xl space-y-12"
            >
              <h3 className="serif text-3xl md:text-4xl font-light dark:text-white">Intelligence Preferences</h3>
              
              <section className="space-y-6">
                <h4 className="text-sm font-semibold uppercase tracking-widest opacity-40 dark:text-white/40">Focus Areas</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    "Global Economy", 
                    "Geopolitics", 
                    "Technology", 
                    "Climate Policy", 
                    "Emerging Markets", 
                    "Defense",
                    "Monetary Policy",
                    "Fixed Income & Bonds",
                    "Equity Markets",
                    "Commodities & Energy",
                    "ESG & Sustainable Finance",
                    "M&A & Private Equity",
                    "Crypto & Digital Assets",
                    "Regulatory & Compliance",
                    "Wealth Management",
                    "Corporate Earnings",
                    "Venture Capital",
                    "Real Estate Markets"
                  ].map((topic) => (
                    <label key={topic} className="flex items-center gap-3 p-4 bg-white dark:bg-white/5 rounded-2xl border border-black/5 dark:border-white/5 cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                      <input 
                        type="checkbox" 
                        checked={profile?.topics?.includes(topic)} 
                        onChange={() => handleTopicToggle(topic)}
                        className="w-4 h-4 rounded border-black/20 dark:border-white/20 text-black dark:text-white focus:ring-black dark:focus:ring-white"
                      />
                      <span className="text-sm dark:text-white">{topic}</span>
                    </label>
                  ))}
                </div>
              </section>

              <section className="space-y-6">
                <h4 className="text-sm font-semibold uppercase tracking-widest opacity-40 dark:text-white/40">Analytical Framework</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { id: 'None', label: 'Standard Intelligence', desc: 'Direct analytical synthesis' },
                    { id: 'PESTEL', label: 'PESTEL Analysis', desc: 'Political, Economic, Social, Tech, Environmental, Legal' },
                    { id: 'SWOT', label: 'SWOT Matrix', desc: 'Strengths, Weaknesses, Opportunities, Threats' },
                    { id: "Porter's Five Forces", label: "Porter's Five Forces", desc: 'Competitive intensity and market attractiveness' }
                  ].map((framework) => (
                    <button
                      key={framework.id}
                      onClick={() => handleFrameworkChange(framework.id)}
                      className={cn(
                        "flex flex-col items-start gap-2 p-5 rounded-2xl border transition-all text-left",
                        profile?.analyticalFramework === framework.id
                          ? "bg-black text-white border-black dark:bg-white dark:text-black dark:border-white shadow-lg"
                          : "bg-white dark:bg-white/5 border-black/5 dark:border-white/5 hover:border-black/20 dark:hover:border-white/20"
                      )}
                    >
                      <span className="text-sm font-semibold">{framework.label}</span>
                      <span className={cn(
                        "text-[10px] leading-relaxed",
                        profile?.analyticalFramework === framework.id ? "opacity-70" : "opacity-40"
                      )}>{framework.desc}</span>
                    </button>
                  ))}
                </div>
              </section>

              <section className="space-y-6">
                <h4 className="text-sm font-semibold uppercase tracking-widest opacity-40 dark:text-white/40">Intelligence Depth</h4>
                <div className="flex gap-4 p-1 bg-black/5 dark:bg-white/5 rounded-2xl">
                  {['Concise', 'Standard', 'Comprehensive'].map((length) => (
                    <button
                      key={length}
                      onClick={() => handleLengthChange(length)}
                      className={cn(
                        "flex-1 py-3 rounded-xl text-xs font-semibold transition-all",
                        profile?.reportLength === length
                          ? "bg-white dark:bg-white/10 shadow-sm dark:text-white"
                          : "text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white"
                      )}
                    >
                      {length}
                    </button>
                  ))}
                </div>
              </section>

              <section className="space-y-6">
                <h4 className="text-sm font-semibold uppercase tracking-widest opacity-40 dark:text-white/40">Critical Data Points</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {[
                    "Market Volatility",
                    "Political Risk Index",
                    "Supply Chain Health",
                    "Consumer Sentiment",
                    "Regulatory Shifts",
                    "Tech Disruption",
                    "ESG Impact",
                    "M&A Activity",
                    "Central Bank Signals"
                  ].map((point) => (
                    <button
                      key={point}
                      onClick={() => handleDataPointToggle(point)}
                      className={cn(
                        "px-4 py-3 rounded-xl border text-[11px] font-medium transition-all",
                        profile?.dataPoints?.includes(point)
                          ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                          : "bg-white dark:bg-white/5 border-black/5 dark:border-white/5 text-black/60 dark:text-white/60 hover:border-black/20 dark:hover:border-white/20"
                      )}
                    >
                      {point}
                    </button>
                  ))}
                </div>
              </section>

              <section className="space-y-6">
                <h4 className="text-sm font-semibold uppercase tracking-widest opacity-40 dark:text-white/40">Delivery Schedule</h4>
                <div className="bg-white dark:bg-white/5 p-6 rounded-2xl border border-black/5 dark:border-white/5 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm dark:text-white">Daily Email Dispatch</span>
                    <input 
                      type="time" 
                      value={profile?.deliveryTime || "08:00"} 
                      onChange={(e) => handleTimeChange(e.target.value)}
                      className="bg-black/5 dark:bg-white/5 border-none rounded-lg px-3 py-2 text-sm dark:text-white" 
                    />
                  </div>
                  <p className="text-xs text-black/40 dark:text-white/40 italic">Reports are generated using the latest global data at your preferred time.</p>
                </div>
              </section>

              <button 
                onClick={logout}
                className="w-full flex items-center justify-center gap-3 px-4 py-4 rounded-xl bg-red-50 dark:bg-red-900/10 text-red-500 transition-all text-sm font-medium"
              >
                <LogOut size={18} />
                <span>Sign Out of Aura Intelligence</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Notification Toast */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className={cn(
              "fixed bottom-24 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 rounded-full shadow-2xl text-sm font-medium",
              notification.type === 'success' ? "bg-black text-white dark:bg-white dark:text-black" : "bg-red-500 text-white"
            )}
          >
            {notification.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-[#111] border-t border-black/5 dark:border-white/5 px-6 py-3 flex justify-between items-center z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        {[
          { id: 'latest', label: 'Brief', icon: Newspaper },
          { id: 'history', label: 'Archives', icon: History },
          { id: 'settings', label: 'Settings', icon: Settings },
        ].map((item) => (
          <button 
            key={item.id}
            onClick={() => setView(item.id as any)}
            className={cn(
              "flex flex-col items-center gap-1 transition-all",
              view === item.id ? "text-black dark:text-white" : "text-black/30 dark:text-white/30"
            )}
          >
            <item.icon size={20} />
            <span className="text-[10px] uppercase tracking-wider font-bold">{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

const Landing = () => {
  const { signIn } = useAuth();
  const [isSigningIn, setIsSigningIn] = useState(false);

  const handleSignIn = async () => {
    setIsSigningIn(true);
    try {
      await signIn();
    } finally {
      setIsSigningIn(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col items-center justify-center p-6 overflow-hidden relative">
      {/* Background Atmosphere */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-emerald-900/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-blue-900/20 blur-[120px] rounded-full" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="relative z-10 text-center space-y-12 max-w-4xl"
      >
        <div className="space-y-4">
          <span className="text-[11px] uppercase tracking-[0.4em] font-semibold opacity-50">Intelligence for the Elite</span>
          <h1 className="serif text-7xl md:text-9xl font-light leading-none tracking-tight">
            Aura <span className="italic-small">News</span>
          </h1>
          <p className="text-lg md:text-xl font-light opacity-60 max-w-2xl mx-auto leading-relaxed">
            Institutional-grade global analysis for finance executives. 
            Deeply researched. Credible sources. Market-moving insights 
            delivered with the precision of a private Bloomberg briefing.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left border-y border-white/10 py-12">
          <div className="space-y-3">
            <TrendingUp className="text-emerald-400" size={24} />
            <h4 className="font-semibold text-sm uppercase tracking-wider">Alpha Intelligence</h4>
            <p className="text-xs opacity-50 leading-relaxed">Connecting disparate global events to structural market shifts and alpha-generating opportunities.</p>
          </div>
          <div className="space-y-3">
            <ShieldCheck className="text-blue-400" size={24} />
            <h4 className="font-semibold text-sm uppercase tracking-wider">Bloomberg Standard</h4>
            <p className="text-xs opacity-50 leading-relaxed">Reports grounded in credible, high-authority sources via Gemini 3.1 Pro reasoning.</p>
          </div>
          <div className="space-y-3">
            <Globe className="text-purple-400" size={24} />
            <h4 className="font-semibold text-sm uppercase tracking-wider">Global Reach</h4>
            <p className="text-xs opacity-50 leading-relaxed">Geopolitical analysis covering every major economic corridor.</p>
          </div>
        </div>

        <button 
          onClick={handleSignIn}
          disabled={isSigningIn}
          className="bg-white text-black px-12 py-5 rounded-full text-sm font-semibold uppercase tracking-widest hover:scale-105 transition-transform shadow-2xl disabled:opacity-50 flex items-center gap-3 mx-auto"
        >
          {isSigningIn && <Loader2 className="animate-spin" size={18} />}
          {isSigningIn ? 'Connecting...' : 'Access Intelligence'}
        </button>
      </motion.div>

      <footer className="absolute bottom-8 text-[10px] uppercase tracking-widest opacity-30">
        © 2026 Aura Intelligence Group • Private & Confidential
      </footer>
    </div>
  );
};

const AppContent = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f2ed] flex items-center justify-center">
        <Loader2 className="animate-spin text-black/20" size={48} />
      </div>
    );
  }

  return user ? <Dashboard /> : <Landing />;
};

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
