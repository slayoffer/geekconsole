import { Outlet } from '@remix-run/react';

import { Footer, Header } from '~/core/components/layout';

export default function Layout() {
  return (
    <>
      <Header />
      <main className="container mx-auto flex flex-col items-center p-10">
        {<Outlet />}
      </main>
      <Footer />
    </>
  );
}
