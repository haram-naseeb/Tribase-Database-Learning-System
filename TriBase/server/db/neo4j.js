require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });

let driver = null;
let isConnected = false;

const MAX_RETRIES = 5;
const RETRY_DELAY_MS = 5000;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const connectNeo4j = async () => {
  if (process.env.NEO4J_ENABLED !== 'true') {
    console.log('Neo4j disabled in config. Set NEO4J_ENABLED=true in .env to enable.');
    return;
  }

  const neo4j = require('neo4j-driver');
  const uri  = process.env.NEO4J_URI      || 'bolt://localhost:7687';
  const user = process.env.NEO4J_USER     || 'neo4j';
  const pass = process.env.NEO4J_PASSWORD || 'password';

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      // Close any previous driver before creating a new one
      if (driver) { await driver.close().catch(() => {}); driver = null; }

      driver = neo4j.driver(uri, neo4j.auth.basic(user, pass));
      await driver.verifyConnectivity();
      isConnected = true;
      console.log(`Neo4j Connected (attempt ${attempt})`);
      return;
    } catch (err) {
      console.error(`Neo4j connection error (attempt ${attempt}/${MAX_RETRIES}):`, err.message);
      driver = null;
      isConnected = false;
      if (attempt < MAX_RETRIES) {
        console.log(`  Retrying in ${RETRY_DELAY_MS / 1000}s...`);
        await sleep(RETRY_DELAY_MS);
      }
    }
  }

  console.log('Neo4j failed to connect after all retries. Neo4j features will be unavailable.');
};

const getDriver = () => driver;
const getNeo4jStatus = () => isConnected;

module.exports = { connectNeo4j, getDriver, getNeo4jStatus };
