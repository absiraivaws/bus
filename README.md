# Transport Booking Platform

A comprehensive bus/van booking platform built with Next.js, Prisma, and SQLite.

## Features

- **Operator Dashboard**
  - Seat arrangement template management
  - Vehicle management with custom seat layouts
  - Route management
  - Trip scheduling
  - Booking management

- **Public Booking**
  - Search trips by origin, destination, and date
  - Book seats with passenger details
  - Payment processing
  - Booking confirmation

## Tech Stack

- **Frontend**: Next.js 16 (App Router), React, TypeScript
- **Backend**: Next.js Server Actions
- **Database**: SQLite with Prisma ORM
- **Styling**: Custom CSS with glassmorphism design

## Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/absiraivaws/bus.git
   cd bus
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```
   DATABASE_URL="file:./dev.db"
   ```

4. **Run database migrations**
   ```bash
   npx prisma migrate dev
   npx prisma generate
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to `http://localhost:3000`

## Deployment to Vercel

### Prerequisites
- A Vercel account
- A PostgreSQL database (recommended for production)

### Steps

1. **Set up a PostgreSQL database**
   - Use Vercel Postgres, Supabase, or any PostgreSQL provider
   - Get your database connection string

2. **Update Prisma schema for PostgreSQL**
   In `prisma/schema.prisma`, change:
   ```prisma
   datasource db {
     provider = "postgresql"  // Changed from "sqlite"
     url      = env("DATABASE_URL")
   }
   ```

3. **Deploy to Vercel**
   ```bash
   vercel
   ```

4. **Set environment variables in Vercel**
   - Go to your project settings in Vercel
   - Add `DATABASE_URL` with your PostgreSQL connection string
   - Example: `postgresql://user:password@host:5432/database?schema=public`

5. **Run migrations on production**
   After deployment, run:
   ```bash
   npx prisma migrate deploy
   ```

### Alternative: Using SQLite on Vercel (Not Recommended)

If you want to use SQLite on Vercel (not recommended for production):

1. **Install better-sqlite3**
   ```bash
   npm install better-sqlite3
   ```

2. **Note**: SQLite on Vercel is ephemeral and will reset on each deployment. Use PostgreSQL for production.

## Environment Variables

Required environment variables:

- `DATABASE_URL`: Database connection string

## Database Schema

The application uses the following main models:
- `User`: User accounts (operators and customers)
- `SeatTemplate`: Reusable seat layout templates
- `Vehicle`: Fleet vehicles with seat configurations
- `Location`: Cities/towns for routes
- `Route`: Routes between locations
- `Trip`: Scheduled trips
- `Booking`: Customer bookings

## Project Structure

```
├── app/
│   ├── operator/          # Operator dashboard pages
│   │   ├── seat-templates/ # Seat template management
│   │   ├── vehicles/      # Vehicle management
│   │   ├── routes/        # Route management
│   │   └── trips/         # Trip scheduling
│   ├── book/              # Booking flow
│   ├── payment/           # Payment processing
│   └── search/            # Trip search
├── lib/
│   └── prisma.ts          # Prisma client singleton
├── prisma/
│   ├── schema.prisma      # Database schema
│   └── migrations/        # Database migrations
└── public/                # Static assets
```

## License

MIT
