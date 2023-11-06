import { Form, Link } from '@remix-run/react';
import { AuthenticityTokenInput } from 'remix-utils/csrf/react';
import { useUser } from '~/app/shared/lib/hooks/index.ts';

import {
	Avatar,
	AvatarFallback,
	AvatarImage,
	Button,
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
	Icon,
} from '~/app/shared/ui/index.ts';

export const UserNav = () => {
	const user = useUser();

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="outline" className="relative h-12 w-12 rounded-full">
					<Avatar className="h-12 w-12">
						<AvatarImage
							src={
								// TODO! fix this nonsense
								null ?? `https://robohash.org/${user.username}.png`
							}
							alt="User Avatar"
						/>
						<AvatarFallback />
					</Avatar>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent className="w-56" align="end" forceMount>
				<DropdownMenuLabel className="font-normal">
					<div className="flex flex-col space-y-1">
						<p className="text-sm font-medium leading-none">{user.username}</p>
						<p className="text-xs leading-none text-muted-foreground">
							{user.email}
						</p>
					</div>
				</DropdownMenuLabel>
				<DropdownMenuSeparator />
				<DropdownMenuGroup>
					<DropdownMenuItem asChild>
						<Link to="/profile" prefetch="intent">
							Profile
						</Link>
					</DropdownMenuItem>
					<DropdownMenuItem asChild>
						<Link to="/dashboard" prefetch="intent">
							Dashboard
						</Link>
					</DropdownMenuItem>
					<DropdownMenuItem asChild>
						<Link to="/settings" prefetch="intent">
							Settings
						</Link>
					</DropdownMenuItem>
				</DropdownMenuGroup>
				<DropdownMenuSeparator />
				<DropdownMenuItem asChild>
					<Form action="/logout" method="post" className="mt-3">
						<AuthenticityTokenInput />
						<Button type="submit" variant="link" size="sm">
							<Icon name="exit" className="scale-125 max-md:scale-150">
								Logout
							</Icon>
						</Button>
					</Form>
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
};
