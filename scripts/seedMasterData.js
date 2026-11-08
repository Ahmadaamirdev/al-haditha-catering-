import { MongoClient } from 'mongodb';
import dns from 'node:dns';
import { harmonizeStateMetrics, defaultAlHadithaEvent } from '../src/utils/harmonizeEngine.js';

try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (_) {}

const uri = process.env.MONGODB_URI || "mongodb+srv://musahere:jJ56wB0cd1naVLdT@cluster0.fsmczem.mongodb.net/al_haditha_catering?retryWrites=true&w=majority";

const masterMealEntries = [
  {
    id: "MEAL-1081-001",
    employeeId: "AHP-1081",
    employeeName: "Eng. Abdullah Al-Haditha",
    category: "VIP",
    department: "Executive Management",
    designation: "Managing Director",
    mealType: "Breakfast",
    facility: "Main Camp Mess Hall",
    timestamp: "12:09 PM",
    date: "2026-11-03",
    status: "Verified"
  },
  {
    id: "MEAL-1041-001",
    employeeId: "AHP-1041",
    employeeName: "Eng. Tariq Al-Hashmi",
    category: "Senior",
    department: "Petroleum Engineering",
    designation: "Reservoir Engineer",
    mealType: "Breakfast",
    facility: "Main Camp Mess Hall",
    timestamp: "10:57 PM",
    date: "2026-11-03",
    status: "Verified"
  },
  {
    id: "MEAL-1001-001",
    employeeId: "AHP-1001",
    employeeName: "Tariq Al-Balushi",
    category: "Junior",
    department: "Field Operations",
    designation: "Rig Technician",
    mealType: "Lunch",
    facility: "Main Camp Mess Hall",
    timestamp: "09:48 PM",
    date: "2026-11-03",
    status: "Verified"
  },
  {
    id: "MEAL-1001-002",
    employeeId: "AHP-1001",
    employeeName: "Tariq Al-Balushi",
    category: "Junior",
    department: "Field Operations",
    designation: "Rig Technician",
    mealType: "Dinner",
    facility: "Main Camp Mess Hall",
    timestamp: "08:43 PM",
    date: "2026-11-03",
    status: "Verified"
  },
  {
    id: "MEAL-672713-827",
    employeeId: "AHP-1004",
    employeeName: "Mohammed Al-Harthy",
    category: "Junior",
    department: "Field Operations",
    designation: "Field Operator",
    mealType: "Dinner",
    facility: "Main Camp Mess Hall",
    timestamp: "09:07 PM",
    date: "2026-11-07",
    status: "Verified"
  }
];

async function seedMasterData() {
  console.log("Connecting to MongoDB Atlas...");
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db('al_haditha_catering');
    console.log("Connected to MongoDB Atlas!");

    // 1. Sync mealEntries collection
    const mealCol = db.collection('mealEntries');
    await mealCol.deleteMany({});
    await mealCol.insertMany(masterMealEntries);
    console.log(`✓ Inserted ${masterMealEntries.length} master meal entries into 'mealEntries' collection`);

    // 2. Sync events collection
    const eventsCol = db.collection('events');
    await eventsCol.deleteMany({});
    await eventsCol.insertOne(defaultAlHadithaEvent);
    console.log(`✓ Inserted default event into 'events' collection`);

    // 3. Update appState
    const stateCol = db.collection('appState');
    const existing = await stateCol.findOne({ _id: 'current_state' });

    const rawState = {
      ...(existing || {}),
      _id: 'current_state',
      mealEntries: masterMealEntries,
      events: [defaultAlHadithaEvent],
      updatedAt: new Date(),
    };

    const harmonized = harmonizeStateMetrics(rawState);
    await stateCol.updateOne(
      { _id: 'current_state' },
      { $set: harmonized },
      { upsert: true }
    );

    console.log("✓ Synchronized appState with harmonized metrics:");
    console.log("  Junior Eating:", harmonized.employeeOverview.junior.eating, `(${harmonized.employeeOverview.junior.percentage}%)`);
    console.log("  Senior Eating:", harmonized.employeeOverview.senior.eating, `(${harmonized.employeeOverview.senior.percentage}%)`);
    console.log("  VIP Eating:", harmonized.employeeOverview.vip.eating, `(${harmonized.employeeOverview.vip.percentage}%)`);
    console.log("  Wastage Consumed:", harmonized.wastageOverview.consumedMeals);
    console.log("  Events Count:", harmonized.events.length);

  } catch (err) {
    console.error("Error:", err);
  } finally {
    await client.close();
  }
}

seedMasterData();
