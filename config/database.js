require('dotenv').config();
const mongoose = require('mongoose');

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

module.exports = connectDB;
