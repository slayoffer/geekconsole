import { type DataFunctionArgs } from '@remix-run/node';
import { authenticator, redirectWithToast } from '~/app/core/server/index.ts';

export async function loader({ request }: DataFunctionArgs) {
	const providerName = 'github';

	const profile = await authenticator.authenticate(providerName, request, {
		throwOnError: true,
	});

	console.log({ profile });

	throw await redirectWithToast('/login', {
		title: 'Auth Success (jk)',
		description: `You have successfully authenticated with GitHub (not really though...).`,
		type: 'success',
	});
}
