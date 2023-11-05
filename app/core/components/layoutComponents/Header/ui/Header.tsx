import { Link, useOutletContext } from '@remix-run/react';

import { type OutletContextValues } from '~/shared/models/common.ts';
import { Button } from '~/shared/ui/index.ts';
import { ThemeSwitcher, UserNav } from './components/index.ts';

export const Header = () => {
	const { user, theme } = useOutletContext<OutletContextValues>();

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
						{user !== null ? (
							<div className="ml-10 hidden space-x-4 lg:block">
								<UserNav />
							</div>
						) : (
							<div className="ml-10 hidden space-x-4 lg:block">
								<Button asChild variant="link">
									<Link to="/auth?type=signin">Sign in</Link>
								</Button>
								<Button asChild variant="link">
									<Link to="/auth?type=register">Get started today</Link>
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
