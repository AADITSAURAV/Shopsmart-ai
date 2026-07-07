import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

interface FormState {
  budget: string
  category: string
  brand: string
  purpose: string
  min_rating: string
}

/**
 * This is the main page of my whole app - the recommendation form
 * itself. Collects budget, category, brand, purpose, and minimum
 * rating, then POSTs all of it to /recommend and takes you to /results
 * with whatever comes back.
 */
export default function RecommendForm() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState<FormState>({
    budget: '',
    category: '',
    brand: '',
    purpose: '',
    min_rating: '',
  })
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const categories = [
    "Beauty & Hygiene", "Kitchen, Garden & Pets", "Cleaning & Household", 
    "Gourmet & World Food", "Snacks & Branded Foods", "Foodgrains, Oil & Masala", 
    "Beverages", "Bakery, Cakes & Dairy", "Baby Care", "Fruits & Vegetables", 
    "Eggs, Meat & Fish"
  ]

  const ratings = ["3", "3.5", "4", "4.5"]

  /** Just updates whichever field changed - one handler for the whole form. */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  /** Sends the form to POST /recommend and routes to /results with whatever it gets back. */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const payload = {
      budget: parseFloat(formData.budget),
      category: formData.category || null,
      brand: formData.brand || null,
      purpose: formData.purpose || null,
      min_rating: formData.min_rating ? parseFloat(formData.min_rating) : null
    }

    try {
      const response = await fetch('/api/recommend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        throw new Error('Failed to fetch recommendations from the server.')
      }

      const data = await response.json()
      navigate('/results', { state: { results: data } })
    } catch (err: any) {
      setError(err.message || 'An error occurred while connecting to the recommendation service.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card" style={{ maxWidth: '600px', margin: '0 auto' }}>
      <h2 style={{ marginBottom: '1.5rem', fontSize: '1.75rem' }}>Personalized Match Filters</h2>
      
      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="budget">Maximum Budget (Rs.) *</label>
          <input
            id="budget"
            type="number"
            name="budget"
            required
            min="1"
            className="form-control"
            placeholder="Enter max spend budget"
            value={formData.budget}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label htmlFor="category">Category</label>
          <select
            id="category"
            name="category"
            className="form-control"
            value={formData.category}
            onChange={handleChange}
          >
            <option value="">All Categories</option>
            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="brand">Brand</label>
          <input
            id="brand"
            type="text"
            name="brand"
            className="form-control"
            placeholder="e.g. Organic Tattva, Britannia"
            value={formData.brand}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label htmlFor="purpose">What are you looking for?</label>
          <input
            id="purpose"
            type="text"
            name="purpose"
            className="form-control"
            placeholder="e.g. healthy breakfast snack"
            value={formData.purpose}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label htmlFor="min_rating">Minimum Rating</label>
          <select
            id="min_rating"
            name="min_rating"
            className="form-control"
            value={formData.min_rating}
            onChange={handleChange}
          >
            <option value="">Any Rating</option>
            {ratings.map(rate => <option key={rate} value={rate}>{rate} stars & up</option>)}
          </select>
        </div>

        <button type="submit" disabled={loading} className="btn" style={{ width: '100%', marginTop: '1rem' }}>
          {loading ? 'Finding Best Deals...' : 'Generate Recommendations'}
        </button>
      </form>
    </div>
  )
}