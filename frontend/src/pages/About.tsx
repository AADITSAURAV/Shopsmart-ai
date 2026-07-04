export default function About() {
  const stack = [
    { title: 'Frontend Stack', details: 'React 19, TypeScript, Vite, React Router 6' },
    { title: 'Application Framework', details: 'FastAPI (Python REST Routing Shell)' },
    { title: 'Vector & Data Layer', details: 'PostgreSQL relational storage engine' },
    { title: 'AI Recommendation Engine', details: 'Scikit-learn (TF-IDF vector weights mapping structural product content similarities)' }
  ]

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div className="card" style={{ marginBottom: '2rem' }}>
        <h2 style={{ marginBottom: '1rem', fontSize: '1.75rem' }}>Under the Hood</h2>
        <p style={{ color: '#475569', marginBottom: '1rem', fontSize: '1.05rem' }}>
          ShopSmart AI implements a production-ready Content-Based Filtering algorithm to generate real-time product mappings. 
          By taking natural text inputs from search purposes, it evaluates item text tokens against a massive data matrix.
        </p>
        <p style={{ color: '#475569', fontSize: '1.05rem' }}>
          The baseline source tracking architecture handles items mined from the <strong>BigBasket Product Catalog Dataset</strong> sourced via Kaggle, processing raw details across <strong>~27,500 inventory line items</strong> flawlessly.
        </p>
      </div>

      <h3 style={{ marginBottom: '1rem', fontSize: '1.25rem', paddingLeft: '0.5rem' }}>Tech Infrastructure Overview</h3>
      <div className="grid-2">
        {stack.map((tech, idx) => (
          <div key={idx} className="card" style={{ padding: '1.25rem' }}>
            <h4 style={{ color: '#10b981', marginBottom: '0.25rem' }}>{tech.title}</h4>
            <p style={{ fontSize: '0.95rem', color: '#64748b' }}>{tech.details}</p>
          </div>
        ))}
      </div>
    </div>
  )
}