import { prisma } from '@/lib/prisma'
import { updateInventoryLevel } from '@/lib/notifications'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const item = await prisma.item.findUnique({
      where: { id: params.id }
    })
    
    if (!item) {
      return NextResponse.json(
        { error: 'Item not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(item)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch item' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json()
    
    // Handle inventory level updates specially to trigger notifications
    if ('inventoryLevel' in data) {
      const updatedItem = await updateInventoryLevel(
        params.id,
        data.inventoryLevel,
        data.reason || 'Manual update'
      )
      return NextResponse.json(updatedItem)
    }
    
    // Regular item updates
    const item = await prisma.item.update({
      where: { id: params.id },
      data
    })
    
    return NextResponse.json(item)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update item' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.item.update({
      where: { id: params.id },
      data: { isActive: false }
    })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete item' },
      { status: 500 }
    )
  }
}