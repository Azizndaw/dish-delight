
-- Add stock_quantity column to products
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS stock_quantity INTEGER NOT NULL DEFAULT 1;

-- Update existing products to have stock_quantity = 1
UPDATE public.products SET stock_quantity = 1 WHERE stock_quantity IS NULL;
