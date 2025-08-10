import { prisma } from './prisma'
import { WebScraper, SITE_CONFIGS, ScrapingConfig } from './scraper'
import { createNotification } from './notifications'
import { SiteType, NotificationType } from '@prisma/client'

export class InventoryMonitor {
  static async checkAllItems(): Promise<void> {
    console.log('Starting automated inventory check...')
    
    const startTime = Date.now()
    let itemsChecked = 0
    const errors: string[] = []

    try {
      // Get all items with auto-tracking enabled
      const items = await prisma.item.findMany({
        where: { 
          autoTrack: true,
          isActive: true 
        },
        include: {
          dataSources: {
            where: { isActive: true }
          }
        }
      })

      console.log(`Found ${items.length} items to check`)

      for (const item of items) {
        try {
          await this.checkItem(item)
          itemsChecked++
        } catch (error) {
          const errorMsg = `Failed to check item ${item.name}: ${error instanceof Error ? error.message : 'Unknown error'}`
          errors.push(errorMsg)
          console.error(errorMsg)
        }
      }

      // Log scraping session
      await prisma.scrapingLog.create({
        data: {
          source: 'automated_check',
          status: errors.length > 0 ? 'COMPLETED' : 'COMPLETED',
          itemsChecked,
          errors: errors.length > 0 ? errors.join('\n') : null,
          duration: Date.now() - startTime,
          completedAt: new Date()
        }
      })

      console.log(`Inventory check completed. Checked ${itemsChecked} items with ${errors.length} errors`)
    } catch (error) {
      await prisma.scrapingLog.create({
        data: {
          source: 'automated_check',
          status: 'FAILED',
          itemsChecked,
          errors: error instanceof Error ? error.message : 'Unknown error',
          duration: Date.now() - startTime,
          completedAt: new Date()
        }
      })
      throw error
    }
  }

  private static async checkItem(item: any): Promise<void> {
    console.log(`Checking item: ${item.name}`)
    
    for (const dataSource of item.dataSources) {
      // Check if it's time to scrape this source
      if (dataSource.lastChecked) {
        const timeSinceLastCheck = Date.now() - dataSource.lastChecked.getTime()
        const checkFrequencyMs = dataSource.checkFrequency * 60 * 1000 // convert minutes to ms
        
        if (timeSinceLastCheck < checkFrequencyMs) {
          console.log(`Skipping ${dataSource.siteName} - checked recently`)
          continue
        }
      }

      try {
        const result = await this.scrapeDataSource(dataSource)
        
        if (result.error) {
          console.error(`Error scraping ${dataSource.siteName}: ${result.error}`)
          continue
        }

        // Update data source last checked time
        await prisma.dataSource.update({
          where: { id: dataSource.id },
          data: { lastChecked: new Date() }
        })

        // Record price history
        if (result.price) {
          await prisma.priceHistory.create({
            data: {
              itemId: item.id,
              price: result.price,
              source: dataSource.siteName,
              inStock: result.inStock,
              stockLevel: result.stockLevel
            }
          })
        }

        // Check for significant changes and create notifications
        await this.checkForNotifications(item, dataSource, result)
        
      } catch (error) {
        console.error(`Failed to scrape ${dataSource.siteName}:`, error)
      }
    }
  }

  private static async scrapeDataSource(dataSource: any) {
    const config: ScrapingConfig = {
      url: dataSource.url,
      priceSelector: dataSource.priceSelector,
      stockSelector: dataSource.stockSelector,
      titleSelector: dataSource.titleSelector,
      imageSelector: dataSource.imageSelector
    }

    // Use predefined config if available
    const domain = new URL(dataSource.url).hostname.toLowerCase()
    const siteConfig = Object.keys(SITE_CONFIGS).find(key => domain.includes(key))
    if (siteConfig) {
      const predefinedConfig = SITE_CONFIGS[siteConfig as keyof typeof SITE_CONFIGS]
      config.priceSelector = config.priceSelector || predefinedConfig.priceSelector
      config.stockSelector = config.stockSelector || predefinedConfig.stockSelector
      config.titleSelector = config.titleSelector || predefinedConfig.titleSelector
      config.imageSelector = config.imageSelector || predefinedConfig.imageSelector
      config.stockKeywords = predefinedConfig.stockKeywords
    }

    return WebScraper.scrape(config)
  }

  private static async checkForNotifications(item: any, dataSource: any, currentResult: any): Promise<void> {
    // Get recent price history for comparison
    const recentPrices = await prisma.priceHistory.findMany({
      where: {
        itemId: item.id,
        source: dataSource.siteName,
        scrapedAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
        }
      },
      orderBy: { scrapedAt: 'desc' },
      take: 5
    })

    if (recentPrices.length === 0) {
      // First time checking this item
      if (currentResult.inStock && currentResult.price) {
        await createNotification(
          item.id,
          'NEW_ITEM',
          `${item.name} is now being tracked on ${dataSource.siteName} - $${currentResult.price}`
        )
      }
      return
    }

    const lastResult = recentPrices[0]

    // Check for stock changes
    if (!lastResult.inStock && currentResult.inStock) {
      await createNotification(
        item.id,
        'BACK_IN_STOCK',
        `${item.name} is back in stock on ${dataSource.siteName}!`
      )
    } else if (lastResult.inStock && !currentResult.inStock) {
      await createNotification(
        item.id,
        'OUT_OF_STOCK',
        `${item.name} is now out of stock on ${dataSource.siteName}`
      )
    }

    // Check for significant price changes (>10% change)
    if (currentResult.price && lastResult.price) {
      const priceChange = ((currentResult.price - lastResult.price) / lastResult.price) * 100
      
      if (priceChange <= -10) {
        await createNotification(
          item.id,
          'PRICE_DROP',
          `${item.name} price dropped ${Math.abs(priceChange).toFixed(1)}% on ${dataSource.siteName}: $${lastResult.price} → $${currentResult.price}`
        )
      } else if (priceChange >= 10) {
        await createNotification(
          item.id,
          'PRICE_INCREASE',
          `${item.name} price increased ${priceChange.toFixed(1)}% on ${dataSource.siteName}: $${lastResult.price} → $${currentResult.price}`
        )
      }
    }
  }

  static async addDataSource(itemId: string, config: {
    siteName: string
    siteType: SiteType
    url: string
    priceSelector?: string
    stockSelector?: string
    titleSelector?: string
    imageSelector?: string
    checkFrequency?: number
  }) {
    return await prisma.dataSource.create({
      data: {
        itemId,
        siteName: config.siteName,
        siteType: config.siteType,
        url: config.url,
        priceSelector: config.priceSelector,
        stockSelector: config.stockSelector,
        titleSelector: config.titleSelector,
        imageSelector: config.imageSelector,
        checkFrequency: config.checkFrequency || 60 // Default 1 hour
      }
    })
  }
}