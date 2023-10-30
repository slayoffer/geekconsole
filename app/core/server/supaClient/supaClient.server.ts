import { type CookieOptions } from '@remix-run/node';
import { createServerClient } from '@supabase/auth-helpers-remix';
import { type SupabaseClient } from '@supabase/supabase-js';

import { type Database } from '~/shared/types/index.ts';

export const createSupabaseServerClient = (options: {
	request: Request;
	response: Response;
	options?: any;
	cookieOptions?: CookieOptions | undefined;
}): SupabaseClient<Database> => {
	const supabaseUrl = process.env.SUPABASE_API_URL ?? '';
	const supabaseKey = process.env.SUPABASE_ANON_KEY ?? '';

	const supaClient = createServerClient<Database>(
		supabaseUrl,
		supabaseKey,
		options,
	);

	return supaClient;
};

export const getSession = async (request: Request) => {
	const response = new Response();

	const supabaseClient = createSupabaseServerClient({
		response,
		request,
	});

	const {
		data: { session },
	} = await supabaseClient.auth.getSession();

	return { supabaseClient, session };
};
