import { prisma } from './prisma'
import { NotificationType } from '@prisma/client'

export async function createNotification(
  itemId: string,
  type: NotificationType,
  message: string
) {
  return await prisma.notification.create({
    data: {
      itemId,
      type,
      message,
    },
  })
}

export async function checkStockLevels() {
  const items = await prisma.item.findMany({
    where: { isActive: true }
  })

  for (const item of items) {
    const existingNotifications = await prisma.notification.findMany({
      where: {
        itemId: item.id,
        isRead: false,
        type: {
          in: ['OUT_OF_STOCK', 'LOW_STOCK']
        }
      }
    })

    if (item.inventoryLevel === 0 && !existingNotifications.some(n => n.type === 'OUT_OF_STOCK')) {
      await createNotification(
        item.id,
        'OUT_OF_STOCK',
        `${item.name} is out of stock`
      )
    } else if (
      item.inventoryLevel > 0 &&
      item.inventoryLevel <= item.minStockLevel &&
      !existingNotifications.some(n => n.type === 'LOW_STOCK')
    ) {
      await createNotification(
        item.id,
        'LOW_STOCK',
        `${item.name} is running low (${item.inventoryLevel} remaining)`
      )
    } else if (item.inventoryLevel > item.minStockLevel) {
      // Mark existing low stock and out of stock notifications as read
      await prisma.notification.updateMany({
        where: {
          itemId: item.id,
          isRead: false,
          type: {
            in: ['OUT_OF_STOCK', 'LOW_STOCK']
          }
        },
        data: { isRead: true }
      })
    }
  }
}

export async function updateInventoryLevel(
  itemId: string,
  newLevel: number,
  reason?: string
) {
  const item = await prisma.item.findUnique({ where: { id: itemId } })
  if (!item) throw new Error('Item not found')

  const oldLevel = item.inventoryLevel

  // Update the item
  const updatedItem = await prisma.item.update({
    where: { id: itemId },
    data: { inventoryLevel: newLevel }
  })

  // Create inventory history record
  await prisma.inventoryHistory.create({
    data: {
      itemId,
      oldLevel,
      newLevel,
      reason
    }
  })

  // Check if we need to create notifications
  if (oldLevel === 0 && newLevel > 0) {
    await createNotification(
      itemId,
      'RESTOCKED',
      `${item.name} has been restocked (${newLevel} units available)`
    )
  }

  // Run stock level check for this item
  await checkStockLevels()

  return updatedItem
}