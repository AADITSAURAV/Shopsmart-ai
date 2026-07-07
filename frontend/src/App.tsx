import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom'
import { CartProvider, useCart } from './CartContext'
import RecommendForm from './pages/RecommendForm'
import RecommendResults from './pages/RecommendResults'
import ProductDetail from './pages/ProductDetail'
import Cart from './pages/Cart'

/** Simple shopping cart icon, drawn as inline SVG so I don't need an image file for it. */
function CartIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="21" r="1"></circle>
      <circle cx="20" cy="21" r="1"></circle>
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
    </svg>
  )
}

/**
 * The Cart link in the nav bar. Pulls the live item count from
 * CartContext so it shows something like "Cart (2)" instead of just
 * "Cart" once you've added something.
 */
function NavCartLink() {
  const { items } = useCart()
  return (
    <NavLink to="/cart" className={({ isActive }) => isActive ? 'active' : ''}>
      Cart{items.length > 0 ? ` (${items.length})` : ''}
    </NavLink>
  )
}

/**
 * Root of the whole app. Wraps everything in CartProvider so any page
 * can read/update the cart, and sets up all the routes. "/" is the
 * recommendation form itself - I deliberately don't have a separate
 * landing page, since I want this to be a direct recommendation tool,
 * not something you have to click through to get to.
 */
function App() {
  return (
    <CartProvider>
      <BrowserRouter>
        <div className="app-wrapper">
          <nav className="navbar">
            <div className="nav-container">
              <NavLink to="/" className="nav-brand" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <CartIcon />
                Smart Cart
              </NavLink>
              <ul className="nav-links">
                <li>
                  <NavCartLink />
                </li>
              </ul>
            </div>
          </nav>

          <main className="main-content">
            <Routes>
              <Route path="/" element={<RecommendForm />} />
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