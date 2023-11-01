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
	useRevalidator,
} from '@remix-run/react';
import { createBrowserClient } from '@supabase/auth-helpers-remix';
import { useEffect, useMemo, type PropsWithChildren } from 'react';

import { HoneypotProvider } from 'remix-utils/honeypot/react';
import {
	createSupabaseServerClient,
	csrf,
	getEnv,
	honeypot,
} from './core/server/index.ts';
import fonts from './core/styles/fonts.css';
import twStyles from './core/styles/twStyles.css';
import { type Database } from './shared/types/index.ts';
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
	const { honeyProps } = useLoaderData<typeof loader>();

	return (
		<HoneypotProvider {...honeyProps}>
			<App />
		</HoneypotProvider>
	);
}

function App() {
	const { ENV, supabaseEnv, session, userProfile } =
		useLoaderData<typeof loader>();
	const { revalidate } = useRevalidator();

	const supabase = useMemo(() => {
		return createBrowserClient<Database>(
			supabaseEnv.SUPABASE_URL!,
			supabaseEnv.SUPABASE_ANON_KEY!,
		);
	}, [supabaseEnv.SUPABASE_URL, supabaseEnv.SUPABASE_ANON_KEY]);

	const serverAccessToken = session?.access_token;

	useEffect(() => {
		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange((_, session) => {
			if (session?.access_token !== serverAccessToken) revalidate();
		});

		return () => {
			subscription.unsubscribe();
		};
	}, [serverAccessToken, supabase, revalidate]);

	return (
		<Document title="Geek Console">
			<Outlet context={{ supabase, session, userProfile }} />

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

	const response = new Response();

	const supabaseClient = createSupabaseServerClient({ response, request });

	const {
		data: { session },
	} = await supabaseClient.auth.getSession();

	const { data: userProfile } = await supabaseClient
		.from('user_profiles')
		.select('*')
		.eq('id', session?.user.id ?? '')
		.single();

	return json(
		{ ENV: getEnv(), honeyProps, csrfToken, supabaseEnv, session, userProfile },
		{
			headers: {
				...response.headers,
				'set-cookie': csrfCookieHeader ? csrfCookieHeader : '',
			},
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
