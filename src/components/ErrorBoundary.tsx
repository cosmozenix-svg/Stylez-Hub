import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { BRAND } from '../constants/brand';

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
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(`${BRAND.name} Application caught error:`, error, errorInfo);
  }

  private handleReset = () => {
    try {
      localStorage.removeItem('stylezhub_blogs_v1');
      localStorage.removeItem('stylezhub_news_v1');
    } catch {
      // ignore
    }
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen stylez-backdrop text-slate-100 flex items-center justify-center p-4">
          <div className="glass-panel max-w-sm w-full rounded-2xl p-6 border border-blue-500/20 text-center space-y-4 shadow-xl">
            <div className="w-12 h-12 rounded-xl bg-rose-950/50 border border-rose-500/25 text-rose-400 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-heading text-lg font-bold text-slate-100">
                Something went wrong
              </h2>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                An unexpected interface issue occurred on {BRAND.name}. Click below to restore your session.
              </p>
            </div>
            <button
              onClick={this.handleReset}
              className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Reload {BRAND.name}</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
