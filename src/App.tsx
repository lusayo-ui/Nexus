import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ReportView } from './components/ReportView';
import { SkeletonLoader } from './components/SkeletonLoader';
import { GeopoliticalMap } from './components/GeopoliticalMap';
import { RelationshipGraph } from './components/RelationshipGraph';
import { DeltaComparison } from './components/DeltaComparison';
import { SourceNetworkGraph } from './components/SourceNetworkGraph';
import { MeridianChat } from './components/MeridianChat';
import { StrategicCountdown } from './components/StrategicCountdown';
import { Archives } from './components/Archives';
import { StoryArcs } from './components/StoryArcs';
import { NewsFeed } from './components/NewsFeed';
import { WatchFeed } from './components/WatchFeed';
import { MarketSignals } from './components/MarketSignals';
import { 
  generatePremiumReport, 
  generateNexusReport, 
  generateDeltaReport, 
  generateRegionalBrief, 
  generateStrategicCountdownBrief,
  generateAggregatedReport,
  generateWeeklyDebrief,
  generateCatchUpBrief,
  generateStoryArcsFromFeeds,
  generateAssetSummary
} from './services/geminiService';
import { AVAILABLE_TOPICS } from './constants';
import { db, handleFirestoreError, OperationType } from './firebase';
import { collection, addDoc, query, where, orderBy, onSnapshot, limit, serverTimestamp, getDocs } from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import Markdown from 'react-markdown';
import { Newspaper, History, LogOut, ChevronRight, Loader2, Sparkles, Globe, TrendingUp, ShieldCheck, Moon, Sun, Search, Filter, Zap, BarChart3, ListChecks, Maximize2, Share2, Map, GitBranch, ArrowRightLeft, X, Users, Building2, Calendar, MapPin, Cpu, Shield, Trash2, Clock, Target, RotateCcw, Languages, Mail, Bell } from 'lucide-react';
import { EntityTracker } from './components/EntityTracker';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const PremiumIcon = ({ icon: Icon, color = "emerald", size = 16 }: { icon: any, color?: string, size?: number }) => (
  <div className={cn(
    "p-2 rounded-xl apple-icon-bg flex items-center justify-center relative overflow-hidden group-hover:scale-110 transition-transform duration-500",
    color === "emerald" ? "text-emerald-500" : 
    color === "blue" ? "text-blue-500" : 
    color === "violet" ? "text-violet-500" : 
    color === "orange" ? "text-orange-500" : "text-black/40 dark:text-white/40"
  )}>
    <div className="absolute inset-0 bg-current opacity-5 group-hover:opacity-10 transition-opacity" />
    <Icon size={size} className="relative z-10" />
  </div>
);

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message }: { isOpen: boolean, onClose: () => void, onConfirm: () => void, title: string, message: string }) => (
  <AnimatePresence>
    {isOpen && (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-md bg-white dark:bg-[#0a0a0a] rounded-[2.5rem] border border-black/5 dark:border-white/10 p-8 premium-shadow"
        >
          <h3 className="text-xl font-bold dark:text-white mb-2">{title}</h3>
          <p className="text-sm opacity-60 dark:text-white/60 mb-8 leading-relaxed">{message}</p>
          <div className="flex gap-3">
            <button 
              onClick={onClose}
              className="flex-1 py-3 rounded-xl bg-black/5 dark:bg-white/5 text-[10px] font-bold uppercase tracking-widest dark:text-white hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className="flex-1 py-3 rounded-xl bg-red-500 text-white text-[10px] font-bold uppercase tracking-widest hover:bg-red-600 transition-colors shadow-lg shadow-red-500/20"
            >
              Confirm
            </button>
          </div>
        </motion.div>
      </div>
    )}
  </AnimatePresence>
);

const Dashboard = () => {
  const { user, profile, logout, updateProfile } = useAuth();
  const [reports, setReports] = useState<any[]>([]);
  const [activeReport, setActiveReport] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [reportType, setReportType] = useState<'traditional' | 'nexus'>('traditional');
  const [view, setView] = useState<'latest' | 'history' | 'settings' | 'map' | 'graph' | 'delta' | 'sources' | 'entities' | 'arcs' | 'markets' | 'report'>('latest');
  const [viewHistory, setViewHistory] = useState<typeof view[]>(['latest']);

  const handleSetView = (newView: typeof view) => {
    setViewHistory(prev => [...prev, newView]);
    setView(newView);
  };

  const handleBack = () => {
    if (viewHistory.length > 1) {
      const newHistory = [...viewHistory];
      newHistory.pop(); // Remove current
      const prev = newHistory[newHistory.length - 1];
      setViewHistory(newHistory);
      setView(prev);
    } else {
      setView('latest');
    }
  };
  const [newEntityName, setNewEntityName] = useState('');
  const [newEntityCategory, setNewEntityCategory] = useState('Organization');
  const [newMarketTicker, setNewMarketTicker] = useState('');
  const [newMarketName, setNewMarketName] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      showNotification("Intelligence configuration synchronized.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetSettings = () => {
    updateProfile({
      reportLength: 'Standard',
      analyticalFramework: 'None',
      rigor: 'Standard',
      frequency: 'Daily',
      emailNotifications: true,
      pushNotifications: true,
      anonymousAnalytics: false,
      language: 'English',
      timezone: 'UTC'
    });
    showNotification("Intelligence parameters reset to default.");
  };

  const handleAddEntity = () => {
    if (newEntityName.trim()) {
      const flags: Record<string, string> = {
        'Organization': '🏢',
        'Person': '👤',
        'Location': '📍',
        'Event': '📅',
        'General': '🌐'
      };
      handleUpdateEntities([...monitoredEntities, {
        id: Date.now().toString(),
        name: newEntityName.trim(),
        subtext: `${newEntityCategory} entity`,
        category: newEntityCategory,
        status: 'ACTIVE',
        flag: flags[newEntityCategory] || '🌐'
      }]);
      setNewEntityName('');
    }
  };

  const handleAddMarket = () => {
    if (newMarketTicker.trim() && newMarketName.trim()) {
      handleUpdateMarkets([...marketSignals, {
        ticker: newMarketTicker.trim().toUpperCase(),
        name: newMarketName.trim(),
        value: '0.00',
        change: 0,
        sparkline: [0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5]
      }]);
      setNewMarketTicker('');
      setNewMarketName('');
    }
  };

  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [showPurgeModal, setShowPurgeModal] = useState(false);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('meridian-dark-mode') === 'true');

  useEffect(() => {
    if (profile?.theme) {
      setDarkMode(profile.theme === 'dark');
    }
  }, [profile?.theme]);

  const setInterfaceTheme = (theme: 'light' | 'dark') => {
    setDarkMode(theme === 'dark');
    updateProfile({ theme });
  };

  const toggleDarkMode = () => {
    setInterfaceTheme(darkMode ? 'light' : 'dark');
  };

  const [searchQuery, setSearchQuery] = useState('');
  const [latestSearchQuery, setLatestSearchQuery] = useState('');
  const [filterTopic, setFilterTopic] = useState('All');
  const [sortBy, setSortBy] = useState<'date' | 'sentiment' | 'risk'>('date');
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [isTopicMenuOpen, setIsTopicMenuOpen] = useState(false);
  const [selectedReportsForDelta, setSelectedReportsForDelta] = useState<any[]>([]);
  const [deltaReport, setDeltaReport] = useState<any>(null);
  const [comparedReports, setComparedReports] = useState<{ a: any, b: any } | null>(null);
  const [isComparing, setIsComparing] = useState(false);

  // Customization States
  const [monitoredEntities, setMonitoredEntities] = useState<any[]>([
    { id: '1', name: 'Russia · Kremlin', subtext: 'State actor · Defence posture', category: 'Geopolitics', status: 'HOSTILE', flag: '🇷🇺' },
    { id: '2', name: 'China · PRC', subtext: 'State actor · Taiwan Strait', category: 'Geopolitics', status: 'ESCALATING', flag: '🇨🇳' },
    { id: '3', name: 'US Federal Reserve', subtext: 'Monetary policy · Rate path', category: 'Finance', status: 'NEUTRAL', flag: '🏛️' },
    { id: '4', name: 'OPEC+', subtext: 'Energy · Supply decisions', category: 'Commodities', status: 'ACTIVE', flag: '💧' }
  ]);

  const [marketSignals, setMarketSignals] = useState<any[]>([
    { ticker: 'DXY', name: 'US Dollar Index', value: '104.83', change: 0.4, sparkline: [0.5, 0.52, 0.48, 0.5, 0.55, 0.53, 0.6] },
    { ticker: 'BRENT', name: 'Brent Crude', value: '$82.17', change: -1.2, sparkline: [0.8, 0.75, 0.7, 0.65, 0.6, 0.55, 0.5] },
    { ticker: 'GOLD', name: 'Gold Spot', value: '$3,142', change: 0.8, sparkline: [0.2, 0.3, 0.25, 0.4, 0.6, 0.55, 0.8] },
    { ticker: 'VIX', name: 'Volatility Index', value: '19.4', change: 0.0, sparkline: [0.4, 0.45, 0.42, 0.4, 0.41, 0.39, 0.4] },
    { ticker: 'US10Y', name: 'US 10Y Yield', value: '4.71%', change: -0.3, sparkline: [0.6, 0.58, 0.55, 0.52, 0.5, 0.48, 0.45] }
  ]);

  useEffect(() => {
    if (profile?.monitoredEntities) {
      setMonitoredEntities(profile.monitoredEntities);
    }
    if (profile?.marketSignals) {
      setMarketSignals(profile.marketSignals);
    }
  }, [profile]);

  const handleUpdateEntities = (newEntities: any[]) => {
    setMonitoredEntities(newEntities);
    updateProfile({ monitoredEntities: newEntities });
  };

  const handleUpdateMarkets = (newMarkets: any[]) => {
    setMarketSignals(newMarkets);
    updateProfile({ marketSignals: newMarkets });
  };

  const [storyArcsLimit, setStoryArcsLimit] = useState(3);

  // Asset Summary Modal States
  const [assetSummary, setAssetSummary] = useState<{ title: string; content: string; type: string } | null>(null);
  const [isAssetSummaryLoading, setIsAssetSummaryLoading] = useState(false);

  const handleAssetClick = async (name: string, type: 'Story Arc' | 'Entity' | 'Market Signal') => {
    setIsAssetSummaryLoading(true);
    try {
      const summary = await generateAssetSummary(name, type);
      setAssetSummary({ title: name, content: summary, type });
    } catch (error) {
      console.error("Failed to generate asset summary:", error);
    } finally {
      setIsAssetSummaryLoading(false);
    }
  };

  // Custom Brief Builder States
  const [sector, setSector] = useState('');
  const [region, setRegion] = useState('');
  const [role, setRole] = useState('');
  const [isBriefBuilderOpen, setIsBriefBuilderOpen] = useState(false);

  // Regional Brief States
  const [regionalBrief, setRegionalBrief] = useState<string | null>(null);
  const [isGeneratingRegionalBrief, setIsGeneratingRegionalBrief] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);

  // Catch-up Brief Modal
  const [catchUpBrief, setCatchUpBrief] = useState<{ title: string; content: string; criticalAlerts: string[] } | null>(null);
  const [isCatchUpModalOpen, setIsCatchUpModalOpen] = useState(false);

  // Entity Side Panel
  const [selectedEntity, setSelectedEntity] = useState<any>(null);

  // Story Arcs State
  const [storyArcs, setStoryArcs] = useState<any[]>([]);
  const [isGeneratingArcs, setIsGeneratingArcs] = useState(false);

  useEffect(() => {
    // Initial fetch
    handleRefreshStoryArcs();

    // Auto-refresh every 5 minutes
    const interval = setInterval(() => {
      handleRefreshStoryArcs();
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  const handleRefreshStoryArcs = async () => {
    setIsGeneratingArcs(true);
    try {
      const response = await fetch('/api/feeds');
      const feeds = await response.json();
      
      // Flatten all items and sort by date
      const allItems: any[] = [];
      feeds.forEach((feed: any) => {
        if (feed.items) {
          feed.items.forEach((item: any) => {
            allItems.push({
              ...item,
              source: feed.source
            });
          });
        }
      });

      // Sort by pubDate descending
      allItems.sort((a, b) => {
        const dateA = new Date(a.pubDate).getTime();
        const dateB = new Date(b.pubDate).getTime();
        return dateB - dateA;
      });

      const arcs = allItems.slice(0, 20).map((item, idx) => ({
        id: item.link || String(idx),
        title: item.title,
        category: item.source.toUpperCase(),
        summary: item.contentSnippet || 'No summary available.',
        date: new Date(item.pubDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        updateCount: 1,
        priority: 'Medium',
        isActive: true,
        link: item.link
      }));

      setStoryArcs(arcs);
      showNotification("Story arcs synchronized with real global headlines.");
    } catch (error) {
      console.error("Story arcs error:", error);
      showNotification("Failed to synchronize story arcs.", "error");
    } finally {
      setIsGeneratingArcs(false);
    }
  };

  useEffect(() => {
    if (view === 'arcs' && storyArcs.length === 0) {
      handleRefreshStoryArcs();
    }
  }, [view]);

  useEffect(() => {
    localStorage.setItem('meridian-dark-mode', darkMode.toString());
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
      limit(20)
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

      // Check for "What You Missed" on first load if user was away
      const lastVisit = localStorage.getItem('meridian-last-visit');
      const now = Date.now();
      if (lastVisit && now - parseInt(lastVisit) > 3 * 24 * 60 * 60 * 1000) { // 3 days
        handleGenerateCatchUp(reportsData);
      }
      localStorage.setItem('meridian-last-visit', now.toString());
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'reports');
      setIsInitialLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const handleGenerateCatchUp = async (recentReports: any[]) => {
    try {
      const brief = await generateCatchUpBrief(recentReports, { sector, region, role });
      setCatchUpBrief(brief);
      setIsCatchUpModalOpen(true);
    } catch (error) {
      console.error("Catch-up brief error:", error);
    }
  };

  const handleAggregateFeeds = async () => {
    if (!user) return;
    setIsGenerating(true);
    setLoadingMessage("Aggregating live intelligence feeds...");
    try {
      const response = await fetch('/api/feeds');
      const feeds = await response.json();
      const report = await generateAggregatedReport(feeds);
      
      const reportDoc = {
        userId: user.uid,
        ...report,
        reportType: 'nexus',
        createdAt: serverTimestamp()
      };
      
      const docRef = await addDoc(collection(db, 'reports'), reportDoc);
      setActiveReport({ id: docRef.id, ...reportDoc, createdAt: new Date().toISOString() });
      handleSetView('report');
      showNotification("Live intelligence cycle synthesized.");
    } catch (error) {
      console.error("Aggregation error:", error);
      showNotification("Failed to aggregate feeds.", "error");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleWeeklyDebrief = async () => {
    if (!user) return;
    setIsGenerating(true);
    setLoadingMessage("Synthesizing weekly intelligence debrief...");
    try {
      const debrief = await generateWeeklyDebrief(reports);
      const reportDoc = {
        userId: user.uid,
        title: debrief.title || `Weekly Strategic Debrief: ${new Date().toLocaleDateString()}`,
        summary: "A narrative recap of the week's key geopolitical and market events.",
        content: debrief.content,
        sentimentScore: debrief.sentimentScore || 50,
        riskLevel: 'Medium',
        imageUrl: null,
        keyMetrics: debrief.keyThemes?.map((t: string) => ({ label: 'Key Theme', value: t, trend: 'neutral' })) || [],
        articleSummaries: [],
        marketTrendData: [],
        sources: [],
        geopoliticalRisk: [],
        entities: [],
        reportType: 'nexus',
        createdAt: serverTimestamp()
      };
      const docRef = await addDoc(collection(db, 'reports'), reportDoc);
      setActiveReport({ id: docRef.id, ...reportDoc, createdAt: new Date().toISOString() });
      handleSetView('report');
      showNotification("Weekly debrief generated.");
    } catch (error) {
      console.error("Weekly debrief error:", error);
      showNotification("Failed to generate weekly debrief.", "error");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleTriggerCountdownBrief = async (eventName: string) => {
    setIsGenerating(true);
    setLoadingMessage(`Preparing briefing for ${eventName}...`);
    try {
      const brief = await generateStrategicCountdownBrief(eventName);
      const reportDoc = {
        userId: user?.uid,
        title: `Strategic Brief: ${eventName}`,
        summary: `A high-impact intelligence briefing on the upcoming ${eventName}.`,
        content: brief,
        sentimentScore: 50,
        riskLevel: 'High',
        imageUrl: null,
        keyMetrics: [],
        articleSummaries: [],
        marketTrendData: [],
        sources: [],
        geopoliticalRisk: [],
        entities: [],
        reportType: 'nexus',
        createdAt: serverTimestamp()
      };
      const docRef = await addDoc(collection(db, 'reports'), reportDoc);
      setActiveReport({ id: docRef.id, ...reportDoc, createdAt: new Date().toISOString() });
      handleSetView('report');
      showNotification("Strategic briefing generated.");
    } catch (error) {
      console.error("Countdown brief error:", error);
      showNotification("Failed to generate strategic briefing.", "error");
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleFollowEntity = async (name: string) => {
    if (!profile) return;
    const followed = profile.followedEntities || [];
    const isFollowing = followed.includes(name);
    const newFollowed = isFollowing
      ? followed.filter((n: string) => n !== name)
      : [...followed, name];
    
    try {
      await updateProfile({ followedEntities: newFollowed });
      showNotification(isFollowing ? `Unfollowed ${name}` : `Following ${name}`);
    } catch (error) {
      console.error("Error toggling follow:", error);
      showNotification("Failed to update preferences.", "error");
    }
  };

  const handleCountryClick = async (countryCode: string) => {
    setSelectedCountry(countryCode);
    setIsGeneratingRegionalBrief(true);
    setRegionalBrief(null);
    try {
      const brief = await generateRegionalBrief(countryCode);
      setRegionalBrief(brief);
    } catch (error) {
      console.error("Regional brief error:", error);
      showNotification("Failed to generate regional brief.", "error");
    } finally {
      setIsGeneratingRegionalBrief(false);
    }
  };

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
      const topicsToUse = selectedTopics.length > 0 ? selectedTopics : (profile?.topics || ["Global Economy"]);
      const options = {
        length: profile?.reportLength || 'Standard',
        dataPoints: profile?.prioritizedDataPoints || [],
        analyticalFramework: profile?.analyticalFramework || 'None',
        sector,
        region,
        role
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
      handleSetView('report');
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
    } catch (error: any) {
      console.error("Generation failed:", error);
      const errorMessage = error?.message || "Synthesis failed. Please check your connection.";
      showNotification(`Intelligence Synthesis Error: ${errorMessage}`, "error");
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
      handleSetView('delta');
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
        if (view !== 'latest') handleSetView('latest');
      } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        e.preventDefault();
        const prevIndex = currentIndex === -1 ? currentList.length - 1 : (currentIndex - 1 + currentList.length) % currentList.length;
        setActiveReport(currentList[prevIndex]);
        if (view !== 'latest') handleSetView('latest');
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
            <div className="flex items-center gap-2 mb-1">
              <h2 className="serif text-2xl font-light dark:text-white text-black">Meridian</h2>
              <div className="h-4 w-[1px] bg-black/10 dark:bg-white/10" />
              <div className="flex items-center gap-1.5">
                <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[8px] uppercase tracking-[0.2em] font-bold text-emerald-500">Live</span>
              </div>
            </div>
            <p className="text-[9px] uppercase tracking-[0.3em] opacity-40 dark:text-white/40 font-bold">Intelligence · Executive</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#D4AF37]/10 flex items-center justify-center">
              <span className="text-[10px] font-bold text-[#D4AF37]">AI</span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {[
            { id: 'latest', label: 'Home', icon: Newspaper },
            { id: 'history', label: 'Archives', icon: History },
            { id: 'markets', label: 'Market Signals', icon: BarChart3 },
            { id: 'map', label: 'Risk Matrix', icon: Map },
            { id: 'graph', label: 'Intelligence Nexus', icon: GitBranch },
            { id: 'sources', label: 'Provenance Web', icon: Share2 },
            { id: 'entities', label: 'Entity Tracker', icon: Users },
          ].map((item) => (
            <button 
              key={item.id}
              onClick={() => handleSetView(item.id as any)}
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
        <button 
          onClick={() => handleSetView('settings')}
          className={cn(
            "w-full flex items-center gap-3 mb-6 px-2 py-2 rounded-xl transition-all text-left",
            view === 'settings' ? "bg-black/5 dark:bg-white/5" : "hover:bg-black/5 dark:hover:bg-white/5"
          )}
        >
          <img src={user?.photoURL || ''} className="w-8 h-8 rounded-full border border-black/10 dark:border-white/10" alt="" referrerPolicy="no-referrer" />
          <div className="overflow-hidden">
            <p className="text-xs font-semibold truncate dark:text-white">{user?.displayName}</p>
            <p className="text-[10px] opacity-40 truncate dark:text-white/40">{user?.email}</p>
          </div>
        </button>
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
    <div className={cn("min-h-screen flex flex-col transition-colors duration-300 overflow-x-hidden", darkMode ? "bg-[#0a0a0a]" : "bg-[#f5f2ed]")}>
      {/* Static Header */}
      <div className="w-full pt-4 md:pt-6 pb-2">
        <header className="glass mx-2 md:mx-12 rounded-2xl md:rounded-[2rem] p-2 md:p-3 md:px-8 flex justify-between items-center premium-shadow transition-all duration-700">
          <div className="flex items-center gap-2 md:gap-8">
          {view !== 'latest' && (
            <button 
              onClick={handleBack}
              className="p-2.5 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-all text-black/60 dark:text-white/60 hover:scale-110 active:scale-95"
              title="Back"
            >
              <ArrowRightLeft size={18} className="rotate-180" />
            </button>
          )}
          <button 
            onClick={() => handleSetView('latest')}
            className="serif text-xl md:text-2xl font-light italic-small dark:text-white hover:opacity-70 transition-opacity"
          >
            Meridian
          </button>
          
          <div className="hidden xl:flex items-center p-1 bg-black/5 dark:bg-white/5 rounded-full relative">
            {[
              { id: 'latest', label: 'Meridian', icon: Newspaper },
              { id: 'history', label: 'Archives', icon: History },
              { id: 'markets', label: 'Markets', icon: BarChart3 },
              { id: 'map', label: 'Risk Map', icon: Map },
              { id: 'graph', label: 'Nexus', icon: GitBranch },
              { id: 'sources', label: 'Provenance', icon: Share2 },
              { id: 'entities', label: 'Entities', icon: Users },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => handleSetView(item.id as any)}
                className={cn(
                  "px-4 py-2 rounded-full text-[10px] uppercase tracking-widest font-bold transition-all flex items-center gap-2 relative z-10 group",
                  view === item.id 
                    ? "text-white dark:text-black" 
                    : "text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white"
                )}
              >
                {view === item.id && (
                  <motion.div 
                    layoutId="nav-pill"
                    className="absolute inset-0 bg-black dark:bg-white rounded-full -z-10 shadow-lg shadow-black/10 dark:shadow-white/10"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <item.icon size={12} className={cn("transition-transform duration-300", view === item.id ? "scale-110" : "group-hover:scale-110 group-hover:rotate-3")} />
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex-1 max-w-[120px] sm:max-w-md mx-2 md:mx-8">
          <div className="relative w-full group">
            <Search className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 text-black/30 dark:text-white/30 group-focus-within:text-emerald-500 transition-colors" size={14} />
            <input 
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setLatestSearchQuery(e.target.value);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  if (view !== 'history' && view !== 'latest') handleSetView('history');
                }
              }}
              className="w-full bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-full py-1.5 md:py-2.5 pl-8 md:pl-12 pr-3 text-[10px] md:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50 transition-all dark:text-white"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          <div className="hidden lg:flex items-center gap-2 px-4 py-2 rounded-xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 text-[10px] uppercase tracking-widest font-bold opacity-40">
            <Zap size={12} />
            <span>Arrow Keys to Navigate</span>
          </div>
          <button 
            onClick={toggleDarkMode}
            className="p-2 rounded-lg bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
          >
            {darkMode ? <Sun size={16} className="text-white" /> : <Moon size={16} />}
          </button>
          <button 
            onClick={() => handleSetView('settings')}
            className={cn(
              "flex items-center gap-2 md:gap-3 pl-1 md:pl-2 pr-2 md:pr-4 py-1 rounded-full transition-all border",
              view === 'settings' ? "bg-black/5 border-black/10 dark:bg-white/5 dark:border-white/10" : "border-transparent hover:bg-black/5 dark:hover:bg-white/5"
            )}
          >
            <img src={user?.photoURL || ''} className="w-6 h-6 md:w-8 md:h-8 rounded-full border border-black/10 dark:border-white/10" alt="" referrerPolicy="no-referrer" />
            <div className="hidden sm:block text-left">
              <p className="text-[10px] font-bold truncate dark:text-white leading-none">{user?.displayName?.split(' ')[0]}</p>
              <p className="text-[8px] opacity-40 truncate dark:text-white/40 mt-0.5">Preferences</p>
            </div>
          </button>
        </div>
      </header>
    </div>

    {/* Main Content */}
      <main className="flex-1 p-3 md:p-8 scroll-smooth">
        <AnimatePresence mode="wait">
          {view === 'latest' && (
            <motion.div 
              key="latest-view"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="max-w-[1600px] mx-auto"
            >
              {isInitialLoading ? (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
                  <div className="lg:col-span-8 space-y-8">
                    <div className="h-64 glass rounded-[2.5rem] animate-pulse bg-black/5 dark:bg-white/5" />
                    <div className="h-96 glass rounded-[2.5rem] animate-pulse bg-black/5 dark:bg-white/5" />
                  </div>
                  <div className="lg:col-span-4 space-y-6">
                    <div className="h-48 glass rounded-[2rem] animate-pulse bg-black/5 dark:bg-white/5" />
                    <div className="h-96 glass rounded-[2rem] animate-pulse bg-black/5 dark:bg-white/5" />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
                  {/* Left Column: Story Arcs (Real News) */}
                  <div className="lg:col-span-8 space-y-8">
                    <NewsFeed darkMode={darkMode} />
                    
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <h3 className="serif text-2xl md:text-4xl font-light dark:text-white tracking-tight leading-tight">Meridian</h3>
                      <p className="text-[10px] text-black/40 dark:text-white/40 mt-1 max-w-xl uppercase tracking-widest font-bold">Global Macro Intelligence</p>
                      <p className="text-xs text-black/60 dark:text-white/60 mt-2 max-w-2xl leading-relaxed">Real-time mapping of macro events, policy shifts, and geopolitical risk shaping markets.</p>
                    </div>
                    
                    <div className="flex flex-row gap-2">
                      <button 
                        onClick={handleAggregateFeeds}
                        disabled={isGenerating}
                        className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 rounded-full border border-emerald-500/30 font-bold text-[9px] uppercase tracking-widest hover:bg-emerald-500/20 transition-all disabled:opacity-50"
                      >
                        <Zap size={12} />
                        <span>Live Aggregation</span>
                      </button>
                      <button 
                        onClick={handleWeeklyDebrief}
                        disabled={isGenerating}
                        className="flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 text-blue-700 dark:text-blue-400 rounded-full border border-blue-500/30 font-bold text-[9px] uppercase tracking-widest hover:bg-blue-500/20 transition-all disabled:opacity-50"
                      >
                        <History size={12} />
                        <span>Weekly Debrief</span>
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
                    <div className="space-y-6 sticky top-4 self-start snap-start scroll-mt-4 transition-all hover:z-20 hover:shadow-2xl hover:shadow-emerald-500/10 glass p-4 md:p-6 rounded-2xl md:rounded-[2rem] premium-shadow hover-lift">
                      <div className="flex items-center gap-3 mb-2">
                        <PremiumIcon icon={Zap} color="orange" size={14} />
                        <div className="space-y-0.5">
                          <h3 className="text-[10px] uppercase tracking-[0.3em] font-bold text-[#D4AF37]">Today's Signal</h3>
                          <p className="text-[8px] opacity-40 uppercase tracking-widest">Updated 06:00 UTC</p>
                        </div>
                      </div>
                      <StrategicCountdown onTriggerBrief={handleTriggerCountdownBrief} />
                      
                      <div className="pt-4">
                        <MarketSignals 
                          compact
                          darkMode={darkMode}
                          markets={marketSignals.slice(0, 3)}
                          analysis="Dollar strength persisting alongside elevated VIX signals a risk-off regime."
                          onSignalClick={(ticker, name) => handleAssetClick(name || ticker, 'Market Signal')}
                        />
                      </div>
                    </div>
                    <div className="sticky top-4 self-start snap-start scroll-mt-4 transition-all hover:z-20 hover:shadow-2xl hover:shadow-emerald-500/10 glass p-4 md:p-6 rounded-2xl md:rounded-[2rem] premium-shadow hover-lift">
                      <div className="flex items-center gap-3 mb-6">
                        <PremiumIcon icon={Users} color="blue" size={14} />
                        <h4 className="text-[10px] font-bold uppercase tracking-widest opacity-40 dark:text-white/40">Monitored Entities</h4>
                      </div>
                      <WatchFeed 
                        entities={monitoredEntities}
                        onAddEntity={() => handleSetView('settings')}
                        onEntityClick={(name) => handleAssetClick(name, 'Entity')}
                      />
                    </div>
                  </div>

                  <div className="space-y-6 sticky top-4 snap-start scroll-mt-4 transition-all hover:z-20 hover:shadow-2xl hover:shadow-emerald-500/10 glass p-4 md:p-6 rounded-2xl md:rounded-[2rem] premium-shadow hover-lift">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <PremiumIcon icon={Newspaper} color="emerald" size={14} />
                        <h4 className="text-[10px] font-bold uppercase tracking-widest opacity-40 dark:text-white/40">Real-Time Story Arcs</h4>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 md:gap-4">
                        <button 
                          onClick={() => setStoryArcsLimit(storyArcsLimit === 3 ? 15 : 3)}
                          className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest hover:underline"
                        >
                          {storyArcsLimit === 3 ? 'View All' : 'Show Less'}
                        </button>
                        <button 
                          onClick={handleRefreshStoryArcs}
                          disabled={isGeneratingArcs}
                          className="flex items-center gap-2 text-[10px] font-bold text-violet-500 uppercase tracking-widest hover:underline disabled:opacity-50"
                        >
                          {isGeneratingArcs ? <Loader2 size={12} className="animate-spin" /> : <Zap size={12} />}
                          <span className="hidden sm:inline">Refresh Arcs</span>
                          <span className="sm:hidden">Refresh</span>
                        </button>
                      </div>
                    </div>
                    <StoryArcs 
                      arcs={storyArcs.slice(0, storyArcsLimit)} 
                      darkMode={darkMode} 
                      onArcClick={(arc) => handleAssetClick(arc.title, 'Story Arc')}
                    />
                  </div>
                </div>

                {/* Right Column: Quick Actions & Archives Sidebar */}
                <div className="lg:col-span-4 space-y-6">
                  <div className="sticky top-4 space-y-6">
                    <div className="p-4 md:p-6 glass rounded-2xl md:rounded-[2rem] premium-shadow space-y-5 hover-lift">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <PremiumIcon icon={Sparkles} color="emerald" size={14} />
                          <div className="space-y-0.5">
                            <h4 className="serif text-lg md:text-xl font-light dark:text-white">Synthesize</h4>
                            <p className="text-[8px] uppercase tracking-widest opacity-40 dark:text-white/40">Briefing Engine</p>
                          </div>
                        </div>
                        <div className="flex p-0.5 bg-black/5 dark:bg-white/10 rounded-lg border border-black/5 dark:border-white/5">
                          <button 
                            onClick={() => setReportType('traditional')}
                            className={cn(
                              "px-2 md:px-3 py-1 text-[8px] font-bold uppercase tracking-widest rounded-md transition-all",
                              reportType === 'traditional' ? "bg-white dark:bg-white/20 text-black dark:text-white shadow-sm" : "opacity-40 hover:opacity-100 dark:text-white"
                            )}
                          >
                            Trad
                          </button>
                          <button 
                            onClick={() => setReportType('nexus')}
                            className={cn(
                              "px-2 md:px-3 py-1 text-[8px] font-bold uppercase tracking-widest rounded-md transition-all",
                              reportType === 'nexus' ? "bg-white dark:bg-white/20 text-black dark:text-white shadow-sm" : "opacity-40 hover:opacity-100 dark:text-white"
                            )}
                          >
                            Nexus
                          </button>
                        </div>
                      </div>

                      <button 
                        disabled={isGenerating}
                        onClick={handleGenerate}
                        className="w-full py-3 rounded-xl bg-emerald-500 text-white flex items-center justify-center gap-2 hover:bg-emerald-600 transition-all group shadow-lg shadow-emerald-500/10"
                      >
                        {isGenerating ? <Loader2 className="animate-spin" size={14} /> : <Sparkles size={14} />}
                        <span className="text-xs font-bold uppercase tracking-widest">Generate</span>
                      </button>

                      <div className="pt-4 border-t border-black/5 dark:border-white/5">
                        <div className="flex items-center justify-between mb-3">
                          <p className="text-[8px] opacity-40 uppercase tracking-widest dark:text-white/40">Focus</p>
                          <button 
                            onClick={() => setIsTopicMenuOpen(!isTopicMenuOpen)}
                            className="text-[8px] font-bold uppercase tracking-widest text-emerald-500 hover:underline"
                          >
                            {isTopicMenuOpen ? 'Close' : 'Edit'}
                          </button>
                        </div>

                        {isTopicMenuOpen ? (
                          <div className="grid grid-cols-2 gap-1.5 max-h-40 overflow-y-auto pr-1 custom-scrollbar">
                            {AVAILABLE_TOPICS.map(topic => (
                              <button
                                key={topic}
                                onClick={() => {
                                  setSelectedTopics(prev => 
                                    prev.includes(topic) ? prev.filter(t => t !== topic) : [...prev, topic]
                                  );
                                }}
                                className={cn(
                                  "px-2 py-1.5 rounded-lg border text-[8px] font-bold uppercase tracking-wider text-left transition-all",
                                  selectedTopics.includes(topic) 
                                    ? "bg-emerald-500 border-emerald-400 text-white" 
                                    : "bg-white/5 dark:bg-white/5 border-black/5 dark:border-white/5 opacity-60 hover:opacity-100 dark:text-white"
                                )}
                              >
                                {topic}
                              </button>
                            ))}
                          </div>
                        ) : (
                          <div className="flex flex-wrap gap-1.5">
                            {selectedTopics.length === 0 ? (
                              <span className="text-[9px] opacity-40 italic dark:text-white/40">Global Coverage</span>
                            ) : (
                              selectedTopics.map(topic => (
                                <span key={topic} className="px-2 py-0.5 rounded bg-black/5 dark:bg-white/5 text-[8px] font-bold uppercase tracking-wider dark:text-white/60">{topic}</span>
                              ))
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <h3 className="serif text-xl md:text-2xl font-light dark:text-white">Recent Reports</h3>
                      <button onClick={() => handleSetView('history')} className="text-[10px] uppercase tracking-widest font-bold opacity-40 hover:opacity-100 transition-opacity dark:text-white">View All</button>
                    </div>

                    <div className="space-y-3 max-h-[calc(100vh-35rem)] overflow-y-auto pr-2 custom-scrollbar">
                      {reports.slice(0, 3).map((report) => (
                        <button 
                          key={report.id}
                          onClick={() => { setActiveReport(report); handleSetView('report'); }}
                          className="w-full flex items-center justify-between p-3 md:p-4 bg-white dark:bg-white/5 border border-black/5 dark:border-white/5 rounded-xl md:rounded-2xl hover:border-black/20 dark:hover:border-white/20 transition-all group text-left"
                        >
                          <div className="flex-1 min-w-0">
                            <h4 className="text-xs md:text-sm font-semibold truncate dark:text-white group-hover:text-emerald-500 transition-colors">{report.title}</h4>
                            <p className="text-[8px] md:text-[9px] opacity-40 dark:text-white/40 mt-1 uppercase tracking-widest">{new Date(report.createdAt).toLocaleDateString()}</p>
                          </div>
                          <ChevronRight className="w-3 h-3 md:w-3.5 md:h-3.5 opacity-20 group-hover:opacity-100 transition-all dark:text-white" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}

          {view === 'report' && activeReport && (
            <motion.div 
              key="report-view"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="max-w-4xl mx-auto"
            >
              <ReportView 
                report={activeReport} 
                onEmail={handleEmail} 
                onShare={handleShare} 
                darkMode={darkMode} 
                searchQuery={searchQuery}
                allReports={reports}
                onSelectReport={(r) => setActiveReport(r)}
              />
            </motion.div>
          )}

          {view === 'history' && (
            <motion.div 
              key="history"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="max-w-4xl mx-auto py-8 md:py-12"
            >
              <div className="sticky top-4 z-20 glass py-6 md:py-8 mb-8 md:mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6 premium-shadow -mx-4 px-6 md:px-8 rounded-2xl md:rounded-[2.5rem]">
                <div>
                  <h3 className="serif text-3xl md:text-5xl font-light dark:text-white mb-2 md:mb-4">Intelligence Archives</h3>
                  <p className="text-xs md:text-sm opacity-40 dark:text-white/40">Historical intelligence records and strategic briefings.</p>
                </div>
                <div className="flex flex-row gap-2 md:gap-3">
                  <button 
                    onClick={handleAggregateFeeds}
                    disabled={isGenerating}
                    className="flex items-center gap-2 px-3 md:px-4 py-2 md:py-2.5 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 rounded-full border border-emerald-500/30 font-bold text-[9px] md:text-[10px] uppercase tracking-widest hover:bg-emerald-500/20 transition-all disabled:opacity-50"
                  >
                    <Zap className="w-3 h-3 md:w-3.5 md:h-3.5" />
                    <span>Live Aggregation</span>
                  </button>
                  <button 
                    onClick={handleWeeklyDebrief}
                    disabled={isGenerating}
                    className="flex items-center gap-2 px-3 md:px-4 py-2 md:py-2.5 bg-blue-500/10 text-blue-700 dark:text-blue-400 rounded-full border border-blue-500/30 font-bold text-[9px] md:text-[10px] uppercase tracking-widest hover:bg-blue-500/20 transition-all disabled:opacity-50"
                  >
                    <History className="w-3 h-3 md:w-3.5 md:h-3.5" />
                    <span>Weekly Debrief</span>
                  </button>
                </div>
              </div>
              <Archives 
                items={reports.map(r => ({ id: r.id, title: r.title, date: new Date(r.createdAt), tags: r.topics || [] }))} 
                onSelect={(item) => { 
                  const report = reports.find(r => r.id === item.id);
                  if (report) {
                    setActiveReport(report);
                    handleSetView('report');
                  }
                }}
                darkMode={darkMode}
              />
            </motion.div>
          )}

          {view === 'markets' && (
            <motion.div 
              key="markets"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="max-w-6xl mx-auto py-8 md:py-12"
            >
              <div className="sticky top-4 z-20 glass py-6 md:py-8 mb-8 md:mb-12 premium-shadow -mx-4 px-6 md:px-8 rounded-2xl md:rounded-[2.5rem]">
                <h3 className="serif text-3xl md:text-5xl font-light dark:text-white mb-2 md:mb-4">Market Signals</h3>
                <p className="text-xs md:text-sm opacity-40 dark:text-white/40">Financial transmission of geopolitical risk and strategic asset movements.</p>
              </div>
              <MarketSignals 
                darkMode={darkMode}
                markets={marketSignals}
                analysis="Dollar strength persisting alongside elevated VIX signals a risk-off regime that is not yet resolved. Gold's sustained bid above $3,100 confirms institutional hedging against tail scenarios — consistent with the geopolitical stress visible in the Baltic and Taiwan threads."
                onSignalClick={(ticker, name) => handleAssetClick(name || ticker, 'Market Signal')}
              />
            </motion.div>
          )}

          {view === 'map' && (
            <motion.div 
              key="map"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              className="h-[calc(100vh-12rem)] relative"
            >
              <GeopoliticalMap 
                data={activeReport?.geopoliticalRisk || []} 
                darkMode={darkMode} 
                onCountryClick={handleCountryClick}
              />

              <AnimatePresence>
                {selectedCountry && (
                  <motion.div
                    initial={{ opacity: 0, x: 20, y: 20 }}
                    animate={{ opacity: 1, x: 0, y: 0 }}
                    exit={{ opacity: 0, x: 20, y: 20 }}
                    className="fixed md:absolute inset-0 md:inset-auto md:top-8 md:right-8 md:w-96 bg-white dark:bg-[#1a1a1a] md:rounded-3xl shadow-2xl border-t md:border border-black/5 dark:border-white/10 p-6 md:p-8 z-[100] md:z-20 overflow-y-auto custom-scrollbar"
                  >
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <h4 className="serif text-2xl font-light dark:text-white">{selectedCountry} Briefing</h4>
                        <p className="text-[10px] uppercase tracking-widest font-bold opacity-40 dark:text-white/40">Regional Intelligence</p>
                      </div>
                      <button onClick={() => setSelectedCountry(null)} className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-full">
                        <X size={20} className="dark:text-white md:hidden" />
                        <X size={16} className="dark:text-white hidden md:block" />
                      </button>
                    </div>

                    {isGeneratingRegionalBrief ? (
                      <div className="flex flex-col items-center justify-center py-12 space-y-4">
                        <Loader2 className="animate-spin text-black/20 dark:text-white/20" size={32} />
                        <p className="text-xs font-medium opacity-40 dark:text-white/40">Synthesizing Regional Intelligence...</p>
                      </div>
                    ) : regionalBrief ? (
                      <div className="markdown-body text-sm leading-relaxed dark:text-white/80">
                        <Markdown>{regionalBrief}</Markdown>
                      </div>
                    ) : null}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {view === 'graph' && (
            <motion.div 
              key="graph"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              className="h-[calc(100vh-12rem)] relative"
            >
              <RelationshipGraph 
                entities={activeReport?.entities || []} 
                darkMode={darkMode} 
                onNodeClick={(entity) => setSelectedEntity(entity)}
              />

              <AnimatePresence>
                {selectedEntity && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="fixed md:absolute inset-0 md:inset-auto md:top-8 md:right-8 md:w-96 bg-white dark:bg-[#1a1a1a] md:rounded-3xl shadow-2xl border-t md:border border-black/5 dark:border-white/10 p-6 md:p-8 z-[100] md:z-20 overflow-y-auto custom-scrollbar"
                  >
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "p-2 rounded-xl",
                          selectedEntity.type === 'Organization' ? 'bg-blue-500/10 text-blue-500' :
                          selectedEntity.type === 'Person' ? 'bg-pink-500/10 text-pink-500' :
                          selectedEntity.type === 'Event' ? 'bg-orange-500/10 text-orange-500' :
                          selectedEntity.type === 'Location' ? 'bg-emerald-500/10 text-emerald-500' :
                          'bg-violet-500/10 text-violet-500'
                        )}>
                          {selectedEntity.type === 'Organization' ? <Building2 size={20} /> :
                           selectedEntity.type === 'Person' ? <Users size={20} /> :
                           selectedEntity.type === 'Event' ? <Calendar size={20} /> :
                           selectedEntity.type === 'Location' ? <MapPin size={20} /> :
                           <Cpu size={20} />}
                        </div>
                        <div>
                          <h4 className="serif text-2xl font-light dark:text-white">{selectedEntity.name}</h4>
                          <p className="text-[10px] uppercase tracking-widest font-bold opacity-40 dark:text-white/40">{selectedEntity.type}</p>
                        </div>
                      </div>
                      <button onClick={() => setSelectedEntity(null)} className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-full">
                        <X size={20} className="dark:text-white md:hidden" />
                        <X size={16} className="dark:text-white hidden md:block" />
                      </button>
                    </div>

                    <div className="space-y-8">
                      <div>
                        <h5 className="text-[10px] uppercase tracking-widest font-bold opacity-40 mb-4 dark:text-white/40">Direct Connections</h5>
                        <div className="space-y-3">
                          {selectedEntity.connections.map((conn: any, i: number) => (
                            <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5">
                              <span className="text-xs font-bold dark:text-white">{conn.target}</span>
                              <span className="text-[9px] uppercase font-bold px-2 py-1 rounded-md bg-black/10 dark:bg-white/10 opacity-60 dark:text-white">{conn.relationship}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h5 className="text-[10px] uppercase tracking-widest font-bold opacity-40 mb-4 dark:text-white/40">Intelligence Context</h5>
                        <div className="p-4 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5">
                          <p className="text-xs leading-relaxed opacity-70 dark:text-white/70">
                            {selectedEntity.name} is a key {selectedEntity.type.toLowerCase()} identified within the current intelligence cycle. 
                            Its primary strategic relevance stems from its {selectedEntity.connections.length} established links across the operational landscape.
                          </p>
                        </div>
                      </div>

                      <div>
                        <h5 className="text-[10px] uppercase tracking-widest font-bold opacity-40 mb-4 dark:text-white/40">Associated Briefings</h5>
                        <div className="space-y-3">
                          {reports.filter(r => r.entities?.some((e: any) => e.name === selectedEntity.name)).slice(0, 3).map((report, i) => (
                            <button 
                              key={i}
                              onClick={() => {
                                handleSetView('latest');
                                setActiveReport(report);
                                setSelectedEntity(null);
                              }}
                              className="w-full text-left p-3 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors group"
                            >
                              <p className="text-[11px] font-bold dark:text-white group-hover:text-emerald-500 transition-colors">{report.title}</p>
                              <p className="text-[9px] opacity-40 dark:text-white/40">{new Date(report.createdAt).toLocaleDateString()}</p>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {view === 'sources' && (
            <motion.div 
              key="sources"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              className="h-[calc(100vh-12rem)]"
            >
              <SourceNetworkGraph 
                reports={reports} 
                darkMode={darkMode} 
              />
            </motion.div>
          )}

          {view === 'entities' && (
            <motion.div 
              key="entities"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
            >
              <EntityTracker 
                reports={reports} 
                darkMode={darkMode} 
                followedEntities={profile?.followedEntities || []}
                onToggleFollow={toggleFollowEntity}
                onEntityClick={(name) => handleAssetClick(name, 'Entity')}
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
                onBack={() => handleSetView('history')}
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
              className="max-w-4xl mx-auto space-y-8 md:space-y-12 pb-32"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl md:text-2xl font-bold dark:text-white">Settings</h2>
                  <p className="text-xs md:text-sm opacity-60 dark:text-white/60">Configure your intelligence parameters and account security.</p>
                </div>
                <button 
                  onClick={handleSaveSettings}
                  disabled={isSaving}
                  className="w-full sm:w-auto px-8 py-3 bg-emerald-500 text-white text-[10px] font-bold uppercase tracking-widest rounded-full hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
                >
                  {isSaving ? <Loader2 className="animate-spin" size={14} /> : <ShieldCheck size={14} />}
                  {isSaving ? 'Synchronizing...' : 'Save Configuration'}
                </button>
              </div>

              {/* Profile Section */}
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <PremiumIcon icon={Users} color="blue" size={14} />
                  <h3 className="serif text-xl md:text-2xl font-light dark:text-white">Identity & Access</h3>
                </div>
                
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 md:gap-6 p-6 bg-white dark:bg-white/5 rounded-2xl md:rounded-[2.5rem] border border-black/5 dark:border-white/5 premium-shadow">
                  <div className="relative group">
                    <img src={user?.photoURL || ''} className="w-20 h-20 md:w-24 md:h-24 rounded-full border-2 border-black/5 dark:border-white/10 object-cover" alt="" referrerPolicy="no-referrer" />
                    <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                      <span className="text-[8px] text-white font-bold uppercase tracking-widest">Update</span>
                    </div>
                  </div>
                  <div className="min-w-0 flex-1 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-lg md:text-xl font-semibold dark:text-white truncate">{user?.displayName}</h4>
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[8px] font-bold uppercase tracking-wider border border-emerald-500/20">Verified</span>
                        </div>
                        <p className="text-xs md:text-sm opacity-40 dark:text-white/40 truncate">{user?.email}</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5">
                          <Shield size={10} className="text-blue-500" />
                          <span className="text-[8px] md:text-[9px] font-bold uppercase tracking-wider dark:text-white/60">Premium Tier</span>
                        </div>
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5">
                          <Zap size={10} className="text-amber-500" />
                          <span className="text-[8px] md:text-[9px] font-bold uppercase tracking-wider dark:text-white/60">24/7 Monitoring</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="pt-4 border-t border-black/5 dark:border-white/5">
                      <label className="text-[9px] font-bold uppercase tracking-widest opacity-40 dark:text-white/40 mb-2 block">Display Identity</label>
                      <input 
                        type="text"
                        value={profile?.displayName || user?.displayName || ''}
                        onChange={(e) => updateProfile({ displayName: e.target.value })}
                        placeholder="Enter your preferred name"
                        className="w-full max-w-md bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 rounded-xl px-4 py-2 text-xs dark:text-white outline-none focus:ring-2 focus:ring-emerald-500/20"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Regional Settings */}
              <section className="space-y-6">
                <div className="flex items-center gap-3">
                  <PremiumIcon icon={Languages} color="orange" size={14} />
                  <h3 className="serif text-xl md:text-2xl font-light dark:text-white">Regional Parameters</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-6 bg-white dark:bg-white/5 rounded-2xl border border-black/5 dark:border-white/5 space-y-4">
                    <label className="text-[10px] font-bold uppercase tracking-widest opacity-40 dark:text-white/40">Intelligence Language</label>
                    <select 
                      value={profile?.language || 'English'}
                      onChange={(e) => updateProfile({ language: e.target.value })}
                      className="w-full bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 rounded-xl px-4 py-3 text-sm dark:text-white outline-none focus:ring-2 focus:ring-emerald-500/20 appearance-none"
                    >
                      {['English', 'Spanish', 'French', 'German', 'Mandarin', 'Japanese'].map(lang => (
                        <option key={lang} value={lang}>{lang}</option>
                      ))}
                    </select>
                  </div>

                  <div className="p-6 bg-white dark:bg-white/5 rounded-2xl border border-black/5 dark:border-white/5 space-y-4">
                    <label className="text-[10px] font-bold uppercase tracking-widest opacity-40 dark:text-white/40">Operational Timezone</label>
                    <select 
                      value={profile?.timezone || 'UTC'}
                      onChange={(e) => updateProfile({ timezone: e.target.value })}
                      className="w-full bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 rounded-xl px-4 py-3 text-sm dark:text-white outline-none focus:ring-2 focus:ring-emerald-500/20 appearance-none"
                    >
                      {['UTC', 'EST', 'PST', 'GMT', 'CET', 'JST', 'AEST'].map(tz => (
                        <option key={tz} value={tz}>{tz}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </section>
              
              {/* Intelligence Config */}
              <section className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <PremiumIcon icon={Cpu} color="emerald" size={14} />
                    <h3 className="serif text-xl md:text-2xl font-light dark:text-white">Analysis Parameters</h3>
                  </div>
                  <button 
                    onClick={handleResetSettings}
                    className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest opacity-40 hover:opacity-100 transition-opacity dark:text-white"
                  >
                    <RotateCcw size={10} />
                    Reset Defaults
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-6 bg-white dark:bg-white/5 rounded-2xl border border-black/5 dark:border-white/5 space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-bold uppercase tracking-widest opacity-40 dark:text-white/40">Report Depth</label>
                      <div className="group relative">
                        <X size={12} className="opacity-20 cursor-help rotate-45" />
                        <div className="absolute bottom-full right-0 mb-2 w-48 p-2 bg-black text-white text-[8px] rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                          Determines the level of granularity in generated intelligence briefings.
                        </div>
                      </div>
                    </div>
                    <select 
                      value={profile?.reportLength || 'Standard'}
                      onChange={(e) => updateProfile({ reportLength: e.target.value })}
                      className="w-full bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 rounded-xl px-4 py-3 text-sm dark:text-white outline-none focus:ring-2 focus:ring-emerald-500/20 appearance-none"
                    >
                      {['Concise', 'Standard', 'Comprehensive'].map(length => (
                        <option key={length} value={length}>{length}</option>
                      ))}
                    </select>
                  </div>

                  <div className="p-6 bg-white dark:bg-white/5 rounded-2xl border border-black/5 dark:border-white/5 space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-bold uppercase tracking-widest opacity-40 dark:text-white/40">Analytical Framework</label>
                      <div className="group relative">
                        <X size={12} className="opacity-20 cursor-help rotate-45" />
                        <div className="absolute bottom-full right-0 mb-2 w-48 p-2 bg-black text-white text-[8px] rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                          The strategic model used to categorize and analyze geopolitical events.
                        </div>
                      </div>
                    </div>
                    <select 
                      value={profile?.analyticalFramework || 'None'}
                      onChange={(e) => updateProfile({ analyticalFramework: e.target.value })}
                      className="w-full bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 rounded-xl px-4 py-3 text-sm dark:text-white outline-none focus:ring-2 focus:ring-emerald-500/20 appearance-none"
                    >
                      {['None', 'PESTEL', 'SWOT', "Porter's Five Forces"].map(framework => (
                        <option key={framework} value={framework}>{framework}</option>
                      ))}
                    </select>
                  </div>

                  <div className="p-6 bg-white dark:bg-white/5 rounded-2xl border border-black/5 dark:border-white/5 space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-bold uppercase tracking-widest opacity-40 dark:text-white/40">Intelligence Rigor</label>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {['Standard', 'Academic', 'Tactical'].map(r => (
                        <button
                          key={r}
                          onClick={() => updateProfile({ rigor: r })}
                          className={cn(
                            "py-2.5 rounded-xl text-[9px] font-bold uppercase tracking-widest border transition-all",
                            (profile?.rigor || 'Standard') === r
                              ? "bg-emerald-500 text-white border-emerald-500 shadow-md shadow-emerald-500/10"
                              : "bg-transparent border-black/10 dark:border-white/10 dark:text-white/40 hover:border-emerald-500/30"
                          )}
                        >
                          {r}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="p-6 bg-white dark:bg-white/5 rounded-2xl border border-black/5 dark:border-white/5 space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-bold uppercase tracking-widest opacity-40 dark:text-white/40">Briefing Frequency</label>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {['Daily', 'Weekly', 'Real-time'].map(f => (
                        <button
                          key={f}
                          onClick={() => updateProfile({ frequency: f })}
                          className={cn(
                            "py-2.5 rounded-xl text-[9px] font-bold uppercase tracking-widest border transition-all",
                            (profile?.frequency || 'Daily') === f
                              ? "bg-blue-500 text-white border-blue-500 shadow-md shadow-blue-500/10"
                              : "bg-transparent border-black/10 dark:border-white/10 dark:text-white/40 hover:border-blue-500/30"
                          )}
                        >
                          {f}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </section>

              {/* Intelligence Focus */}
              <section className="space-y-6">
                <div className="flex items-center gap-3">
                  <PremiumIcon icon={Target} color="blue" size={14} />
                  <h3 className="serif text-xl md:text-2xl font-light dark:text-white">Strategic Focus</h3>
                </div>
                
                <div className="p-6 bg-white dark:bg-white/5 rounded-2xl border border-black/5 dark:border-white/5">
                  <label className="text-[10px] font-bold uppercase tracking-widest opacity-40 dark:text-white/40 mb-4 block">Priority Sectors</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
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
                    ].map(sector => {
                      const isSelected = (profile?.prioritySectors || []).includes(sector);
                      return (
                        <button
                          key={sector}
                          onClick={() => {
                            const current = profile?.prioritySectors || [];
                            const next = isSelected 
                              ? current.filter((s: string) => s !== sector)
                              : [...current, sector];
                            updateProfile({ prioritySectors: next });
                          }}
                          className={cn(
                            "px-3 py-2 rounded-xl text-[9px] font-bold uppercase tracking-wider border transition-all text-left",
                            isSelected 
                              ? "bg-blue-500 text-white border-blue-500 shadow-lg shadow-blue-500/20"
                              : "bg-black/5 dark:bg-white/5 border-black/5 dark:border-white/5 dark:text-white/60 hover:border-blue-500/30"
                          )}
                        >
                          {sector}
                        </button>
                      );
                    })}
                  </div>
                  <p className="mt-4 text-[10px] opacity-40 dark:text-white/40 italic">Selected sectors will receive higher weightage in automated intelligence synthesis.</p>
                </div>
              </section>

                  {/* Data Prioritization */}
              <section className="space-y-6">
                <div className="flex items-center gap-3">
                  <PremiumIcon icon={ListChecks} color="emerald" size={14} />
                  <h3 className="serif text-xl md:text-2xl font-light dark:text-white">Data Prioritization</h3>
                </div>
                
                <div className="p-6 bg-white dark:bg-white/5 rounded-2xl border border-black/5 dark:border-white/5">
                  <label className="text-[10px] font-bold uppercase tracking-widest opacity-40 dark:text-white/40 mb-4 block">Intelligence Data Points</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[
                      { id: 'gdp', label: 'GDP Growth' },
                      { id: 'inflation', label: 'Inflation Rates' },
                      { id: 'policy_rates', label: 'Central Bank Policy Rates' },
                      { id: 'conflict_index', label: 'Conflict Escalation Indices' },
                      { id: 'trade_balance', label: 'Trade Balance Figures' },
                      { id: 'unemployment', label: 'Unemployment Data' },
                      { id: 'consumer_sentiment', label: 'Consumer Sentiment' },
                      { id: 'manufacturing_pmi', label: 'Manufacturing PMI' }
                    ].map(point => {
                      const isSelected = (profile?.prioritizedDataPoints || []).includes(point.id);
                      return (
                        <button
                          key={point.id}
                          onClick={() => {
                            const current = profile?.prioritizedDataPoints || [];
                            const next = isSelected 
                              ? current.filter((id: string) => id !== point.id)
                              : [...current, point.id];
                            updateProfile({ prioritizedDataPoints: next });
                          }}
                          className={cn(
                            "flex items-center justify-between p-4 rounded-xl border transition-all text-left group",
                            isSelected 
                              ? "bg-emerald-500/10 border-emerald-500/50 text-emerald-700 dark:text-emerald-400"
                              : "bg-black/5 dark:bg-white/5 border-black/5 dark:border-white/5 dark:text-white/60 hover:border-emerald-500/30"
                          )}
                        >
                          <span className="text-xs font-medium">{point.label}</span>
                          <div className={cn(
                            "w-4 h-4 rounded-full border flex items-center justify-center transition-all",
                            isSelected 
                              ? "bg-emerald-500 border-emerald-500 text-white"
                              : "border-black/20 dark:border-white/20"
                          )}>
                            {isSelected && <ShieldCheck size={10} />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  <p className="mt-4 text-[10px] opacity-40 dark:text-white/40 italic">Prioritized data points will be highlighted and analyzed with greater depth in your briefings.</p>
                </div>
              </section>

              {/* Notifications & Privacy */}
              <section className="space-y-6">
                <div className="flex items-center gap-3">
                  <PremiumIcon icon={Shield} color="violet" size={14} />
                  <h3 className="serif text-xl md:text-2xl font-light dark:text-white">Security & Privacy</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-6 bg-white dark:bg-white/5 rounded-2xl border border-black/5 dark:border-white/5 space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-xs font-bold dark:text-white">Email Briefings</p>
                        <p className="text-[10px] opacity-40 dark:text-white/40">Receive intelligence reports via email.</p>
                      </div>
                      <button 
                        onClick={() => updateProfile({ emailNotifications: !profile?.emailNotifications })}
                        className={cn(
                          "w-10 h-5 rounded-full transition-all relative",
                          profile?.emailNotifications ? "bg-emerald-500" : "bg-black/10 dark:bg-white/10"
                        )}
                      >
                        <div className={cn(
                          "absolute top-1 w-3 h-3 rounded-full bg-white transition-all",
                          profile?.emailNotifications ? "right-1" : "left-1"
                        )} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-xs font-bold dark:text-white">Nexus Alerts</p>
                        <p className="text-[10px] opacity-40 dark:text-white/40">Real-time push notifications for critical events.</p>
                      </div>
                      <button 
                        onClick={() => updateProfile({ pushNotifications: !profile?.pushNotifications })}
                        className={cn(
                          "w-10 h-5 rounded-full transition-all relative",
                          profile?.pushNotifications ? "bg-emerald-500" : "bg-black/10 dark:bg-white/10"
                        )}
                      >
                        <div className={cn(
                          "absolute top-1 w-3 h-3 rounded-full bg-white transition-all",
                          profile?.pushNotifications ? "right-1" : "left-1"
                        )} />
                      </button>
                    </div>
                  </div>

                  <div className="p-6 bg-white dark:bg-white/5 rounded-2xl border border-black/5 dark:border-white/5 space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-xs font-bold dark:text-white">Anonymous Analytics</p>
                        <p className="text-[10px] opacity-40 dark:text-white/40">Help improve Meridian with anonymous data.</p>
                      </div>
                      <button 
                        onClick={() => updateProfile({ anonymousAnalytics: !profile?.anonymousAnalytics })}
                        className={cn(
                          "w-10 h-5 rounded-full transition-all relative",
                          profile?.anonymousAnalytics ? "bg-emerald-500" : "bg-black/10 dark:bg-white/10"
                        )}
                      >
                        <div className={cn(
                          "absolute top-1 w-3 h-3 rounded-full bg-white transition-all",
                          profile?.anonymousAnalytics ? "right-1" : "left-1"
                        )} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-xs font-bold dark:text-white">Data Encryption</p>
                        <p className="text-[10px] opacity-40 dark:text-white/40">All intelligence data is AES-256 encrypted.</p>
                      </div>
                      <ShieldCheck size={16} className="text-emerald-500" />
                    </div>
                  </div>
                </div>
              </section>

              {/* Assets Section */}
              <section className="space-y-6">
                <div className="flex items-center gap-3">
                  <PremiumIcon icon={Building2} color="orange" size={14} />
                  <h3 className="serif text-xl md:text-2xl font-light dark:text-white">Intelligence Assets</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Entity List Editor */}
                  <div className="p-6 bg-white dark:bg-white/5 rounded-2xl border border-black/5 dark:border-white/5 space-y-6">
                    <div className="flex items-center justify-between">
                      <h5 className="text-[10px] font-bold uppercase tracking-widest opacity-60 dark:text-white/60">Monitored Entities</h5>
                      <span className="text-[8px] font-mono opacity-30">{monitoredEntities.length} ACTIVE</span>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex gap-2">
                        <input 
                          type="text"
                          value={newEntityName}
                          onChange={(e) => setNewEntityName(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleAddEntity()}
                          placeholder="Add entity name..."
                          className="flex-1 bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 rounded-xl px-4 py-2.5 text-xs dark:text-white outline-none focus:ring-1 focus:ring-emerald-500/30"
                        />
                        <button 
                          onClick={handleAddEntity}
                          className="px-4 py-2.5 bg-emerald-500 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-emerald-600 transition-colors"
                        >
                          Add
                        </button>
                      </div>
                      <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
                        {['Organization', 'Person', 'Location', 'Event', 'General'].map(cat => (
                          <button
                            key={cat}
                            onClick={() => setNewEntityCategory(cat)}
                            className={cn(
                              "px-3 py-1.5 rounded-lg text-[8px] font-bold uppercase tracking-wider border transition-all whitespace-nowrap",
                              newEntityCategory === cat
                                ? "bg-black text-white border-black dark:bg-white dark:text-black dark:border-white"
                                : "bg-transparent border-black/10 dark:border-white/10 dark:text-white/40 hover:border-black/20"
                            )}
                          >
                            {cat}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="bg-black/5 dark:bg-white/5 rounded-xl divide-y divide-black/5 dark:divide-white/5 max-h-[240px] overflow-y-auto custom-scrollbar">
                      {monitoredEntities.map(entity => (
                        <div key={entity.id} className="p-3 flex items-center justify-between group hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                          <div className="flex items-center gap-3">
                            <span className="text-sm">{entity.flag}</span>
                            <span className="text-xs font-medium dark:text-white">{entity.name}</span>
                          </div>
                          <button 
                            onClick={() => handleUpdateEntities(monitoredEntities.filter(e => e.id !== entity.id))}
                            className="text-red-500/40 hover:text-red-500 transition-colors p-1.5 opacity-0 group-hover:opacity-100"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Market Signal Editor */}
                  <div className="p-6 bg-white dark:bg-white/5 rounded-2xl border border-black/5 dark:border-white/5 space-y-6">
                    <div className="flex items-center justify-between">
                      <h5 className="text-[10px] font-bold uppercase tracking-widest opacity-60 dark:text-white/60">Market Signals</h5>
                      <span className="text-[8px] font-mono opacity-30">{marketSignals.length} TRACKED</span>
                    </div>

                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <input 
                          type="text"
                          value={newMarketTicker}
                          onChange={(e) => setNewMarketTicker(e.target.value)}
                          placeholder="Ticker..."
                          className="w-20 bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 rounded-xl px-4 py-2.5 text-xs dark:text-white outline-none focus:ring-1 focus:ring-emerald-500/30"
                        />
                        <input 
                          type="text"
                          value={newMarketName}
                          onChange={(e) => setNewMarketName(e.target.value)}
                          placeholder="Asset Name..."
                          className="flex-1 bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 rounded-xl px-4 py-2.5 text-xs dark:text-white outline-none focus:ring-1 focus:ring-emerald-500/30"
                        />
                      </div>
                      <button 
                        onClick={handleAddMarket}
                        className="w-full py-2.5 bg-emerald-500 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-emerald-600 transition-colors"
                      >
                        Add Asset
                      </button>
                    </div>

                    <div className="bg-black/5 dark:bg-white/5 rounded-xl divide-y divide-black/5 dark:divide-white/5 max-h-[240px] overflow-y-auto custom-scrollbar">
                      {marketSignals.map(signal => (
                        <div key={signal.ticker} className="p-3 flex items-center justify-between group hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                          <div className="flex items-center gap-3">
                            <span className="text-[10px] font-bold text-emerald-500 w-12">{signal.ticker}</span>
                            <span className="text-xs font-medium dark:text-white">{signal.name}</span>
                          </div>
                          <button 
                            onClick={() => handleUpdateMarkets(marketSignals.filter(s => s.ticker !== signal.ticker))}
                            className="text-red-500/40 hover:text-red-500 transition-colors p-1.5 opacity-0 group-hover:opacity-100"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </section>

              {/* Danger Zone */}
              <section className="pt-12 border-t border-black/5 dark:border-white/5">
                <div className="p-8 bg-red-500/5 rounded-[2.5rem] border border-red-500/10 space-y-6">
                  <div>
                    <h4 className="text-sm font-bold text-red-500 uppercase tracking-widest mb-1">Danger Zone</h4>
                    <p className="text-xs opacity-60 dark:text-white/40">Irreversible actions regarding your intelligence profile.</p>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-4">
                    <button 
                      onClick={() => showNotification("Data export initiated. Check your email.", "success")}
                      className="px-6 py-3 bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-black/5 dark:hover:bg-white/10 transition-all dark:text-white"
                    >
                      Export Intelligence Data
                    </button>
                    <button 
                      onClick={() => setShowPurgeModal(true)}
                      className="px-6 py-3 bg-red-500 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-red-600 transition-all shadow-lg shadow-red-500/20"
                    >
                      Purge Account Data
                    </button>
                  </div>
                </div>
              </section>

              <div className="flex flex-col items-center gap-6 pt-12">
                <button 
                  onClick={handleSaveSettings}
                  disabled={isSaving}
                  className="px-12 py-4 bg-emerald-500 text-white text-xs font-bold uppercase tracking-widest rounded-full hover:bg-emerald-600 transition-all shadow-xl shadow-emerald-500/20 flex items-center gap-3"
                >
                  {isSaving ? <Loader2 className="animate-spin" size={16} /> : <ShieldCheck size={16} />}
                  {isSaving ? 'Synchronizing Configuration...' : 'Save All Changes'}
                </button>

                <button 
                  onClick={logout}
                  className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-red-500 hover:text-red-600 transition-colors"
                >
                  <LogOut size={14} />
                  Sign Out of Meridian
                </button>
              </div>
            </motion.div>
          )}

          <ConfirmationModal 
            isOpen={showPurgeModal}
            onClose={() => setShowPurgeModal(false)}
            onConfirm={() => showNotification("Account data purged.", "error")}
            title="Purge Account Data"
            message="Are you sure you want to purge all intelligence records? This action is irreversible and will permanently delete your history, preferences, and monitored assets."
          />
        </AnimatePresence>

        <MeridianChat activeReport={activeReport} darkMode={darkMode} />
      </main>

      {/* Asset Summary Modal */}
      <AnimatePresence>
        {assetSummary && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-4 md:p-8"
            onClick={() => setAssetSummary(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white dark:bg-[#0a0a0a] w-full max-w-4xl max-h-[90vh] rounded-[2.5rem] shadow-2xl border border-black/5 dark:border-white/10 overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-8 md:p-12 border-b border-black/5 dark:border-white/5 flex justify-between items-start bg-black/[0.02] dark:bg-white/[0.02]">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-[#D4AF37]">{assetSummary.type} Intelligence</span>
                    <div className="h-1 w-1 rounded-full bg-black/20 dark:bg-white/20" />
                    <span className="text-[10px] uppercase tracking-widest font-bold opacity-40 dark:text-white/40">Strategic Briefing</span>
                  </div>
                  <h2 className="serif text-3xl md:text-5xl font-light dark:text-white leading-tight">{assetSummary.title}</h2>
                </div>
                <button 
                  onClick={() => setAssetSummary(null)}
                  className="p-3 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                >
                  <X size={24} className="dark:text-white opacity-40" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar p-8 md:p-12">
                <div className="max-w-3xl mx-auto">
                  <div className="markdown-body dark:text-white/80 leading-relaxed text-lg">
                    <Markdown>{assetSummary.content}</Markdown>
                  </div>
                </div>
              </div>

              <div className="p-8 border-t border-black/5 dark:border-white/5 bg-black/[0.02] dark:bg-white/[0.02] flex justify-between items-center">
                <div className="flex items-center gap-2 opacity-40">
                  <ShieldCheck size={14} className="text-emerald-500" />
                  <span className="text-[10px] uppercase tracking-widest font-bold dark:text-white">Verified Intelligence Source</span>
                </div>
                <button 
                  onClick={() => setAssetSummary(null)}
                  className="px-8 py-3 rounded-xl bg-black dark:bg-white text-white dark:text-black text-xs font-bold uppercase tracking-widest hover:opacity-90 transition-opacity"
                >
                  Dismiss Briefing
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading Overlay for Asset Summary */}
      <AnimatePresence>
        {isAssetSummaryLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[110] flex flex-col items-center justify-center space-y-6"
          >
            <div className="relative">
              <div className="w-20 h-20 rounded-full border-2 border-white/10 border-t-emerald-500 animate-spin" />
              <Sparkles className="absolute inset-0 m-auto text-emerald-500 animate-pulse" size={32} />
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-white text-lg font-light tracking-widest uppercase">Synthesizing Intelligence</h3>
              <p className="text-white/40 text-[10px] uppercase tracking-[0.3em] animate-pulse">Accessing Global Intelligence Grid...</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Catch-up Brief Modal */}
      <AnimatePresence>
        {isCatchUpModalOpen && catchUpBrief && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-3xl bg-white dark:bg-[#111] rounded-[3rem] shadow-2xl overflow-hidden border border-black/5 dark:border-white/10"
            >
              <div className="p-8 md:p-12 max-h-[80vh] overflow-y-auto custom-scrollbar">
                <div className="flex justify-between items-start mb-8">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-500">
                      <Zap size={24} />
                    </div>
                    <div>
                      <h2 className="serif text-3xl font-light dark:text-white">Welcome Back</h2>
                      <p className="text-xs uppercase tracking-widest font-bold opacity-40 dark:text-white/40">Your Intelligence Catch-up Brief</p>
                    </div>
                  </div>
                  <button onClick={() => setIsCatchUpModalOpen(false)} className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-full">
                    <X size={24} className="dark:text-white" />
                  </button>
                </div>

                <div className="space-y-8">
                  <div className="p-6 bg-emerald-500/5 rounded-3xl border border-emerald-500/10">
                    <h3 className="text-lg font-semibold dark:text-white mb-4">{catchUpBrief.title}</h3>
                    <div className="markdown-body dark:text-white/80 leading-relaxed text-sm">
                      <Markdown>{catchUpBrief.content}</Markdown>
                    </div>
                  </div>

                  {catchUpBrief.criticalAlerts.length > 0 && (
                    <div className="space-y-4">
                      <h4 className="text-[10px] uppercase tracking-widest font-bold opacity-40 dark:text-white/40">Critical Alerts</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {catchUpBrief.criticalAlerts.map((alert, i) => (
                          <div key={i} className="p-4 bg-red-500/5 border border-red-500/10 rounded-2xl flex items-start gap-3">
                            <ShieldCheck size={16} className="text-red-500 shrink-0 mt-0.5" />
                            <p className="text-xs font-medium dark:text-white/90">{alert}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-12 pt-8 border-t border-black/5 dark:border-white/5 flex justify-end">
                  <button 
                    onClick={() => setIsCatchUpModalOpen(false)}
                    className="px-8 py-4 bg-black text-white dark:bg-white dark:text-black rounded-2xl font-semibold text-sm hover:scale-105 transition-transform"
                  >
                    Enter Intelligence Hub
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Notification Toast */}
      {/* Global Loading Overlay */}
      <AnimatePresence>
        {isGenerating && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-[200] flex flex-col items-center justify-center p-8 text-center"
          >
            <div className="relative w-32 h-32 mb-12">
              <div className="absolute inset-0 border-4 border-emerald-500/20 rounded-full" />
              <motion.div 
                className="absolute inset-0 border-4 border-emerald-500 rounded-full border-t-transparent"
                animate={{ rotate: 360 }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <Shield size={32} className="text-emerald-500" />
              </div>
            </div>
            
            <h2 className="serif text-4xl font-light text-white mb-4">{loadingMessage}</h2>
            <div className="w-64 h-1 bg-white/10 rounded-full overflow-hidden mb-4">
              <motion.div 
                className="h-full bg-emerald-500"
                initial={{ width: 0 }}
                animate={{ width: `${generationProgress}%` }}
              />
            </div>
            <p className="text-[10px] uppercase tracking-[0.4em] font-bold text-white/40">Meridian Intelligence Synthesis in Progress</p>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className={cn(
              "fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 rounded-full shadow-2xl text-sm font-medium w-[90%] md:w-auto text-center",
              notification.type === 'success' ? "bg-black text-white dark:bg-white dark:text-black" : "bg-red-500 text-white"
            )}
          >
            {notification.message}
          </motion.div>
        )}
      </AnimatePresence>
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
            Meridian <span className="italic-small">Intelligence</span>
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
        © 2026 Meridian Intelligence Group • Private & Confidential
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
