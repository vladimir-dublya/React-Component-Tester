import { Component, type ErrorInfo, type ReactNode } from 'react'

interface Props {
  testId: string
  children: ReactNode
  onError: (testId: string, error: Error) => void
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, _info: ErrorInfo) {
    this.props.onError(this.props.testId, error)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '6px 10px',
          background: 'rgba(239,68,68,0.12)',
          border: '1px solid rgba(239,68,68,0.35)',
          borderRadius: '6px',
          fontSize: '11px',
          color: '#fca5a5',
          fontFamily: 'monospace',
          wordBreak: 'break-word',
        }}>
          💥 {this.state.error?.message ?? 'Render error'}
        </div>
      )
    }
    return this.props.children
  }
}
