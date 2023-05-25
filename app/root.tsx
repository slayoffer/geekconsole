import { useState } from 'react';

import { cssBundleHref } from '@remix-run/css-bundle';
import { json, type LinksFunction } from '@remix-run/node';
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from '@remix-run/react';
import { createBrowserClient } from '@supabase/auth-helpers-remix';

import styles from './styles.css';

export default function App() {
  const { env } = useLoaderData();

  const [supabase] = useState(() =>
    createBrowserClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY),
  );

  return (
    <html className="dark h-full" lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Meta />
        <link
          rel="icon"
          type="image/png"
          href="https://i.ibb.co/31W7B1y/Png-Item-1032462.png"
        />
        <Links />
      </head>
      <body className="flex h-full flex-col justify-between">
        <Outlet context={{ supabase }} />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}

export const links: LinksFunction = () => [
  ...(cssBundleHref !== undefined
    ? [{ rel: 'stylesheet', href: cssBundleHref }]
    : []),
  {
    rel: 'stylesheet',
    href: styles,
  },
];

export const loader = () => {
  const env = {
    SUPABASE_URL: process.env.SUPABASE_API_URL,
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
  };

  return json({ env });
};
