import { useEffect } from 'react';
import { Toaster, toast as showToast } from 'sonner';
import { type Toast } from '~/app/core/server/index.ts';

export function CustomToaster({ toast }: { toast?: Toast | null }) {
	return (
		<>
			<Toaster closeButton position="bottom-right" />
			{toast ? <ShowToast toast={toast} /> : null}
		</>
	);
}

function ShowToast({ toast }: { toast: Toast }) {
	const { id, type, title, description } = toast;

	useEffect(() => {
		setTimeout(() => {
			showToast[type](title, { id, description });
		}, 0);
	}, [description, id, title, type]);

	return null;
}
