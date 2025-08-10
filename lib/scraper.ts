import * as cheerio from 'cheerio'

export interface ScrapingResult {
  price?: number
  inStock: boolean
  stockLevel?: number
  title?: string
  imageUrl?: string
  error?: string
}

export interface ScrapingConfig {
  url: string
  priceSelector?: string
  stockSelector?: string
  titleSelector?: string
  imageSelector?: string
  stockKeywords?: string[] // Keywords that indicate stock status
}

export class WebScraper {
  private static async fetchPage(url: string): Promise<string> {
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
        }
      })
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }
      
      return await response.text()
    } catch (error) {
      throw new Error(`Failed to fetch ${url}: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  static async scrape(config: ScrapingConfig): Promise<ScrapingResult> {
    try {
      const html = await this.fetchPage(config.url)
      const $ = cheerio.load(html)
      
      const result: ScrapingResult = {
        inStock: false
      }

      // Extract price
      if (config.priceSelector) {
        const priceText = $(config.priceSelector).first().text().trim()
        const price = this.parsePrice(priceText)
        if (price > 0) {
          result.price = price
        }
      }

      // Extract title
      if (config.titleSelector) {
        result.title = $(config.titleSelector).first().text().trim()
      }

      // Extract image URL
      if (config.imageSelector) {
        const imgElement = $(config.imageSelector).first()
        result.imageUrl = imgElement.attr('src') || imgElement.attr('data-src') || undefined
      }

      // Check stock status
      if (config.stockSelector) {
        const stockText = $(config.stockSelector).first().text().trim().toLowerCase()
        result.inStock = this.isInStock(stockText, config.stockKeywords)
        
        // Try to extract stock level number
        const stockMatch = stockText.match(/(\d+)\s*(available|in stock|left)/i)
        if (stockMatch) {
          result.stockLevel = parseInt(stockMatch[1])
        }
      } else {
        // If no stock selector, assume in stock if price is found
        result.inStock = result.price !== undefined
      }

      return result
    } catch (error) {
      return {
        inStock: false,
        error: error instanceof Error ? error.message : 'Scraping failed'
      }
    }
  }

  private static parsePrice(priceText: string): number {
    // Remove currency symbols and extract number
    const cleanPrice = priceText.replace(/[^\d.,]/g, '')
    const price = parseFloat(cleanPrice.replace(',', ''))
    return isNaN(price) ? 0 : price
  }

  private static isInStock(stockText: string, keywords?: string[]): boolean {
    const outOfStockKeywords = [
      'out of stock', 'sold out', 'unavailable', 'not available',
      'temporarily out of stock', 'currently unavailable', 'not in stock'
    ]
    
    const inStockKeywords = keywords || [
      'in stock', 'available', 'add to cart', 'buy now', 'purchase'
    ]

    // Check if any out of stock keyword is present
    for (const keyword of outOfStockKeywords) {
      if (stockText.includes(keyword)) {
        return false
      }
    }

    // Check if any in stock keyword is present
    for (const keyword of inStockKeywords) {
      if (stockText.includes(keyword)) {
        return true
      }
    }

    // Default to false if uncertain
    return false
  }
}

// Predefined configurations for popular sites
export const SITE_CONFIGS = {
  'amazon.com': {
    priceSelector: '.a-price-whole, .a-price .a-offscreen',
    stockSelector: '#availability .a-size-medium',
    titleSelector: '#productTitle',
    imageSelector: '#landingImage',
    stockKeywords: ['in stock', 'available']
  },
  'popmart.com': {
    priceSelector: '.price, .current-price',
    stockSelector: '.stock-status, .availability',
    titleSelector: '.product-title, h1',
    imageSelector: '.product-image img, .main-image img',
    stockKeywords: ['in stock', 'available', 'add to cart']
  },
  'ebay.com': {
    priceSelector: '.main-price, .price-current',
    stockSelector: '.availability, .stock-info',
    titleSelector: '.x-item-title-label',
    imageSelector: '#icImg',
    stockKeywords: ['available', 'in stock']
  }
}