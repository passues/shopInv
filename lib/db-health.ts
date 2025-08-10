import { prisma } from './prisma'

export async function checkDatabaseHealth() {
  try {
    // Try to perform a simple query
    await prisma.$queryRaw`SELECT 1`
    return { healthy: true, error: null }
  } catch (error) {
    console.error('Database health check failed:', error)
    return { 
      healthy: false, 
      error: error instanceof Error ? error.message : 'Unknown database error' 
    }
  }
}

export async function initializeDatabase() {
  try {
    // Try to run a migration or push schema
    const health = await checkDatabaseHealth()
    if (!health.healthy) {
      throw new Error(`Database not healthy: ${health.error}`)
    }
    
    // Check if tables exist by trying to count items
    const itemCount = await prisma.item.count()
    console.log(`Database initialized. Items count: ${itemCount}`)
    
    return { success: true, itemCount, error: null }
  } catch (error) {
    console.error('Database initialization failed:', error)
    return { 
      success: false, 
      itemCount: 0,
      error: error instanceof Error ? error.message : 'Database initialization failed' 
    }
  }
}