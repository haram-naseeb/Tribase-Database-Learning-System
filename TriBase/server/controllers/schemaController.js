const { pool } = require('../db/postgres');
const mongoose = require('mongoose');
const { getDriver, getNeo4jStatus } = require('../db/neo4j');

// ─── PostgreSQL Schema ─────────────────────────────────────────────
const getPostgresSchema = async (req, res) => {
  try {
    const tablesResult = await pool.query(`
      SELECT 
        t.table_name,
        COUNT(c.column_name)::int AS column_count,
        (SELECT reltuples::bigint FROM pg_class WHERE relname = t.table_name) AS approx_rows
      FROM information_schema.tables t
      JOIN information_schema.columns c ON c.table_name = t.table_name AND c.table_schema = 'public'
      WHERE t.table_schema = 'public' AND t.table_type = 'BASE TABLE'
        AND t.table_name NOT IN ('platform_users','user_progress')
      GROUP BY t.table_name
      ORDER BY t.table_name
    `);

    const foreignKeys = await pool.query(`
      SELECT
        kcu.table_name AS from_table,
        kcu.column_name AS from_col,
        ccu.table_name AS to_table,
        ccu.column_name AS to_col
      FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
      JOIN information_schema.constraint_column_usage ccu ON tc.constraint_name = ccu.constraint_name
      WHERE tc.constraint_type = 'FOREIGN KEY' AND kcu.table_schema = 'public'
    `);

    res.json({ tables: tablesResult.rows, foreignKeys: foreignKeys.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getPostgresTable = async (req, res) => {
  const { tableName } = req.params;
  const allowed = ['ecom_users','products','orders','order_items','ecom_categories','reviews','payments'];
  if (!allowed.includes(tableName)) return res.status(403).json({ error: 'Table not accessible.' });
  try {
    const columns = await pool.query(`
      SELECT column_name, data_type, is_nullable,
        CASE WHEN column_name = (
          SELECT kcu.column_name FROM information_schema.table_constraints tc
          JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
          WHERE tc.table_name = $1 AND tc.constraint_type = 'PRIMARY KEY' LIMIT 1
        ) THEN true ELSE false END AS is_primary
      FROM information_schema.columns
      WHERE table_name = $1 AND table_schema = 'public'
      ORDER BY ordinal_position
    `, [tableName]);

    const sample = await pool.query(`SELECT * FROM ${tableName} LIMIT 5`);
    const count = await pool.query(`SELECT COUNT(*) FROM ${tableName}`);

    res.json({
      columns: columns.rows,
      sample: sample.rows,
      rowCount: parseInt(count.rows[0].count)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ─── MongoDB Schema ────────────────────────────────────────────────
const getMongoSchema = async (req, res) => {
  if (mongoose.connection.readyState !== 1) return res.status(503).json({ error: 'MongoDB not connected.' });
  try {
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    const result = await Promise.all(collections.map(async (col) => {
      const count = await db.collection(col.name).countDocuments();
      const sample = await db.collection(col.name).findOne();
      return { name: col.name, count, sampleKeys: sample ? Object.keys(sample) : [] };
    }));
    res.json({ collections: result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getMongoCollection = async (req, res) => {
  const { collectionName } = req.params;
  const allowed = ['users','posts','messages','notifications'];
  if (!allowed.includes(collectionName)) return res.status(403).json({ error: 'Collection not accessible.' });
  if (mongoose.connection.readyState !== 1) return res.status(503).json({ error: 'MongoDB not connected.' });
  try {
    const db = mongoose.connection.db;
    const sample = await db.collection(collectionName).find({}).limit(5).toArray();
    const count = await db.collection(collectionName).countDocuments();
    const sampleDoc = sample[0] || {};
    const schema = Object.entries(sampleDoc).map(([key, val]) => ({
      field: key, type: Array.isArray(val) ? 'Array' : typeof val === 'object' && val !== null ? 'Object' : typeof val
    }));
    res.json({ sample, count, schema });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ─── Neo4j Schema ──────────────────────────────────────────────────
const getNeo4jSchema = async (req, res) => {
  if (!getNeo4jStatus()) return res.status(503).json({ error: 'Neo4j not connected.' });
  const driver = getDriver();
  const session = driver.session();
  try {
    const labelsResult = await session.run('CALL db.labels() YIELD label RETURN label');
    const relResult = await session.run('CALL db.relationshipTypes() YIELD relationshipType RETURN relationshipType');
    const countResult = await session.run(`
      UNWIND ['Movie','Person','Genre','Studio','Award'] AS label
      CALL { WITH label MATCH (n) WHERE label IN labels(n) RETURN COUNT(n) AS cnt }
      RETURN label, cnt
    `);

    const labels = labelsResult.records.map(r => r.get('label'));
    const relationships = relResult.records.map(r => r.get('relationshipType'));
    const counts = {};
    countResult.records.forEach(r => { counts[r.get('label')] = r.get('cnt').toNumber(); });

    res.json({ labels, relationships, counts });
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    await session.close();
  }
};

const getNeo4jNodeSample = async (req, res) => {
  if (!getNeo4jStatus()) return res.status(503).json({ error: 'Neo4j not connected.' });
  const { label } = req.params;
  const allowed = ['Movie','Person','Genre','Studio','Award'];
  if (!allowed.includes(label)) return res.status(403).json({ error: 'Label not accessible.' });
  const driver = getDriver();
  const session = driver.session();
  try {
    const result = await session.run(`MATCH (n:${label}) RETURN properties(n) AS props LIMIT 5`);
    const sample = result.records.map(r => r.get('props'));
    const relResult = await session.run(`
      MATCH (n:${label})-[r]->(m) 
      RETURN type(r) AS relType, labels(m)[0] AS targetLabel, COUNT(*) AS cnt
      LIMIT 10
    `);
    const relationships = relResult.records.map(r => ({
      type: r.get('relType'), target: r.get('targetLabel'), count: r.get('cnt').toNumber()
    }));
    res.json({ label, sample, relationships });
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    await session.close();
  }
};

module.exports = { getPostgresSchema, getPostgresTable, getMongoSchema, getMongoCollection, getNeo4jSchema, getNeo4jNodeSample };
