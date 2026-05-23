const { pool } = require('../db/postgres');
const mongoose = require('mongoose');
const { getDriver, getNeo4jStatus } = require('../db/neo4j');
const { PG_SCHEMA } = require('../db/sandboxManager');

// ─── PostgreSQL Sandbox Query Handler ──────────────────────────────
// All queries run in the qf_sandbox schema — writes commit and are
// visible immediately. On server restart the schema is re-created.
const executePostgresQuery = async (req, res) => {
  const { query } = req.body;
  if (!query || !query.trim()) return res.status(400).json({ error: 'Query cannot be empty.' });

  const lower = query.toLowerCase().trim();
  const forbidden = ['drop schema', 'drop database', 'create role', 'create user', 'grant ', 'revoke '];
  if (forbidden.some(k => lower.includes(k))) {
    return res.status(403).json({ error: 'That operation is not permitted in the sandbox.' });
  }

  let client;
  try {
    client = await pool.connect();
    await client.query('SET statement_timeout = 5000');
    // Route everything through the sandbox schema
    await client.query(`SET search_path = ${PG_SCHEMA}, public`);

    const result = await client.query(query);
    const isWrite = /^\s*(insert|update|delete)\b/i.test(query.trim());

    res.json({
      rows: result.rows?.slice(0, 100) || [],
      rowCount: result.rowCount,
      fields: result.fields?.map(f => ({ name: f.name, dataTypeID: f.dataTypeID })) || [],
      ...(isWrite && {
        sandboxNote: `✅ ${result.rowCount} row(s) affected in sandbox. Data resets when server restarts.`
      })
    });
  } catch (err) {
    if (client) await client.query('ROLLBACK').catch(() => {});
    res.status(400).json({ error: err.message, hint: 'Check your SQL syntax and table/column names.' });
  } finally {
    if (client) client.release();
  }
};


// ─── MongoDB Query Handler ──────────────────────────────────────
const executeMongoQuery = async (req, res) => {
  const { collection, method, args } = req.body;
  if (!collection || !method) return res.status(400).json({ error: 'collection and method are required.' });

  // Block only truly destructive ops on the db itself
  const forbidden = ['dropdatabase', 'dropallcollections'];
  if (forbidden.some(m => method.toLowerCase().replace(/\s/g,'') === m)) {
    return res.status(403).json({ error: 'That operation is not permitted in the sandbox.' });
  }

  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({ error: 'MongoDB is not connected.' });
  }

  try {
    // Use the sandbox database — resets on server restart
    const sandboxDb = mongoose.connection.client.db('queryforge_sandbox');
    const col = sandboxDb.collection(collection);

    // args: already-parsed array or string
    let parsedArgs = args;
    if (typeof args === 'string') {
      try { parsedArgs = JSON.parse(args); } catch(e) { return res.status(400).json({ error: 'Invalid JSON in args.' }); }
    }
    if (!Array.isArray(parsedArgs)) parsedArgs = parsedArgs !== undefined ? [parsedArgs] : [{}];

    let result;
    const opts = { maxTimeMS: 5000 };
    const isWrite = ['insertOne','insertMany','updateOne','updateMany','deleteOne','deleteMany','replaceOne','findOneAndUpdate','findOneAndDelete'].includes(method);

    if      (method === 'find')               result = await col.find(...parsedArgs).limit(100).maxTimeMS(5000).toArray();
    else if (method === 'findOne')            result = await col.findOne(parsedArgs[0] || {}, opts);
    else if (method === 'aggregate')          result = await col.aggregate(parsedArgs[0] || [], opts).toArray();
    else if (method === 'countDocuments')     result = await col.countDocuments(parsedArgs[0] || {}, opts);
    else if (method === 'distinct')           result = await col.distinct(parsedArgs[0], parsedArgs[1] || {});
    else if (method === 'insertOne')          result = await col.insertOne(parsedArgs[0]);
    else if (method === 'insertMany')         result = await col.insertMany(parsedArgs[0]);
    else if (method === 'updateOne')          result = await col.updateOne(parsedArgs[0], parsedArgs[1], parsedArgs[2] || {});
    else if (method === 'updateMany')         result = await col.updateMany(parsedArgs[0], parsedArgs[1], parsedArgs[2] || {});
    else if (method === 'deleteOne')          result = await col.deleteOne(parsedArgs[0]);
    else if (method === 'deleteMany')         result = await col.deleteMany(parsedArgs[0] || {});
    else if (method === 'replaceOne')         result = await col.replaceOne(parsedArgs[0], parsedArgs[1]);
    else if (method === 'findOneAndUpdate')   result = await col.findOneAndUpdate(parsedArgs[0], parsedArgs[1], { returnDocument:'after', ...(parsedArgs[2]||{}) });
    else if (method === 'findOneAndDelete')   result = await col.findOneAndDelete(parsedArgs[0]);
    else return res.status(400).json({ error: `Method "${method}" is not supported.` });

    const payload = Array.isArray(result) ? result.slice(0, 100) : result;
    res.json({
      result: payload,
      ...(isWrite && { sandboxNote: `✅ Operation applied to sandbox. Data resets on server restart.` })
    });
  } catch (err) {
    res.status(400).json({ error: err.message, hint: 'Check your collection name, method, and query syntax.' });
  }
};


