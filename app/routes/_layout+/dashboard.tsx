import { type SEOHandle } from '@nasa-gcn/remix-seo';
import {
	Outlet,
	type MetaFunction,
	NavLink,
	Link,
	useMatches,
} from '@remix-run/react';
import { z } from 'zod';
import { cn } from '~/app/shared/lib/utils/index.ts';
import { BreadcrumbHandle } from '~/app/shared/schemas/index.ts';
import { Icon } from '~/app/shared/ui/index.ts';

export const meta: MetaFunction = () => {
	return [
		{ title: 'Dashboard | Geek Console' },
		{ name: 'description', content: 'This is your dashboard' },
	];
};

const DASHBOARD_ROUTES = [
	{
		path: 'books',
		text: 'Books to Read',
	},
	{
		path: 'games',
		text: 'Games to Play',
	},
	{
		path: 'car',
		text: 'Car to Maintain',
	},
];

const NAV_LINK_DEFAULT_CN =
	'flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50';

export const handle: BreadcrumbHandle & SEOHandle = {
	breadcrumb: 'Dashboard',
	getSitemapEntries: () => null,
};

const BreadcrumbHandleMatch = z.object({
	handle: BreadcrumbHandle,
});

export default function Dashboard() {
	const matches = useMatches();

	const breadcrumbs = matches
		.map((m) => {
			const result = BreadcrumbHandleMatch.safeParse(m);

			if (!result.success || !result.data.handle.breadcrumb) return null;

			return (
				<Link key={m.id} to={m.pathname} className="flex items-center">
					{result.data.handle.breadcrumb}
				</Link>
			);
		})
		.filter(Boolean);

	return (
		<div className="grid w-full lg:grid-cols-[280px_1fr]">
			<div className="hidden border-r bg-gray-100/40 dark:bg-gray-800/40 lg:block">
				<div className="flex h-full max-h-screen flex-col gap-2">
					<div className="flex h-[60px] items-center border-b px-6">
						<Link className="flex items-center gap-2 font-semibold" to="/">
							<Icon name="skull">Dashboard</Icon>
						</Link>
					</div>
					<div className="flex-1 overflow-auto py-2">
						<nav className="grid items-start px-4 text-sm font-medium">
							{DASHBOARD_ROUTES.map((route) => (
								<NavLink
									key={route.path}
									to={route.path}
									className={({ isActive }) =>
										cn(
											NAV_LINK_DEFAULT_CN,
											isActive &&
												'bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-50',
										)
									}
								>
									{route.text}
								</NavLink>
							))}
						</nav>
					</div>
				</div>
			</div>

			<div className="flex flex-col p-6">
				<header className="flex h-14 items-center gap-4 border-b bg-gray-100/40 px-6 dark:bg-gray-800/40">
					<ul className="flex gap-3">
						{breadcrumbs.map((breadcrumb, i, arr) => (
							<li
								key={i}
								className={cn('flex items-center gap-3', {
									'text-muted-foreground': i < arr.length - 1,
								})}
							>
								{breadcrumb}
								{i !== arr.length - 1 && <Icon name="arrow-right" />}
							</li>
						))}
					</ul>
				</header>
				<main className="flex flex-1 flex-wrap gap-4 p-4 md:gap-8 md:p-6">
					<Outlet />
				</main>
			</div>
		</div>
	);
}
