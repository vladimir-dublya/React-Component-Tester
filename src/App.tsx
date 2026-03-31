import React from 'react'
import { generateTestCases } from './engine/generators'
import { startCapture } from './engine/consoleCapture'
import { TestReport } from './reporter/TestReport'
import { productCardSpec } from './demo/productCardSpec'

// Start capturing console output once on load
startCapture()

const cases = generateTestCases(productCardSpec)

export default function App() {
  return <TestReport spec={productCardSpec} cases={cases} />
}
