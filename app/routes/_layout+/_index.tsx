import { type MetaFunction } from '@remix-run/node';
import { Link } from '@remix-run/react';
import { userHasRole } from '~/app/core/server/index.ts';
import { useOptionalUser } from '~/app/shared/lib/hooks/index.ts';
import { Button, Icon } from '~/app/shared/ui/index.ts';

export const meta: MetaFunction = () => {
	return [{ title: 'Geek Console' }];
};

export default function Index() {
	const maybeUser = useOptionalUser();
	const userIsAdmin = userHasRole(maybeUser, 'admin');

	return (
		<div className="mx-auto mt-16 flex h-full max-w-7xl flex-col items-center px-4 sm:px-6 lg:px-8">
			<div className="text-center">
				<img
					className="mx-auto h-40 w-auto"
					src="images/giphy.gif"
					alt="GeekConsole Logo"
				/>
				<h1 className="mb-3 text-xl text-primary">Welcome to GeekConsole</h1>
				<p className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
					Take full control of your material and digital stuff
				</p>
				<p className="mx-auto mt-5 max-w-xl text-xl">
					Start saving your essentials with zero effort.
				</p>
				{userIsAdmin ? (
					<Button asChild variant="secondary" className="mt-4">
						<Link to="/admin/cache">
							<Icon name="backpack">
								<span className="hidden sm:block">Admin</span>
							</Icon>
						</Link>
					</Button>
				) : null}
			</div>
		</div>
	);
}
