-- Reverse-engineered base schema for local development.
-- Built from the columns/tables referenced across src/routes/*.js, since the
-- Node API normally runs against an existing legacy CodeIgniter database dump
-- that isn't present in this repo. Includes a bit of seed data so the app is
-- browsable end-to-end.

SET NAMES utf8mb4;

CREATE TABLE IF NOT EXISTS categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  category_name VARCHAR(150) NOT NULL,
  category_alias VARCHAR(150) NOT NULL UNIQUE,
  description TEXT NULL,
  image VARCHAR(255) NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'Active',
  meta_tag VARCHAR(255) NULL,
  meta_keywords VARCHAR(255) NULL,
  meta_description VARCHAR(255) NULL,
  created_at DATETIME NULL,
  updated_at DATETIME NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS subcategories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  subcategory_name VARCHAR(150) NOT NULL,
  subcategory_alias VARCHAR(150) NOT NULL UNIQUE,
  cat_id INT NOT NULL,
  description TEXT NULL,
  image VARCHAR(255) NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'Active',
  meta_tag VARCHAR(255) NULL,
  meta_keywords VARCHAR(255) NULL,
  meta_description VARCHAR(255) NULL,
  created_at DATETIME NULL,
  updated_at DATETIME NULL,
  FOREIGN KEY (cat_id) REFERENCES categories(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS subcat_images (
  id INT AUTO_INCREMENT PRIMARY KEY,
  subcat_id INT NOT NULL,
  title VARCHAR(150) NULL,
  url VARCHAR(255) NULL,
  image VARCHAR(255) NULL,
  order_no INT NOT NULL DEFAULT 0,
  status VARCHAR(20) NOT NULL DEFAULT 'Active',
  FOREIGN KEY (subcat_id) REFERENCES subcategories(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS filters (
  id INT AUTO_INCREMENT PRIMARY KEY,
  filter_name VARCHAR(150) NOT NULL,
  filter_alias VARCHAR(150) NOT NULL,
  filter_type VARCHAR(20) NOT NULL,
  color_code VARCHAR(20) NULL,
  created_at DATETIME NULL,
  updated_at DATETIME NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  pro_name VARCHAR(200) NOT NULL,
  pro_alias VARCHAR(200) NOT NULL UNIQUE,
  sku VARCHAR(100) NULL,
  qty INT NOT NULL DEFAULT 0,
  min_ord_qty INT NOT NULL DEFAULT 1,
  inr_price DECIMAL(10,2) NOT NULL DEFAULT 0,
  usd_price DECIMAL(10,2) NOT NULL DEFAULT 0,
  gbp_price DECIMAL(10,2) NOT NULL DEFAULT 0,
  aud_price DECIMAL(10,2) NOT NULL DEFAULT 0,
  euro_price DECIMAL(10,2) NOT NULL DEFAULT 0,
  video_link VARCHAR(255) NULL,
  short_description VARCHAR(500) NULL,
  description TEXT NULL,
  cat_id INT NULL,
  subcat_id INT NULL,
  color_id INT NULL,
  size_id INT NULL,
  fabric_id INT NULL,
  tags_id INT NULL,
  gender VARCHAR(20) NULL,
  feature_pros VARCHAR(5) NOT NULL DEFAULT 'No',
  new_arrivals VARCHAR(5) NOT NULL DEFAULT 'No',
  best_sellers VARCHAR(5) NOT NULL DEFAULT 'No',
  star_rating DECIMAL(2,1) NOT NULL DEFAULT 0,
  show_without_login VARCHAR(5) NOT NULL DEFAULT 'Yes',
  status VARCHAR(20) NOT NULL DEFAULT 'Active',
  meta_tag VARCHAR(255) NULL,
  meta_keywords VARCHAR(255) NULL,
  meta_description VARCHAR(255) NULL,
  created_at DATETIME NULL,
  updated_at DATETIME NULL,
  FOREIGN KEY (cat_id) REFERENCES categories(id) ON DELETE SET NULL,
  FOREIGN KEY (subcat_id) REFERENCES subcategories(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS product_images (
  id INT AUTO_INCREMENT PRIMARY KEY,
  pro_id INT NOT NULL,
  image VARCHAR(255) NOT NULL,
  order_no INT NOT NULL DEFAULT 1,
  FOREIGN KEY (pro_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  fname VARCHAR(100) NOT NULL,
  lname VARCHAR(100) NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password VARCHAR(255) NULL,
  contact_no VARCHAR(30) NULL,
  gender VARCHAR(20) NULL,
  dob DATE NULL,
  address VARCHAR(255) NULL,
  city VARCHAR(100) NULL,
  state VARCHAR(100) NULL,
  country VARCHAR(100) NULL,
  pincode VARCHAR(20) NULL,
  currency VARCHAR(10) NOT NULL DEFAULT 'inr',
  status VARCHAR(20) NOT NULL DEFAULT 'Active',
  created_at DATETIME NULL,
  updated_at DATETIME NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS adminusers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS carts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usr_id INT NOT NULL,
  pro_id INT NOT NULL,
  qty INT NOT NULL DEFAULT 1,
  curr_symbol VARCHAR(20) NULL,
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  pro_image VARCHAR(255) NULL,
  created_at DATETIME NULL,
  updated_at DATETIME NULL,
  FOREIGN KEY (usr_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (pro_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS wishlists (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usr_id INT NOT NULL,
  pro_id INT NOT NULL,
  pro_image VARCHAR(255) NULL,
  FOREIGN KEY (usr_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (pro_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usr_id INT NOT NULL,
  order_date DATE NOT NULL,
  total_qty INT NOT NULL DEFAULT 0,
  total_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  ship_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  curn_symbol VARCHAR(20) NULL,
  payment_status VARCHAR(30) NOT NULL DEFAULT 'pending',
  payment_way VARCHAR(50) NULL,
  order_status VARCHAR(30) NOT NULL DEFAULT 'pending',
  special_note TEXT NULL,
  FOREIGN KEY (usr_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS order_products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  ord_id INT NOT NULL,
  pro_id INT NOT NULL,
  qty INT NOT NULL DEFAULT 1,
  cur_symbol VARCHAR(20) NULL,
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  proimage VARCHAR(255) NULL,
  FOREIGN KEY (ord_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (pro_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS testimonials (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(150) NULL,
  review TEXT NOT NULL,
  name VARCHAR(150) NULL,
  country VARCHAR(100) NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS homeimages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  first_line VARCHAR(255) NULL,
  second_line VARCHAR(255) NULL,
  pglink VARCHAR(255) NULL,
  image VARCHAR(255) NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS abouts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(200) NULL,
  content TEXT NULL,
  image VARCHAR(255) NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS policy_pages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(200) NULL,
  content TEXT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS contacts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  mobile_no VARCHAR(30) NULL,
  address VARCHAR(255) NULL,
  email VARCHAR(150) NULL,
  home_aboutus TEXT NULL,
  facebook VARCHAR(255) NULL,
  instagram VARCHAR(255) NULL,
  youtube VARCHAR(255) NULL,
  pinterest VARCHAR(255) NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS headlines (
  id INT AUTO_INCREMENT PRIMARY KEY,
  content VARCHAR(255) NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'Active'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS newsletters (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(150) NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------------- seed data ----------------

-- adminusers.password: bcrypt hash of "Admin@12345"
INSERT INTO adminusers (id, name, email, password) VALUES
  (1, 'Site Admin', 'admin@futureindiaexpo.com', '$2b$12$O9JurHEJhFh9GjucA1cofO1DyWizRQ8e/3OkgkuOYmPJ8.jH5GNoW')
ON DUPLICATE KEY UPDATE email = VALUES(email);

INSERT INTO categories (id, category_name, category_alias, description, status) VALUES
  (1, 'Sarees', 'sarees', 'Traditional Indian sarees', 'Active'),
  (2, 'Kurtis', 'kurtis', 'Everyday and festive kurtis', 'Active')
ON DUPLICATE KEY UPDATE category_name = VALUES(category_name);

INSERT INTO subcategories (id, subcategory_name, subcategory_alias, cat_id, description, status) VALUES
  (1, 'Silk Sarees', 'silk-sarees', 1, 'Pure silk sarees', 'Active'),
  (2, 'Cotton Kurtis', 'cotton-kurtis', 2, 'Breathable cotton kurtis', 'Active')
ON DUPLICATE KEY UPDATE subcategory_name = VALUES(subcategory_name);

INSERT INTO filters (id, filter_name, filter_alias, filter_type, color_code) VALUES
  (1, 'Cotton', 'cotton', 'fabric', NULL),
  (2, 'Silk', 'silk', 'fabric', NULL),
  (3, 'Medium', 'medium', 'size', NULL),
  (4, 'New', 'new', 'tags', NULL)
ON DUPLICATE KEY UPDATE filter_name = VALUES(filter_name);

INSERT INTO products (id, pro_name, pro_alias, sku, qty, inr_price, usd_price, gbp_price, aud_price, euro_price,
  short_description, description, cat_id, subcat_id, fabric_id, size_id, tags_id, gender,
  feature_pros, new_arrivals, best_sellers, star_rating, show_without_login, status) VALUES
  (1, 'Banarasi Silk Saree', 'banarasi-silk-saree', 'SKU-1001', 25, 4500, 55, 44, 82, 50,
   'Elegant Banarasi silk saree', 'Handwoven Banarasi silk saree with zari border.', 1, 1, 2, 3, 4, 'Women',
   'Yes', 'Yes', 'No', 4.5, 'Yes', 'Active'),
  (2, 'Cotton Printed Kurti', 'cotton-printed-kurti', 'SKU-1002', 40, 1200, 15, 12, 22, 14,
   'Comfortable printed cotton kurti', 'Soft cotton kurti with block print design.', 2, 2, 1, 3, NULL, 'Women',
   'No', 'Yes', 'Yes', 4.2, 'Yes', 'Active')
ON DUPLICATE KEY UPDATE pro_name = VALUES(pro_name);

INSERT INTO testimonials (id, title, review, name, country) VALUES
  (1, 'Beautiful quality', 'Loved the fabric and the finishing, will order again!', 'Asha Verma', 'India'),
  (2, 'Fast shipping', 'Arrived quickly and packaged well.', 'John Smith', 'UK')
ON DUPLICATE KEY UPDATE review = VALUES(review);

INSERT INTO homeimages (id, first_line, second_line, pglink) VALUES
  (1, 'Festive Collection', 'Shop the new arrivals', '/sarees')
ON DUPLICATE KEY UPDATE first_line = VALUES(first_line);

INSERT INTO abouts (id, title, content) VALUES
  (1, 'About Us', 'Future India Expo brings authentic Indian fashion to the world.'),
  (2, 'Customization', 'We offer custom tailoring on select products.'),
  (3, 'FAQ', 'Frequently asked questions about ordering, shipping and returns.')
ON DUPLICATE KEY UPDATE content = VALUES(content);

INSERT INTO policy_pages (id, title, content) VALUES
  (1, 'Privacy Policy', 'We respect your privacy and protect your data.'),
  (2, 'Terms & Conditions', 'By using this site you agree to our terms.'),
  (3, 'Return Policy', 'Returns accepted within 7 days of delivery.')
ON DUPLICATE KEY UPDATE content = VALUES(content);

INSERT INTO contacts (id, mobile_no, address, email, home_aboutus, facebook, instagram, youtube, pinterest) VALUES
  (1, '+91 98765 43210', 'Surat, Gujarat, India', 'contact@futureindiaexpo.com',
   'Future India Expo is a leading exporter of Indian ethnic wear.',
   'https://facebook.com', 'https://instagram.com', 'https://youtube.com', 'https://pinterest.com')
ON DUPLICATE KEY UPDATE email = VALUES(email);

INSERT INTO headlines (id, content, status) VALUES
  (1, 'Free shipping on orders above $100', 'Active')
ON DUPLICATE KEY UPDATE content = VALUES(content);
