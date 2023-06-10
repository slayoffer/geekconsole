import { Outlet, useOutletContext } from '@remix-run/react';

import { Footer, Header } from '~/core/components/layout';
import { type OutletContextValues } from '~/shared/models/common';

export default function Layout() {
  const { session, supabase } = useOutletContext<OutletContextValues>();

  return (
    <>
      <Header />
      <main className="container mx-auto flex flex-col items-center p-10">
        {<Outlet context={{ supabase, session }} />}
      </main>
      <Footer />
    </>
  );
}
