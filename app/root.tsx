import { cssBundleHref } from '@remix-run/css-bundle';
import {
	type DataFunctionArgs,
	json,
	type LinksFunction,
} from '@remix-run/node';
import {
	Links,
	LiveReload,
	Meta,
	Outlet,
	Scripts,
	ScrollRestoration,
	useLoaderData,
} from '@remix-run/react';
import { type PropsWithChildren } from 'react';
import { AuthenticityTokenProvider } from 'remix-utils/csrf/react';

import { HoneypotProvider } from 'remix-utils/honeypot/react';
import { csrf, getEnv, honeypot } from './core/server/index.ts';
import fonts from './core/styles/fonts.css';
import twStyles from './core/styles/twStyles.css';
import { prisma } from './shared/lib/utils/index.ts';
import { GeneralErrorBoundary } from './shared/ui/index.ts';

export const links: LinksFunction = () => [
	...(cssBundleHref !== undefined
		? [{ rel: 'stylesheet', href: cssBundleHref }]
		: []),
	{
		rel: 'stylesheet',
		href: twStyles,
	},
	{ rel: 'stylesheet', href: fonts },
	{
		rel: 'icon',
		type: 'image/png',
		href: 'https://i.ibb.co/31W7B1y/Png-Item-1032462.png',
	},
];

export default function AppWithProviders() {
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
	const { ENV, userProfile } = useLoaderData<typeof loader>();

	return (
		<Document title="Geek Console">
			<Outlet context={{ userProfile }} />

			<script
				dangerouslySetInnerHTML={{
					__html: `window.ENV = ${JSON.stringify(ENV)}`,
				}}
			/>
		</Document>
	);
}

function Document({ children, title }: PropsWithChildren<{ title: string }>) {
	return (
		<html className="dark h-full overflow-x-hidden" lang="en">
			<head>
				<Meta />
				<Links />

				<meta charSet="utf-8" />
				<meta name="description" content="Your favourite geek storage" />
				<meta name="viewport" content="width=device-width,initial-scale=1" />

				<title>{title}</title>
			</head>
			<body className="flex h-full flex-col justify-between">
				{children}

				<ScrollRestoration />
				<Scripts />
				<LiveReload />
			</body>
		</html>
	);
}

export const loader = async ({ request }: DataFunctionArgs) => {
	const honeyProps = honeypot.getInputProps();
	const [csrfToken, csrfCookieHeader] = await csrf.commitToken(request);

	const supabaseEnv = {
		SUPABASE_URL: process.env.SUPABASE_API_URL,
		SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
	};

	const volodya = await prisma.user.findUnique({
		select: {
			name: true,
			username: true,
			email: true,
			createdAt: true,
			image: { select: { id: true, blob: true } },
		},
		where: {
			username: 'vVolodya',
		},
	});

	return json(
		{ ENV: getEnv(), honeyProps, csrfToken, supabaseEnv, userProfile: volodya },
		{
			headers: csrfCookieHeader
				? {
						'set-cookie': csrfCookieHeader,
				  }
				: {},
		},
	);
};

export function ErrorBoundary() {
	return (
		<Document title="Oops. Something went wrong">
			<GeneralErrorBoundary />
		</Document>
	);
}
