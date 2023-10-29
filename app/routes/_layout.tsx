import { Outlet, useOutletContext } from '@remix-run/react';

import {
  Footer,
  GlobalLoading,
  Header,
} from '~/core/components/layoutComponents/index.ts';
import { type OutletContextValues } from '~/shared/models/index.ts';
import { Toaster } from '~/shared/ui/index.ts';

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
