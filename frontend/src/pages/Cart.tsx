import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../CartContext'

const API_URL = 'http://localhost:8000'

interface Alternative {
  id: number
  name: string
  brand: string
  price: number
  rating: number | null
}

export default function Cart() {
  const { items, removeFromCart } = useCart()
  const [alternatives, setAlternatives] = useState<Record<number, Alternative[]>>({})

  useEffect(() => {
    items.forEach((item) => {
      if (alternatives[item.id] !== undefined) return
      fetch(`${API_URL}/products/${item.id}/alternatives`)
        .then((res) => (res.ok ? res.json() : []))
        .then((data) => {
          setAlternatives((prev) => ({ ...prev, [item.id]: data }))
        })
        .catch(() => {
          setAlternatives((prev) => ({ ...prev, [item.id]: [] }))
        })
    })
  }, [items])

  if (items.length === 0) {
    return (
      <div className="card" style={{ textAlign: 'center', maxWidth: '500px', margin: '4rem auto', padding: '3rem 2rem' }}>
        <h3 style={{ margin: '1rem 0', fontSize: '1.5rem' }}>Your cart is empty</h3>
        <p style={{ color: '#64748b', marginBottom: '2rem' }}>
          Add some products from your recommendations to see them here.
        </p>
        <Link to="/" className="btn">Get Recommendations</Link>
      </div>
    )
  }

  const total = items.reduce((sum, item) => sum + item.price, 0)

  return (
    <div>
      <h2 style={{ fontSize: '1.75rem', marginBottom: '1.5rem' }}>Your Cart</h2>

      {items.map((item) => {
        const itemAlternatives = alternatives[item.id] || []
        return (
          <div key={item.id} className="card" style={{ padding: '1.5rem', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#94a3b8', fontWeight: 700 }}>
                  {item.brand || 'Generic'}
                </span>
                <h3 style={{ margin: '0.25rem 0', fontSize: '1.1rem' }}>{item.name}</h3>
                <span style={{ fontWeight: 700 }}>Rs.{item.price}</span>
                {item.rating && (
                  <span style={{ color: '#f59e0b', marginLeft: '0.75rem' }}>Rating: {item.rating.toFixed(1)}/5</span>
                )}
              </div>
              <button onClick={() => removeFromCart(item.id)} className="btn btn-secondary">
                Remove
              </button>
            </div>

            {itemAlternatives.length > 0 && (
              <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #e2e8f0' }}>
                <p style={{ fontSize: '0.85rem', color: '#16a34a', fontWeight: 600, marginBottom: '0.5rem' }}>
                  Better rated alternative available:
                </p>
                {itemAlternatives.slice(0, 1).map((alt) => (
                  <Link
                    key={alt.id}
                    to={`/product/${alt.id}`}
                    style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      background: '#f0fdf4', padding: '0.75rem', borderRadius: '6px',
                      textDecoration: 'none', color: 'inherit',
                    }}
                  >
                    <span>
                      <strong>{alt.name}</strong> ({alt.brand}) - Rating: {alt.rating?.toFixed(1)}/5
                    </span>
                    <span style={{ fontWeight: 700 }}>Rs.{alt.price}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )
      })}

      <div className="card" style={{ padding: '1.5rem', marginTop: '1.5rem', textAlign: 'right' }}>
        <strong style={{ fontSize: '1.2rem' }}>Total: Rs.{total.toFixed(2)}</strong>
      </div>
    </div>
  )
}