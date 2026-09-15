import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoServer: MongoMemoryServer;

const connectDB = async () => {
  try {
    let uri = process.env.MONGODB_URI as string;

    // If testing locally without a real MongoDB server, we spin up an in-memory one automatically!
    if (process.env.USE_LOCAL_TEST_DB === 'true') {
      console.log('Starting Local Testing In-Memory MongoDB...');
      mongoServer = await MongoMemoryServer.create();
      uri = mongoServer.getUri();
    }

    const conn = await mongoose.connect(uri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error: any) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
