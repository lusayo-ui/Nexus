import React from 'react';

interface SkeletonLoaderProps {
  darkMode?: boolean;
  progress?: number;
  message?: string;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({ darkMode, progress, message }) => {
  return (
    <div className={`max-w-5xl mx-auto ${darkMode ? 'bg-[#0a0a0a] border-white/5' : 'bg-[#fcfcfc] border-black/5'} shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)] rounded-2xl md:rounded-[3rem] border overflow-hidden relative`}>
      {/* Progress Bar Overlay */}
      {progress !== undefined && (
        <div className="absolute top-0 left-0 right-0 h-1 z-50 bg-black/5 dark:bg-white/5">
          <div 
            className="h-full bg-emerald-500 transition-all duration-700 ease-in-out shadow-[0_0_15px_rgba(16,185,129,0.6)]"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {/* Header Image Skeleton */}
      <div className={`w-full h-64 md:h-[30rem] ${darkMode ? 'bg-white/5' : 'bg-black/5'} relative overflow-hidden`}>
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />
        
        {progress !== undefined && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-md">
            <div className="text-center space-y-4 md:space-y-6 px-6">
              <div className="relative w-24 h-24 md:w-32 md:h-32 mx-auto">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="48"
                    cy="48"
                    r="42"
                    stroke="currentColor"
                    strokeWidth="2"
                    fill="transparent"
                    className="text-white/10 md:hidden"
                  />
                  <circle
                    cx="48"
                    cy="48"
                    r="42"
                    stroke="currentColor"
                    strokeWidth="2"
                    fill="transparent"
                    strokeDasharray={263.9}
                    strokeDashoffset={263.9 * (1 - progress / 100)}
                    className="text-emerald-500 transition-all duration-700 ease-in-out md:hidden"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r="58"
                    stroke="currentColor"
                    strokeWidth="2"
                    fill="transparent"
                    className="text-white/10 hidden md:block"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r="58"
                    stroke="currentColor"
                    strokeWidth="2"
                    fill="transparent"
                    strokeDasharray={364.4}
                    strokeDashoffset={364.4 * (1 - progress / 100)}
                    className="text-emerald-500 transition-all duration-700 ease-in-out hidden md:block"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="serif text-2xl md:text-3xl font-light text-white tracking-tighter">{Math.round(progress)}%</span>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-[8px] md:text-[10px] uppercase tracking-[0.4em] text-emerald-400 font-bold animate-pulse">
                  System Synthesis
                </p>
                <p className="text-xs md:text-sm text-white/80 font-medium tracking-tight h-4">
                  {message || "Synthesizing Intelligence..."}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="p-6 md:p-20 -mt-12 md:-mt-32 relative z-10">
        <header className={`mb-10 md:mb-16 border-b ${darkMode ? 'border-white/10' : 'border-black/10'} pb-8 md:pb-12`}>
          <div className="flex justify-between items-start mb-6 md:mb-8">
            <div className="space-y-2">
              <div className={`h-3 w-32 ${darkMode ? 'bg-white/10' : 'bg-black/5'} rounded-full animate-pulse`} />
              <div className={`h-3 w-24 ${darkMode ? 'bg-white/10' : 'bg-black/5'} rounded-full animate-pulse`} />
            </div>
            <div className="flex gap-2 md:gap-4">
              <div className={`w-8 h-8 md:w-12 md:h-12 rounded-full ${darkMode ? 'bg-white/10' : 'bg-black/5'} animate-pulse`} />
              <div className={`w-8 h-8 md:w-12 md:h-12 rounded-full ${darkMode ? 'bg-white/10' : 'bg-black/5'} animate-pulse`} />
              <div className={`w-8 h-8 md:w-12 md:h-12 rounded-full ${darkMode ? 'bg-white/10' : 'bg-black/5'} animate-pulse`} />
            </div>
          </div>
          
          <div className="space-y-4 mb-8 md:mb-10">
            <div className={`h-8 md:h-12 w-full ${darkMode ? 'bg-white/10' : 'bg-black/5'} rounded-xl md:rounded-2xl animate-pulse`} />
            <div className={`h-8 md:h-12 w-3/4 ${darkMode ? 'bg-white/10' : 'bg-black/5'} rounded-xl md:rounded-2xl animate-pulse`} />
          </div>

          <div className="flex flex-wrap gap-3 md:gap-4 items-center">
            <div className={`h-6 md:h-8 w-24 md:w-32 ${darkMode ? 'bg-white/10' : 'bg-black/5'} rounded-full animate-pulse`} />
            <div className={`h-6 md:h-8 w-20 md:w-24 ${darkMode ? 'bg-white/10' : 'bg-black/5'} rounded-full animate-pulse`} />
            <div className={`h-6 md:h-8 w-24 md:w-28 ${darkMode ? 'bg-white/10' : 'bg-black/5'} rounded-full animate-pulse`} />
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 mb-12 md:mb-20">
          <div className="lg:col-span-7 space-y-6 md:space-y-8">
            <div className="space-y-4">
              <div className={`h-4 w-40 ${darkMode ? 'bg-white/10' : 'bg-black/5'} rounded-full animate-pulse`} />
              <div className={`h-24 w-full ${darkMode ? 'bg-white/10' : 'bg-black/5'} rounded-2xl md:rounded-3xl animate-pulse`} />
            </div>
            <div className="space-y-4">
              <div className={`h-4 w-40 ${darkMode ? 'bg-white/10' : 'bg-black/5'} rounded-full animate-pulse`} />
              <div className={`h-[200px] md:h-[250px] w-full ${darkMode ? 'bg-white/10' : 'bg-black/5'} rounded-2xl md:rounded-3xl animate-pulse`} />
            </div>
          </div>

          <div className="lg:col-span-5 space-y-6">
            <div className={`h-4 w-40 ${darkMode ? 'bg-white/10' : 'bg-black/5'} rounded-full animate-pulse`} />
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className={`h-16 md:h-20 w-full ${darkMode ? 'bg-white/10' : 'bg-black/5'} rounded-xl md:rounded-2xl animate-pulse`} />
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6 mb-12 md:mb-20">
          <div className={`h-4 w-40 ${darkMode ? 'bg-white/10' : 'bg-black/5'} rounded-full animate-pulse`} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {[1, 2].map((i) => (
              <div key={i} className={`h-40 md:h-48 w-full ${darkMode ? 'bg-white/10' : 'bg-black/5'} rounded-2xl md:rounded-[2.5rem] animate-pulse`} />
            ))}
          </div>
        </div>

        <div className="space-y-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className={`h-3 md:h-4 w-full ${darkMode ? 'bg-white/10' : 'bg-black/5'} rounded-full animate-pulse`} />
          ))}
        </div>
      </div>
    </div>
  );
};
