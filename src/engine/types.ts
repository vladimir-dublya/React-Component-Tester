import type React from 'react'

export type PropType = 'string' | 'number' | 'boolean' | 'function' | 'array' | 'object' | 'node' | 'enum'

export interface PropSpec {
  type: PropType
  required?: boolean
  defaultValue?: unknown
  enumValues?: unknown[]
}

export interface ComponentSpec {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  component: React.ComponentType<any>
  name: string
  description?: string
  propSpecs: Record<string, PropSpec>
}

export type TestStatus = 'pending' | 'pass' | 'fail' | 'warning'

export interface TestCase {
  id: string
  name: string
  props: Record<string, unknown>
  propUnderTest?: string
  boundaryLabel?: string
}

export interface TestResult {
  id: string
  status: TestStatus
  renderTime: number
  error?: string
  warnings: string[]
}
