'use client'

import { useState } from 'react'
import { X, Plus, Minus } from 'lucide-react'

interface Item {
  id: string
  name: string
  inventoryLevel: number
  minStockLevel: number
  maxStockLevel: number
}

interface InventoryUpdateFormProps {
  item: Item
  onClose: () => void
}

export default function InventoryUpdateForm({ item, onClose }: InventoryUpdateFormProps) {
  const [updateType, setUpdateType] = useState<'set' | 'add' | 'subtract'>('set')
  const [amount, setAmount] = useState('')
  const [reason, setReason] = useState('')
  const [loading, setLoading] = useState(false)

  const calculateNewLevel = () => {
    const amountNum = parseInt(amount) || 0
    switch (updateType) {
      case 'add':
        return item.inventoryLevel + amountNum
      case 'subtract':
        return Math.max(0, item.inventoryLevel - amountNum)
      case 'set':
      default:
        return amountNum
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const newLevel = calculateNewLevel()
      
      const response = await fetch(`/api/items/${item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inventoryLevel: newLevel,
          reason: reason || `${updateType === 'set' ? 'Set to' : updateType === 'add' ? 'Added' : 'Subtracted'} ${amount}`
        })
      })

      if (response.ok) {
        onClose()
      }
    } catch (error) {
      console.error('Error updating inventory:', error)
    } finally {
      setLoading(false)
    }
  }

  const newLevel = calculateNewLevel()
  const isValidUpdate = amount && parseInt(amount) >= 0

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-md shadow-lg rounded-md bg-white">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            Update Inventory
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-gray-900">{item.name}</h4>
          <p className="text-sm text-gray-600">Current Stock: {item.inventoryLevel}</p>
          <p className="text-xs text-gray-500">
            Min: {item.minStockLevel} | Max: {item.maxStockLevel}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Update Type
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setUpdateType('set')}
                className={`flex items-center justify-center px-3 py-2 text-sm font-medium rounded-md border ${
                  updateType === 'set'
                    ? 'bg-brand-100 border-brand-500 text-brand-700'
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                Set To
              </button>
              <button
                type="button"
                onClick={() => setUpdateType('add')}
                className={`flex items-center justify-center px-3 py-2 text-sm font-medium rounded-md border ${
                  updateType === 'add'
                    ? 'bg-green-100 border-green-500 text-green-700'
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add
              </button>
              <button
                type="button"
                onClick={() => setUpdateType('subtract')}
                className={`flex items-center justify-center px-3 py-2 text-sm font-medium rounded-md border ${
                  updateType === 'subtract'
                    ? 'bg-red-100 border-red-500 text-red-700'
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Minus className="h-4 w-4 mr-1" />
                Subtract
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              {updateType === 'set' ? 'New Stock Level' : 'Amount'}
            </label>
            <input
              type="number"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-brand-500 focus:border-brand-500"
              placeholder={updateType === 'set' ? 'Enter new stock level' : 'Enter amount'}
            />
          </div>

          {isValidUpdate && (
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-sm">
                <span className="font-medium text-blue-900">
                  New stock level will be: {newLevel}
                </span>
                <br />
                <span className="text-blue-700">
                  Change: {newLevel > item.inventoryLevel ? '+' : ''}{newLevel - item.inventoryLevel}
                </span>
              </p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700">Reason (optional)</label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-brand-500 focus:border-brand-500"
              placeholder="e.g., Received shipment, Damaged goods, Sale"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !isValidUpdate}
              className="px-4 py-2 text-sm font-medium text-white bg-brand-600 border border-transparent rounded-md hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 disabled:opacity-50"
            >
              {loading ? 'Updating...' : 'Update Inventory'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}