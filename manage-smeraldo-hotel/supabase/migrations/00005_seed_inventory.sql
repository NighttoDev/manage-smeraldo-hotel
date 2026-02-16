-- Smeraldo Hotel — Seed Inventory Items
-- Migration: 00005_seed_inventory.sql
-- Seeds initial inventory with common hotel beverages and supplies

INSERT INTO inventory_items (name, category, current_stock, low_stock_threshold, unit) VALUES
  -- Đồ uống (Beverages)
  ('Nước suối', 'Đồ uống', 48, 10, 'chai'),
  ('Coca-Cola', 'Đồ uống', 24, 10, 'lon'),
  ('Pepsi', 'Đồ uống', 24, 10, 'lon'),
  ('Bia Saigon', 'Đồ uống', 36, 12, 'lon'),
  ('Nước cam', 'Đồ uống', 12, 5, 'chai'),
  ('Bia Tiger', 'Đồ uống', 24, 10, 'lon'),
  ('Red Bull', 'Đồ uống', 12, 5, 'lon'),
  ('Trà xanh 0 độ', 'Đồ uống', 20, 8, 'chai'),

  -- Vật tư (Supplies)
  ('Khăn tắm', 'Vật tư', 50, 15, 'cái'),
  ('Xà phòng', 'Vật tư', 100, 20, 'cục'),
  ('Dầu gội', 'Vật tư', 80, 20, 'chai'),
  ('Giấy vệ sinh', 'Vật tư', 120, 30, 'cuộn'),
  ('Bàn chải đánh răng', 'Vật tư', 60, 15, 'cái'),
  ('Kem đánh răng', 'Vật tư', 40, 10, 'tuýp'),
  ('Dép phòng', 'Vật tư', 30, 10, 'đôi'),
  ('Nước rửa tay', 'Vật tư', 20, 5, 'chai');
