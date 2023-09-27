import { redirect, type LoaderFunctionArgs } from '@remix-run/node';

import { createSupabaseServerClient } from '~/core/server';

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const response = new Response();
  const url = new URL(request.url);
  const code = url.searchParams.get('code');

  if (code !== null) {
    const supabaseClient = createSupabaseServerClient({ response, request });
    await supabaseClient.auth.exchangeCodeForSession(code);
  }

  return redirect('/', {
    headers: response.headers,
  });
};
