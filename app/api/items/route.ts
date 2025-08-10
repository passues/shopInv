import { prisma } from '@/lib/prisma'
import { updateInventoryLevel } from '@/lib/notifications'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const items = await prisma.item.findMany({
      where: { isActive: true },
      orderBy: { updatedAt: 'desc' }
    })
    return NextResponse.json(items)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch items' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json()
    
    const item = await prisma.item.create({
      data: {
        name: data.name,
        description: data.description,
        category: data.category,
        brand: data.brand,
        sku: data.sku,
        imageUrl: data.imageUrl,
        inventoryLevel: data.inventoryLevel || 0,
        minStockLevel: data.minStockLevel || 0,
        maxStockLevel: data.maxStockLevel || 100,
        price: data.price,
      }
    })
    
    // Create notification for new item
    if (item.inventoryLevel > 0) {
      await prisma.notification.create({
        data: {
          itemId: item.id,
          type: 'NEW_ITEM',
          message: `New item added: ${item.name} (${item.inventoryLevel} units)`
        }
      })
    }
    
    return NextResponse.json(item)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create item' },
      { status: 500 }
    )
  }
}