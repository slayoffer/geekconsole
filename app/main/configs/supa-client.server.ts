import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_API_URL ?? '';
const supabaseKey = process.env.SUPABASE_ANON_KEY ?? '';

export const supaClient = createClient(supabaseUrl, supabaseKey);
