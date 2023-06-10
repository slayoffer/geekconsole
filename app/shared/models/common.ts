import { type Session, type SupabaseClient } from '@supabase/supabase-js';

export type OutletContextValues = {
  session: Session;
  supabase: SupabaseClient;
};

export type ErrorWithStatus = {
  status?: number | undefined;
} & Error;
