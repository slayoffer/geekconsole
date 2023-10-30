import { type ActionFunctionArgs, json, redirect } from '@remix-run/node';
import invariant from 'tiny-invariant';

import { createSupabaseServerClient } from '~/core/server/index.ts';
import { SUCCESS_DELETE_COOKIE_NAME } from '~/shared/consts/index.ts';

export const action = async ({ request, params }: ActionFunctionArgs) => {
	invariant(params.bookId, 'Missing bookId param');

	const response = new Response();
	const supabaseClient = createSupabaseServerClient({ response, request });

	const { error } = await supabaseClient
		.from('books')
		.delete()
		.eq('id', params.bookId);

	if (error) return json({ error: error.message }, { status: 500 });

	return redirect('/books', {
		headers: {
			...response.headers,
			'Set-Cookie': SUCCESS_DELETE_COOKIE_NAME,
		},
	});
};
