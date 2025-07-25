-- Insert categories
INSERT INTO categories (name, slug, description) VALUES
('Riego', 'riego', 'Sistemas y equipos de riego para cultivos'),
('Jardinería', 'jardineria', 'Herramientas y productos para jardinería'),
('Semillas', 'semillas', 'Semillas de alta calidad para diferentes cultivos'),
('Plaguicidas', 'plaguicidas', 'Productos para control de plagas'),
('Bioinsumos', 'bioinsumos', 'Productos biológicos para agricultura'),
('Fertilizantes', 'fertilizantes', 'Fertilizantes orgánicos e inorgánicos'),
('Bioestimulantes', 'bioestimulantes', 'Productos para estimular el crecimiento'),
('Reguladores de Crecimiento', 'reguladores-crecimiento', 'Reguladores hormonales para plantas'),
('Coadyuvantes', 'coadyuvantes', 'Productos auxiliares para aplicaciones'),
('Equipos Agrícolas', 'equipos-agricolas', 'Maquinaria y equipos para agricultura');

-- Insert sample products
INSERT INTO products (name, slug, description, short_description, price, original_price, sku, stock_quantity, is_featured, is_new, is_on_sale, category_id, rating) 
SELECT 
  'BEGONIA 500 SEMILLAS TUBERHYBRIDA NONSTOP MOCCA CHERRY PET FLOR MACETA',
  'begonia-500-semillas-tuberhybrida-nonstop-mocca-cherry',
  'Semillas de begonia de alta calidad, perfectas para macetas y jardines. Variedad Tuberhybrida Nonstop con flores color cherry mocca.',
  'Semillas de begonia premium para macetas',
  101.00,
  120.00,
  'BEG-500-CHERRY',
  50,
  true,
  true,
  true,
  c.id,
  4.5
FROM categories c WHERE c.slug = 'semillas';

INSERT INTO products (name, slug, description, short_description, price, sku, stock_quantity, is_featured, is_new, is_on_sale, category_id, rating) 
SELECT 
  'BEGONIA 1000 SEMILLAS HYBRID INTERSPECIFIC FUNKY SCARLET PET FLOR COLORANTE MACETA',
  'begonia-1000-semillas-hybrid-interspecific-funky-scarlet',
  'Semillas híbridas de begonia interespecífica con flores de color escarlata vibrante. Ideal para macetas decorativas.',
  'Semillas híbridas de begonia escarlata',
  738.00,
  'BEG-1000-SCARLET',
  30,
  true,
  true,
  true,
  c.id,
  4.8
FROM categories c WHERE c.slug = 'semillas';

INSERT INTO products (name, slug, description, short_description, price, sku, stock_quantity, is_featured, is_new, is_on_sale, category_id, rating) 
SELECT 
  'BEGONIA 1000 SEMILLAS HYBRID INTERSPECIFIC FUNKY WHITE PET FLOR COLORANTE MACETA',
  'begonia-1000-semillas-hybrid-interspecific-funky-white',
  'Semillas híbridas de begonia interespecífica con flores blancas elegantes. Perfectas para decoración de interiores.',
  'Semillas híbridas de begonia blanca',
  738.00,
  'BEG-1000-WHITE',
  25,
  true,
  true,
  true,
  c.id,
  4.6
FROM categories c WHERE c.slug = 'semillas';

INSERT INTO products (name, slug, description, short_description, price, sku, stock_quantity, is_featured, is_new, is_on_sale, category_id, rating) 
SELECT 
  'BEGONIA 1000 SEMILLAS HYBRID INTERSPECIFIC FUNKY ORANGE PET FLOR COLORANTE MACETA',
  'begonia-1000-semillas-hybrid-interspecific-funky-orange',
  'Semillas híbridas de begonia interespecífica con flores naranjas brillantes. Ideal para crear contrastes coloridos.',
  'Semillas híbridas de begonia naranja',
  738.00,
  'BEG-1000-ORANGE',
  35,
  true,
  true,
  true,
  c.id,
  4.7
FROM categories c WHERE c.slug = 'semillas';

INSERT INTO products (name, slug, description, short_description, price, sku, stock_quantity, is_featured, category_id, rating) 
SELECT 
  'Semillas de Lechuga Orgánica Premium',
  'semillas-lechuga-organica-premium',
  'Semillas de lechuga orgánica certificada, variedad de hojas verdes crujientes. Ideal para huertos caseros.',
  'Semillas de lechuga orgánica certificada',
  45.00,
  'LET-ORG-PREM',
  100,
  true,
  c.id,
  4.9
FROM categories c WHERE c.slug = 'semillas';

INSERT INTO products (name, slug, description, short_description, price, sku, stock_quantity, category_id, rating) 
SELECT 
  'Fertilizante Orgánico Compost Natural',
  'fertilizante-organico-compost-natural',
  'Fertilizante orgánico 100% natural elaborado con compost de alta calidad. Rico en nutrientes esenciales.',
  'Fertilizante orgánico natural premium',
  89.00,
  'FERT-ORG-COMP',
  75,
  false,
  c.id,
  4.4
FROM categories c WHERE c.slug = 'fertilizantes';

INSERT INTO products (name, slug, description, short_description, price, sku, stock_quantity, is_on_sale, category_id, rating) 
SELECT 
  'Medidor Digital pH Suelo Profesional',
  'medidor-digital-ph-suelo-profesional',
  'Medidor digital profesional para medir pH del suelo con precisión. Incluye sonda de acero inoxidable.',
  'Medidor digital de pH profesional',
  156.00,
  'MED-PH-PROF',
  20,
  true,
  c.id,
  4.8
FROM categories c WHERE c.slug = 'equipos-agricolas';

INSERT INTO products (name, slug, description, short_description, price, sku, stock_quantity, category_id, rating) 
SELECT 
  'Semillas Flores Mixtas Colores Variados',
  'semillas-flores-mixtas-colores-variados',
  'Mezcla especial de semillas de flores de temporada en colores variados. Perfecta para jardines coloridos.',
  'Mezcla de semillas de flores variadas',
  67.00,
  'SEM-FLOR-MIX',
  60,
  false,
  c.id,
  4.3
FROM categories c WHERE c.slug = 'semillas';
