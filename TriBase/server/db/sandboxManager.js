/**
 * QueryForge Sandbox Manager
 * ─────────────────────────────────────────────────────────────────
 * Creates a dedicated `qf_sandbox` PostgreSQL schema and a
 * `queryforge_sandbox` MongoDB database on every server start.
 * All practice sandbox queries run AGAINST these — not the real data.
 * This means writes are visible and persist within the session,
 * but are wiped clean on every server restart.
 */

const { pool } = require('./postgres');
const mongoose = require('mongoose');

const PG_SCHEMA = 'qf_sandbox';

// ── PostgreSQL Sandbox ────────────────────────────────────────────
const initPostgresSandbox = async () => {
  const client = await pool.connect();
  try {
    // Wipe and recreate the sandbox schema
    await client.query(`DROP SCHEMA IF EXISTS ${PG_SCHEMA} CASCADE`);
    await client.query(`CREATE SCHEMA ${PG_SCHEMA}`);

    // Create tables (matching the lesson examples)
    await client.query(`
      CREATE TABLE ${PG_SCHEMA}.ecom_categories (
        id   SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        parent_id INTEGER
      );
      CREATE TABLE ${PG_SCHEMA}.ecom_users (
        id         SERIAL PRIMARY KEY,
        name       VARCHAR(100) NOT NULL,
        email      VARCHAR(150) UNIQUE NOT NULL,
        country    VARCHAR(60) DEFAULT 'USA',
        is_premium BOOLEAN DEFAULT false,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
      CREATE TABLE ${PG_SCHEMA}.products (
        id          SERIAL PRIMARY KEY,
        name        VARCHAR(200) NOT NULL,
        category_id INTEGER REFERENCES ${PG_SCHEMA}.ecom_categories(id),
        price       DECIMAL(10,2) NOT NULL,
        stock       INTEGER DEFAULT 0,
        rating      DECIMAL(3,2) DEFAULT 0
      );
      CREATE TABLE ${PG_SCHEMA}.orders (
        id         SERIAL PRIMARY KEY,
        user_id    INTEGER REFERENCES ${PG_SCHEMA}.ecom_users(id),
        status     VARCHAR(20) DEFAULT 'pending',
        total      DECIMAL(10,2) DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
      CREATE TABLE ${PG_SCHEMA}.order_items (
        id         SERIAL PRIMARY KEY,
        order_id   INTEGER REFERENCES ${PG_SCHEMA}.orders(id),
        product_id INTEGER REFERENCES ${PG_SCHEMA}.products(id),
        qty        INTEGER NOT NULL,
        unit_price DECIMAL(10,2) NOT NULL
      );
      CREATE TABLE ${PG_SCHEMA}.reviews (
        id         SERIAL PRIMARY KEY,
        user_id    INTEGER REFERENCES ${PG_SCHEMA}.ecom_users(id),
        product_id INTEGER REFERENCES ${PG_SCHEMA}.products(id),
        rating     INTEGER CHECK (rating BETWEEN 1 AND 5),
        comment    TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
      CREATE TABLE ${PG_SCHEMA}.payments (
        id       SERIAL PRIMARY KEY,
        order_id INTEGER REFERENCES ${PG_SCHEMA}.orders(id),
        method   VARCHAR(30) DEFAULT 'credit_card',
        status   VARCHAR(20) DEFAULT 'completed',
        paid_at  TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // Seed categories (10 rows)
    await client.query(`
      INSERT INTO ${PG_SCHEMA}.ecom_categories (name, parent_id) VALUES
        ('Electronics', NULL),('Laptops', 1),('Smartphones', 1),
        ('Clothing', NULL),('Men''s', 4),('Women''s', 4),
        ('Books', NULL),('Fiction', 7),('Non-Fiction', 7),
        ('Sports & Outdoors', NULL);
    `);

    // Seed users (25 rows)
    await client.query(`
      INSERT INTO ${PG_SCHEMA}.ecom_users (name, email, country, is_premium) VALUES
        ('Alice Johnson','alice@demo.com','USA',true),
        ('Bob Smith','bob@demo.com','UK',false),
        ('Carol White','carol@demo.com','Canada',true),
        ('David Brown','david@demo.com','USA',false),
        ('Eva Martinez','eva@demo.com','Spain',true),
        ('Frank Lee','frank@demo.com','China',false),
        ('Grace Kim','grace@demo.com','Korea',true),
        ('Henry Taylor','henry@demo.com','Australia',false),
        ('Iris Chen','iris@demo.com','Canada',false),
        ('Jack Wilson','jack@demo.com','USA',true),
        ('Karen Davis','karen@demo.com','UK',false),
        ('Leo Garcia','leo@demo.com','Mexico',true),
        ('Mia Anderson','mia@demo.com','Germany',false),
        ('Noah Thomas','noah@demo.com','France',true),
        ('Olivia Moore','olivia@demo.com','USA',false),
        ('Paul Jackson','paul@demo.com','Brazil',true),
        ('Quinn Harris','quinn@demo.com','India',false),
        ('Rachel Martin','rachel@demo.com','Japan',true),
        ('Sam Thompson','sam@demo.com','USA',false),
        ('Tina Robinson','tina@demo.com','UAE',true),
        ('Uma Clark','uma@demo.com','UK',false),
        ('Victor Lewis','victor@demo.com','USA',true),
        ('Wendy Walker','wendy@demo.com','Canada',false),
        ('Xander Hall','xander@demo.com','USA',true),
        ('Yara Young','yara@demo.com','Netherlands',false);
    `);

    // Seed products (20 rows)
    await client.query(`
      INSERT INTO ${PG_SCHEMA}.products (name, category_id, price, stock, rating) VALUES
        ('MacBook Pro 14"', 2, 1999.99, 45, 4.8),
        ('Dell XPS 15', 2, 1599.99, 30, 4.6),
        ('iPhone 15 Pro', 3, 1099.99, 120, 4.7),
        ('Samsung Galaxy S24', 3, 899.99, 85, 4.5),
        ('Google Pixel 8', 3, 699.99, 60, 4.4),
        ('Sony WH-1000XM5', 1, 349.99, 200, 4.9),
        ('iPad Air', 1, 599.99, 75, 4.6),
        ('Men''s Classic T-Shirt', 5, 24.99, 500, 4.2),
        ('Women''s Yoga Pants', 6, 54.99, 300, 4.5),
        ('Men''s Running Shoes', 5, 89.99, 150, 4.3),
        ('The Great Gatsby', 8, 12.99, 400, 4.6),
        ('Atomic Habits', 9, 16.99, 350, 4.9),
        ('Dune', 8, 14.99, 280, 4.7),
        ('Sapiens', 9, 18.99, 220, 4.8),
        ('Mountain Bike Helmet', 10, 79.99, 90, 4.4),
        ('Yoga Mat', 10, 39.99, 250, 4.5),
        ('Women''s Winter Jacket', 6, 149.99, 80, 4.6),
        ('Lenovo ThinkPad X1', 2, 1299.99, 25, 4.5),
        ('AirPods Pro', 1, 249.99, 180, 4.8),
        ('Running Water Bottle', 10, 19.99, 400, 4.3);
    `);

    // Seed orders (30 rows)
    await client.query(`
      INSERT INTO ${PG_SCHEMA}.orders (user_id, status, total, created_at) VALUES
        (1,'completed',1999.99, NOW()-INTERVAL '30 days'),
        (2,'completed',349.99,  NOW()-INTERVAL '28 days'),
        (3,'shipped',  1099.99, NOW()-INTERVAL '25 days'),
        (4,'completed',54.99,   NOW()-INTERVAL '22 days'),
        (5,'pending',  899.99,  NOW()-INTERVAL '20 days'),
        (6,'completed',24.99,   NOW()-INTERVAL '18 days'),
        (7,'cancelled',599.99,  NOW()-INTERVAL '16 days'),
        (8,'completed',89.99,   NOW()-INTERVAL '14 days'),
        (9,'shipped',  1599.99, NOW()-INTERVAL '12 days'),
        (10,'completed',79.99,  NOW()-INTERVAL '10 days'),
        (1,'completed',249.99,  NOW()-INTERVAL '9 days'),
        (2,'pending',  149.99,  NOW()-INTERVAL '8 days'),
        (3,'completed',16.99,   NOW()-INTERVAL '7 days'),
        (4,'shipped',  39.99,   NOW()-INTERVAL '6 days'),
        (5,'completed',1299.99, NOW()-INTERVAL '5 days'),
        (6,'completed',12.99,   NOW()-INTERVAL '5 days'),
        (7,'pending',  14.99,   NOW()-INTERVAL '4 days'),
        (8,'completed',18.99,   NOW()-INTERVAL '4 days'),
        (9,'completed',19.99,   NOW()-INTERVAL '3 days'),
        (10,'shipped', 699.99,  NOW()-INTERVAL '3 days'),
        (11,'completed',1099.99,NOW()-INTERVAL '2 days'),
        (12,'pending',  89.99,  NOW()-INTERVAL '2 days'),
        (13,'completed',249.99, NOW()-INTERVAL '1 day'),
        (14,'shipped',  349.99, NOW()-INTERVAL '1 day'),
        (15,'completed',54.99,  NOW()-INTERVAL '12 hours'),
        (16,'completed',24.99,  NOW()-INTERVAL '10 hours'),
        (17,'pending',  79.99,  NOW()-INTERVAL '8 hours'),
        (18,'completed',599.99, NOW()-INTERVAL '6 hours'),
        (19,'shipped',  149.99, NOW()-INTERVAL '3 hours'),
        (20,'completed',899.99, NOW()-INTERVAL '1 hour');
    `);

    // Seed order_items (40 rows – 1–2 items per order)
    await client.query(`
      INSERT INTO ${PG_SCHEMA}.order_items (order_id, product_id, qty, unit_price) VALUES
        (1,1,1,1999.99),(2,6,1,349.99),(3,3,1,1099.99),(4,9,1,54.99),
        (5,4,1,899.99),(6,8,2,24.99),(7,7,1,599.99),(8,10,1,89.99),
        (9,2,1,1599.99),(10,15,1,79.99),(11,19,1,249.99),(12,17,1,149.99),
        (13,12,1,16.99),(14,16,1,39.99),(15,18,1,1299.99),(16,11,1,12.99),
        (17,13,1,14.99),(18,14,1,18.99),(19,20,1,19.99),(20,5,1,699.99),
        (21,3,1,1099.99),(22,10,1,89.99),(23,19,1,249.99),(24,6,1,349.99),
        (25,9,1,54.99),(26,8,1,24.99),(27,15,1,79.99),(28,7,1,599.99),
        (29,17,1,149.99),(30,4,1,899.99),
        (1,19,1,249.99),(5,6,1,349.99),(9,3,1,1099.99),(15,16,1,39.99),
        (20,12,1,16.99),(21,6,1,349.99),(22,8,2,24.99),(23,11,1,12.99),
        (29,16,1,39.99),(30,10,1,89.99);
    `);

    // Seed reviews (25 rows)
    await client.query(`
      INSERT INTO ${PG_SCHEMA}.reviews (user_id, product_id, rating, comment, created_at) VALUES
        (1,1,5,'Absolutely love this laptop!', NOW()-INTERVAL '25 days'),
        (2,6,5,'Best headphones ever.',        NOW()-INTERVAL '23 days'),
        (3,3,4,'Great phone, solid camera.',   NOW()-INTERVAL '20 days'),
        (4,9,5,'Super comfortable.',           NOW()-INTERVAL '18 days'),
        (5,4,4,'Good value for money.',        NOW()-INTERVAL '15 days'),
        (6,8,3,'Quality is just ok.',          NOW()-INTERVAL '13 days'),
        (7,7,5,'Perfect for my work.',         NOW()-INTERVAL '11 days'),
        (8,10,4,'Runs great, good support.',   NOW()-INTERVAL '9 days'),
        (9,2,4,'Solid performance.',           NOW()-INTERVAL '8 days'),
        (10,15,4,'Good protection.',           NOW()-INTERVAL '7 days'),
        (1,12,5,'Life-changing book!',         NOW()-INTERVAL '6 days'),
        (2,14,5,'Fascinating read.',           NOW()-INTERVAL '5 days'),
        (3,16,4,'Great for yoga.',             NOW()-INTERVAL '4 days'),
        (4,11,5,'Classic literature.',         NOW()-INTERVAL '3 days'),
        (5,13,5,'Epic science fiction.',       NOW()-INTERVAL '3 days'),
        (6,17,3,'Material is thin.',           NOW()-INTERVAL '2 days'),
        (7,19,5,'Crystal clear audio.',        NOW()-INTERVAL '2 days'),
        (8,5,4,'Smooth and fast.',             NOW()-INTERVAL '1 day'),
        (9,18,5,'Workhorse laptop.',           NOW()-INTERVAL '1 day'),
        (10,20,4,'Good size bottle.',          NOW()-INTERVAL '12 hours'),
        (11,1,4,'A bit pricey but worth it.',  NOW()-INTERVAL '10 hours'),
        (12,4,2,'Battery life is poor.',       NOW()-INTERVAL '8 hours'),
        (13,6,5,'Noise cancellation is amazing.', NOW()-INTERVAL '5 hours'),
        (14,3,5,'Best iPhone ever.',           NOW()-INTERVAL '3 hours'),
        (15,9,4,'Fits perfectly.',             NOW()-INTERVAL '1 hour');
    `);

    // Seed payments (30 rows)
    await client.query(`
      INSERT INTO ${PG_SCHEMA}.payments (order_id, method, status, paid_at)
      SELECT id,
        CASE (id % 4) WHEN 0 THEN 'credit_card' WHEN 1 THEN 'paypal'
                      WHEN 2 THEN 'debit_card' ELSE 'stripe' END,
        CASE WHEN status='completed' OR status='shipped' THEN 'completed' ELSE 'pending' END,
        created_at + INTERVAL '5 minutes'
      FROM ${PG_SCHEMA}.orders;
    `);

    console.log('  ✅ PostgreSQL sandbox schema (qf_sandbox) ready');
  } catch (err) {
    console.error('  ⚠️  Sandbox PG error:', err.message);
  } finally {
    client.release();
  }
};

// ── MongoDB Sandbox ───────────────────────────────────────────────
const initMongoSandbox = async () => {
  try {
    if (mongoose.connection.readyState !== 1) return;
    const sandboxDb = mongoose.connection.client.db('queryforge_sandbox');

    // Drop all sandbox collections for a clean slate
    const collections = await sandboxDb.listCollections().toArray();
    for (const col of collections) {
      await sandboxDb.collection(col.name).drop().catch(() => {});
    }

    // Seed users (20 docs)
    const users = [];
    const names = ['alex_j','morgan_s','taylor_r','casey_b','jordan_k','riley_m','avery_p','quinn_l','dakota_n','skyler_t','blake_w','parker_a','sawyer_c','logan_d','hayden_f','reagan_g','ryan_h','peyton_i','emerson_x','charlie_y'];
    for (let i = 0; i < 20; i++) {
      users.push({
        username: names[i],
        email: `${names[i]}@social.io`,
        bio: ['Coffee lover ☕', 'Traveler 🌍', 'Designer 🎨', 'Developer 💻', 'Gamer 🎮'][i % 5],
        followers_count: Math.floor(Math.random() * 5000),
        following: [],
        is_premium: i % 3 === 0,
        tags: [['#tech','#ai'],['#design','#ux'],['#travel','#food'],['#music','#art'],['#sports','#fitness']][i % 5],
        created_at: new Date(Date.now() - (20-i) * 86400000 * 3)
      });
    }
    await sandboxDb.collection('users').insertMany(users);

    // Seed posts (30 docs)
    const posts = [];
    const hashtags = [['#mongodb','#nosql'],['#webdev','#javascript'],['#ai','#machinelearning'],['#design','#ui'],['#devops','#cloud']];
    for (let i = 0; i < 30; i++) {
      posts.push({
        user_id: users[i % 20].username,
        content: `Post number ${i+1} - sharing thoughts about ${hashtags[i%5].join(' ')}`,
        media_url: i % 3 === 0 ? `https://picsum.photos/seed/${i}/400/300` : null,
        likes_count: Math.floor(Math.random() * 500),
        comments_count: Math.floor(Math.random() * 50),
        hashtags: hashtags[i % 5],
        created_at: new Date(Date.now() - (30-i) * 86400000)
      });
    }
    await sandboxDb.collection('posts').insertMany(posts);

    // Seed messages (20 docs)
    const messages = [];
    for (let i = 0; i < 20; i++) {
      messages.push({
        sender: users[i % 20].username,
        receiver: users[(i+1) % 20].username,
        text: `Hey! Message #${i+1}`,
        read: i % 2 === 0,
        timestamp: new Date(Date.now() - i * 3600000)
      });
    }
    await sandboxDb.collection('messages').insertMany(messages);

    // Seed notifications (20 docs)
    const notifications = [];
    const types = ['like','comment','follow','mention'];
    for (let i = 0; i < 20; i++) {
      notifications.push({
        user_id: users[i % 20].username,
        type: types[i % 4],
        message: `Someone ${types[i%4]}d your post`,
        read: i % 3 === 0,
        created_at: new Date(Date.now() - i * 3600000)
      });
    }
    await sandboxDb.collection('notifications').insertMany(notifications);

    console.log('  ✅ MongoDB sandbox (queryforge_sandbox) ready');
  } catch (err) {
    console.error('  ⚠️  Sandbox Mongo error:', err.message);
  }
};

// ── Main export ───────────────────────────────────────────────────
const initSandbox = async () => {
  console.log('  → Initializing query sandbox...');
  await Promise.all([initPostgresSandbox(), initMongoSandbox()]);
};

module.exports = { initSandbox, PG_SCHEMA };
