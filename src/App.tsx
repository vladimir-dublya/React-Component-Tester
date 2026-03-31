import React from 'react'
import { generateTestCases } from './engine/generators'
import { startCapture } from './engine/consoleCapture'
import { TestReport } from './reporter/TestReport'
import { testComponentSpec } from './demo/testComponentSpec'

// Start capturing console output once on load
startCapture()

const cases = generateTestCases(testComponentSpec)

export default function App() {
  return <TestReport spec={testComponentSpec} cases={cases} />
}
