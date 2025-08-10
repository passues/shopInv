import Image from 'next/image'
import { AlertTriangle, Package } from 'lucide-react'

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
}

interface ItemCardProps {
  item: Item
}

export default function ItemCard({ item }: ItemCardProps) {
  const getStockStatus = () => {
    if (item.inventoryLevel === 0) {
      return { status: 'out-of-stock', color: 'text-red-600', bgColor: 'bg-red-100' }
    } else if (item.inventoryLevel <= item.minStockLevel) {
      return { status: 'low-stock', color: 'text-yellow-600', bgColor: 'bg-yellow-100' }
    } else {
      return { status: 'in-stock', color: 'text-green-600', bgColor: 'bg-green-100' }
    }
  }

  const stockStatus = getStockStatus()

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      <div className="aspect-w-1 aspect-h-1 w-full">
        {item.imageUrl ? (
          <Image
            src={item.imageUrl}
            alt={item.name}
            width={300}
            height={300}
            className="w-full h-48 object-cover"
          />
        ) : (
          <div className="w-full h-48 bg-gray-100 flex items-center justify-center">
            <Package className="h-12 w-12 text-gray-400" />
          </div>
        )}
      </div>
      
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-sm font-semibold text-gray-900 line-clamp-2">
            {item.name}
          </h3>
          {stockStatus.status !== 'in-stock' && (
            <AlertTriangle className={`h-4 w-4 ${stockStatus.color} flex-shrink-0 ml-2`} />
          )}
        </div>
        
        {item.brand && (
          <p className="text-xs text-gray-500 mb-2">{item.brand}</p>
        )}
        
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-gray-500 uppercase tracking-wide">
            {item.category}
          </span>
          {item.sku && (
            <span className="text-xs text-gray-400">SKU: {item.sku}</span>
          )}
        </div>
        
        {item.description && (
          <p className="text-xs text-gray-600 mb-3 line-clamp-2">
            {item.description}
          </p>
        )}
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-900">Stock Level</span>
            <span className={`text-sm font-semibold ${stockStatus.color}`}>
              {item.inventoryLevel}
            </span>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full ${
                stockStatus.status === 'out-of-stock' ? 'bg-red-500' :
                stockStatus.status === 'low-stock' ? 'bg-yellow-500' :
                'bg-green-500'
              }`}
              style={{
                width: `${Math.min((item.inventoryLevel / item.maxStockLevel) * 100, 100)}%`
              }}
            ></div>
          </div>
          
          <div className="flex justify-between text-xs text-gray-500">
            <span>Min: {item.minStockLevel}</span>
            <span>Max: {item.maxStockLevel}</span>
          </div>
          
          {item.price && (
            <div className="pt-2 border-t border-gray-100">
              <span className="text-sm font-semibold text-gray-900">
                ${item.price.toFixed(2)}
              </span>
            </div>
          )}
        </div>
        
        <div className={`mt-3 px-2 py-1 rounded-full text-xs font-medium text-center ${stockStatus.bgColor} ${stockStatus.color}`}>
          {stockStatus.status === 'out-of-stock' ? 'Out of Stock' :
           stockStatus.status === 'low-stock' ? 'Low Stock' :
           'In Stock'}
        </div>
      </div>
    </div>
  )
}