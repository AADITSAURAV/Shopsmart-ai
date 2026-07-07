import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useCart } from '../CartContext'

interface Product {
  id: number
  name: string
  brand: string
  category: string
  price: number
  rating: number | null
  description: string
  image_url: string
}

const API_URL = '/api'

/** Picks a consistent color per category for the fallback icon circle. */
function getFallbackColor(category: string) {
  const hash = category.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  const colors = ['#e11d48', '#2563eb', '#16a34a', '#d97706', '#7c3aed', '#db2777', '#059669', '#4f46e5']
  return colors[hash % colors.length]
}

/**
 * Shows one product's full details, and its "similar products" section
 * underneath. Both fetches happen in parallel with Promise.all since
 * they don't depend on each other - no reason to wait for one before
 * starting the other. Clicking a similar product takes you to that
 * product's own detail page, which is why this page can be reached
 * recursively, not just from search results.
 */
export default function ProductDetail() {
  const { id } = useParams<{ id: string }>()
  const { addToCart } = useCart()
  const [product, setProduct] = useState<Product | null>(null)
  const [similar, setSimilar] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!id) return
    setLoading(true)
    setError('')

    Promise.all([
      fetch(`${API_URL}/products/${id}`).then((res) => {
        if (!res.ok) throw new Error('Product not found')
        return res.json()
      }),
      fetch(`${API_URL}/products/${id}/similar`).then((res) => {
        if (!res.ok) return []
        return res.json()
      }),
    ])
      .then(([productData, similarData]) => {
        setProduct(productData)
        setSimilar(similarData)
      })
      .catch(() => setError('Could not load this product.'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return <p style={{ textAlign: 'center', marginTop: '3rem' }}>Loading product...</p>
  }

  if (error || !product) {
    return (
      <div className="card" style={{ textAlign: 'center', maxWidth: '500px', margin: '4rem auto', padding: '3rem 2rem' }}>
        <h3>Product not found</h3>
        <p style={{ color: '#64748b', marginBottom: '2rem' }}>{error || 'This product does not exist.'}</p>
        <Link to="/" className="btn">Back to Search</Link>
      </div>
    )
  }

  return (
    <div>
      <Link to="/" style={{ display: 'inline-block', marginBottom: '1.5rem', color: '#2563eb', textDecoration: 'none' }}>
        Back to search
      </Link>

      <div className="card" style={{ padding: '2rem', marginBottom: '2rem' }}>
        <div style={{
          width: '70px', height: '70px', borderRadius: '50%',
          backgroundColor: getFallbackColor(product.category),
          color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: 'bold', fontSize: '1.75rem', marginBottom: '1.5rem', textTransform: 'uppercase'
        }}>
          {product.category ? product.category.charAt(0) : '?'}
        </div>

        <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: '#94a3b8', fontWeight: 700, letterSpacing: '0.05em' }}>
          {product.brand || 'Generic'} - {product.category}
        </span>

        <h2 style={{ fontSize: '1.75rem', margin: '0.5rem 0 1rem 0', color: '#0f172a' }}>
          {product.name}
        </h2>

        <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', marginBottom: '1rem' }}>
          <span style={{ fontSize: '2rem', fontWeight: 700, color: '#0f172a' }}>Rs.{product.price}</span>
          <span style={{ color: '#f59e0b', fontWeight: 'bold' }}>
            {product.rating ? `Rating: ${product.rating.toFixed(1)}/5` : 'Not yet rated'}
          </span>
        </div>

        {product.description && (
          <p style={{ color: '#475569', lineHeight: 1.6, marginTop: '1rem', marginBottom: '1.5rem' }}>
            {product.description}
          </p>
        )}

        <button
          onClick={() =>
            addToCart({
              id: product.id,
              name: product.name,
              brand: product.brand,
              price: product.price,
              rating: product.rating,
            })
          }
          className="btn"
        >
          Add to Cart
        </button>
      </div>

      {similar.length > 0 && (
        <div>
          <h3 style={{ fontSize: '1.3rem', marginBottom: '1rem' }}>Similar products</h3>
          <div className="grid-cards">
            {similar.map((p) => (
              <Link
                key={p.id}
                to={`/product/${p.id}`}
                className="card"
                style={{
                  display: 'flex', flexDirection: 'column', padding: '1.5rem',
                  textDecoration: 'none', color: 'inherit',
                }}
              >
                <div style={{
                  width: '40px', height: '40px', borderRadius: '50%',
                  backgroundColor: getFallbackColor(p.category),
                  color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 'bold', fontSize: '1rem', marginBottom: '0.75rem', textTransform: 'uppercase'
                }}>
                  {p.category ? p.category.charAt(0) : '?'}
                </div>
                <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: '#94a3b8', fontWeight: 700 }}>
                  {p.brand || 'Generic'}
                </span>
                <h4 style={{ fontSize: '1rem', margin: '0.25rem 0 0.5rem 0', color: '#0f172a' }}>
                  {p.name}
                </h4>
                <span style={{ fontWeight: 700, color: '#0f172a' }}>Rs.{p.price}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}