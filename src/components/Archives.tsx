import React from 'react';
import { motion } from 'motion/react';
import { ChevronRight } from 'lucide-react';

interface ArchiveItem {
  id: string;
  title: string;
  date: Date;
  tags: string[];
}

interface ArchivesProps {
  items: ArchiveItem[];
  onSelect: (item: ArchiveItem) => void;
  darkMode: boolean;
}

export const Archives: React.FC<ArchivesProps> = ({ items, onSelect, darkMode }) => {
  // Group items by month
  const groupedItems = items.reduce((acc, item) => {
    const month = item.date.toLocaleString('default', { month: 'long', year: 'numeric' });
    if (!acc[month]) acc[month] = [];
    acc[month].push(item);
    return acc;
  }, {} as Record<string, ArchiveItem[]>);

  return (
    <div className="space-y-12">
      {Object.entries(groupedItems).map(([month, monthItems]) => (
        <div key={month} className="space-y-6">
          <div className="flex items-center gap-4">
            <h3 className="serif text-xl font-light opacity-60 dark:text-white/60 whitespace-nowrap">{month}</h3>
            <div className="h-[0.5px] w-full bg-black/10 dark:bg-white/10" />
          </div>

          <div className="space-y-4">
            {monthItems.map((item) => (
              <motion.button
                key={item.id}
                onClick={() => onSelect(item)}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full group flex items-start gap-4 md:gap-6 text-left"
              >
                {/* Left Column: Date */}
                <div className="flex flex-col items-center w-12 md:w-16 shrink-0">
                  <span className="serif text-2xl md:text-4xl font-light leading-none dark:text-white">
                    {item.date.getDate().toString().padStart(2, '0')}
                  </span>
                  <span className="text-[8px] md:text-[10px] uppercase tracking-widest font-bold opacity-40 dark:text-white/40 mt-1">
                    {item.date.toLocaleString('default', { month: 'short' })}
                  </span>
                </div>

                {/* Vertical Divider */}
                <div className="w-[0.5px] self-stretch bg-black/10 dark:bg-white/10" />

                {/* Right Column: Content */}
                <div className="flex-1 py-1">
                  <h4 className="serif text-base md:text-lg font-light leading-snug group-hover:italic transition-all duration-300 dark:text-white">
                    {item.title}
                  </h4>
                  <div className="mt-2 md:mt-3 flex flex-wrap gap-1.5 md:gap-2">
                    {item.tags.map((tag, i) => (
                      <span 
                        key={i} 
                        className="text-[7px] md:text-[8px] uppercase tracking-widest font-bold px-2 py-0.5 rounded-full bg-black/5 dark:bg-white/10 opacity-60 dark:text-white"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="self-center opacity-0 group-hover:opacity-40 transition-opacity">
                  <ChevronRight className="w-3.5 h-3.5 md:w-4 md:h-4 dark:text-white" />
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
