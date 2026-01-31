// ----------------------------------------------------------------
// DATABASE CONFIGURATION
// ----------------------------------------------------------------
// This application uses Neon.tech PostgreSQL.
//
// WARNING: In a production environment, never expose your 
// connection string (which contains your password) in the frontend.
// Use a backend API layer to handle database interactions securely.

export const DATABASE_URL = 'postgresql://neondb_owner:npg_Mgerhfk4mD8u@ep-late-tooth-ahd1ook0-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

// Supabase exports removed as we've migrated to standard PSQL via Neon
