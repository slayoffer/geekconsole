import type { PropsWithChildren } from 'react';
import { useEffect, useMemo } from 'react';
import { cssBundleHref } from '@remix-run/css-bundle';
import { json } from '@remix-run/node';
import type { LinksFunction, LoaderFunctionArgs } from '@remix-run/node';
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

import { createSupabaseServerClient } from './core/server';
import type { Database } from './shared/types';
import styles from './styles.css';

export const links: LinksFunction = () => [
  ...(cssBundleHref !== undefined
    ? [{ rel: 'stylesheet', href: cssBundleHref }]
    : []),
  {
    rel: 'stylesheet',
    href: styles,
  },
  {
    rel: 'icon',
    type: 'image/png',
    href: 'https://i.ibb.co/31W7B1y/Png-Item-1032462.png',
  },
];

function Document({ children, title }: PropsWithChildren<{ title: string }>) {
  return (
    <html className="dark h-full" lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Meta />
        <Links />
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

export default function App() {
  const { env, session, userProfile } = useLoaderData<any>();
  const { revalidate } = useRevalidator();

  const supabase = useMemo(() => {
    return createBrowserClient<Database>(
      env.SUPABASE_URL,
      env.SUPABASE_ANON_KEY,
    );
  }, [env.SUPABASE_URL, env.SUPABASE_ANON_KEY]);

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
    <Document title="Your favourite geek storage">
      <Outlet context={{ supabase, session, userProfile }} />
    </Document>
  );
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const env = {
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

  return json({ env, session, userProfile }, { headers: response.headers });
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
