import type { ComponentSpec, PropSpec, PropType, TestCase } from './types'

const BOUNDARY_MAP: Record<PropType, Array<{ label: string; value: unknown }>> = {
  string: [
    { label: 'normal', value: 'Hello World' },
    { label: 'empty', value: '' },
    { label: 'whitespace', value: '   ' },
    { label: 'long (1000 chars)', value: 'A'.repeat(1000) },
    { label: 'HTML injection', value: '<b>bold</b> <script>xss</script>' },
    { label: 'unicode emoji', value: '🎉 Привет 世界' },
    { label: 'null', value: null },
    { label: 'undefined', value: undefined },
    { label: 'number (wrong type)', value: 42 },
  ],
  number: [
    { label: '42', value: 42 },
    { label: '0', value: 0 },
    { label: '-1', value: -1 },
    { label: 'Infinity', value: Infinity },
    { label: '-Infinity', value: -Infinity },
    { label: 'NaN', value: NaN },
    { label: 'MAX_SAFE_INTEGER', value: Number.MAX_SAFE_INTEGER },
    { label: '0.1 (float)', value: 0.1 },
    { label: 'null', value: null },
    { label: 'undefined', value: undefined },
    { label: '"str" (wrong type)', value: 'not-a-number' },
  ],
  boolean: [
    { label: 'true', value: true },
    { label: 'false', value: false },
    { label: 'null', value: null },
    { label: 'undefined', value: undefined },
    { label: '0 (falsy)', value: 0 },
    { label: '"" (falsy string)', value: '' },
  ],
  function: [
    { label: 'noop', value: () => {} },
    { label: 'returns value', value: () => 'result' },
    { label: 'throws error', value: () => { throw new Error('Callback threw!') } },
    { label: 'async', value: async () => new Promise(r => setTimeout(r, 0)) },
    { label: 'null', value: null },
    { label: 'undefined', value: undefined },
    { label: '"str" (wrong type)', value: 'not-a-function' },
  ],
  array: [
    { label: '[1,2,3]', value: [1, 2, 3] },
    { label: '[] empty', value: [] },
    { label: '[...1000 items]', value: Array.from({ length: 1000 }, (_, i) => i) },
    { label: 'null', value: null },
    { label: 'undefined', value: undefined },
    { label: '"str" (wrong type)', value: 'not-an-array' },
  ],
  object: [
    { label: '{ key: "val" }', value: { key: 'value', num: 42 } },
    { label: '{} empty', value: {} },
    { label: 'deeply nested', value: { a: { b: { c: { d: 'deep' } } } } },
    { label: 'null', value: null },
    { label: 'undefined', value: undefined },
    { label: '"str" (wrong type)', value: 'not-an-object' },
  ],
  node: [
    { label: '"text" node', value: 'Text content' },
    { label: 'null', value: null },
    { label: 'undefined', value: undefined },
    { label: '0 (falsy number)', value: 0 },
    { label: 'false (falsy)', value: false },
  ],
  enum: [],
}

function getDefaultValue(spec: PropSpec): unknown {
  if (spec.defaultValue !== undefined) return spec.defaultValue
  switch (spec.type) {
    case 'string': return 'Default Text'
    case 'number': return 1
    case 'boolean': return true
    case 'function': return () => {}
    case 'array': return []
    case 'object': return {}
    case 'node': return null
    case 'enum': return spec.enumValues?.[0]
    default: return undefined
  }
}

export function generateTestCases(spec: ComponentSpec): TestCase[] {
  const cases: TestCase[] = []

  const defaultProps: Record<string, unknown> = {}
  for (const [key, propSpec] of Object.entries(spec.propSpecs)) {
    defaultProps[key] = getDefaultValue(propSpec)
  }

  // 1. Happy path
  cases.push({
    id: `${spec.name}__happy-path`,
    name: 'Happy path (all defaults)',
    props: { ...defaultProps },
  })

  // 2. All null
  const nullProps: Record<string, unknown> = {}
  for (const key of Object.keys(spec.propSpecs)) nullProps[key] = null
  cases.push({
    id: `${spec.name}__all-null`,
    name: 'All props null',
    props: nullProps,
  })

  // 3. All undefined
  cases.push({
    id: `${spec.name}__all-undefined`,
    name: 'All props undefined',
    props: {},
  })

  // 4. Per-prop boundary tests
  for (const [propName, propSpec] of Object.entries(spec.propSpecs)) {
    const boundaries = propSpec.type === 'enum' && propSpec.enumValues
      ? [
          ...propSpec.enumValues.map(v => ({ label: String(v), value: v })),
          { label: 'null', value: null },
          { label: 'undefined', value: undefined },
          { label: 'invalid_value', value: '__INVALID__' },
        ]
      : BOUNDARY_MAP[propSpec.type] ?? []

    for (const boundary of boundaries) {
      const props: Record<string, unknown> = { ...defaultProps, [propName]: boundary.value }
      cases.push({
        id: `${spec.name}__${propName}__${boundary.label.replace(/[^a-zA-Z0-9]/g, '-')}`,
        name: `${propName}: ${boundary.label}`,
        props,
        propUnderTest: propName,
        boundaryLabel: boundary.label,
      })
    }
  }

  return cases
}
