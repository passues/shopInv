import { PrismaClient, SiteType } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Check if data already exists
  const existingItems = await prisma.item.count()
  if (existingItems > 0) {
    console.log('Database already seeded')
    return
  }

  console.log('Seeding database with automated tracking...')

  // Create sample items with automated tracking
  const sampleItems = [
    {
      name: 'MOLLY x Kenny Scharf Series',
      description: 'Limited edition MOLLY figure from Kenny Scharf collaboration',
      category: 'Pop Mart',
      brand: 'Pop Mart',
      sku: 'MOLLY-KS-001',
      imageUrl: 'https://picsum.photos/300/300?random=1',
      inventoryLevel: 15,
      minStockLevel: 5,
      maxStockLevel: 50,
      price: 15.99,
      autoTrack: true,
      dataSources: [
        {
          siteName: 'Pop Mart Official',
          siteType: SiteType.OFFICIAL_STORE,
          url: 'https://www.popmart.com/products/molly-kenny-scharf',
          checkFrequency: 30 // Check every 30 minutes
        },
        {
          siteName: 'Amazon',
          siteType: SiteType.MARKETPLACE,
          url: 'https://www.amazon.com/dp/example-molly',
          checkFrequency: 60 // Check every hour
        }
      ]
    },
    {
      name: 'SKULLPANDA The Sound Series',
      description: 'Musical themed SKULLPANDA collectible figure',
      category: 'Pop Mart',
      brand: 'Pop Mart',
      sku: 'SP-SOUND-002',
      imageUrl: 'https://picsum.photos/300/300?random=2',
      inventoryLevel: 8,
      minStockLevel: 10,
      maxStockLevel: 40,
      price: 13.99,
      autoTrack: true,
      dataSources: [
        {
          siteName: 'Pop Mart Official',
          siteType: SiteType.OFFICIAL_STORE,
          url: 'https://www.popmart.com/products/skullpanda-sound',
          checkFrequency: 30
        }
      ]
    },
    {
      name: 'Vintage Band Tee - The Rolling Stones',
      description: 'Authentic vintage Rolling Stones concert t-shirt',
      category: 'Clothing',
      brand: 'Band Merch',
      sku: 'VTGE-RS-L',
      imageUrl: 'https://picsum.photos/300/300?random=3',
      inventoryLevel: 0,
      minStockLevel: 2,
      maxStockLevel: 20,
      price: 89.99,
      autoTrack: true,
      dataSources: [
        {
          siteName: 'eBay',
          siteType: SiteType.MARKETPLACE,
          url: 'https://www.ebay.com/itm/vintage-rolling-stones-tee',
          checkFrequency: 120 // Check every 2 hours
        },
        {
          siteName: 'Etsy',
          siteType: SiteType.MARKETPLACE,
          url: 'https://www.etsy.com/listing/vintage-stones-shirt',
          checkFrequency: 180 // Check every 3 hours
        }
      ]
    },
    {
      name: 'Collectible Enamel Pin Set',
      description: 'Set of 6 limited edition enamel pins',
      category: 'Accessories',
      brand: 'Pin Co',
      sku: 'PIN-SET-01',
      imageUrl: 'https://picsum.photos/300/300?random=4',
      inventoryLevel: 25,
      minStockLevel: 8,
      maxStockLevel: 100,
      price: 24.99,
      autoTrack: false, // Manual tracking only
    },
    {
      name: 'DIMOO Space Travel Series',
      description: 'Astronaut themed DIMOO collectible figure',
      category: 'Pop Mart',
      brand: 'Pop Mart',
      sku: 'DIMOO-SPACE-003',
      imageUrl: 'https://picsum.photos/300/300?random=5',
      inventoryLevel: 3,
      minStockLevel: 5,
      maxStockLevel: 30,
      price: 14.99,
      autoTrack: true,
      dataSources: [
        {
          siteName: 'Pop Mart Official',
          siteType: SiteType.OFFICIAL_STORE,
          url: 'https://www.popmart.com/products/dimoo-space-travel',
          checkFrequency: 45
        },
        {
          siteName: 'Amazon',
          siteType: SiteType.MARKETPLACE, 
          url: 'https://www.amazon.com/dp/example-dimoo',
          checkFrequency: 90
        }
      ]
    }
  ]

  for (const itemData of sampleItems) {
    const { dataSources, ...itemInfo } = itemData
    
    const created = await prisma.item.create({
      data: itemInfo
    })
    
    console.log(`Created item: ${created.name}`)

    // Create data sources if provided
    if (dataSources) {
      for (const sourceData of dataSources) {
        await prisma.dataSource.create({
          data: {
            itemId: created.id,
            ...sourceData
          }
        })
        console.log(`  Added data source: ${sourceData.siteName}`)
      }
    }

    // Create notifications for items that are low stock or out of stock
    if (created.inventoryLevel === 0) {
      await prisma.notification.create({
        data: {
          itemId: created.id,
          type: 'OUT_OF_STOCK',
          message: `${created.name} is out of stock`
        }
      })
    } else if (created.inventoryLevel <= created.minStockLevel) {
      await prisma.notification.create({
        data: {
          itemId: created.id,
          type: 'LOW_STOCK',
          message: `${created.name} is running low (${created.inventoryLevel} remaining)`
        }
      })
    }
  }

  console.log('Database seeded successfully with automated tracking!')
  console.log('You can now:')
  console.log('1. Visit /api/monitor to trigger manual inventory checks')
  console.log('2. Set up cron jobs to run automated monitoring')
  console.log('3. Add more data sources via the admin panel')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })