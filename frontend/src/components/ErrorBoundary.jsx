import React from 'react';
import { AlertCircle, Home } from 'lucide-react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        console.error('Error caught by boundary:', error, errorInfo);
        this.state = { hasError: true, error, errorInfo };
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-background flex items-center justify-center p-4">
                    <div className="bg-surface/50 backdrop-blur-xl border border-red-500/50 rounded-2xl p-8 max-w-md text-center">
                        <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold mb-2 text-white">Something went wrong</h2>
                        <p className="text-gray-400 mb-6">
                            An unexpected error occurred. Please try refreshing the page.
                        </p>
                        {process.env.NODE_ENV === 'development' && this.state.error && (
                            <details className="text-left text-xs bg-black/40 p-4 rounded-lg mb-4">
                                <summary className="cursor-pointer text-gray-400 mb-2">Error Details</summary>
                                <pre className="text-red-400 overflow-auto">
                                    {this.state.error.toString()}
                                    {this.state.errorInfo?.componentStack}
                                </pre>
                            </details>
                        )}
                        <div className="flex gap-4 justify-center">
                            <button
                                onClick={() => window.location.reload()}
                                className="bg-primary hover:bg-primary/80 text-white px-6 py-3 rounded-xl font-bold"
                            >
                                Reload Page
                            </button>
                            <button
                                onClick={() => window.location.href = '/'}
                                className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2"
                            >
                                <Home className="w-5 h-5" />
                                Go Home
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
