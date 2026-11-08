import express from 'express';
import cors from 'cors';
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
import { alHadithaEmployees } from './src/data/employeesData.js';
import { initialMockData } from './src/data/mockData.js';
import { harmonizeStateMetrics, defaultAlHadithaEvent } from './src/utils/harmonizeEngine.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://musahere:jJ56wB0cd1naVLdT@cluster0.fsmczem.mongodb.net/al_haditha_catering?retryWrites=true&w=majority";

app.use(cors());
app.use(express.json({ limit: '10mb' }));

let client = null;
let db = null;

async function connectToMongo() {
  if (db) return db;
  try {
    client = new MongoClient(MONGODB_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
    });
    await client.connect();
    db = client.db('al_haditha_catering');
    console.log('✓ Connected to MongoDB Atlas (al_haditha_catering)');
    return db;
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    throw err;
  }
}

// Ensure MongoDB is connected for every request (essential for serverless Vercel cold starts)
app.use(async (req, res, next) => {
  try {
    await connectToMongo();
    next();
  } catch (err) {
    console.error('MongoDB connection middleware error:', err);
    res.status(500).json({ error: 'Database connection failed', details: err.message });
  }
});

// Health check
app.get('/api/health', async (req, res) => {
  try {
    const database = await connectToMongo();
    const count = await database.collection('employees').countDocuments();
    const mealCount = await database.collection('mealEntries').countDocuments();
    res.json({
      status: 'ok',
      db: 'connected',
      employeesCount: count,
      mealEntriesCount: mealCount,
      timestamp: new Date()
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// GET /api/data - Fetch full application state from MongoDB
app.get('/api/data', async (req, res) => {
  try {
    const database = await connectToMongo();
    const stateCol = database.collection('appState');
    let state = await stateCol.findOne({ _id: 'current_state' });

    // Always retrieve latest meal entries from mealEntries collection
    const mealEntriesCol = database.collection('mealEntries');
    const rawDbEntries = await mealEntriesCol.find({}).toArray();
    const dbEntries = rawDbEntries.filter((e) => (e.category || '').toUpperCase() !== 'VIP');

    // Always retrieve latest events from events collection
    const eventsCol = database.collection('events');
    let dbEvents = await eventsCol.find({}).toArray();
    if (dbEvents.length === 0) {
      dbEvents = [defaultAlHadithaEvent];
    }

    if (!state) {
      state = {
        _id: 'current_state',
        currency: 'OMR',
        selectedMonth: 'November 2026',
        currentDateFormatted: 'Monday, 3 Nov 2026',
        employees: alHadithaEmployees,
        employeeOverview: initialMockData.employeeOverview,
        wastageOverview: initialMockData.wastageOverview,
        financeOverview: initialMockData.financeOverview,
        mealAllocation: initialMockData.mealAllocation,
        timetable: initialMockData.timetable,
        facilities: initialMockData.facilities,
        mealEntries: dbEntries,
        events: dbEvents,
      };
    } else {
      state.mealEntries = dbEntries.length > 0 ? dbEntries : (state.mealEntries || []);
      state.events = dbEvents;
    }

    // Harmonize all metrics (Junior, Senior, VIP eating counts, Wastage consumed, Finance)
    const harmonized = harmonizeStateMetrics(state);

    res.json(harmonized);
  } catch (err) {
    console.error('Error fetching data from MongoDB:', err);
    res.status(500).json({ error: 'Failed to fetch data from MongoDB', details: err.message });
  }
});

// POST /api/data - Sync full state update to MongoDB
app.post('/api/data', async (req, res) => {
  try {
    const database = await connectToMongo();
    const stateCol = database.collection('appState');
    const mealEntriesCol = database.collection('mealEntries');
    const eventsCol = database.collection('events');

    // Smart merge meal entries (never lose entries)
    let clientEntries = Array.isArray(req.body.mealEntries) ? req.body.mealEntries : [];
    const dbEntries = await mealEntriesCol.find({}).toArray();
    const entryMap = new Map();
    [...dbEntries, ...clientEntries].forEach((e) => {
      if (e && e.id) entryMap.set(e.id, e);
    });
    const mergedEntries = Array.from(entryMap.values()).filter(
      (e) => (e.category || '').toUpperCase() !== 'VIP'
    );
    const cleanEntries = mergedEntries.map((e) => {
      const { _id, ...rest } = e;
      return rest;
    });

    await mealEntriesCol.deleteMany({});
    if (cleanEntries.length > 0) {
      await mealEntriesCol.insertMany(cleanEntries);
    }

    // Smart merge events
    let clientEvents = Array.isArray(req.body.events) ? req.body.events : [];
    const dbEvents = await eventsCol.find({}).toArray();
    const eventMap = new Map();
    [...dbEvents, ...clientEvents].forEach((evt) => {
      if (evt && evt.id) eventMap.set(evt.id, evt);
    });
    const mergedEvents = Array.from(eventMap.values());
    const finalEvents = mergedEvents.length > 0 ? mergedEvents : [defaultAlHadithaEvent];
    const cleanEvents = finalEvents.map((evt) => {
      const { _id, ...rest } = evt;
      return rest;
    });

    await eventsCol.deleteMany({});
    await eventsCol.insertMany(cleanEvents);

    const fullState = {
      ...req.body,
      _id: 'current_state',
      mealEntries: mergedEntries,
      events: finalEvents,
      updatedAt: new Date(),
    };

    const harmonized = harmonizeStateMetrics(fullState);

    await stateCol.updateOne(
      { _id: 'current_state' },
      { $set: harmonized },
      { upsert: true }
    );

    res.json({ success: true, harmonized });
  } catch (err) {
    console.error('Error saving data to MongoDB:', err);
    res.status(500).json({ error: 'Failed to save data to MongoDB', details: err.message });
  }
});

// POST /api/meal-entries - Log single meal check-in
app.post('/api/meal-entries', async (req, res) => {
  try {
    const database = await connectToMongo();
    const entry = req.body;
    
    // Save to mealEntries collection if not already existing
    const existing = await database.collection('mealEntries').findOne({ id: entry.id });
    if (!existing) {
      await database.collection('mealEntries').insertOne(entry);
    }

    const allEntries = await database.collection('mealEntries').find({}).toArray();
    const stateCol = database.collection('appState');
    const state = await stateCol.findOne({ _id: 'current_state' });

    const harmonized = harmonizeStateMetrics({
      ...(state || {}),
      mealEntries: allEntries,
      updatedAt: new Date()
    });

    await stateCol.updateOne(
      { _id: 'current_state' },
      { $set: harmonized },
      { upsert: true }
    );

    res.json({ success: true, entry, harmonized });
  } catch (err) {
    console.error('Error logging meal entry to MongoDB:', err);
    res.status(500).json({ error: 'Failed to log meal entry', details: err.message });
  }
});

// DELETE /api/meal-entries/:id - Delete single meal check-in
app.delete('/api/meal-entries/:id', async (req, res) => {
  try {
    const database = await connectToMongo();
    const { id } = req.params;
    await database.collection('mealEntries').deleteOne({ id });

    const allEntries = await database.collection('mealEntries').find({}).toArray();
    const stateCol = database.collection('appState');
    const state = await stateCol.findOne({ _id: 'current_state' });

    const harmonized = harmonizeStateMetrics({
      ...(state || {}),
      mealEntries: allEntries,
      updatedAt: new Date()
    });

    await stateCol.updateOne(
      { _id: 'current_state' },
      { $set: harmonized },
      { upsert: true }
    );

    res.json({ success: true, deletedId: id, harmonized });
  } catch (err) {
    console.error('Error deleting meal entry from MongoDB:', err);
    res.status(500).json({ error: 'Failed to delete meal entry', details: err.message });
  }
});

// Connect to MongoDB and start Express server when running locally or standalone
if (!process.env.VERCEL) {
  connectToMongo()
    .then(() => {
      app.listen(PORT, () => {
        console.log(`✓ Al Haditha Mess Server listening on http://localhost:${PORT}`);
      });
    })
    .catch((err) => {
      console.error('Could not start server due to MongoDB error:', err);
    });
}

export default app;
