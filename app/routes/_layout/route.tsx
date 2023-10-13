import { Outlet, useOutletContext } from '@remix-run/react';

import { type OutletContextValues } from '~/shared/models/common';
import { Toaster } from '~/shared/ui';
import { Footer, GlobalLoading, Header } from './components';

export default function Layout() {
  const { session, supabase } = useOutletContext<OutletContextValues>();

  return (
    <>
      <GlobalLoading />
      <Toaster />

      <Header />
      <main className="container mx-auto flex flex-col items-center p-10">
        <Outlet context={{ supabase, session }} />
      </main>
      <Footer />
    </>
  );
}
