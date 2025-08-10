import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { InventoryMonitor } from '@/lib/inventory-monitor'

export async function GET() {
  try {
    const dataSources = await prisma.dataSource.findMany({
      include: {
        item: {
          select: {
            id: true,
            name: true,
            category: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })
    
    return NextResponse.json(dataSources)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch data sources' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json()
    
    const dataSource = await InventoryMonitor.addDataSource(data.itemId, {
      siteName: data.siteName,
      siteType: data.siteType,
      url: data.url,
      priceSelector: data.priceSelector,
      stockSelector: data.stockSelector,
      titleSelector: data.titleSelector,
      imageSelector: data.imageSelector,
      checkFrequency: data.checkFrequency
    })
    
    return NextResponse.json(dataSource)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create data source' },
      { status: 500 }
    )
  }
}