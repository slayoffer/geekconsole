import { Outlet } from '@remix-run/react';

import { Footer } from '~/widgets/Footer';
import { Header } from '~/widgets/Header';

export default function Index() {
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
