import { Outlet, type MetaFunction, NavLink } from '@remix-run/react';
import { cn } from '~/app/shared/lib/utils/index.ts';

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
	'line-clamp-2 block rounded-l-full py-2 pl-8 pr-6 text-base lg:text-xl';

export default function Dashboard() {
	return (
		<div className="w-full overflow-hidden rounded-[0.5rem] border bg-background p-6 shadow">
			<div className="flex gap-6">
				<div className="flex w-1/6 flex-col gap-4">
					<div className="flex items-center justify-between space-y-2">
						<h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
					</div>

					<div className="flex flex-col items-start">
						<ul className="overflow-y-auto overflow-x-hidden pb-12">
							{DASHBOARD_ROUTES.map((route) => (
								<li className="p-1 pr-0" key={route.path}>
									<NavLink
										to={route.path}
										className={({ isActive }) =>
											cn(NAV_LINK_DEFAULT_CN, isActive && 'bg-accent')
										}
									>
										{route.text}
									</NavLink>
								</li>
							))}
						</ul>
					</div>
				</div>

				<div className="flex flex-1 items-center justify-center">
					<Outlet />
				</div>
			</div>
		</div>
	);
}
