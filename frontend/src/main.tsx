import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './App.css'

/**
 * This is where everything starts. It just grabs the #root div from
 * index.html and renders my whole app into it. StrictMode is a React
 * dev tool that helps catch mistakes early - it doesn't do anything
 * once the app is actually built for production.
 */
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)