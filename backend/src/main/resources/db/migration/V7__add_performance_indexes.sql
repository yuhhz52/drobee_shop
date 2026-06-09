-- V7: Add performance indexes for frequently queried columns
-- Boost query speed for product listing, filtering, and navigation

-- products: filter by category, type, brand, active status, new arrivals, featured
CREATE INDEX IF NOT EXISTS idx_products_category_type_id ON products(category_type_id);
CREATE INDEX IF NOT EXISTS idx_products_brand ON products(brand);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(active);
CREATE INDEX IF NOT EXISTS idx_products_new_arrival ON products(new_arrival);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(featured);
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);

-- products: composite indexes for common filter combinations
CREATE INDEX IF NOT EXISTS idx_products_category_active ON products(category_type_id, active);
CREATE INDEX IF NOT EXISTS idx_products_active_new_arrival ON products(active, new_arrival);

-- product_variants: stock and product lookups
CREATE INDEX IF NOT EXISTS idx_product_variants_product_id ON product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_product_variants_stock ON product_variants(stock_quantity);

-- category_type: category lookup
CREATE INDEX IF NOT EXISTS idx_category_type_category_id ON category_type(category_id);
CREATE INDEX IF NOT EXISTS idx_category_type_code ON category_type(code);

-- categories: code lookup for navbar brand resolution
CREATE INDEX IF NOT EXISTS idx_categories_code ON categories(code);

-- collections: slug lookup for URL resolution
CREATE INDEX IF NOT EXISTS idx_collections_slug_active ON collections(slug, active);

-- orders: user order history and status lookups
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_order_status ON orders(order_status);
CREATE INDEX IF NOT EXISTS idx_orders_order_date ON orders(order_date);

-- product_resources: product image lookups
CREATE INDEX IF NOT EXISTS idx_product_resources_product_id ON product_resources(product_id);
