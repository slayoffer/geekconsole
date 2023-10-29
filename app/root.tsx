import { cssBundleHref } from '@remix-run/css-bundle';
import {
	type DataFunctionArgs,
	json,
	type LinksFunction,
} from '@remix-run/node';
import {
	isRouteErrorResponse,
	Links,
	LiveReload,
	Meta,
	Outlet,
	Scripts,
	ScrollRestoration,
	useLoaderData,
	useRevalidator,
	useRouteError,
} from '@remix-run/react';
import { createBrowserClient } from '@supabase/auth-helpers-remix';
import { useEffect, useMemo, type PropsWithChildren } from 'react';

import { createSupabaseServerClient, getEnv } from './core/server/index.ts';
import fonts from './core/styles/fonts.css';
import styles from './core/styles/styles.css';
import { type Database } from './shared/types/index.ts';

export const links: LinksFunction = () => [
	...(cssBundleHref !== undefined
		? [{ rel: 'stylesheet', href: cssBundleHref }]
		: []),
	{
		rel: 'stylesheet',
		href: styles,
	},
	{ rel: 'stylesheet', href: fonts },
	{
		rel: 'icon',
		type: 'image/png',
		href: 'https://i.ibb.co/31W7B1y/Png-Item-1032462.png',
	},
];

function Document({ children, title }: PropsWithChildren<{ title: string }>) {
	const data = useLoaderData<typeof loader>();

	return (
		<html className="dark h-full" lang="en">
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

				<script
					dangerouslySetInnerHTML={{
						__html: `window.ENV = ${JSON.stringify(data.ENV)}`,
					}}
				/>
			</body>
		</html>
	);
}

export default function App() {
	const { supabaseEnv, session, userProfile } = useLoaderData<typeof loader>();
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
		</Document>
	);
}

export const loader = async ({ request }: DataFunctionArgs) => {
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
		{ ENV: getEnv(), supabaseEnv, session, userProfile },
		{ headers: response.headers },
	);
};

export function ErrorBoundary() {
	const error = useRouteError();

	if (isRouteErrorResponse(error)) {
		return (
			<Document title={`${error.status} ${error.statusText}`}>
				<div>
					<h1>
						{error.status} {error.statusText}
					</h1>
				</div>
			</Document>
		);
	}

	const errorMessage = error instanceof Error ? error.message : 'Unknown error';

	return (
		<Document title="Ooops. Something went wrong">
			<div>
				<h1>App Error</h1>
				<pre>{errorMessage}</pre>
			</div>
		</Document>
	);
}
