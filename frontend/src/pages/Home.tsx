import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <div className="card" style={{ maxWidth: '800px', margin: '4rem auto', textAlign: 'center', padding: '3rem 2rem' }}>
      <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', color: '#0f172a' }}>Smart Grocery Lists, Tailored For You</h1>
      <p style={{ fontSize: '1.2rem', color: '#64748b', marginBottom: '2.5rem', maxWidth: '600px', margin: '0 auto 2.5rem' }}>
        Stop guessing what to buy. Smart Cart uses item analysis to cross-reference your specific dietary purposes, budget ranges, and ratings against thousands of options instantly.
      </p>
      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
        <Link to="/recommend" className="btn">
          Find Recommendations
        </Link>
      </div>
    </div>
  )
}