import { neon } from '@neondatabase/serverless';
import { DATABASE_URL } from '../config';

if (!DATABASE_URL) {
  throw new Error("DATABASE_URL is required in config.ts");
}

// Create the SQL client for browser-based HTTP queries
const sql = neon(DATABASE_URL);

export default sql;