import { useLocation, Link } from 'react-router-dom'

interface Product {
  id: number
  name: string
  brand: string
  category: string
  price: number
  original_price?: number | null
  rating: number | null
  image_url: string
  match_score: number
  reason: string
}

export default function RecommendResults() {
  const location = useLocation()
  const results = (location.state?.results as Product[]) || []

  const getFallbackColor = (category: string) => {
    const hash = category.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
    const colors = ['#e11d48', '#2563eb', '#16a34a', '#d97706', '#7c3aed', '#db2777', '#059669', '#4f46e5']
    return colors[hash % colors.length]
  }

  if (results.length === 0) {
    return (
      <div className="card" style={{ textAlign: 'center', maxWidth: '500px', margin: '4rem auto', padding: '3rem 2rem' }}>
        <h3 style={{ margin: '1rem 0', fontSize: '1.5rem' }}>No Matches Found</h3>
        <p style={{ color: '#64748b', marginBottom: '2rem' }}>
          We couldn't track down exact matches matching your criteria. Try loosening up your budget or switching category descriptions.
        </p>
        <Link to="/recommend" className="btn">Adjust Filters</Link>
      </div>
    )
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem' }}>Your Recommended Picks</h2>
          <p style={{ color: '#64748b' }}>AI-ranked options matching your explicit goals</p>
        </div>
        <Link to="/recommend" className="btn btn-secondary">Search Again</Link>
      </div>

      <div className="grid-cards">
        {results.map((product) => {
          const discountExists = product.original_price && product.original_price > product.price
          const discountPct = discountExists
            ? Math.round(((product.original_price! - product.price) / product.original_price!) * 100)
            : 0

          return (
            <Link
              key={product.id}
              to={`/product/${product.id}`}
              className="card"
              style={{
                display: 'flex', flexDirection: 'column', padding: '1.5rem',
                justifyContent: 'space-between', position: 'relative',
                textDecoration: 'none', color: 'inherit', cursor: 'pointer',
              }}
            >
              <div style={{
                position: 'absolute', top: '12px', right: '12px',
                background: product.match_score > 80 ? '#f0fdf4' : '#fffbeb',
                color: product.match_score > 80 ? '#16a34a' : '#d97706',
                border: `1px solid ${product.match_score > 80 ? '#bbf7d0' : '#fef3c7'}`,
                padding: '4px 8px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 700
              }}>
                {Math.round(product.match_score)}% Match
              </div>

              <div>
                <div style={{
                  width: '50px', height: '50px', borderRadius: '50%',
                  backgroundColor: getFallbackColor(product.category),
                  color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 'bold', fontSize: '1.25rem', marginBottom: '1rem', textTransform: 'uppercase'
                }}>
                  {product.category ? product.category.charAt(0) : '?'}
                </div>

                <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#94a3b8', fontWeight: 700, letterSpacing: '0.05em' }}>
                  {product.brand || 'Generic'} - {product.category}
                </span>

                <h3 style={{ fontSize: '1.1rem', margin: '0.25rem 0 0.75rem 0', color: '#0f172a', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', height: '2.6rem' }}>
                  {product.name}
                </h3>

                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '1rem', fontSize: '0.9rem', color: '#f59e0b', fontWeight: 'bold' }}>
                  {product.rating ? `Rating: ${product.rating.toFixed(1)}` : 'Not yet rated'}
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '1rem' }}>
                  <span style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a' }}>Rs.{product.price}</span>
                  {discountExists && (
                    <>
                      <span style={{ textDecoration: 'line-through', color: '#94a3b8', fontSize: '0.9rem' }}>Rs.{product.original_price}</span>
                      <span style={{ color: '#dc2626', fontSize: '0.8rem', fontWeight: 600, background: '#fef2f2', padding: '2px 6px', borderRadius: '4px' }}>
                        {discountPct}% OFF
                      </span>
                    </>
                  )}
                </div>

                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '0.75rem', borderRadius: '6px', fontSize: '0.85rem', color: '#475569' }}>
                  <strong>AI Match Check:</strong> {product.reason}
                </div>
              </div>

            </Link>
          )
        })}
      </div>
    </div>
  )
}