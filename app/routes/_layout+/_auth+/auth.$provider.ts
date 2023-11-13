import { redirect, type DataFunctionArgs } from '@remix-run/node';
import { ProviderNameSchema } from '~/app/core/components/providers/index.ts';
import { authenticator, handleMockAction } from '~/app/core/server/index.ts';

export async function loader() {
	return redirect('/login');
}

export async function action({ request, params }: DataFunctionArgs) {
	const providerName = ProviderNameSchema.parse(params.provider);

	await handleMockAction(providerName, request);

	return await authenticator.authenticate(providerName, request);
}
