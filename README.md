# Shop Inventory Tracker

A modern inventory management system for tracking popular clothes, Pop Mart items, and other collectibles. Built with Next.js, TypeScript, and Prisma for easy deployment and scalability.

## Features

- 📦 **Inventory Management**: Track items with ID, name, category, brand, and stock levels
- 🔔 **Smart Notifications**: Automatic alerts for low stock, out of stock, and restocked items
- 📊 **Dashboard**: Visual overview with stock statistics and status indicators
- ⚡ **Real-time Updates**: Instant inventory level updates with history tracking
- 🎨 **Modern UI**: Clean, responsive design with Tailwind CSS
- 🚀 **Easy Deployment**: Ready for Vercel deployment with minimal configuration

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript
- **Styling**: Tailwind CSS
- **Database**: Prisma with SQLite (dev) / PostgreSQL (production)
- **Icons**: Lucide React
- **Deployment**: Vercel-ready

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd shop-inventory-tracker
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```

4. **Set up the database**
   ```bash
   # Generate Prisma client
   npm run db:generate
   
   # Push schema to database
   npm run db:push
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

### Main Dashboard
- View all items with current stock levels
- See notifications for low stock and out of stock items
- Quick overview statistics

### Admin Interface
Access the admin panel at `/admin` to:
- Add new items with details (name, category, brand, SKU, etc.)
- Update inventory levels with reason tracking
- Edit item information
- View stock history

### Notifications
The system automatically creates notifications for:
- **Low Stock**: When inventory falls to or below minimum stock level
- **Out of Stock**: When inventory reaches zero
- **Restocked**: When out-of-stock items get restocked
- **New Items**: When new items are added to the inventory

## Deployment

### Deploy to Vercel

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-github-repo-url>
   git push -u origin main
   ```

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Vercel will automatically detect the Next.js configuration

3. **Set up Production Database**
   - For production, consider using:
     - Vercel Postgres
     - PlanetScale
     - Railway
     - Supabase
   
4. **Configure Environment Variables**
   - Add your production database URL to Vercel environment variables
   - The build process will automatically run migrations

### Alternative Deployment Options

- **Netlify**: Works with minor configuration changes
- **Railway**: Built-in database and deployment
- **Docker**: Containerized deployment ready

## Database Schema

The application uses the following main entities:

- **Item**: Core inventory items with stock levels and metadata
- **Notification**: System notifications for inventory events
- **InventoryHistory**: Track all inventory level changes

## Customization

### Adding Categories
Edit the category options in `components/ItemForm.tsx`:

```typescript
<option value="Pop Mart">Pop Mart</option>
<option value="Clothing">Clothing</option>
<option value="Your-Category">Your Category</option>
```

### Notification Types
Extend notification types in `prisma/schema.prisma`:

```prisma
enum NotificationType {
  LOW_STOCK
  OUT_OF_STOCK
  RESTOCKED
  NEW_ITEM
  YOUR_TYPE
}
```

## API Routes

- `GET /api/items` - Get all active items
- `POST /api/items` - Create new item
- `PUT /api/items/[id]` - Update item (including inventory levels)
- `DELETE /api/items/[id]` - Soft delete item
- `GET /api/notifications` - Get notifications
- `POST /api/notifications` - Mark notifications as read

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the [MIT License](LICENSE).