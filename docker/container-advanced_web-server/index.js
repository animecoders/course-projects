const express = require('express');
const { MongoClient } = require('mongodb');

const app = express();
const client = new MongoClient(
  process.env.MONGODB_URI || 'mongodb://mongo:27017'
);

async function start() {
  await client.connect();

  app.get("/", async (req, res) => {
    res.json({ status: 'ok' })
  })

  app.get('/time', async (req, res) => {
    try {
      await client.db('admin').command({ ping: 1 });
      res.json({ currentTime: new Date() });
    } catch (err) {
      res.status(500).send(err.message);
    }
  });

  const server = app.listen(3000, () => console.log('Server running on port 3000'));

  let shuttingDown = false;
  process.on('SIGTERM', () => {
    if (shuttingDown) return;
    shuttingDown = true;
    console.log('SIGTERM received; shutting down');

    server.close(async err => {
      if (err) {
        console.error('Error closing HTTP server:', err);
        process.exitCode = 1;
      }

      try {
        await client.close();
      } catch (closeErr) {
        console.error('Error closing MongoDB client:', closeErr);
        process.exitCode = 1;
      }
    });
  });
}

start().catch(err => {
  console.error('Could not connect to MongoDB:', err);
  process.exit(1);
});
