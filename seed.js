require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Detective = require('./models/Detective');
const Chief = require('./models/Chief');

// MongoDB Atlas Connection
const connectDB = async () => {
  try {
    const mongoURI = `mongodb+srv://${process.env.USER}:${process.env.PASS}@${process.env.NET}.mongodb.net/CTF?retryWrites=true&w=majority&${process.env.END}`;
    await mongoose.connect(mongoURI);
    console.log('MongoDB Atlas connected successfully to CTF database');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
};

async function seedDatabase() {
  // Connect to MongoDB Atlas first
  await connectDB();
  
  try {
    // Clear existing data
    await Detective.deleteMany({});
    await Chief.deleteMany({});
    console.log('Cleared existing data');

    // Create sample detectives
    const detectivePassword = await bcrypt.hash('detective123', 10);
    const detectives = [
      {
        username: 'detective1',
        password: detectivePassword
      },
      {
        username: 'detective2',
        password: detectivePassword
      },
      {
        username: 'detective3',
        password: detectivePassword
      }
    ];

    await Detective.insertMany(detectives);
    console.log('✓ Created sample detectives (username: detective1/detective2/detective3, password: detective123)');

    // Create sample chiefs
    const chiefPassword = await bcrypt.hash('chief123', 10);
    const chiefs = [
      {
        username: 'chief1',
        password: chiefPassword
      },
      {
        username: 'admin',
        password: chiefPassword
      }
    ];

    await Chief.insertMany(chiefs);
    console.log('✓ Created sample chiefs (username: chief1/admin, password: chief123)');

    console.log('\n=== Seeding Complete ===');
    console.log('\nDetective Accounts:');
    console.log('  Username: detective1, detective2, detective3');
    console.log('  Password: detective123');
    console.log('\nChief Accounts:');
    console.log('  Username: chief1, admin');
    console.log('  Password: chief123');

    mongoose.connection.close();
  } catch (error) {
    console.error('Error seeding database:', error);
    mongoose.connection.close();
  }
}

seedDatabase();
