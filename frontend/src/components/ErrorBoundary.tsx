import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null
        };
    }

    static getDerivedStateFromError(error: Error): State {
        return {
            hasError: true,
            error,
            errorInfo: null
        };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('[Error Boundary] Caught error:', error, errorInfo);
        this.setState({
            error,
            errorInfo
        });
    }

    handleReset = () => {
        this.setState({
            hasError: false,
            error: null,
            errorInfo: null
        });
        window.location.href = '/login';
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-4">
                    <div className="max-w-2xl w-full bg-gray-800 rounded-lg p-8 border border-red-500/50">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="rounded-full bg-red-500 p-2">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                            <h1 className="text-2xl font-bold">Something went wrong</h1>
                        </div>

                        <p className="text-gray-300 mb-4">
                            The application encountered an unexpected error. This has been logged for debugging.
                        </p>

                        {this.state.error && (
                            <div className="bg-gray-900 p-4 rounded border border-gray-700 mb-4">
                                <p className="text-red-400 font-mono text-sm mb-2">
                                    {this.state.error.toString()}
                                </p>
                                {this.state.errorInfo && (
                                    <details className="mt-2">
                                        <summary className="cursor-pointer text-gray-400 hover:text-white">
                                            Stack Trace
                                        </summary>
                                        <pre className="mt-2 text-xs text-gray-500 overflow-auto max-h-60">
                                            {this.state.errorInfo.componentStack}
                                        </pre>
                                    </details>
                                )}
                            </div>
                        )}

                        <div className="flex gap-3">
                            <button
                                onClick={() => window.location.reload()}
                                className="bg-primary hover:bg-blue-600 px-6 py-2 rounded transition"
                            >
                                Reload Page
                            </button>
                            <button
                                onClick={this.handleReset}
                                className="bg-gray-700 hover:bg-gray-600 px-6 py-2 rounded transition"
                            >
                                Go to Login
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
