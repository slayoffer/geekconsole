import { Outlet, useRouteLoaderData } from '@remix-run/react';

import {
	Footer,
	Header,
	LogoutTimer,
} from '~/app/core/components/layoutComponents/index.ts';
import { type loader as rootLoader } from '~/app/root.tsx';
import { useOptionalUser } from '~/app/shared/lib/hooks/index.ts';
import { Confetti, CustomToaster, ProgressBar } from '~/app/shared/ui/index.ts';

export default function Layout() {
	const data = useRouteLoaderData<typeof rootLoader>('root');
	const maybeUser = useOptionalUser();

	return (
		<>
			<Header />
			<main className="container mx-auto flex flex-col items-center p-10">
				<Outlet />
			</main>
			<Footer />

			<ProgressBar />
			<CustomToaster toast={data?.toast ?? null} />
			<Confetti id={data?.confettiId} />

			{maybeUser ? <LogoutTimer /> : null}
		</>
	);
}
