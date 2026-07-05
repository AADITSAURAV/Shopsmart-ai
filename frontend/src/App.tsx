import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom'
import Home from './pages/Home'
import RecommendForm from './pages/RecommendForm'
import RecommendResults from './pages/RecommendResults'
import ProductDetail from './pages/ProductDetail'
import About from './pages/About'

function App() {
  return (
    <BrowserRouter>
      <div className="app-wrapper">
        <nav className="navbar">
          <div className="nav-container">
            <NavLink to="/" className="nav-brand">
              ShopSmart AI
            </NavLink>
            <ul className="nav-links">
              <li>
                <NavLink to="/" className={({ isActive }) => isActive ? 'active' : ''}>Home</NavLink>
              </li>
              <li>
                <NavLink to="/recommend" className={({ isActive }) => isActive ? 'active' : ''}>Get Recommendations</NavLink>
              </li>
              <li>
                <NavLink to="/about" className={({ isActive }) => isActive ? 'active' : ''}>About</NavLink>
              </li>
            </ul>
          </div>
        </nav>

        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/recommend" element={<RecommendForm />} />
            <Route path="/results" element={<RecommendResults />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/about" element={<About />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}

export default App