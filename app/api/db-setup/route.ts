import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST() {
  try {
    // Try to run a simple query to test database connection
    await prisma.$queryRaw`SELECT 1`
    
    // Check if tables exist
    const tableCount = await prisma.$queryRaw`
      SELECT COUNT(*) as count 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'items'
    `
    
    const hasItems = Array.isArray(tableCount) && tableCount[0]?.count > 0
    
    return NextResponse.json({
      success: true,
      message: 'Database connection successful',
      tablesExist: hasItems,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Database setup failed',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

export async function GET() {
  return POST()
}