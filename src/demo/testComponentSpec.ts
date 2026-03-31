import TestComponent from './TestComponent/TestComponent'
import type { ComponentSpec } from '../engine/types'
import type { TestItem } from './TestComponent/TestComponent'

const sampleItems: TestItem[] = [
  {
    id: 1,
    title: 'Refactor button states',
    description: 'Unify disabled and loading styles for CTA buttons.',
    category: 'ui',
    status: 'draft',
    createdAt: '2026-03-20T10:15:00.000Z',
    score: 67,
    tags: ['buttons', 'style', 'ux'],
  },
  {
    id: 2,
    title: 'Add retry for network requests',
    description: 'Retry 3 times with exponential backoff for 5xx responses.',
    category: 'api',
    status: 'published',
    createdAt: '2026-03-24T08:30:00.000Z',
    score: 91,
    tags: ['network', 'resilience'],
  },
  {
    id: 3,
    title: 'Document setup flow',
    description: 'Write quick-start docs for local development and CI setup.',
    category: 'docs',
    status: 'archived',
    createdAt: '2026-03-28T13:45:00.000Z',
    score: 54,
    tags: ['onboarding', 'guide'],
  },
]

export const testComponentSpec: ComponentSpec = {
  component: TestComponent,
  name: 'TestComponent',
  description: 'Filterable, sortable, paginated item list with create form and async actions',
  propSpecs: {
    title: {
      type: 'string',
      defaultValue: 'Complex Test Component',
    },
    pageSize: {
      type: 'number',
      defaultValue: 3,
    },
    disabled: {
      type: 'boolean',
      defaultValue: false,
    },
    simulateDelayMs: {
      type: 'number',
      defaultValue: 0,
    },
    withRandomErrors: {
      type: 'boolean',
      defaultValue: false,
    },
    initialItems: {
      type: 'array',
      defaultValue: sampleItems,
    },
    onItemSelect: {
      type: 'function',
      defaultValue: (item: unknown) => console.log('selected:', item),
    },
    onItemsChange: {
      type: 'function',
      defaultValue: (items: unknown) => console.log('items changed:', items),
    },
    onSubmit: {
      type: 'function',
      defaultValue: (payload: unknown) => console.log('submit:', payload),
    },
  },
}
