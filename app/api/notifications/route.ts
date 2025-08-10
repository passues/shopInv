import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const notifications = await prisma.notification.findMany({
      include: { item: true },
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json(notifications)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const { ids } = await request.json()
    
    await prisma.notification.updateMany({
      where: { id: { in: ids } },
      data: { isRead: true }
    })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to mark notifications as read' },
      { status: 500 }
    )
  }
}