const mongoose = require('mongoose');
const Agent = require('./models/Agent');

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://sam:sam@cluster0.jx031pw.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

const migrateAgents = async () => {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB successfully!');

    console.log('🔄 Updating existing agents with default location values...');
    
    // Update all agents that don't have the new location fields
    const result = await Agent.updateMany(
      {
        $or: [
          { district: { $exists: false } },
          { state: { $exists: false } },
          { pincode: { $exists: false } }
        ]
      },
      {
        $set: {
          district: 'Not specified',
          state: 'Not specified',
          pincode: '000000'
        }
      }
    );

    console.log(`✅ Migration completed! Updated ${result.modifiedCount} agents.`);

    // List all agents to verify
    const agents = await Agent.find({}, { name: 1, email: 1, location: 1, district: 1, state: 1, pincode: 1 });
    console.log('\n📋 Current agents:');
    agents.forEach(agent => {
      console.log(`- ${agent.name} (${agent.email}) - ${agent.location}, ${agent.district}, ${agent.state}, ${agent.pincode}`);
    });

  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
};

migrateAgents();


