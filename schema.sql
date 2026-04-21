-- SQL Schema for Inventory Management System (Idempotent Version)

-- 1. Create Categories Table
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create Products Table
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    sku TEXT UNIQUE,
    price NUMERIC NOT NULL CHECK (price >= 0),
    quantity INTEGER NOT NULL DEFAULT 0 CHECK (quantity >= 0),
    low_stock_threshold INTEGER NOT NULL DEFAULT 5 CHECK (low_stock_threshold >= 0),
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create Stock Transactions Table
CREATE TABLE IF NOT EXISTS stock_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('IN', 'OUT')),
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Function to update updated_at on product update
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_products_updated_at ON products;
CREATE TRIGGER update_products_updated_at
BEFORE UPDATE ON products
FOR EACH ROW
EXECUTE PROCEDURE update_updated_at_column();

-- 5. Helper function for stock movement
CREATE OR REPLACE FUNCTION update_product_stock()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        IF (NEW.type = 'IN') THEN
            UPDATE products 
            SET quantity = quantity + NEW.quantity 
            WHERE id = NEW.product_id;
        ELSIF (NEW.type = 'OUT') THEN
            -- Check if we have enough stock
            IF (SELECT quantity FROM products WHERE id = NEW.product_id) < NEW.quantity THEN
                RAISE EXCEPTION 'Insufficient stock';
            END IF;
            
            UPDATE products 
            SET quantity = quantity - NEW.quantity 
            WHERE id = NEW.product_id;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS tr_update_product_stock ON stock_transactions;
CREATE TRIGGER tr_update_product_stock
AFTER INSERT ON stock_transactions
FOR EACH ROW
EXECUTE PROCEDURE update_product_stock();

-- 6. Profiles tracking roles
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'staff')) DEFAULT 'staff',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 7. RLS Policies
-- Categories
DROP POLICY IF EXISTS "Admin and Staff can manage categories" ON categories;
CREATE POLICY "Admin and Staff can manage categories" ON categories FOR ALL TO authenticated USING (true);

-- Products
DROP POLICY IF EXISTS "Admin and Staff can manage products" ON products;
CREATE POLICY "Admin and Staff can manage products" ON products FOR ALL TO authenticated USING (true);

-- Transactions
DROP POLICY IF EXISTS "Admin and Staff can manage transactions" ON stock_transactions;
CREATE POLICY "Admin and Staff can manage transactions" ON stock_transactions FOR ALL TO authenticated USING (true);

-- Profiles
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
CREATE POLICY "Users can view their own profile" ON profiles FOR SELECT TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
CREATE POLICY "Admins can view all profiles" ON profiles FOR SELECT TO authenticated USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);

DROP POLICY IF EXISTS "Admins can manage profiles" ON profiles;
CREATE POLICY "Admins can manage profiles" ON profiles FOR ALL TO authenticated USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);

-- Automated profile creation on Auth Signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (new.id, new.email, 'staff'); -- Default to staff
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 8. Initial Seed Data (Optional)
INSERT INTO categories (name) VALUES 
('Groceries'),
('Beverages'),
('Cleaning Supplies'),
('Personal Care'),
('Dairy & Eggs')
ON CONFLICT (name) DO NOTHING;

-- Example Product (Optional)
-- Note: Replace ID if needed, but this works as a placeholder
INSERT INTO products (name, sku, price, quantity, low_stock_threshold, description, category_id)
SELECT 'Shakthi Rice 5kg', 'RICE-SH-05KG', 25.50, 2, 5, 'High quality basmati rice', id
FROM categories WHERE name = 'Groceries'
ON CONFLICT (sku) DO NOTHING;
