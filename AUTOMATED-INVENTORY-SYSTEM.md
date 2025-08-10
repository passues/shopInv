# 🤖 Automated Inventory Tracking System

## 🎯 **What This System Does**

Your inventory tracker now automatically monitors **real websites** for:
- ✅ **Stock levels** (in stock / out of stock)
- ✅ **Price changes** (price drops, increases)  
- ✅ **Product availability** on multiple sites
- ✅ **Automatic notifications** for important changes

### **Supported Sites:**
- **Pop Mart Official Store**
- **Amazon** (any product page)
- **eBay** (Buy It Now listings)
- **Custom sites** (with CSS selectors)

## 🏗️ **System Architecture**

### **Database Models:**
1. **Item** - Your tracked products (now with `autoTrack` flag)
2. **DataSource** - URLs and scraping config for each site
3. **PriceHistory** - Historical price/stock data  
4. **ScrapingLog** - Monitor system performance
5. **Notification** - Alerts for stock/price changes

### **Core Components:**
- **WebScraper** - Fetches and parses website data
- **InventoryMonitor** - Orchestrates automated checking
- **Notification System** - Sends alerts for changes

## 🚀 **How to Use**

### **1. Add Items for Tracking**
Use the admin panel to create items and enable `autoTrack`

### **2. Configure Data Sources**  
For each item, add data sources:
```javascript
{
  siteName: "Pop Mart Official",
  siteType: "OFFICIAL_STORE", 
  url: "https://www.popmart.com/products/molly-series",
  checkFrequency: 30, // minutes
  priceSelector: ".price",
  stockSelector: ".stock-status"
}
```

### **3. Run Monitoring**
**Manual:** `GET/POST /api/monitor`
**Automated:** Set up cron job or Railway's cron

### **4. Get Notifications**
System automatically creates notifications for:
- **PRICE_DROP** - Significant price decreases
- **PRICE_INCREASE** - Significant price increases  
- **BACK_IN_STOCK** - Item becomes available
- **OUT_OF_STOCK** - Item becomes unavailable
- **NEW_ITEM** - First time tracking

## 📊 **API Endpoints**

### **Monitoring**
- `POST /api/monitor` - Trigger manual check of all items
- `GET /api/monitor` - Same as POST (for easy testing)

### **Data Sources**
- `GET /api/data-sources` - List all configured sources
- `POST /api/data-sources` - Add new source for an item

### **Price History**
- `GET /api/price-history/[itemId]` - Get price history for item

### **Testing**
- `POST /api/test-scrape` - Test scraping configuration

## 🔧 **Configuration Examples**

### **Pop Mart Official Store**
```json
{
  "siteName": "Pop Mart Official",
  "siteType": "OFFICIAL_STORE",
  "url": "https://www.popmart.com/products/molly-kenny-scharf-series",
  "priceSelector": ".price, .current-price",
  "stockSelector": ".stock-status, .availability",
  "checkFrequency": 30
}
```

### **Amazon Product**
```json
{
  "siteName": "Amazon",
  "siteType": "MARKETPLACE", 
  "url": "https://www.amazon.com/dp/B08EXAMPLE",
  "priceSelector": ".a-price-whole, .a-price .a-offscreen",
  "stockSelector": "#availability .a-size-medium",
  "checkFrequency": 60
}
```

### **eBay Listing**
```json
{
  "siteName": "eBay",
  "siteType": "MARKETPLACE",
  "url": "https://www.ebay.com/itm/123456789",
  "priceSelector": ".main-price, .price-current", 
  "stockSelector": ".availability, .stock-info",
  "checkFrequency": 120
}
```

## ⚙️ **Deployment Setup**

### **Railway (Recommended)**
1. **Deploy normally** - Railway handles the database automatically
2. **Enable Cron Jobs** in Railway dashboard:
   ```bash
   # Add this as a Railway cron job (hourly)
   curl -X POST https://your-app.railway.app/api/monitor
   ```

### **Environment Variables** (Optional)
```bash
# Scraping configuration
SCRAPE_DELAY=1000          # Delay between requests (ms)
SCRAPE_TIMEOUT=30000       # Request timeout (ms)
SCRAPE_USER_AGENT="custom" # Custom user agent
```

## 📈 **Monitoring & Analytics**

### **System Health**
- `GET /api/health` - Check database and system status
- **Scraping Logs** - Track success/failure rates
- **Error Handling** - Graceful failures, retry logic

### **Performance Metrics**
- **Items Checked** per run
- **Success Rate** per site
- **Response Times** for each source
- **Price Change Detection** accuracy

## 🔔 **Notification Types**

| Type | Description | Trigger |
|------|-------------|---------|
| `PRICE_DROP` | Significant price decrease (>10%) | Price comparison |
| `PRICE_INCREASE` | Significant price increase (>10%) | Price comparison |
| `BACK_IN_STOCK` | Item becomes available | Stock status change |
| `OUT_OF_STOCK` | Item becomes unavailable | Stock status change |
| `NEW_ITEM` | First time tracking item | Initial scrape |

## 🛠️ **Advanced Features**

### **Smart Retry Logic**
- Automatic retry on temporary failures
- Exponential backoff for repeated failures
- Skip unreliable sources temporarily

### **Anti-Detection**
- Random delays between requests
- Rotating User-Agent headers
- Respectful rate limiting

### **Data Quality**
- Price validation (detect formatting errors)
- Stock status verification
- Change detection (ignore minor fluctuations)

## 🚀 **Getting Started Quickly**

1. **Deploy to Railway** (handles PostgreSQL automatically)
2. **Seed with examples:** Visit `/api/seed`  
3. **Test monitoring:** Visit `/api/monitor`
4. **Check results:** Visit your main dashboard

The system will immediately start tracking Pop Mart items on official stores and marketplaces!

## 💡 **Use Cases**

- **Pop Mart Collectors** - Track rare figures across all sites
- **Resellers** - Monitor price fluctuations for profit opportunities  
- **Personal Shopping** - Get notified when desired items go on sale
- **Inventory Management** - Track competitor pricing and availability
- **Market Research** - Analyze pricing trends across platforms

This system transforms your basic inventory tracker into a **powerful market intelligence tool**! 🎯