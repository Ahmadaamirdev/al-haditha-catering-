import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI || "mongodb+srv://musahere:jJ56wB0cd1naVLdT@cluster0.fsmczem.mongodb.net/al_haditha_catering?retryWrites=true&w=majority";

async function restoreAndHarmonize() {
  console.log("Connecting to MongoDB Atlas...");
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db('al_haditha_catering');
    console.log("Connected to MongoDB!");

    // 1. Get current state
    const stateCol = db.collection('appState');
    const state = await stateCol.findOne({ _id: 'current_state' });

    if (!state) {
      console.error("current_state not found!");
      return;
    }

    const mealEntries = state.mealEntries || [];
    console.log(`Found ${mealEntries.length} meal entries in state.`);

    // 2. Compute live counts from mealEntries
    const juniorCount = mealEntries.filter(m => (m.category || '').toLowerCase() === 'junior').length;
    const seniorCount = mealEntries.filter(m => (m.category || '').toLowerCase() === 'senior').length;
    const vipCount = mealEntries.filter(m => (m.category || '').toLowerCase() === 'vip').length;
    const totalConsumed = juniorCount + seniorCount + vipCount;
    const totalAllocated = state.wastageOverview?.totalAllocated || 300;

    console.log(`Live Counts -> Junior: ${juniorCount}, Senior: ${seniorCount}, VIP: ${vipCount}, Total: ${totalConsumed}`);

    const employeeOverview = {
      junior: {
        category: 'Junior',
        total: 40,
        eating: juniorCount,
        percentage: Math.min(100, Math.round((juniorCount / 40) * 100)),
        color: '#009B4D',
        bgColor: '#E5F5EC',
      },
      senior: {
        category: 'Senior',
        total: 40,
        eating: seniorCount,
        percentage: Math.min(100, Math.round((seniorCount / 40) * 100)),
        color: '#1684AA',
        bgColor: '#E7F2F9',
      },
      vip: {
        category: 'VIP',
        total: 20,
        eating: vipCount,
        percentage: Math.min(100, Math.round((vipCount / 20) * 100)),
        color: '#009B4D',
        bgColor: '#E5F5EC',
      },
    };

    const wastageOverview = {
      ...state.wastageOverview,
      consumedMeals: totalConsumed,
      consumptionPercentage: Math.min(100, Math.round((totalConsumed / totalAllocated) * 100)),
      wastedMeals: 0,
    };

    // 3. Restore event: "al haditha meeting"
    const eventObj = {
      id: 'EVT-1001',
      title: 'al haditha meeting',
      day: '20',
      month: 'Nov',
      fullDate: '2026-11-20',
      time: '18:00 - 21:00',
      location: 'Main Camp Mess Hall',
      description: 'Executive board and catering committee quarterly dinner.',
      category: 'VIP',
      status: 'Confirmed',
      statusType: 'success',
      invitedCount: 8,
      expectedCount: 8,
      perPersonBudget: 30,
      overallBudget: 240,
      menuChanged: false,
      menuDetails: 'Executive VIP Banquet: Grilled Lamb, Fresh Saffron Rice, Mezza and Arabic Sweets.',
      invitedEmployees: []
    };

    const events = (state.events && state.events.length > 0) ? state.events : [eventObj];

    // 4. Update events collection in MongoDB
    const eventsCol = db.collection('events');
    await eventsCol.deleteMany({});
    await eventsCol.insertMany(events);
    console.log(`Updated events collection with ${events.length} event(s).`);

    // 5. Update appState in MongoDB
    await stateCol.updateOne(
      { _id: 'current_state' },
      {
        $set: {
          employeeOverview,
          wastageOverview,
          events,
          updatedAt: new Date(),
        }
      }
    );

    console.log("✓ MongoDB state updated successfully with live counts and restored event!");

  } catch (err) {
    console.error("Error:", err);
  } finally {
    await client.close();
  }
}

restoreAndHarmonize();
