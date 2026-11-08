import { MongoClient } from 'mongodb';
import dns from 'node:dns';
import { alHadithaEmployees } from '../src/data/employeesData.js';
import { initialMockData } from '../src/data/mockData.js';

try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (_) {}

const uri = process.env.MONGODB_URI || "mongodb+srv://musahere:jJ56wB0cd1naVLdT@cluster0.fsmczem.mongodb.net/al_haditha_catering?retryWrites=true&w=majority";

async function migrateData() {
  console.log("=== Starting MongoDB Data Migration for Al Haditha Catering ===");
  console.log("Target URI:", uri.replace(/:([^:@]+)@/, ':****@'));

  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log("✓ Connected to MongoDB Atlas successfully");

    const db = client.db('al_haditha_catering');

    // 1. Migrate Employees Collection (100 Staff)
    console.log(`\n1. Migrating ${alHadithaEmployees.length} Employees...`);
    const employeesCol = db.collection('employees');
    await employeesCol.deleteMany({}); // Fresh clean seed
    const empResult = await employeesCol.insertMany(alHadithaEmployees);
    console.log(`✓ Inserted ${empResult.insertedCount} employees`);

    // 2. Migrate Timetable (Meal Schedule)
    console.log("\n2. Migrating Timetable Meals...");
    const timetableCol = db.collection('timetable');
    await timetableCol.deleteMany({});
    const timetableResult = await timetableCol.insertMany(initialMockData.timetable);
    console.log(`✓ Inserted ${timetableResult.insertedCount} timetable meals`);

    // 3. Migrate Facilities
    console.log("\n3. Migrating Facilities...");
    const facilitiesCol = db.collection('facilities');
    await facilitiesCol.deleteMany({});
    const facResult = await facilitiesCol.insertMany(initialMockData.facilities);
    console.log(`✓ Inserted ${facResult.insertedCount} facilities`);

    // 4. Migrate Events
    console.log("\n4. Migrating Events...");
    const eventsCol = db.collection('events');
    const existingEventsCount = await eventsCol.countDocuments();
    if (existingEventsCount === 0 && initialMockData.events && initialMockData.events.length > 0) {
      await eventsCol.insertMany(initialMockData.events);
      console.log(`✓ Inserted ${initialMockData.events.length} initial events`);
    } else {
      console.log(`✓ Events collection preserved (${existingEventsCount} events existing)`);
    }

    // 5. Migrate Meal Entries (Live check-in stream)
    console.log("\n5. Checking Meal Entries...");
    const mealEntriesCol = db.collection('mealEntries');
    const existingMealCount = await mealEntriesCol.countDocuments();
    console.log(`✓ Meal entries collection has ${existingMealCount} records`);

    // 6. Migrate Wastage Records
    console.log("\n6. Checking Wastage Records...");
    const wastageCol = db.collection('wastageRecords');
    if (initialMockData.wastageOverview?.records?.length > 0) {
      await wastageCol.deleteMany({});
      await wastageCol.insertMany(initialMockData.wastageOverview.records);
      console.log(`✓ Inserted ${initialMockData.wastageOverview.records.length} wastage records`);
    }

    // 7. Initialize Unified Application State Snapshot
    console.log("\n7. Creating Unified Application State Snapshot...");
    const stateCol = db.collection('appState');
    const fullState = {
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

    await stateCol.updateOne(
      { _id: 'current_state' },
      { $setOnInsert: fullState },
      { upsert: true }
    );
    console.log("✓ Application state snapshot initialized in MongoDB");

    // Print Summary
    console.log("\n=== Migration Completed Successfully! ===");
    const collections = await db.listCollections().toArray();
    console.log("Collections in 'al_haditha_catering':", collections.map(c => c.name));

  } catch (err) {
    console.error("Migration failed:", err);
    process.exit(1);
  } finally {
    await client.close();
    console.log("MongoDB connection closed.");
  }
}

migrateData();