// ─── Neo4j Query Handler ────────────────────────────────────────

const executeNeo4jQuery = async (req, res) => {
  const { query } = req.body;
  if (!query) return res.status(400).json({ error: 'Query cannot be empty.' });

  if (!getNeo4jStatus()) {
    return res.status(503).json({
      error: 'Neo4j is not connected. Install Neo4j and set NEO4J_ENABLED=true in .env.',
      mockMode: true
    });
  }

  // Only block destructive ops in practice mode
  const upper = query.toUpperCase().trim();
  const forbidden = ['DELETE ', 'DROP ', 'DETACH DELETE'];
  if (forbidden.some(k => upper.includes(k))) {
    return res.status(403).json({ error: 'DELETE/DROP operations are not allowed in the sandbox.' });
  }

  const driver = getDriver();
  const session = driver.session();
  try {
    const result = await session.run(query, {}, { timeout: 5000 });

    // Serialize Neo4j driver types to plain JSON
    const toJS = (val) => {
      if (val === null || val === undefined) return null;

      // Neo4j Integer type
      if (val.constructor && (val.constructor.name === 'Integer' || val.constructor.name === 'Neo4jInteger')) {
        return val.toNumber();
      }
      // Integer-like low/high object
      if (typeof val === 'object' && typeof val.low === 'number' && typeof val.high === 'number') {
        return val.toNumber ? val.toNumber() : val.low + val.high * 0x100000000;
      }

      // Neo4j Node — driver v4 has .identity, driver v5 has .elementId
      if (typeof val === 'object' && val.labels !== undefined && val.properties !== undefined) {
        const rawId = val.identity !== undefined ? val.identity : val.elementId;
        const numId = rawId?.toNumber ? rawId.toNumber() : (typeof rawId === 'number' ? rawId : parseInt(rawId) || Math.floor(Math.random() * 999999));
        return {
          _isNode: true,
          labels: val.labels,
          identity: numId,
          properties: Object.fromEntries(Object.entries(val.properties).map(([k, v]) => [k, toJS(v)]))
        };
      }

      // Neo4j Relationship
      if (typeof val === 'object' && val.type !== undefined && (val.start !== undefined || val.startNodeElementId !== undefined)) {
        const startRaw = val.start ?? val.startNodeElementId;
        const endRaw   = val.end   ?? val.endNodeElementId;
        const toNum = (x) => x?.toNumber ? x.toNumber() : (typeof x === 'number' ? x : parseInt(x) || 0);
        return {
          _isRelationship: true,
          type: val.type,
          start: toNum(startRaw),
          end:   toNum(endRaw),
          properties: Object.fromEntries(Object.entries(val.properties || {}).map(([k, v]) => [k, toJS(v)]))
        };
      }

      if (Array.isArray(val)) return val.map(toJS);
      if (typeof val === 'object') return Object.fromEntries(Object.entries(val).map(([k, v]) => [k, toJS(v)]));
      return val;
    };


    const records = result.records.map(r => {
      const obj = {};
      r.keys.forEach(k => { obj[k] = toJS(r.get(k)); });
      return obj;
    });

    res.json({ records: records.slice(0, 100) });
  } catch (err) {
    res.status(400).json({ error: err.message, hint: 'Check your Cypher syntax.' });
  } finally {
    await session.close();
  }
};

module.exports = { executePostgresQuery, executeMongoQuery, executeNeo4jQuery };
