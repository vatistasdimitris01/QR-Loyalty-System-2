
import { createClient } from '@supabase/supabase-js';

// FIX: Supabase constants were removed from config.ts during the migration to Neon PostgreSQL.
// This client is deprecated and remains only to satisfy legacy references without causing build errors.
const SUPABASE_URL = 'https://deprecated.supabase.co';
const SUPABASE_ANON_KEY = 'deprecated';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export default supabase;
