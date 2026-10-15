import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div
          style={{
            padding: '32px',
            backgroundColor: 'var(--bg-card, #ffffff)',
            borderRadius: 'var(--radius-lg, 12px)',
            border: '1px solid var(--border-color, #e2e8f0)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            gap: '16px',
            minHeight: '380px',
            margin: '16px',
            boxShadow: 'var(--shadow-md, 0 4px 16px rgba(0,0,0,0.06))',
          }}
        >
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              backgroundColor: 'rgba(239, 68, 68, 0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ef4444',
            }}
          >
            <AlertTriangle size={30} />
          </div>

          <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary, #0f172a)' }}>
            {this.props.title || 'Component Encountered an Issue'}
          </h3>

          <p style={{ margin: 0, maxWidth: '480px', fontSize: '0.88rem', color: 'var(--text-muted, #64748b)' }}>
            {this.props.message ||
              'A rendering error occurred while loading this view. You can reload the view or reset the state.'}
          </p>

          {this.state.error && (
            <div
              style={{
                fontFamily: 'monospace',
                fontSize: '0.78rem',
                backgroundColor: 'var(--bg-app, #f8fafc)',
                padding: '10px 14px',
                borderRadius: '8px',
                color: '#ef4444',
                maxWidth: '600px',
                wordBreak: 'break-all',
              }}
            >
              {this.state.error.toString()}
            </div>
          )}

          <button
            onClick={this.handleReload}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 20px',
              borderRadius: 'var(--radius-md, 8px)',
              backgroundColor: '#0d9488',
              color: '#ffffff',
              border: 'none',
              fontWeight: 700,
              fontSize: '0.86rem',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(13, 148, 136, 0.3)',
              marginTop: '8px',
            }}
          >
            <RefreshCw size={16} />
            <span>Reload View</span>
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
