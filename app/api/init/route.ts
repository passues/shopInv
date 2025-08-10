import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST() {
  try {
    // First check if we can connect to the database
    console.log('Attempting database connection...')
    
    // Try a simple query to test connection
    await prisma.$queryRaw`SELECT 1`
    console.log('Database connection successful')

    // Check if tables exist by trying to count items
    let itemCount = 0
    try {
      itemCount = await prisma.item.count()
      console.log(`Database already initialized. Items count: ${itemCount}`)
    } catch (error) {
      // Tables might not exist yet, that's ok
      console.log('Tables not found, database needs initialization')
    }

    return NextResponse.json({
      success: true,
      message: 'Database connection successful',
      itemCount,
      needsSeeding: itemCount === 0
    })

  } catch (error) {
    console.error('Database initialization error:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Database initialization failed',
      suggestion: 'Make sure DATABASE_URL environment variable is set correctly'
    }, { status: 500 })
  }
}

export async function GET() {
  return POST() // Same logic for GET requests
}