import { useFetchers, useRouteLoaderData } from '@remix-run/react';
import { type loader as rootLoader } from '~/app/root.tsx';

export function useTheme() {
	const data = useRouteLoaderData<typeof rootLoader>('root');

	const fetchers = useFetchers();
	const themeFetcher = fetchers.find(
		(fetcher) => fetcher.formData?.get('intent') === 'update-theme',
	);

	const optimisticTheme = themeFetcher?.formData?.get('theme');

	if (optimisticTheme === 'light' || optimisticTheme === 'dark') {
		return optimisticTheme;
	}

	return data?.theme ?? 'dark';
}
