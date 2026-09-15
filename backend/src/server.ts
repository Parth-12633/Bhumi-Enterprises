import dotenv from 'dotenv';
import app from './app';
import connectDB from './config/db';
import User from './models/User';
import bcrypt from 'bcryptjs';

dotenv.config();

const startServer = async () => {
  await connectDB();

  // Auto-seed the 3 required users if the database is empty
  const userCount = await User.countDocuments();
  if (userCount === 0) {
    console.log('No users found in database. Auto-seeding initial users...');
    
    // Generate 3 different passwords
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

  const PORT = process.env.PORT || 5000;

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer();
