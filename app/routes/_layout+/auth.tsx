import {
	type DataFunctionArgs,
	json,
	redirect,
	type MetaFunction,
} from '@remix-run/node';

import { AuthForm } from '~/core/components/authComponents/index.ts';
import {
	createSupabaseServerClient,
	validateCredentials,
} from '~/core/server/index.ts';
import { invariantResponse } from '~/shared/lib/utils/index.ts';
import { GeneralErrorBoundary } from '~/shared/ui/index.ts';

export const meta: MetaFunction = () => {
	return [{ title: 'Welcome, friend!' }];
};

export default function Auth() {
	return (
		<div className="flex h-full items-center justify-center">
			<AuthForm />
		</div>
	);
}

export const loader = async ({ request }: DataFunctionArgs) => {
	const response = new Response();

	const supabaseClient = createSupabaseServerClient({ response, request });

	const {
		data: { session },
	} = await supabaseClient.auth.getSession();

	if (session) return redirect('/');

	return json({ ok: true });
};

export const action = async ({ request }: DataFunctionArgs) => {
	const { searchParams } = new URL(request.url);
	const authMode = searchParams.get('type');

	const formData = await request.formData();

	const credentials = {
		email: formData.get('email') as string,
		password: formData.get('password') as string,
	};

	if (authMode === 'register') {
		const errors = validateCredentials(credentials);
		if (errors !== undefined) return errors;
	}

	const response = new Response();
	const supabaseClient = createSupabaseServerClient({ response, request });

	if (authMode === 'register') {
		const { data, error } = await supabaseClient.auth.signUp(credentials);

		if (error !== null) {
			return json(error.message, { status: 400 });
		}

		const { error: insertError } = await supabaseClient
			.from('user_profiles')
			.insert([
				{
					id: data.user!.id,
					username: data.user!.email!,
					email: data.user!.email,
				},
			]);

		invariantResponse(!insertError, insertError?.message, { status: 500 });

		return redirect('/auth?type=signin', { headers: response.headers });
	} else {
		const { error } = await supabaseClient.auth.signInWithPassword(credentials);

		if (error !== null) {
			return json(error.message, { status: 400 });
		}

		return redirect('/books', { headers: response.headers });
	}
};

export function ErrorBoundary() {
	return (
		<GeneralErrorBoundary
			statusHandlers={{
				500: () => (
					<p>
						Shoot. Something bad happened on our side. Sorry. Try again later
					</p>
				),
			}}
			unexpectedErrorHandler={() => <div>Error trying to log in. Sorry</div>}
		/>
	);
}
