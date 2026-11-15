import React from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallbackTitle?: string;
  onReset?: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  public override componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Fashion Studio ErrorBoundary caught error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: undefined });
    this.props.onReset?.();
  };

  public override render() {
    if (this.state.hasError) {
      return (
        <div className="flex-1 flex flex-col items-center justify-center p-6 bg-[var(--bg-panel)] text-[var(--text-primary)] border border-[var(--border)] rounded-xl m-4 text-center select-none">
          <div className="w-12 h-12 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-500 mb-3">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-semibold mb-1">
            {this.props.fallbackTitle || 'A rendering error occurred'}
          </h3>
          <p className="text-xs text-[var(--text-secondary)] max-w-sm mb-4 font-mono">
            {this.state.error?.message || 'WebGL or component failure.'}
          </p>
          <button
            onClick={this.handleReset}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--accent)] hover:opacity-90 text-white text-xs font-medium shadow-sm transition-opacity"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reload Workspace
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
