export interface CapturedLog {
  type: 'warn' | 'error'
  message: string
  timestamp: number
}

const captured: CapturedLog[] = []
let isCapturing = false
const originalWarn = console.warn.bind(console)
const originalError = console.error.bind(console)

export function startCapture(): void {
  if (isCapturing) return
  isCapturing = true
  captured.length = 0

  console.warn = (...args: unknown[]) => {
    captured.push({ type: 'warn', message: args.map(String).join(' '), timestamp: Date.now() })
    originalWarn(...args)
  }
  console.error = (...args: unknown[]) => {
    const msg = args.map(String).join(' ')
    // Filter out React's own error boundary re-logging
    if (!msg.includes('The above error occurred in') && !msg.includes('at ErrorBoundary')) {
      captured.push({ type: 'error', message: msg, timestamp: Date.now() })
    }
    originalError(...args)
  }
}

export function stopCapture(): CapturedLog[] {
  if (!isCapturing) return []
  isCapturing = false
  console.warn = originalWarn
  console.error = originalError
  return [...captured]
}

export function getCaptured(): CapturedLog[] {
  return [...captured]
}
