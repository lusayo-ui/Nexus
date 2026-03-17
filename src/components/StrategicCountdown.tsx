import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Timer, AlertTriangle, ChevronRight, Sparkles, ChevronLeft } from 'lucide-react';

interface Event {
  id: string;
  name: string;
  targetDate: Date;
  risk: 'Low' | 'Medium' | 'High';
}

interface StrategicCountdownProps {
  onTriggerBrief: (eventName: string) => void;
}

export const StrategicCountdown: React.FC<StrategicCountdownProps> = ({ onTriggerBrief }) => {
  const [events] = useState<Event[]>([
    { id: '1', name: "Fed FOMC Interest Rate Decision", targetDate: new Date(Date.now() + 2 * 24 * 3600 * 1000 + 5 * 3600 * 1000), risk: 'High' },
    { id: '2', name: "OPEC+ Ministerial Meeting", targetDate: new Date(Date.now() + 4 * 24 * 3600 * 1000 + 12 * 3600 * 1000), risk: 'Medium' },
    { id: '3', name: "EU Energy Summit", targetDate: new Date(Date.now() + 1 * 24 * 3600 * 1000 + 8 * 3600 * 1000), risk: 'High' },
  ]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const currentEvent = events[currentIndex];

  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calculateTime = () => {
      const now = new Date().getTime();
      const distance = currentEvent.targetDate.getTime() - now;

      if (distance < 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000)
      });
    };

    calculateTime();
    const timer = setInterval(calculateTime, 1000);
    return () => clearInterval(timer);
  }, [currentEvent]);

  const nextEvent = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % events.length);
  };

  const prevEvent = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + events.length) % events.length);
  };

  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      onClick={() => onTriggerBrief(currentEvent.name)}
      className="relative p-6 glass rounded-[2rem] border border-[#D4AF37]/20 cursor-pointer group overflow-hidden premium-shadow"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-[#D4AF37]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
      
      <div className="relative flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-6 flex-1 w-full">
          {/* Compact Timer Ring */}
          <div className="relative w-14 h-14 flex items-center justify-center shrink-0">
            <svg className="w-full h-full -rotate-90">
              <circle cx="28" cy="28" r="24" fill="transparent" stroke="rgba(212, 175, 55, 0.1)" strokeWidth="3" />
              <motion.circle
                cx="28" cy="28" r="24" fill="transparent" stroke="#D4AF37" strokeWidth="3"
                strokeDasharray={150}
                initial={{ strokeDashoffset: 150 }}
                animate={{ strokeDashoffset: 150 * (1 - (timeLeft.seconds / 60)) }}
                transition={{ duration: 1 }}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <Timer className="text-[#D4AF37]" size={14} />
              <span className="text-[7px] text-[#D4AF37] font-bold tracking-tighter uppercase">Live</span>
            </div>
          </div>

          {/* Event Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <div className="px-2 py-0.5 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/20">
                <span className="text-[7px] text-[#D4AF37] font-bold uppercase tracking-widest">Strategic Event {currentIndex + 1}/{events.length}</span>
              </div>
              <div className={`flex items-center gap-1 ${currentEvent.risk === 'High' ? 'text-red-500' : 'text-amber-500'} opacity-60`}>
                <AlertTriangle size={10} />
                <span className="text-[7px] font-bold uppercase tracking-widest">{currentEvent.risk} Risk</span>
              </div>
            </div>

            <AnimatePresence mode="wait">
              <motion.h3
                key={currentEvent.id}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="serif text-base text-white font-light leading-tight truncate"
              >
                {currentEvent.name}
              </motion.h3>
            </AnimatePresence>

            <div className="flex items-center gap-3 mt-1">
              {[
                { label: 'D', value: timeLeft.days },
                { label: 'H', value: timeLeft.hours },
                { label: 'M', value: timeLeft.minutes },
                { label: 'S', value: timeLeft.seconds }
              ].map((unit, i) => (
                <div key={i} className="flex items-baseline gap-1">
                  <span className="text-sm text-[#D4AF37] font-light tabular-nums">
                    {unit.value.toString().padStart(2, '0')}
                  </span>
                  <span className="text-[7px] text-white/30 uppercase font-bold">
                    {unit.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Controls & Action */}
        <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-white/5">
          <div className="flex items-center gap-1">
            <button onClick={prevEvent} className="p-1.5 hover:bg-white/5 rounded-lg text-white/40 hover:text-white transition-colors">
              <ChevronLeft size={16} />
            </button>
            <button onClick={nextEvent} className="p-1.5 hover:bg-white/5 rounded-lg text-white/40 hover:text-white transition-colors">
              <ChevronRight size={16} />
            </button>
          </div>
          
          <div className="hidden sm:block h-8 w-[1px] bg-white/10 mx-1" />

          <div className="flex items-center gap-2">
            <div className="flex flex-col items-center gap-0.5">
              <div className="w-8 h-8 rounded-full border border-[#D4AF37]/30 flex items-center justify-center group-hover:bg-[#D4AF37] group-hover:text-black transition-all duration-500">
                <Sparkles size={14} className="text-[#D4AF37] group-hover:text-black" />
              </div>
              <span className="text-[7px] text-[#D4AF37] font-bold uppercase tracking-widest">Brief</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
