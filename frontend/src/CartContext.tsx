import { createContext, useContext, useState, ReactNode } from 'react'

/** What one item in the cart looks like. */
export interface CartItem {
  id: number
  name: string
  brand: string
  price: number
  rating: number | null
}

interface CartContextType {
  items: CartItem[]
  addToCart: (item: CartItem) => void
  removeFromCart: (id: number) => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

/**
 * Makes the cart available to any component in the app, using React's
 * built-in Context system instead of passing props down through every
 * level. Worth knowing: the cart only lives in memory - if you refresh
 * the page, it's gone. I did that on purpose to keep things simple;
 * I didn't want to build a whole persistence layer just for this.
 */
export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])

  /** Adds an item, but skips it if it's already in the cart (checked by id). */
  const addToCart = (item: CartItem) => {
    setItems((prev) => {
      if (prev.some((i) => i.id === item.id)) return prev
      return [...prev, item]
    })
  }

  /** Removes an item from the cart by its id. */
  const removeFromCart = (id: number) => {
    setItems((prev) => prev.filter((i) => i.id !== id))
  }

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart }}>
      {children}
    </CartContext.Provider>
  )
}

/**
 * The hook I use everywhere else to read or update the cart. Has to be
 * called from somewhere inside <CartProvider> (which wraps my whole
 * app in App.tsx), or it'll throw an error.
 */
export function useCart() {
  const context = useContext(CartContext)
  if (!context) throw new Error('useCart must be used within a CartProvider')
  return context
}