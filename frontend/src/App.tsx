import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom'
import { CartProvider, useCart } from './CartContext'
import Home from './pages/Home'
import RecommendForm from './pages/RecommendForm'
import RecommendResults from './pages/RecommendResults'
import ProductDetail from './pages/ProductDetail'
import Cart from './pages/Cart'

function NavCartLink() {
  const { items } = useCart()
  return (
    <NavLink to="/cart" className={({ isActive }) => isActive ? 'active' : ''}>
      Cart{items.length > 0 ? ` (${items.length})` : ''}
    </NavLink>
  )
}

function App() {
  return (
    <CartProvider>
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
                  <NavCartLink />
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
              <Route path="/cart" element={<Cart />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </CartProvider>
  )
}

export default App