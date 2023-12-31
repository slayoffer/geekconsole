import { Outlet, useRouteLoaderData } from '@remix-run/react';

import {
	Footer,
	Header,
	LogoutTimer,
	ProgressBar,
	Confetti,
	useToast,
} from '~/app/core/components/layoutComponents/index.ts';
import { type loader as rootLoader } from '~/app/root.tsx';
import { useOptionalUser, useTheme } from '~/app/shared/lib/hooks/index.ts';
import { GeekToaster } from '~/app/shared/ui';

export default function Layout() {
	const data = useRouteLoaderData<typeof rootLoader>('root');
	const maybeUser = useOptionalUser();
	const theme = useTheme();
	useToast(data?.toast);

	return (
		<>
			<Header />
			<main className="container mx-auto flex flex-col items-center p-10">
				<Outlet />
			</main>
			<Footer />

			<ProgressBar />
			<GeekToaster closeButton position="bottom-right" theme={theme} />
			<Confetti id={data?.confettiId} />

			{maybeUser ? <LogoutTimer /> : null}
		</>
	);
}
