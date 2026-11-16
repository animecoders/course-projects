const express = require('express');
const { MongoClient } = require('mongodb');

const app = express();
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://mongo:27017';

let client = null;   // set only after a successful connect
let dbReady = false;
let shuttingDown = false;

const sleep = ms => new Promise(r => setTimeout(r, ms));

function createClient() {
  const c = new MongoClient(MONGODB_URI, {
    serverSelectionTimeoutMS: 5000,
    connectTimeoutMS: 5000,
  });
  // After the first success, the driver reconnects by itself; just track state
  c.on('serverHeartbeatFailed', e => {
    if (dbReady) console.error('MongoDB heartbeat failed:', e.failure?.message);
    dbReady = false;
  });
  c.on('serverHeartbeatSucceeded', () => {
    if (!dbReady) console.log('MongoDB connection (re)established');
    dbReady = true;
  });
  return c;
}

// Retries forever in the background; never crashes the app
async function connectInBackground() {
  let attempt = 0;
  while (!shuttingDown) {
    attempt++;
    const candidate = createClient(); // fresh client per attempt = clean state
    try {
      await candidate.connect();
      await candidate.db('admin').command({ ping: 1 });
      client = candidate;
      dbReady = true;
      console.log('Connected to MongoDB');
      return;
    } catch (err) {
      console.error(`MongoDB attempt ${attempt} failed: ${err.message}`);
      await candidate.close().catch(() => {});
      const delay = Math.min(1000 * 2 ** Math.min(attempt - 1, 4), 15000);
      console.log(`Retrying in ${delay}ms...`);
      await sleep(delay);
    }
  }
}

// Works without DB
app.get('/', (req, res) => res.json({ status: 'ok' }));

app.get('/health', (req, res) => {
  res
    .status(dbReady ? 200 : 503)
    .json({ status: dbReady ? 'ok' : 'degraded', db: dbReady ? 'up' : 'down' });
});

// Needs DB
app.get('/time', async (req, res) => {
  if (!dbReady || !client) {
    return res.status(503).json({ error: 'Database unavailable' });
  }
  try {
    await client.db('admin').command({ ping: 1 });
    res.json({ currentTime: new Date() });
  } catch (err) {
    console.error('Ping failed:', err.message);
    dbReady = false;
    res.status(503).json({ error: 'Database unavailable' });
  }
});

const server = app.listen(3000, () => console.log('Server running on port 3000'));

connectInBackground(); // intentionally not awaited

function shutdown(signal) {
  if (shuttingDown) return;
  shuttingDown = true;
  console.log(`${signal} received; shutting down`);

  const force = setTimeout(() => {
    console.error('Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
  force.unref();

  server.close(async err => {
    if (err) {
      console.error('Error closing HTTP server:', err);
      process.exitCode = 1;
    }
    try {
      if (client) await client.close();
    } catch (closeErr) {
      console.error('Error closing MongoDB client:', closeErr);
      process.exitCode = 1;
    }
  });
  server.closeIdleConnections?.();
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));