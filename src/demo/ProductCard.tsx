import React from 'react'

export interface ProductCardProps {
  title: string
  price: number
  description?: string
  badge?: 'new' | 'sale' | 'hot'
  inStock?: boolean
  rating?: number
  tags?: string[]
  onAddToCart?: () => void
}

const BADGE_STYLES: Record<string, React.CSSProperties> = {
  new:  { background: '#3b82f6', color: '#fff' },
  sale: { background: '#ef4444', color: '#fff' },
  hot:  { background: '#f97316', color: '#fff' },
}

export function ProductCard({
  title,
  price,
  description,
  badge,
  inStock = true,
  rating,
  tags,
  onAddToCart,
}: ProductCardProps) {
  // Intentionally crash on negative price to make failure cases visible
  if (typeof price === 'number' && price < -1000) {
    throw new Error(`Invalid price: ${price}. Price cannot be less than -1000.`)
  }

  const badgeStyle = badge && BADGE_STYLES[badge]

  return (
    <div style={{
      background: '#1a1a2e',
      border: '1px solid #2d2d50',
      borderRadius: '10px',
      padding: '14px',
      maxWidth: '220px',
      fontFamily: 'system-ui, sans-serif',
      position: 'relative',
    }}>
      {badge && badgeStyle && (
        <span style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          ...badgeStyle,
          padding: '2px 8px',
          borderRadius: '4px',
          fontSize: '11px',
          fontWeight: 700,
          textTransform: 'uppercase',
        }}>
          {badge}
        </span>
      )}

      <div style={{
        background: '#111126',
        borderRadius: '6px',
        height: '80px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '10px',
        fontSize: '28px',
      }}>
        🛍️
      </div>

      <h3 style={{
        fontSize: '14px',
        fontWeight: 600,
        color: '#e2e8f0',
        marginBottom: '4px',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      }}>
        {String(title ?? '–')}
      </h3>

      {description && (
        <p style={{ fontSize: '11px', color: '#64748b', marginBottom: '8px', lineHeight: 1.4 }}>
          {String(description).slice(0, 80)}{String(description).length > 80 ? '…' : ''}
        </p>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
        <span style={{ fontSize: '16px', fontWeight: 700, color: '#4ade80' }}>
          ${typeof price === 'number' && isFinite(price) ? price.toFixed(2) : '–'}
        </span>
        {!inStock && (
          <span style={{ fontSize: '11px', color: '#f87171', fontWeight: 600 }}>Out of stock</span>
        )}
      </div>

      {rating !== undefined && (
        <div style={{ fontSize: '12px', color: '#fbbf24', marginBottom: '8px' }}>
          {'★'.repeat(Math.min(5, Math.max(0, Math.round(Number(rating) || 0))))}
          {'☆'.repeat(5 - Math.min(5, Math.max(0, Math.round(Number(rating) || 0))))}
          <span style={{ color: '#64748b', marginLeft: '4px' }}>{Number(rating).toFixed(1)}</span>
        </div>
      )}

      {Array.isArray(tags) && tags.length > 0 && (
        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginBottom: '8px' }}>
          {tags.slice(0, 5).map((tag, i) => (
            <span key={i} style={{
              background: '#1e1e3f',
              color: '#818cf8',
              padding: '2px 6px',
              borderRadius: '4px',
              fontSize: '10px',
            }}>
              {String(tag)}
            </span>
          ))}
        </div>
      )}

      <button
        onClick={onAddToCart}
        disabled={!inStock}
        style={{
          width: '100%',
          padding: '8px',
          borderRadius: '6px',
          border: 'none',
          background: inStock ? '#4f46e5' : '#1e293b',
          color: inStock ? '#fff' : '#475569',
          fontSize: '12px',
          fontWeight: 600,
          cursor: inStock ? 'pointer' : 'not-allowed',
        }}
      >
        {inStock ? 'Add to Cart' : 'Unavailable'}
      </button>
    </div>
  )
}
