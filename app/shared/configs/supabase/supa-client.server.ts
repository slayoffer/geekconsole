import { type SupabaseClient, createClient } from '@supabase/supabase-js';

const globalAny: any = global;

const supabaseUrl = process.env.SUPABASE_API_URL ?? '';
const supabaseKey = process.env.SUPABASE_ANON_KEY ?? '';

let supaClient: SupabaseClient;

if (process.env.NODE_ENV === 'production') {
  supaClient = createClient(supabaseUrl, supabaseKey);
} else {
  if (globalAny.db === undefined) {
    globalAny.db = createClient(supabaseUrl, supabaseKey);
  }
  console.log('DB SUCCESSFULLY CONNECTED');

  supaClient = globalAny.db;
}

export { supaClient };
