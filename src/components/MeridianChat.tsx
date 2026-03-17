import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, Send, X, Loader2, Sparkles, Zap, ShieldCheck } from 'lucide-react';
import Markdown from 'react-markdown';
import { askMeridian } from '../services/geminiService';

interface Message {
  role: 'user' | 'meridian';
  content: string;
}

interface MeridianChatProps {
  activeReport: any;
  darkMode: boolean;
}

export const MeridianChat: React.FC<MeridianChatProps> = ({ activeReport, darkMode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !activeReport || isLoading) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await askMeridian(activeReport.content, input);
      const meridianMessage: Message = { role: 'meridian', content: response };
      setMessages(prev => [...prev, meridianMessage]);
    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [...prev, { role: 'meridian', content: "I encountered an error while interrogating the intelligence. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 md:bottom-8 right-4 md:right-8 z-50 w-12 h-12 md:w-16 md:h-16 rounded-full bg-black dark:bg-white text-white dark:text-black shadow-2xl group hover:scale-110 transition-all duration-500 flex items-center justify-center"
      >
        <div className="absolute inset-0 rounded-full bg-emerald-500/20 animate-pulse group-hover:animate-none" />
        <div className="relative z-10">
          <Sparkles size={20} className="md:hidden" />
          <Sparkles size={28} className="hidden md:block" />
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full md:w-[450px] bg-white dark:bg-[#0a0a0a] shadow-[-20px_0_60px_rgba(0,0,0,0.2)] z-[60] flex flex-col border-l border-black/5 dark:border-white/5"
          >
            {/* Header */}
            <div className="p-6 md:p-8 border-b border-black/5 dark:border-white/5 flex justify-between items-center">
              <div className="flex items-center gap-3 md:gap-4">
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-black dark:bg-white flex items-center justify-center">
                  <Sparkles size={16} className="text-white dark:text-black md:hidden" />
                  <Sparkles size={20} className="text-white dark:text-black hidden md:block" />
                </div>
                <div>
                  <h3 className="serif text-lg md:text-xl font-light dark:text-white">Ask Meridian</h3>
                  <p className="text-[9px] md:text-[10px] uppercase tracking-widest font-bold opacity-40 dark:text-white/40">Intelligence Interrogation</p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors"
              >
                <X size={20} className="dark:text-white" />
              </button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 md:space-y-8 custom-scrollbar">
              {messages.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4 md:space-y-6 opacity-40">
                  <Zap size={40} className="dark:text-white md:hidden" />
                  <Zap size={48} className="dark:text-white hidden md:block" />
                  <div className="space-y-2">
                    <p className="text-sm font-medium dark:text-white">Interrogate the Briefing</p>
                    <p className="text-xs max-w-[200px] mx-auto">Ask about second-order effects, market transmission, or strategic risks.</p>
                  </div>
                </div>
              )}
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[90%] md:max-w-[85%] p-4 md:p-5 rounded-2xl ${
                    msg.role === 'user' 
                      ? 'bg-black text-white dark:bg-white dark:text-black shadow-lg' 
                      : 'bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 dark:text-white'
                  }`}>
                    <div className="markdown-body text-xs md:text-sm leading-relaxed">
                      <Markdown>{msg.content}</Markdown>
                    </div>
                  </div>
                </motion.div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-black/5 dark:bg-white/5 p-4 md:p-5 rounded-2xl flex items-center gap-3">
                    <Loader2 size={14} className="animate-spin dark:text-white" />
                    <span className="text-[10px] md:text-xs font-medium opacity-40 dark:text-white/40">Meridian is thinking...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-6 md:p-8 border-t border-black/5 dark:border-white/5">
              <div className="relative">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ask Meridian..."
                  className="w-full pl-5 pr-12 md:pl-6 md:pr-14 py-3 md:py-4 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 text-sm focus:ring-2 focus:ring-black dark:focus:ring-white transition-all dark:text-white"
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 md:w-10 md:h-10 rounded-xl bg-black dark:bg-white text-white dark:text-black flex items-center justify-center disabled:opacity-20 transition-all"
                >
                  <Send size={14} className="md:hidden" />
                  <Send size={16} className="hidden md:block" />
                </button>
              </div>
              <div className="mt-4 flex items-center justify-center gap-2 opacity-20">
                <ShieldCheck size={12} className="dark:text-white" />
                <span className="text-[8px] md:text-[9px] uppercase tracking-[0.2em] font-bold dark:text-white">Secure Intelligence Channel</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
