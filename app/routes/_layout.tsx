import { Outlet, useOutletContext } from '@remix-run/react';
import { useEffect } from 'react';
import { Toaster, toast as showToast } from 'sonner';

import {
	Footer,
	GlobalLoading,
	Header,
} from '~/core/components/layoutComponents/index.ts';
import { type OutletContextValues } from '~/shared/models/index.ts';

function ShowToast({ toast }: { toast: any }) {
	const { id, type, title, description } = toast as {
		id: string;
		type: 'success' | 'message';
		title: string;
		description: string;
	};

	useEffect(() => {
		setTimeout(() => {
			showToast[type](title, { id, description });
		}, 0);
	}, [id, type, title, description]);

	return null;
}

export default function Layout() {
	const { userProfile, toast } = useOutletContext<OutletContextValues>();

	return (
		<>
			<Header />
			<main className="container mx-auto flex flex-col items-center p-10">
				<Outlet context={{ userProfile }} />
			</main>
			<Footer />

			<GlobalLoading />

			<Toaster closeButton position="top-center" />
			{toast ? <ShowToast toast={toast} /> : null}
		</>
	);
}
