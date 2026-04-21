export type Category = {
  id: string;
  name: string;
  created_at: string;
};

export type Product = {
  id: string;
  name: string;
  description: string | null;
  sku: string | null;
  price: number;
  quantity: number;
  low_stock_threshold: number;
  category_id: string | null;
  created_at: string;
  updated_at: string;
  categories?: Partial<Category>; // For joined queries
};

export type StockTransaction = {
  id: string;
  product_id: string;
  type: 'IN' | 'OUT';
  quantity: number;
  note: string | null;
  created_at: string;
  products?: Partial<Product>; // For joined queries
};

export type Profile = {
  id: string;
  email: string;
  role: 'admin' | 'staff';
  created_at: string;
};

export type DashboardStats = {
  totalProducts: number;
  totalCategories: number;
  totalStockValue: number;
  lowStockItems: number;
  totalStaff?: number;
};
