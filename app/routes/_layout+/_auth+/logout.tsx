import { type DataFunctionArgs, redirect } from '@remix-run/node';
import { authSessionStorage } from '~/app/core/server/index.ts';

export async function loader() {
	return redirect('/');
}

export async function action({ request }: DataFunctionArgs) {
	const cookieSession = await authSessionStorage.getSession(
		request.headers.get('cookie'),
	);

	return redirect('/', {
		headers: {
			'set-cookie': await authSessionStorage.destroySession(cookieSession),
		},
	});
}
