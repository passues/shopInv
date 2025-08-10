import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const priceHistory = await prisma.priceHistory.findMany({
      where: { itemId: params.id },
      orderBy: { scrapedAt: 'desc' },
      take: 100, // Last 100 price points
      select: {
        price: true,
        source: true,
        inStock: true,
        stockLevel: true,
        scrapedAt: true
      }
    })
    
    return NextResponse.json(priceHistory)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch price history' },
      { status: 500 }
    )
  }
}