'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Package, AlertCircle } from 'lucide-react'
import Image from 'next/image'
import ItemForm from '@/components/ItemForm'
import InventoryUpdateForm from '@/components/InventoryUpdateForm'

interface Item {
  id: string
  name: string
  description: string | null
  category: string
  brand: string | null
  sku: string | null
  imageUrl: string | null
  inventoryLevel: number
  minStockLevel: number
  maxStockLevel: number
  price: number | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export default function AdminPage() {
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)
  const [showItemForm, setShowItemForm] = useState(false)
  const [editingItem, setEditingItem] = useState<Item | null>(null)
  const [showInventoryForm, setShowInventoryForm] = useState(false)
  const [inventoryItem, setInventoryItem] = useState<Item | null>(null)

  useEffect(() => {
    fetchItems()
  }, [])

  const fetchItems = async () => {
    try {
      const response = await fetch('/api/items')
      const data = await response.json()
      setItems(data)
    } catch (error) {
      console.error('Error fetching items:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteItem = async (id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return
    
    try {
      await fetch(`/api/items/${id}`, { method: 'DELETE' })
      fetchItems()
    } catch (error) {
      console.error('Error deleting item:', error)
    }
  }

  const handleEditItem = (item: Item) => {
    setEditingItem(item)
    setShowItemForm(true)
  }

  const handleUpdateInventory = (item: Item) => {
    setInventoryItem(item)
    setShowInventoryForm(true)
  }

  const closeModals = () => {
    setShowItemForm(false)
    setShowInventoryForm(false)
    setEditingItem(null)
    setInventoryItem(null)
    fetchItems()
  }

  const getStockStatusColor = (item: Item) => {
    if (item.inventoryLevel === 0) return 'text-red-600'
    if (item.inventoryLevel <= item.minStockLevel) return 'text-yellow-600'
    return 'text-green-600'
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="sm:flex sm:items-center mb-8">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Inventory Management</h1>
          <p className="mt-2 text-sm text-gray-700">
            Manage your inventory items, stock levels, and notifications.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <button
            onClick={() => setShowItemForm(true)}
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-brand-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 sm:w-auto"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Item
          </button>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-12">
          <Package className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No items</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by adding your first item.
          </p>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {items.map((item) => (
              <li key={item.id}>
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        {item.imageUrl ? (
                          <Image
                            className="h-16 w-16 rounded-lg object-cover"
                            src={item.imageUrl}
                            alt={item.name}
                            width={64}
                            height={64}
                          />
                        ) : (
                          <div className="h-16 w-16 rounded-lg bg-gray-100 flex items-center justify-center">
                            <Package className="h-8 w-8 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="flex items-center">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {item.name}
                          </p>
                          {(item.inventoryLevel === 0 || item.inventoryLevel <= item.minStockLevel) && (
                            <AlertCircle className={`ml-2 h-4 w-4 ${getStockStatusColor(item)}`} />
                          )}
                        </div>
                        <div className="mt-1 flex items-center text-sm text-gray-500">
                          <span>{item.category}</span>
                          {item.brand && <span className="ml-2">• {item.brand}</span>}
                          {item.sku && <span className="ml-2">• SKU: {item.sku}</span>}
                        </div>
                        {item.description && (
                          <p className="mt-1 text-sm text-gray-600 truncate max-w-md">
                            {item.description}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className={`text-sm font-semibold ${getStockStatusColor(item)}`}>
                          Stock: {item.inventoryLevel}
                        </p>
                        <p className="text-xs text-gray-500">
                          Min: {item.minStockLevel} | Max: {item.maxStockLevel}
                        </p>
                        {item.price && (
                          <p className="text-sm font-medium text-gray-900 mt-1">
                            ${item.price.toFixed(2)}
                          </p>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleUpdateInventory(item)}
                          className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500"
                        >
                          Update Stock
                        </button>
                        <button
                          onClick={() => handleEditItem(item)}
                          className="inline-flex items-center p-1.5 border border-transparent text-xs font-medium rounded-md text-brand-600 hover:text-brand-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteItem(item.id)}
                          className="inline-flex items-center p-1.5 border border-transparent text-xs font-medium rounded-md text-red-600 hover:text-red-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {showItemForm && (
        <ItemForm
          item={editingItem}
          onClose={closeModals}
        />
      )}

      {showInventoryForm && inventoryItem && (
        <InventoryUpdateForm
          item={inventoryItem}
          onClose={closeModals}
        />
      )}
    </div>
  )
}