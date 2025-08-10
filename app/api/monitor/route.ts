import { NextResponse } from 'next/server'

export async function POST() {
  try {
    // Dynamic import to avoid build-time issues
    const { InventoryMonitor } = await import('@/lib/inventory-monitor')
    
    await InventoryMonitor.checkAllItems()
    
    return NextResponse.json({
      success: true,
      message: 'Inventory monitoring completed successfully',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Monitoring failed:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Monitoring failed',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

export async function GET() {
  // Manual trigger for monitoring
  return POST()
}