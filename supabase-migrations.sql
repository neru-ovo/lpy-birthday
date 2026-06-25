-- 添加 order_index 字段到 photo_albums 表
ALTER TABLE IF EXISTS photo_albums 
ADD COLUMN IF NOT EXISTS order_index INTEGER DEFAULT 0;

-- 添加 order_index 字段到 diaries 表
ALTER TABLE IF EXISTS diaries 
ADD COLUMN IF NOT EXISTS order_index INTEGER DEFAULT 0;

-- 初始化 order_index 值（按 id 顺序）
UPDATE photo_albums 
SET order_index = (SELECT COUNT(*) FROM photo_albums p2 WHERE p2.id <= photo_albums.id) - 1;

UPDATE diaries 
SET order_index = (SELECT COUNT(*) FROM diaries d2 WHERE d2.id <= diaries.id) - 1;

-- 查询验证
SELECT id, title, order_index FROM photo_albums ORDER BY order_index;
SELECT id, title, order_index FROM diaries ORDER BY order_index;
