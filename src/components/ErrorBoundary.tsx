import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCcw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      let errorMessage = "An unexpected intelligence failure occurred.";
      let isFirestoreError = false;

      try {
        if (this.state.error?.message) {
          const parsed = JSON.parse(this.state.error.message);
          if (parsed.operationType) {
            isFirestoreError = true;
            errorMessage = `Intelligence Access Denied: ${parsed.operationType} on ${parsed.path || 'unknown path'}`;
          }
        }
      } catch (e) {
        errorMessage = this.state.error?.message || errorMessage;
      }

      return (
        <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-white/5 border border-white/10 rounded-[2.5rem] p-12 text-center space-y-8 backdrop-blur-xl">
            <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto">
              <AlertTriangle className="text-red-500" size={40} />
            </div>
            
            <div className="space-y-4">
              <h2 className="serif text-3xl text-white font-light">System Compromised</h2>
              <p className="text-sm text-white/40 leading-relaxed">
                {isFirestoreError ? "Security protocols blocked access to this intelligence node." : errorMessage}
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={() => window.location.reload()}
                className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-white text-black rounded-2xl font-semibold text-sm hover:scale-105 transition-transform"
              >
                <RefreshCcw size={18} />
                Re-initialize System
              </button>
              <button
                onClick={() => window.location.href = '/'}
                className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-white/5 text-white rounded-2xl font-semibold text-sm hover:bg-white/10 transition-colors"
              >
                <Home size={18} />
                Return to Command
              </button>
            </div>

            <div className="pt-8 border-t border-white/5">
              <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-white/20">Meridian Intelligence Protocol v4.0</p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
