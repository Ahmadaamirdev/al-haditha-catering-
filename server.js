import express from 'express';
import cors from 'cors';
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
import { alHadithaEmployees } from './src/data/employeesData.js';
import { initialMockData } from './src/data/mockData.js';

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
    res.json({
      status: 'ok',
      db: 'connected',
      employeesCount: count,
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

    if (!state) {
      console.log('No current_state found in MongoDB, seeding initial data...');
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
        events: initialMockData.events || [],
        facilities: initialMockData.facilities,
        mealEntries: [],
        updatedAt: new Date(),
      };
      await stateCol.insertOne(state);
    }

    // Ensure events collection is synchronized if state.events is empty
    if (!state.events || state.events.length === 0) {
      const dbEvents = await database.collection('events').find({}).toArray();
      if (dbEvents.length > 0) {
        state.events = dbEvents;
      }
    }

    // Ensure mealEntries collection is synchronized if state.mealEntries is empty
    if (!state.mealEntries || state.mealEntries.length === 0) {
      const dbEntries = await database.collection('mealEntries').find({}).toArray();
      if (dbEntries.length > 0) {
        state.mealEntries = dbEntries;
      }
    }

    res.json(state);
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
    const newState = {
      ...req.body,
      _id: 'current_state',
      updatedAt: new Date(),
    };

    await stateCol.updateOne(
      { _id: 'current_state' },
      { $set: newState },
      { upsert: true }
    );

    // Also mirror individual mealEntries if provided
    if (Array.isArray(req.body.mealEntries)) {
      const mealEntriesCol = database.collection('mealEntries');
      await mealEntriesCol.deleteMany({});
      if (req.body.mealEntries.length > 0) {
        await mealEntriesCol.insertMany(req.body.mealEntries);
      }
    }

    // Mirror events if provided
    if (Array.isArray(req.body.events)) {
      const eventsCol = database.collection('events');
      await eventsCol.deleteMany({});
      if (req.body.events.length > 0) {
        await eventsCol.insertMany(req.body.events);
      }
    }

    res.json({ success: true, updatedAt: newState.updatedAt });
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
    await database.collection('mealEntries').insertOne(entry);

    // Update current_state array
    await database.collection('appState').updateOne(
      { _id: 'current_state' },
      { 
        $push: { mealEntries: { $each: [entry], $position: 0 } },
        $set: { updatedAt: new Date() }
      }
    );

    res.json({ success: true, entry });
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

    await database.collection('appState').updateOne(
      { _id: 'current_state' },
      { 
        $pull: { mealEntries: { id } },
        $set: { updatedAt: new Date() }
      }
    );

    res.json({ success: true, deletedId: id });
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
