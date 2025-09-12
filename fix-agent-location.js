const mongoose = require('mongoose');
const Agent = require('./models/Agent');

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://sam:sam@cluster0.jx031pw.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

const fixAgentLocation = async () => {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB successfully!');

    console.log('🔧 Updating anand@gmail.com agent location...');
    
    // Update anand@gmail.com agent with proper location
    const result = await Agent.updateOne(
      { email: 'anand@gmail.com' },
      {
        $set: {
          location: 'Balangir',
          district: 'Balangir',
          state: 'Odisha',
          pincode: '756001'
        }
      }
    );

    console.log(`✅ Update completed! Modified ${result.modifiedCount} agent(s).`);

    // Verify the update
    const agent = await Agent.findOne({ email: 'anand@gmail.com' });
    console.log('\n📋 Updated agent data:');
    console.log('Name:', agent.name);
    console.log('Email:', agent.email);
    console.log('Location:', agent.location);
    console.log('District:', agent.district);
    console.log('State:', agent.state);
    console.log('Pincode:', agent.pincode);

  } catch (error) {
    console.error('❌ Update failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
};

fixAgentLocation();


