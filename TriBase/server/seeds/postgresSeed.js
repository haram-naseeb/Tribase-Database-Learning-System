const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.POSTGRES_USER || 'learndb_admin',
  host: process.env.POSTGRES_HOST || 'localhost',
  database: process.env.POSTGRES_DB || 'learndb',
  password: process.env.POSTGRES_PASSWORD || 'learndb_password',
  port: parseInt(process.env.POSTGRES_PORT) || 5432,
});

const countries = ['USA', 'UK', 'Germany', 'France', 'Canada', 'Australia', 'India', 'Japan', 'Brazil', 'Pakistan', 'UAE', 'Spain', 'Italy', 'Netherlands', 'Sweden'];
const statuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
const payMethods = ['credit_card', 'debit_card', 'paypal', 'stripe', 'bank_transfer'];
const payStatuses = ['pending', 'completed', 'failed', 'refunded'];

const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const pick = arr => arr[rand(0, arr.length - 1)];
const randFloat = (min, max, dec = 2) => parseFloat((Math.random() * (max - min) + min).toFixed(dec));

async function seed() {
  console.log('Seeding PostgreSQL ECommerceDB...');
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Drop and recreate ECommerceDB tables
    await client.query(`
      DROP TABLE IF EXISTS payments, reviews, order_items, orders, products, ecom_categories CASCADE;

      CREATE TABLE ecom_categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        parent_id INTEGER REFERENCES ecom_categories(id)
      );

      CREATE TABLE products (
        id SERIAL PRIMARY KEY,
        name VARCHAR(200) NOT NULL,
        category_id INTEGER REFERENCES ecom_categories(id),
        price NUMERIC(10,2) NOT NULL,
        stock INTEGER NOT NULL DEFAULT 0,
        rating NUMERIC(3,2),
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE ecom_users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(150) UNIQUE NOT NULL,
        country VARCHAR(50),
        is_premium BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE orders (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES ecom_users(id),
        status VARCHAR(30) NOT NULL,
        total NUMERIC(12,2) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE order_items (
        id SERIAL PRIMARY KEY,
        order_id INTEGER REFERENCES orders(id),
        product_id INTEGER REFERENCES products(id),
        qty INTEGER NOT NULL,
        unit_price NUMERIC(10,2) NOT NULL
      );

      CREATE TABLE reviews (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES ecom_users(id),
        product_id INTEGER REFERENCES products(id),
        rating INTEGER CHECK(rating BETWEEN 1 AND 5),
        comment TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE payments (
        id SERIAL PRIMARY KEY,
        order_id INTEGER REFERENCES orders(id),
        method VARCHAR(30),
        status VARCHAR(30),
        paid_at TIMESTAMP
      );
    `);

    // Categories (20 rows)
    const categoryNames = ['Electronics', 'Laptops', 'Smartphones', 'Accessories', 'Books', 'Programming', 'Science', 'Clothing', 'Men', 'Women', 'Sports', 'Fitness', 'Home', 'Kitchen', 'Furniture', 'Beauty', 'Skincare', 'Toys', 'Games', 'Music'];
    for (let i = 0; i < categoryNames.length; i++) {
      const parentId = i > 2 && i % 3 === 0 ? Math.ceil(i / 3) : null;
      await client.query('INSERT INTO ecom_categories (name, parent_id) VALUES ($1, $2)', [categoryNames[i], parentId]);
    }
    console.log('  ✓ 20 categories');

    // Products (500 rows)
    const adjectives = ['Pro', 'Ultra', 'Max', 'Plus', 'Elite', 'Smart', 'Nano', 'Flex', 'Edge', 'Prime'];
    const nouns = ['Laptop', 'Phone', 'Watch', 'Tablet', 'Camera', 'Speaker', 'Headphones', 'Keyboard', 'Monitor', 'Mouse'];
    for (let i = 0; i < 500; i++) {
      await client.query(
        'INSERT INTO products (name, category_id, price, stock, rating, created_at) VALUES ($1, $2, $3, $4, $5, $6)',
        [`${pick(adjectives)} ${pick(nouns)} ${i + 1}`, rand(1, 20), randFloat(5, 2000), rand(0, 500), randFloat(1, 5), new Date(Date.now() - rand(0, 365) * 86400000)]
      );
    }
    console.log('  ✓ 500 products');

    // Users (1000 rows)
    const firstNames = ['Alice', 'Bob', 'Charlie', 'Diana', 'Edward', 'Fiona', 'George', 'Hannah', 'Ivan', 'Julia'];
    const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Wilson', 'Moore'];
    for (let i = 0; i < 1000; i++) {
      const name = `${pick(firstNames)} ${pick(lastNames)}`;
      const email = `user${i + 1}@learndb-ecom.com`;
      await client.query(
        'INSERT INTO ecom_users (name, email, country, is_premium, created_at) VALUES ($1, $2, $3, $4, $5)',
        [name, email, pick(countries), Math.random() > 0.7, new Date(Date.now() - rand(0, 730) * 86400000)]
      );
    }
    console.log('  ✓ 1000 users');

    // Orders (3000 rows)
    for (let i = 0; i < 3000; i++) {
      await client.query(
        'INSERT INTO orders (user_id, status, total, created_at) VALUES ($1, $2, $3, $4)',
        [rand(1, 1000), pick(statuses), randFloat(10, 5000), new Date(Date.now() - rand(0, 365) * 86400000)]
      );
    }
    console.log('  ✓ 3000 orders');

    // Order Items (8000 rows)
    for (let i = 0; i < 8000; i++) {
      const qty = rand(1, 5);
      const price = randFloat(5, 1000);
      await client.query(
        'INSERT INTO order_items (order_id, product_id, qty, unit_price) VALUES ($1, $2, $3, $4)',
        [rand(1, 3000), rand(1, 500), qty, price]
      );
    }
    console.log('  ✓ 8000 order items');

    // Reviews (2000 rows)
    const comments = ['Great product!', 'Highly recommend.', 'Good value for money.', 'Could be better.', 'Excellent quality!', 'Delivery was fast.', 'Not as described.', 'Perfect!', 'Average product.', 'Very happy with it.'];
    for (let i = 0; i < 2000; i++) {
      await client.query(
        'INSERT INTO reviews (user_id, product_id, rating, comment, created_at) VALUES ($1, $2, $3, $4, $5)',
        [rand(1, 1000), rand(1, 500), rand(1, 5), pick(comments), new Date(Date.now() - rand(0, 365) * 86400000)]
      );
    }
    console.log('  ✓ 2000 reviews');

    // Payments (3000 rows)
    for (let i = 0; i < 3000; i++) {
      const status = pick(payStatuses);
      await client.query(
        'INSERT INTO payments (order_id, method, status, paid_at) VALUES ($1, $2, $3, $4)',
        [rand(1, 3000), pick(payMethods), status, status === 'completed' ? new Date(Date.now() - rand(0, 365) * 86400000) : null]
      );
    }
    console.log('  ✓ 3000 payments');

    await client.query('COMMIT');
    console.log('\n✅ PostgreSQL ECommerceDB seeded successfully!\n');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Seeding error:', err.message);
  } finally {
    client.release();
    pool.end();
  }
}

seed();
