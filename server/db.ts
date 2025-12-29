import { MongoClient, Db } from 'mongodb';

if (!process.env.MONGODB_URI) {
  throw new Error(
    "MONGODB_URI must be set. Did you forget to add your MongoDB connection string?",
  );
}

const client = new MongoClient(process.env.MONGODB_URI);

let db: Db;

export async function connectDB(): Promise<Db> {
  if (db) {
    return db;
  }

  try {
    await client.connect();
    db = client.db();
    console.log('✓ Connected to MongoDB');
    return db;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
}

export function getDB(): Db {
  if (!db) {
    throw new Error('Database not connected. Call connectDB() first.');
  }
  return db;
}
