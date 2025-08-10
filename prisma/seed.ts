import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Create some sample items
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
    }
  ]

  console.log('Seeding database...')

  for (const item of sampleItems) {
    const created = await prisma.item.create({
      data: item
    })
    console.log(`Created item: ${created.name}`)

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

  console.log('Database seeded successfully!')
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