import { prisma } from '@/lib/prisma'
import ItemCard from '@/components/ItemCard'
import { Package, AlertCircle } from 'lucide-react'

async function getItems() {
  try {
    const items = await prisma.item.findMany({
      where: { isActive: true },
      orderBy: { updatedAt: 'desc' }
    })
    return items
  } catch (error) {
    console.error('Error fetching items:', error)
    return []
  }
}

async function getNotifications() {
  try {
    const notifications = await prisma.notification.findMany({
      where: { isRead: false },
      include: { item: true },
      orderBy: { createdAt: 'desc' },
      take: 5
    })
    return notifications
  } catch (error) {
    console.error('Error fetching notifications:', error)
    return []
  }
}

// Error boundary component
function ErrorFallback({ error }: { error: Error }) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <h2 className="text-lg font-medium text-red-800">Something went wrong</h2>
        <p className="text-red-600 mt-2">
          There was an error loading the inventory data. Please try refreshing the page.
        </p>
        {process.env.NODE_ENV === 'development' && (
          <pre className="mt-4 text-xs text-red-500 bg-red-100 p-2 rounded">
            {error.message}
          </pre>
        )}
      </div>
    </div>
  )
}

export default async function Home() {
  const [items, notifications] = await Promise.all([
    getItems(),
    getNotifications()
  ])

  const lowStockItems = items.filter(item => item.inventoryLevel <= item.minStockLevel)
  const outOfStockItems = items.filter(item => item.inventoryLevel === 0)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Stats Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <div className="flex items-center">
            <Package className="h-8 w-8 text-brand-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Items</p>
              <p className="text-2xl font-semibold text-gray-900">{items.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <div className="flex items-center">
            <AlertCircle className="h-8 w-8 text-yellow-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Low Stock</p>
              <p className="text-2xl font-semibold text-gray-900">{lowStockItems.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <div className="flex items-center">
            <AlertCircle className="h-8 w-8 text-red-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Out of Stock</p>
              <p className="text-2xl font-semibold text-gray-900">{outOfStockItems.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <div className="flex items-center">
            <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
              <div className="h-4 w-4 bg-green-500 rounded-full"></div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">In Stock</p>
              <p className="text-2xl font-semibold text-gray-900">
                {items.length - outOfStockItems.length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Notifications */}
      {notifications.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Notifications</h2>
          <div className="bg-white rounded-lg shadow-sm">
            {notifications.map((notification) => (
              <div key={notification.id} className="p-4 border-b border-gray-100 last:border-b-0">
                <div className="flex items-start">
                  <AlertCircle className={`h-5 w-5 mt-0.5 ${
                    notification.type === 'OUT_OF_STOCK' ? 'text-red-500' :
                    notification.type === 'LOW_STOCK' ? 'text-yellow-500' :
                    'text-green-500'
                  }`} />
                  <div className="ml-3">
                    <p className="text-sm text-gray-900">{notification.message}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(notification.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Items Grid */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">All Items</h2>
        {items.length === 0 ? (
          <div className="text-center py-12">
            <Package className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No items</h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by adding your first item.
            </p>
            <div className="mt-6">
              <a
                href="/admin"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-brand-600 hover:bg-brand-700"
              >
                Add Item
              </a>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {items.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}