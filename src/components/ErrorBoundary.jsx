import React from 'react'

const ERROR_MESSAGE = 'مشکلی در نمایش این بخش پیش آمده است. لطفاً دوباره تلاش کنید.'

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo)
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback(this.handleRetry)
      }
      return (
        <div className="flex flex-col items-center justify-center p-8 min-h-[200px] text-center">
          <div className="w-16 h-16 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center mb-4">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-5 max-w-xs">
            {ERROR_MESSAGE}
          </p>
          <button
            onClick={this.handleRetry}
            className="px-6 py-2.5 bg-gradient-to-l from-brand-800 to-brand-600 text-white rounded-2xl text-sm font-medium btn-press shadow-md"
          >
            تلاش دوباره
          </button>
          {process.env.NODE_ENV !== 'production' && this.state.error && (
            <details className="mt-4 text-xs text-left max-w-md w-full bg-red-50 dark:bg-red-900/20 p-3 rounded-xl overflow-auto max-h-48" dir="ltr">
              <summary className="cursor-pointer text-red-600 dark:text-red-400 font-medium">Error details</summary>
              <pre className="mt-2 whitespace-pre-wrap break-all text-red-700 dark:text-red-300">{this.state.error && this.state.error.toString ? this.state.error.toString() : String(this.state.error)}</pre>
              <pre className="mt-2 whitespace-pre-wrap break-all text-red-700 dark:text-red-300">{this.state.errorInfo && this.state.errorInfo.componentStack}</pre>
            </details>
          )}
        </div>
      )
    }
    return this.props.children
  }
}
