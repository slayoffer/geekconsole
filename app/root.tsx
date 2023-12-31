import { parse } from '@conform-to/zod';
import { cssBundleHref } from '@remix-run/css-bundle';
import {
	type HeadersFunction,
	type LoaderFunctionArgs,
	type ActionFunctionArgs,
	json,
	type LinksFunction,
} from '@remix-run/node';
import {
	type MetaFunction,
	Links,
	LiveReload,
	Meta,
	Outlet,
	Scripts,
	ScrollRestoration,
	useLoaderData,
} from '@remix-run/react';
import { withSentry } from '@sentry/remix';
import { type PropsWithChildren } from 'react';
import { AuthenticityTokenProvider } from 'remix-utils/csrf/react';

import { HoneypotProvider } from 'remix-utils/honeypot/react';
import { href as iconsHref } from '~/app/shared/ui/Icons/Icon.tsx';
import {
	type Theme,
	csrf,
	getEnv,
	honeypot,
	setTheme,
	getTheme,
	prisma,
	getToast,
	getUserId,
	makeTimings,
	time,
	logout,
	getConfetti,
} from './core/server/index.ts';
import fonts from './core/styles/fonts.css';
import twStyles from './core/styles/twStyles.css';
import { ClientHintCheck, getHints, useNonce } from './core/utils/index.ts';
import { useTheme } from './shared/lib/hooks/index.ts';
import { combineHeaders, getDomainUrl } from './shared/lib/utils/index.ts';
import { ThemeFormSchema } from './shared/schemas/index.ts';
import { GeneralErrorBoundary } from './shared/ui/index.ts';

export const links: LinksFunction = () =>
	[
		// Preload svg sprite as a resource to avoid render blocking
		{ rel: 'preload', href: iconsHref, as: 'image' },
		// Preload CSS as a resource to avoid render blocking
		{
			rel: 'preload',
			href: twStyles,
			as: 'style',
		},
		{ rel: 'preload', href: fonts, as: 'style' },
		cssBundleHref ? { rel: 'preload', href: cssBundleHref, as: 'style' } : null,
		{
			rel: 'icon',
			type: 'image/png',
			href: 'https://i.ibb.co/31W7B1y/Png-Item-1032462.png',
		},
		{
			rel: 'stylesheet',
			href: twStyles,
		},
		{ rel: 'stylesheet', href: fonts },
		cssBundleHref ? { rel: 'stylesheet', href: cssBundleHref } : null,
	].filter(Boolean);

export default withSentry(AppWithProviders);

function AppWithProviders() {
	const { honeyProps, csrfToken } = useLoaderData<typeof loader>();

	return (
		<AuthenticityTokenProvider token={csrfToken}>
			<HoneypotProvider {...honeyProps}>
				<App />
			</HoneypotProvider>
		</AuthenticityTokenProvider>
	);
}

function App() {
	const { ENV } = useLoaderData<typeof loader>();

	const theme = useTheme();
	const nonce = useNonce();

	return (
		<Document nonce={nonce} theme={theme}>
			<Outlet />

			<script
				nonce={nonce}
				dangerouslySetInnerHTML={{
					__html: `window.ENV = ${JSON.stringify(ENV)}`,
				}}
			/>
		</Document>
	);
}

function Document({
	children,
	nonce,
	theme,
}: PropsWithChildren<{ nonce: string; theme?: Theme }>) {
	return (
		<html className={`${theme} h-full overflow-x-hidden`} lang="en">
			<head>
				<ClientHintCheck nonce={nonce} />
				<Meta />
				<Links />

				<meta charSet="utf-8" />
				<meta name="description" content="Your favourite geek storage" />
				<meta name="viewport" content="width=device-width,initial-scale=1" />
			</head>
			<body className="flex h-full flex-col justify-between bg-background text-foreground">
				{children}

				<ScrollRestoration nonce={nonce} />
				<Scripts nonce={nonce} />
				<LiveReload nonce={nonce} />
			</body>
		</html>
	);
}

export async function action({ request }: ActionFunctionArgs) {
	const formData = await request.formData();

	const submission = parse(formData, {
		schema: ThemeFormSchema,
	});

	if (submission.intent !== 'submit') {
		return json({ status: 'success', submission } as const);
	}

	if (!submission.value) {
		return json({ status: 'error', submission } as const, { status: 400 });
	}

	const { theme } = submission.value;

	const responseInit = {
		headers: { 'set-cookie': setTheme(theme) },
	};

	return json({ success: true, submission }, responseInit);
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
	const timings = makeTimings('root loader');
	const userId = await time(() => getUserId(request), {
		timings,
		type: 'getUserId',
		desc: 'getUserId in root',
	});

	const user = userId
		? await time(
				() =>
					prisma.user.findUniqueOrThrow({
						select: {
							id: true,
							name: true,
							username: true,
							email: true,
							image: { select: { id: true } },
							roles: {
								select: {
									name: true,
									permissions: {
										select: { entity: true, action: true, access: true },
									},
								},
							},
						},
						where: { id: userId },
					}),
				{ timings, type: 'find user', desc: 'find user in root' },
		  )
		: null;

	if (userId && !user) {
		console.info('something weird happened');
		// something weird happened... The user is authenticated but we can't find
		// them in the database. Maybe they were deleted? Let's log them out.
		await logout({ request, redirectTo: '/' });
	}

	const { toast, headers: toastHeaders } = await getToast(request);
	const { confettiId, headers: confettiHeaders } = getConfetti(request);
	const honeyProps = honeypot.getInputProps();
	const [csrfToken, csrfCookieHeader] = await csrf.commitToken();

	return json(
		{
			user,
			requestInfo: {
				hints: getHints(request),
				origin: getDomainUrl(request),
				path: new URL(request.url).pathname,
				userPrefs: {
					theme: getTheme(request),
				},
			},
			ENV: getEnv(),
			toast,
			confettiId,
			honeyProps,
			csrfToken,
		},
		{
			headers: combineHeaders(
				{ 'Server-Timing': timings.toString() },
				toastHeaders,
				confettiHeaders,
				csrfCookieHeader ? { 'set-cookie': csrfCookieHeader } : null,
			),
		},
	);
};

export const headers: HeadersFunction = ({ loaderHeaders }) => {
	const headers = {
		'Server-Timing': loaderHeaders.get('Server-Timing') ?? '',
	};

	return headers;
};

export const meta: MetaFunction<typeof loader> = ({ data }) => {
	return [
		{ title: data ? 'Geek Console' : 'Error | Geek Console' },
		{ name: 'description', content: `Your favourite geek storage` },
	];
};

export function ErrorBoundary() {
	// the nonce doesn't rely on the loader so we can access that
	const nonce = useNonce();

	// NOTE: you cannot use useLoaderData in an ErrorBoundary because the loader
	// likely failed to run so we have to do the best we can.
	// We could probably do better than this (it's possible the loader did run).
	// This would require a change in Remix.

	// Just make sure your root route never errors out and you'll always be able
	// to give the user a better UX.

	return (
		<Document nonce={nonce}>
			<GeneralErrorBoundary />
		</Document>
	);
}
