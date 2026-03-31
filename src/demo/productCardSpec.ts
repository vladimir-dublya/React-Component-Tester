import { ProductCard } from './ProductCard'
import type { ComponentSpec } from '../engine/types'

export const productCardSpec: ComponentSpec = {
  component: ProductCard,
  name: 'ProductCard',
  description: 'E-commerce product card with price, rating, tags and cart action',
  propSpecs: {
    title: {
      type: 'string',
      required: true,
      defaultValue: 'Wireless Headphones Pro',
    },
    price: {
      type: 'number',
      required: true,
      defaultValue: 49.99,
    },
    description: {
      type: 'string',
      defaultValue: 'Premium sound quality with active noise cancellation.',
    },
    badge: {
      type: 'enum',
      enumValues: ['new', 'sale', 'hot'],
      defaultValue: 'new',
    },
    inStock: {
      type: 'boolean',
      defaultValue: true,
    },
    rating: {
      type: 'number',
      defaultValue: 4.5,
    },
    tags: {
      type: 'array',
      defaultValue: ['electronics', 'audio', 'wireless'],
    },
    onAddToCart: {
      type: 'function',
      defaultValue: () => alert('Added to cart!'),
    },
  },
}
