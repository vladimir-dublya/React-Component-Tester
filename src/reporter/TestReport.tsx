import React, { useState, useCallback, useMemo } from 'react'
import { TestCaseRunner } from '../engine/TestCaseRunner'
import type { ComponentSpec, TestCase, TestResult, TestStatus } from '../engine/types'
import './TestReport.css'

interface Props {
  spec: ComponentSpec
  cases: TestCase[]
}

type FilterType = 'all' | 'pass' | 'fail' | 'warning' | 'pending'

function valueToString(v: unknown): string {
  if (v === null) return 'null'
  if (v === undefined) return 'undefined'
  if (typeof v === 'function') return `ƒ ${v.name || 'anonymous'}()`
  if (typeof v === 'string') {
    if (v.length > 30) return `"${v.slice(0, 27)}…"`
    return `"${v}"`
  }
  if (Array.isArray(v)) {
    if (v.length > 3) return `[…${v.length} items]`
    return `[${v.map(valueToString).join(', ')}]`
  }
  if (typeof v === 'object') return `{…}`
  if (typeof v === 'number') {
    if (isNaN(v as number)) return 'NaN'
    if (!isFinite(v as number)) return v > 0 ? '+∞' : '-∞'
  }
  return String(v)
}

function StatusBadge({ status }: { status: TestStatus }) {
  const map: Record<TestStatus, { label: string; cls: string }> = {
    pending: { label: '…', cls: 'badge-pending' },
    pass: { label: 'PASS', cls: 'badge-pass' },
    fail: { label: 'FAIL', cls: 'badge-fail' },
    warning: { label: 'WARN', cls: 'badge-warn' },
  }
  const { label, cls } = map[status]
  return <span className={`badge ${cls}`}>{label}</span>
}

function TestCard({
  testCase,
  spec,
  result,
  onResult,
  isSelected,
  onClick,
}: {
  testCase: TestCase
  spec: ComponentSpec
  result: TestResult | undefined
  onResult: (r: TestResult) => void
  isSelected: boolean
  onClick: () => void
}) {
  const status = result?.status ?? 'pending'
  return (
    <div
      className={`test-card status-${status} ${isSelected ? 'selected' : ''}`}
      onClick={onClick}
    >
      <div className="card-header">
        <StatusBadge status={status} />
        <span className="card-name" title={testCase.name}>{testCase.name}</span>
        {result && (
          <span className="render-time">{result.renderTime.toFixed(1)}ms</span>
        )}
      </div>

      {result?.error && (
        <div className="card-error" title={result.error}>
          {result.error.slice(0, 80)}{result.error.length > 80 ? '…' : ''}
        </div>
      )}

      <div className="card-preview">
        <TestCaseRunner testCase={testCase} component={spec.component} onResult={onResult} />
      </div>
    </div>
  )
}

function DetailPanel({
  testCase,
  result,
  onClose,
}: {
  testCase: TestCase
  result: TestResult | undefined
  onClose: () => void
}) {
  const status = result?.status ?? 'pending'
  return (
    <div className="detail-panel">
      <div className="detail-header">
        <StatusBadge status={status} />
        <h3>{testCase.name}</h3>
        <button className="close-btn" onClick={onClose}>✕</button>
      </div>

      {result && (
        <div className="detail-meta">
          <span>Render time: <b>{result.renderTime.toFixed(2)}ms</b></span>
          {testCase.propUnderTest && (
            <span>Prop under test: <b>{testCase.propUnderTest}</b></span>
          )}
        </div>
      )}

      {result?.error && (
        <div className="detail-error">
          <div className="detail-section-label">Error</div>
          <pre>{result.error}</pre>
        </div>
      )}

      <div className="detail-section-label">Props</div>
      <div className="props-table">
        {Object.entries(testCase.props).map(([key, val]) => (
          <div key={key} className={`prop-row ${testCase.propUnderTest === key ? 'prop-highlighted' : ''}`}>
            <span className="prop-key">{key}</span>
            <span className="prop-val">{valueToString(val)}</span>
          </div>
        ))}
        {Object.keys(testCase.props).length === 0 && (
          <div className="prop-row"><span className="prop-key muted">No props passed</span></div>
        )}
      </div>
    </div>
  )
}

