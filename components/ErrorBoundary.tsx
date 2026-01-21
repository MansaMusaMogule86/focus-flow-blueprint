import React, { Component, ErrorInfo, ReactNode } from 'react';

interface ErrorBoundaryProps {
    children: ReactNode;
    fallback?: ReactNode;
}

interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null
        };
    }

    static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
        this.setState({ errorInfo });
        console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    handleReset = (): void => {
        this.setState({ hasError: false, error: null, errorInfo: null });
    };

    render(): ReactNode {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="min-h-screen bg-slate-950 flex items-center justify-center p-8">
                    <div className="bg-white rounded-[3rem] p-12 max-w-lg w-full text-center space-y-8 shadow-2xl">
                        <div className="w-20 h-20 bg-rose-100 text-rose-600 rounded-3xl flex items-center justify-center mx-auto">
                            <i className="fa-solid fa-triangle-exclamation text-4xl"></i>
                        </div>
                        <div className="space-y-4">
                            <h2 className="text-3xl font-black uppercase tracking-tighter text-slate-900">
                                System Interruption
                            </h2>
                            <p className="text-slate-500 text-sm font-medium leading-relaxed">
                                An unexpected error occurred in the neural core. This has been logged for review.
                            </p>
                            {this.state.error && (
                                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-left">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
                                        Error Details
                                    </p>
                                    <p className="text-xs text-rose-600 font-mono break-all">
                                        {this.state.error.message}
                                    </p>
                                </div>
                            )}
                        </div>
                        <div className="space-y-4">
                            <button
                                onClick={this.handleReset}
                                className="w-full py-5 bg-slate-950 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-indigo-600 transition-all shadow-xl"
                            >
                                Reinitialize System
                            </button>
                            <button
                                onClick={() => window.location.reload()}
                                className="w-full py-4 bg-slate-100 text-slate-600 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-slate-200 transition-all"
                            >
                                Hard Reset
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
