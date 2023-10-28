import { Outlet, useOutletContext } from '@remix-run/react';

import {
  Footer,
  GlobalLoading,
  Header,
} from '~/core/components/layoutComponents';
import { type OutletContextValues } from '~/shared/models/common';
import { Toaster } from '~/shared/ui';

export default function Layout() {
  const { session, supabase, userProfile } =
    useOutletContext<OutletContextValues>();

  return (
    <>
      <GlobalLoading />
      <Toaster />

      <Header />
      <main className="container mx-auto flex flex-col items-center p-10">
        <Outlet context={{ supabase, session, userProfile }} />
      </main>
      <Footer />
    </>
  );
}
