import { Component, type ReactNode } from 'react'

interface Props { children: ReactNode }
interface State { error: Error | null }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex flex-col items-center justify-center py-20 text-center px-6">
          <p className="text-[13px] font-semibold text-danger mb-1">Something went wrong</p>
          <p className="text-[12px] text-text-lt max-w-sm">
            {this.state.error.message || 'An unexpected error occurred. Try refreshing the page.'}
          </p>
          <button
            className="mt-4 text-[12px] font-medium text-navy border border-navy/20 px-3 py-1.5 rounded-md hover:bg-surface transition-colors"
            onClick={() => this.setState({ error: null })}
          >
            Try again
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
