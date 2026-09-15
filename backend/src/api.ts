import serverless from 'serverless-http';
import app from './app';
import connectDB from './config/db';
import User from './models/User';
import bcrypt from 'bcryptjs';

let dbConnected = false;

// We need a small wrapper to ensure the DB connects when the serverless function wakes up
export const handler = serverless(app, {
  request: async (request: any, event: any, context: any) => {
    if (!dbConnected) {
      await connectDB();
      
      // Auto-seed the 3 required users if the remote database is empty
      const userCount = await User.countDocuments();
      if (userCount === 0) {
        console.log('No users found in database. Auto-seeding initial users...');
        const pass1 = await bcrypt.hash('Ghanshyam@123', 10);
        const pass2 = await bcrypt.hash('Vipul@456', 10);
        const pass3 = await bcrypt.hash('Suresh@789', 10);

        await User.insertMany([
          { name: 'Father', username: 'Ghanshyam', passwordHash: pass1, role: 'OWNER' },
          { name: 'Friend 1', username: 'Vipul', passwordHash: pass2, role: 'OWNER' },
          { name: 'Friend 2', username: 'Suresh', passwordHash: pass3, role: 'OWNER' }
        ]);
        console.log('Users seeded successfully!');
      }
      
      dbConnected = true;
    }
  }
});
