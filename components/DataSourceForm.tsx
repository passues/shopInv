'use client'

import { useState } from 'react'
import { X, Globe } from 'lucide-react'

interface DataSourceFormProps {
  itemId: string
  onClose: () => void
  onSuccess: () => void
}

const SITE_TYPES = [
  { value: 'OFFICIAL_STORE', label: 'Official Store' },
  { value: 'MARKETPLACE', label: 'Marketplace (Amazon, eBay)' },
  { value: 'RETAILER', label: 'Retailer' },
  { value: 'RESELLER', label: 'Reseller' }
]

export default function DataSourceForm({ itemId, onClose, onSuccess }: DataSourceFormProps) {
  const [formData, setFormData] = useState({
    siteName: '',
    siteType: 'OFFICIAL_STORE',
    url: '',
    priceSelector: '',
    stockSelector: '',
    titleSelector: '',
    imageSelector: '',
    checkFrequency: 60
  })
  const [loading, setLoading] = useState(false)
  const [testingUrl, setTestingUrl] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/data-sources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, itemId })
      })

      if (response.ok) {
        onSuccess()
        onClose()
      } else {
        alert('Failed to add data source')
      }
    } catch (error) {
      alert('Error adding data source')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'checkFrequency' ? parseInt(value) || 60 : value
    }))
  }

  const testUrl = async () => {
    if (!formData.url) return
    
    setTestingUrl(true)
    try {
      // This would be a test scraping endpoint
      const response = await fetch('/api/test-scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: formData.url,
          priceSelector: formData.priceSelector,
          stockSelector: formData.stockSelector
        })
      })
      
      if (response.ok) {
        const result = await response.json()
        alert(`Test successful!\nPrice: ${result.price || 'Not found'}\nStock: ${result.inStock ? 'In Stock' : 'Out of Stock'}`)
      } else {
        alert('Test failed - check URL and selectors')
      }
    } catch (error) {
      alert('Test failed - network error')
    } finally {
      setTestingUrl(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-3xl shadow-lg rounded-md bg-white">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            <Globe className="inline h-5 w-5 mr-2" />
            Add Data Source for Automated Tracking
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="mb-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Automated Tracking:</strong> This will monitor the specified URL for price and stock changes.
            The system will automatically check this source based on the frequency you set.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Site Name *</label>
              <input
                type="text"
                name="siteName"
                value={formData.siteName}
                onChange={handleChange}
                required
                placeholder="e.g., Amazon, Pop Mart Official"
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-brand-500 focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Site Type *</label>
              <select
                name="siteType"
                value={formData.siteType}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-brand-500 focus:border-brand-500"
              >
                {SITE_TYPES.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Product URL *</label>
            <div className="mt-1 flex">
              <input
                type="url"
                name="url"
                value={formData.url}
                onChange={handleChange}
                required
                placeholder="https://www.example.com/product/item"
                className="flex-1 border border-gray-300 rounded-l-md px-3 py-2 focus:outline-none focus:ring-brand-500 focus:border-brand-500"
              />
              <button
                type="button"
                onClick={testUrl}
                disabled={testingUrl || !formData.url}
                className="px-4 py-2 bg-gray-500 text-white rounded-r-md hover:bg-gray-600 disabled:opacity-50"
              >
                {testingUrl ? 'Testing...' : 'Test'}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Price CSS Selector</label>
              <input
                type="text"
                name="priceSelector"
                value={formData.priceSelector}
                onChange={handleChange}
                placeholder=".price, .current-price"
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-brand-500 focus:border-brand-500"
              />
              <p className="text-xs text-gray-500 mt-1">CSS selector to find the price element</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Stock CSS Selector</label>
              <input
                type="text"
                name="stockSelector"
                value={formData.stockSelector}
                onChange={handleChange}
                placeholder=".stock-status, .availability"
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-brand-500 focus:border-brand-500"
              />
              <p className="text-xs text-gray-500 mt-1">CSS selector to find the stock status</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Title Selector (Optional)</label>
              <input
                type="text"
                name="titleSelector"
                value={formData.titleSelector}
                onChange={handleChange}
                placeholder="h1, .product-title"
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-brand-500 focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Image Selector (Optional)</label>
              <input
                type="text"
                name="imageSelector"
                value={formData.imageSelector}
                onChange={handleChange}
                placeholder=".product-image img"
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-brand-500 focus:border-brand-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Check Frequency (minutes)</label>
            <select
              name="checkFrequency"
              value={formData.checkFrequency}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-brand-500 focus:border-brand-500"
            >
              <option value={15}>Every 15 minutes</option>
              <option value={30}>Every 30 minutes</option>
              <option value={60}>Every hour</option>
              <option value={120}>Every 2 hours</option>
              <option value={180}>Every 3 hours</option>
              <option value={360}>Every 6 hours</option>
              <option value={720}>Every 12 hours</option>
              <option value={1440}>Daily</option>
            </select>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-brand-600 border border-transparent rounded-md hover:bg-brand-700 disabled:opacity-50"
            >
              {loading ? 'Adding...' : 'Add Data Source'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}