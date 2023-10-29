import { Link, useOutletContext } from '@remix-run/react';

import type { OutletContextValues } from '~/shared/models/index.ts';
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
} from '~/shared/ui/index.ts';

export const UserNav = () => {
	const { userProfile, supabase } = useOutletContext<OutletContextValues>();

	const handleLogout = () => {
		void (async () => {
			await supabase.auth.signOut();
		})();
	};

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="outline" className="relative h-12 w-12 rounded-full">
					<Avatar className="h-12 w-12">
						<AvatarImage
							src={
								userProfile.avatarUrl ??
								`https://robohash.org/${userProfile.username}.png`
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
						<p className="text-sm font-medium leading-none">
							{userProfile.username}
						</p>
						<p className="text-xs leading-none text-muted-foreground">
							{userProfile.email}
						</p>
					</div>
				</DropdownMenuLabel>
				<DropdownMenuSeparator />
				<DropdownMenuGroup>
					<DropdownMenuItem asChild>
						<Link to="/profile">Profile</Link>
					</DropdownMenuItem>
					<DropdownMenuItem asChild>
						<Link to="/dashboard">Dashboard</Link>
					</DropdownMenuItem>
					<DropdownMenuItem asChild>
						<Link to="/settings">Settings</Link>
					</DropdownMenuItem>
				</DropdownMenuGroup>
				<DropdownMenuSeparator />
				<DropdownMenuItem onClick={handleLogout}>Log out</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
};
