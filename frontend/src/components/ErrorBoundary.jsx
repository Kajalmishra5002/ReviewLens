import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-[80vh] w-full flex-col items-center justify-center p-6 text-center text-white">
          <div className="max-w-md rounded-2xl border border-red-500/30 bg-slate-900/80 p-8 shadow-2xl backdrop-blur-xl">
            <h1 className="mb-4 text-3xl font-bold text-red-500">Oops! Something went wrong.</h1>
            <p className="mb-6 text-slate-400">
              We encountered an unexpected error. Please try refreshing the page or contact support if the issue persists.
            </p>
            <div className="mb-6 rounded-lg bg-black/50 p-4 text-left text-sm text-red-400 overflow-auto">
              <code className="break-all">{this.state.error?.toString() || 'Unknown Error'}</code>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="rounded-xl bg-gradient-to-r from-red-600 to-orange-600 px-6 py-3 font-semibold text-white shadow-lg transition-transform hover:-translate-y-0.5 active:translate-y-0"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
