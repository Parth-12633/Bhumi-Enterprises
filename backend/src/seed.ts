import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import User from './models/User';
import connectDB from './config/db';

dotenv.config();

const seedUsers = async () => {
  try {
    await connectDB();
    
    await User.deleteMany();

    const pass1 = await bcrypt.hash('Ghanshyam@123', 10);
    const pass2 = await bcrypt.hash('Vipul@456', 10);
    const pass3 = await bcrypt.hash('Suresh@789', 10);

    const users = [
      {
        name: 'Father',
        username: 'Ghanshyam',
        passwordHash: pass1,
        role: 'OWNER'
      },
      {
        name: 'Friend 1',
        username: 'Vipul',
        passwordHash: pass2,
        role: 'OWNER'
      },
      {
        name: 'Friend 2',
        username: 'Suresh',
        passwordHash: pass3,
        role: 'OWNER'
      }
    ];

    await User.insertMany(users);

    console.log('Users seeded successfully');
    process.exit();
  } catch (error) {
    console.error('Error seeding users:', error);
    process.exit(1);
  }
};

seedUsers();
