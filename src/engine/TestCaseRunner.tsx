import React, { useEffect, useRef } from 'react'
import { ErrorBoundary } from './ErrorBoundary'
import type { TestCase, TestResult } from './types'

interface Props {
  testCase: TestCase
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  component: React.ComponentType<any>
  onResult: (result: TestResult) => void
}

function TimingCapture({ onMounted }: { onMounted: (ms: number) => void }) {
  const start = useRef(performance.now())
  const fired = useRef(false)
  useEffect(() => {
    if (!fired.current) {
      fired.current = true
      onMounted(performance.now() - start.current)
    }
  })
  return null
}

export function TestCaseRunner({ testCase, component: Component, onResult }: Props) {
  const resultRef = useRef<TestResult>({
    id: testCase.id,
    status: 'pending',
    renderTime: 0,
    warnings: [],
  })
  const firedRef = useRef(false)

  const fire = (patch: Partial<TestResult>) => {
    if (firedRef.current) return
    firedRef.current = true
    onResult({ ...resultRef.current, ...patch })
  }

  const handleError = (_testId: string, error: Error) => {
    fire({ status: 'fail', error: error.message })
  }

  const handleMounted = (ms: number) => {
    fire({ status: resultRef.current.status === 'fail' ? 'fail' : 'pass', renderTime: ms })
  }

  return (
    <ErrorBoundary testId={testCase.id} onError={handleError}>
      <TimingCapture onMounted={handleMounted} />
      <Component {...(testCase.props as Record<string, unknown>)} />
    </ErrorBoundary>
  )
}
