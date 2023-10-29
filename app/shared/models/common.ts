import { type Session, type SupabaseClient } from '@supabase/supabase-js';

import type { UserProfile } from '../types/index.ts';

export type OutletContextValues = {
  session: Session;
  supabase: SupabaseClient;
  userProfile: UserProfile;
};

export type ErrorWithStatus = {
  status?: number | undefined;
} & Error;
