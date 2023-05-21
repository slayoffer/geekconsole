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

import { Flowbite } from 'flowbite-react';
import { theme } from './main/configs/theme';

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
    <html className="h-full" lang="en">
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
      <Flowbite theme={{ theme }}>
        <body className="min-h-full flex flex-col justify-between bg-[#1c1c1c]">
          <Header />
          <main className="container mx-auto flex flex-col items-center p-10">
            <Outlet />
          </main>
          <Footer />
          <ScrollRestoration />
          <Scripts />
          <LiveReload />
        </body>
      </Flowbite>
    </html>
  );
}
