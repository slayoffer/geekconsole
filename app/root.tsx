import { cssBundleHref } from '@remix-run/css-bundle';
import styles from './styles.css';
import type { LinksFunction } from '@remix-run/node';
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from '@remix-run/react';

import { Header } from './widgets/Header';
import { Footer } from './widgets/Footer';

export const links: LinksFunction = () => [
  ...(cssBundleHref !== undefined
    ? [{ rel: 'stylesheet', href: cssBundleHref }]
    : []),
  {
    rel: 'stylesheet',
    href: styles,
  },
];

export default function App() {
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
      <body className="flex min-h-full flex-col justify-between">
        <Header />
        <main className="container mx-auto flex flex-col items-center p-10">
          <Outlet />
        </main>
        <Footer />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
