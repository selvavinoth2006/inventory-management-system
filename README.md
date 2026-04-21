# InvCentral - Inventory Management System

A professional, full-stack Inventory Management System built with **Next.js 15 (App Router)**, **TypeScript**, **Tailwind CSS**, and **Supabase**.

## 🚀 Features

- **Admin Authentication**: Secure login via Supabase Auth.
- **Dynamic Dashboard**: Summary cards for products, categories, total stock, and low-stock alerts.
- **Product Management**: Full CRUD with SKU tracking, pricing, and category association.
- **Category Management**: Organize items into groups.
- **Stock Transactions**: Record Stock In/Out movements with automatic product quantity updates via Database Triggers.
- **Premium UI**: Responsive design, glassmorphism effects, smooth animations (Framer Motion), and toast notifications.
- **Data Safety**: Database-level constraints to prevent negative stock.

## 🛠️ Tech Stack

- **Framework**: Next.js 15
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database & Auth**: Supabase (PostgreSQL)
- **Icons**: Lucide React
- **Animations**: Framer Motion
- **Notifications**: React Hot Toast

## ⚙️ Setup Instructions

### 1. Database Setup (Supabase)
1. Create a new project on [Supabase](https://supabase.com/).
2. Go to the **SQL Editor** in the Supabase Dashboard.
3. Copy the content of the `schema.sql` file provided in this repository and run it.
4. This will create the necessary tables (`categories`, `products`, `stock_transactions`) and the stock management triggers.

### 2. Authentication Setup
1. In Supabase Dashboard, go to **Authentication** > **Users**.
2. Click **Add User** > **Create New User** and create an admin account (Email & Password).
3. Disable "Confirm Email" in **Authentication** > **Providers** > **Email** if you want to log in immediately without verifying.

### 3. Environment Variables
1. Rename `.env.example` to `.env.local`.
2. Fill in your Supabase credentials:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=your_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   ```

### 4. Local Installation
```bash
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to see the app.

## 📝 Business Rules
- **Low Stock**: Products with quantity <= `low_stock_threshold` are marked as "Low Stock".
- **Stock Integrity**: Database triggers prevent stock from going below zero. If a "Stock Out" transaction exceeds current quantity, it will throw an error and fail.
- **Automatic Updates**: You don't need to manually update product quantities; just record a transaction, and the database handles the math.

## 🚢 Deployment (Vercel)
1. Push your code to GitHub.
2. Connect your repo to Vercel.
3. Add the `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` as Environment Variables in Vercel settings.
4. Deploy!

---
Created by Antigravity AI for a premium coding experience.
"# inventory-management-system" 
