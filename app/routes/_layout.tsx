import { Outlet, useOutletContext } from '@remix-run/react';

import {
	Footer,
	GlobalLoading,
	Header,
} from '~/app/core/components/layoutComponents/index.ts';
import { type OutletContextValues } from '~/app/shared/models/index.ts';
import { CustomToaster } from '~/app/shared/ui/index.ts';

export default function Layout() {
	const { user, toast } = useOutletContext<OutletContextValues>();

	return (
		<>
			<Header />
			<main className="container mx-auto flex flex-col items-center p-10">
				<Outlet context={{ user }} />
			</main>
			<Footer />

			<GlobalLoading />

			<CustomToaster toast={toast} />
		</>
	);
}