export function TestReport({ spec, cases }: Props) {
  const [results, setResults] = useState<Map<string, TestResult>>(new Map())
  const [filter, setFilter] = useState<FilterType>('all')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<'index' | 'time' | 'status'>('index')

  const handleResult = useCallback((result: TestResult) => {
    setResults(prev => new Map(prev).set(result.id, result))
  }, [])

  const stats = useMemo(() => {
    const all = cases.map(c => results.get(c.id))
    return {
      total: cases.length,
      pass: all.filter(r => r?.status === 'pass').length,
      fail: all.filter(r => r?.status === 'fail').length,
      warn: all.filter(r => r?.status === 'warning').length,
      pending: all.filter(r => !r || r.status === 'pending').length,
      avgTime: (() => {
        const times = all.filter(r => r && r.status !== 'pending').map(r => r!.renderTime)
        return times.length ? times.reduce((a, b) => a + b, 0) / times.length : 0
      })(),
    }
  }, [cases, results])

  const filtered = useMemo(() => {
    let list = cases.map(c => ({ testCase: c, result: results.get(c.id) }))

    if (filter !== 'all') {
      list = list.filter(({ result }) => (result?.status ?? 'pending') === filter)
    }

    if (sortBy === 'time') {
      list.sort((a, b) => (b.result?.renderTime ?? 0) - (a.result?.renderTime ?? 0))
    } else if (sortBy === 'status') {
      const order: Record<TestStatus, number> = { fail: 0, warning: 1, pending: 2, pass: 3 }
      list.sort((a, b) => (order[a.result?.status ?? 'pending']) - (order[b.result?.status ?? 'pending']))
    }

    return list
  }, [cases, results, filter, sortBy])

  const selectedCase = selectedId ? cases.find(c => c.id === selectedId) : null
  const selectedResult = selectedId ? results.get(selectedId) : undefined

  const done = stats.total - stats.pending

  return (
    <div className="report-root">
      {/* Header */}
      <header className="report-header">
        <div className="header-title">
          <span className="logo">⚡</span>
          <h1>Component Stress Tester</h1>
        </div>
        <div className="header-component">
          <span className="component-name">{spec.name}</span>
          {spec.description && <span className="component-desc">{spec.description}</span>}
        </div>
        <div className="header-stats">
          <span className="stat-total">{stats.total} tests</span>
          <span className="stat-pass">✓ {stats.pass}</span>
          <span className="stat-fail">✕ {stats.fail}</span>
          {stats.warn > 0 && <span className="stat-warn">⚠ {stats.warn}</span>}
          {stats.pending > 0 && <span className="stat-pending">… {stats.pending}</span>}
          {done > 0 && <span className="stat-time">avg {stats.avgTime.toFixed(1)}ms</span>}
        </div>
        {stats.total > 0 && (
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${(done / stats.total) * 100}%` }}
            />
          </div>
        )}
      </header>

      {/* Toolbar */}
      <div className="toolbar">
        <div className="filter-tabs">
          {(['all', 'pass', 'fail', 'warning', 'pending'] as FilterType[]).map(f => (
            <button
              key={f}
              className={`filter-tab ${filter === f ? 'active' : ''} filter-${f}`}
              onClick={() => setFilter(f)}
            >
              {f === 'all' ? `All (${stats.total})` :
               f === 'pass' ? `Pass (${stats.pass})` :
               f === 'fail' ? `Fail (${stats.fail})` :
               f === 'warning' ? `Warn (${stats.warn})` :
               `Pending (${stats.pending})`}
            </button>
          ))}
        </div>
        <div className="sort-controls">
          <span className="sort-label">Sort:</span>
          {(['index', 'status', 'time'] as const).map(s => (
            <button
              key={s}
              className={`sort-btn ${sortBy === s ? 'active' : ''}`}
              onClick={() => setSortBy(s)}
            >
              {s === 'index' ? 'Default' : s === 'status' ? 'Status' : 'Slowest'}
            </button>
          ))}
        </div>
      </div>

      {/* Main layout */}
      <div className="main-layout">
        {/* Cards grid */}
        <div className="cards-grid">
          {filtered.map(({ testCase, result }) => (
            <TestCard
              key={testCase.id}
              testCase={testCase}
              spec={spec}
              result={result}
              onResult={handleResult}
              isSelected={selectedId === testCase.id}
              onClick={() => setSelectedId(prev => prev === testCase.id ? null : testCase.id)}
            />
          ))}
          {filtered.length === 0 && (
            <div className="empty-state">No test cases match the current filter.</div>
          )}
        </div>

        {/* Detail panel */}
        {selectedCase && (
          <DetailPanel
            testCase={selectedCase}
            result={selectedResult}
            onClose={() => setSelectedId(null)}
          />
        )}
      </div>
    </div>
  )
}
