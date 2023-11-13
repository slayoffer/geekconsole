import { type DataFunctionArgs } from '@remix-run/node';
import {
	ProviderNameSchema,
	providerLabels,
} from '~/app/core/components/providers/index.ts';
import {
	authenticator,
	getUserId,
	prisma,
	redirectWithToast,
} from '~/app/core/server/index.ts';

export async function loader({ request, params }: DataFunctionArgs) {
	const providerName = ProviderNameSchema.parse(params.provider);

	const label = providerLabels[providerName];

	const profile = await authenticator
		.authenticate(providerName, request, { throwOnError: true })
		.catch(async (error) => {
			console.error(error);

			throw await redirectWithToast('/login', {
				type: 'error',
				title: 'Auth Failed',
				description: `There was an error authenticating with ${label}.`,
			});
		});

	const existingConnection = await prisma.connection.findUnique({
		select: { userId: true },
		where: {
			providerName_providerId: { providerName, providerId: profile.id },
		},
	});

	const userId = await getUserId(request);

	if (existingConnection && userId) {
		throw await redirectWithToast('/settings/profile/connections', {
			title: 'Already Connected',
			description:
				existingConnection.userId === userId
					? `Your "${profile.username}" ${label} account is already connected.`
					: `The "${profile.username}" ${label} account is already connected to another account.`,
		});
	}

	throw await redirectWithToast('/login', {
		title: 'Auth Success (jk)',
		description: `You have successfully authenticated with ${label} (not really though...).`,
		type: 'success',
	});
}
