import serverless from 'serverless-http';
import app from './app';
import connectDB from './config/db';

let dbConnected = false;

// We need a small wrapper to ensure the DB connects when the serverless function wakes up
export const handler = serverless(app, {
  request: async (request: any, event: any, context: any) => {
    if (!dbConnected) {
      await connectDB();
      dbConnected = true;
    }
  }
});
