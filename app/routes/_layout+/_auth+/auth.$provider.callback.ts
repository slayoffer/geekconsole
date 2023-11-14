import { redirect, type DataFunctionArgs } from '@remix-run/node';
import {
	ProviderNameSchema,
	providerLabels,
} from '~/app/core/components/providers/index.ts';
import {
	authenticator,
	getSessionExpirationDate,
	getUserId,
	prisma,
	redirectWithToast,
	verifySessionStorage,
} from '~/app/core/server/index.ts';
import { handleNewSession } from './login.tsx';
import {
	ONBOARDING_EMAIL_SESSION_KEY,
	PROVIDER_ID_KEY,
	PREFILLED_PROFILE_KEY,
} from './onboarding_.$provider.tsx';

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

	if (existingConnection) {
		const session = await prisma.session.create({
			select: { id: true, expirationDate: true, userId: true },
			data: {
				expirationDate: getSessionExpirationDate(),
				userId: existingConnection.userId,
			},
		});

		return handleNewSession({ request, session, remember: true });
	}

	const verifySession = await verifySessionStorage.getSession(
		request.headers.get('cookie'),
	);
	verifySession.set(ONBOARDING_EMAIL_SESSION_KEY, profile.email);
	verifySession.set(PREFILLED_PROFILE_KEY, {
		...profile,
		username: profile.username
			?.replace(/[^a-zA-Z0-9_]/g, '_')
			.toLowerCase()
			.slice(0, 20)
			.padEnd(3, '_'),
	});
	verifySession.set(PROVIDER_ID_KEY, profile.id);

	return redirect(`/onboarding/${providerName}`, {
		headers: {
			'set-cookie': await verifySessionStorage.commitSession(verifySession),
		},
	});
}
