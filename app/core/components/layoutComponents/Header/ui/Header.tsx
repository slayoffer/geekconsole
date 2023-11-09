import { Link } from '@remix-run/react';

import { useOptionalUser, useTheme } from '~/app/shared/lib/hooks/index.ts';
import { Button } from '~/app/shared/ui/index.ts';
import { ThemeSwitcher, UserNav } from './components/index.ts';

export const Header = () => {
	const maybeUser = useOptionalUser();
	const theme = useTheme();

	return (
		<header className="bg-zinc-900">
			<nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" aria-label="Top">
				<div className="flex w-full items-center justify-center border-b border-white py-6 lg:justify-between lg:border-none">
					<div className="flex items-center">
						<Link to="/" prefetch="intent">
							<img
								className="h-12 w-auto"
								src="/images/geekConsole3.png"
								alt="Header logo"
							/>
						</Link>
					</div>
					<div className="flex items-center justify-center gap-4">
						{maybeUser !== null ? (
							<div className="ml-10 hidden space-x-4 lg:block">
								<UserNav />
							</div>
						) : (
							<div className="ml-10 hidden space-x-4 lg:block">
								<Button asChild variant="link">
									<Link to="/login">Log in</Link>
								</Button>
								<Button asChild variant="link">
									<Link to="/signup">Get started today</Link>
								</Button>
							</div>
						)}
						<ThemeSwitcher userPreference={theme} />
					</div>
				</div>
			</nav>
		</header>
	);
};
