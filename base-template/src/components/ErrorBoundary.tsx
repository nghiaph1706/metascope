import React, { Component, ReactNode, ErrorInfo } from 'react';
import { AlertCircle } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  errorMessage: string;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public override state: ErrorBoundaryState = {
    hasError: false,
    errorMessage: ''
  };

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, errorMessage: error.message };
  }

  public override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error', error, errorInfo);
  }

  public override render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#070b13] text-slate-100 flex items-center justify-center font-sans p-6 rounded-lg">
          <div className="bg-[#111827] border border-rose-500/30 p-8 rounded-3xl max-w-lg text-center space-y-4 shadow-2xl">
            <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
            <h1 className="text-xl font-black uppercase tracking-widest text-rose-400">Application Error</h1>
            <p className="text-sm text-slate-400 font-mono">
              A critical failure occurred rendering this interface.
            </p>
            <div className="bg-[#0c121f] rounded-lg p-4 text-xs font-mono text-left overflow-x-auto text-rose-200 border border-slate-800">
              {this.state.errorMessage}
            </div>
            <button
              onClick={() => window.location.reload()}
              className="mt-6 bg-slate-800 hover:bg-[#1a233b] font-bold px-6 py-2 rounded-xl text-sm transition-colors text-white"
            >
              RESTART APPLICATION
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
