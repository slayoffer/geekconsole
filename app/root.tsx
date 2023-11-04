import { parse } from '@conform-to/zod';
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
	useFetchers,
	useLoaderData,
} from '@remix-run/react';
import { type PropsWithChildren } from 'react';
import { AuthenticityTokenProvider } from 'remix-utils/csrf/react';

import { HoneypotProvider } from 'remix-utils/honeypot/react';
import {
	type Theme,
	csrf,
	getEnv,
	honeypot,
	setTheme,
	getTheme,
} from './core/server/index.ts';
import fonts from './core/styles/fonts.css';
import twStyles from './core/styles/twStyles.css';
import { invariantResponse, prisma } from './shared/lib/utils/index.ts';
import { ThemeFormSchema } from './shared/schemas/index.ts';
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
	const theme = useTheme();

	return (
		<Document title="Geek Console" theme={theme}>
			<Outlet context={{ userProfile, theme }} />

			<script
				dangerouslySetInnerHTML={{
					__html: `window.ENV = ${JSON.stringify(ENV)}`,
				}}
			/>
		</Document>
	);
}

function Document({
	children,
	title,
	theme,
}: PropsWithChildren<{ title: string; theme?: Theme }>) {
	return (
		<html className={`${theme} h-full overflow-x-hidden`} lang="en">
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

export async function action({ request }: DataFunctionArgs) {
	const formData = await request.formData();

	invariantResponse(
		formData.get('intent') === 'update-theme',
		'Invalid intent',
		{ status: 400 },
	);

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
		{
			ENV: getEnv(),
			honeyProps,
			csrfToken,
			supabaseEnv,
			theme: getTheme(request),
			userProfile: volodya,
		},
		{
			headers: csrfCookieHeader
				? {
						'set-cookie': csrfCookieHeader,
				  }
				: {},
		},
	);
};

export function useTheme() {
	const data = useLoaderData<typeof loader>();

	const fetchers = useFetchers();
	const themeFetcher = fetchers.find(
		(fetcher) => fetcher.formData?.get('intent') === 'update-theme',
	);

	const optimisticTheme = themeFetcher?.formData?.get('theme');

	if (optimisticTheme === 'light' || optimisticTheme === 'dark') {
		return optimisticTheme;
	}

	return data.theme;
}

export function ErrorBoundary() {
	return (
		<Document title="Oops. Something went wrong">
			<GeneralErrorBoundary />
		</Document>
	);
}
