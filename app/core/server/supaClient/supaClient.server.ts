import { type CookieOptions } from '@remix-run/node';
import { createServerClient } from '@supabase/auth-helpers-remix';
import { type SupabaseClient } from '@supabase/supabase-js';

export const createSupabaseServerClient = (options: {
  request: Request;
  response: Response;
  options?: any;
  cookieOptions?: CookieOptions | undefined;
}): SupabaseClient => {
  const supabaseUrl = process.env.SUPABASE_API_URL ?? '';
  const supabaseKey = process.env.SUPABASE_ANON_KEY ?? '';

  const supaClient = createServerClient(supabaseUrl, supabaseKey, options);

  return supaClient;
};
