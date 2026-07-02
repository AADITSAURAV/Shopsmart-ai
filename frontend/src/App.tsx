import { useEffect, useState } from 'react'

const API_URL = 'http://localhost:8000'

function App() {
  const [apiStatus, setApiStatus] = useState('checking')
  const [dbStatus, setDbStatus] = useState('checking')

  useEffect(() => {
    fetch(`${API_URL}/health`)
      .then((res) => res.json())
      .then(() => setApiStatus('online'))
      .catch(() => setApiStatus('offline'))

    fetch(`${API_URL}/health/db`)
      .then((res) => res.json())
      .then((data) => setDbStatus(data.database_connected ? 'connected' : 'disconnected'))
      .catch(() => setDbStatus('disconnected'))
  }, [])

  return (
    <div style={{ fontFamily: 'sans-serif', textAlign: 'center', marginTop: '3rem' }}>
      <h1>ShopSmart AI</h1>
      <p>Frontend container: running</p>
      <p>Backend API: {apiStatus}</p>
      <p>Database: {dbStatus}</p>
    </div>
  )
}

export default App