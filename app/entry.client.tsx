import { startTransition } from 'react';
import { RemixBrowser } from '@remix-run/react';
import { hydrateRoot } from 'react-dom/client';

if (ENV.MODE === 'development') {
	import('./shared/lib/utils/index.ts').then(({ init }) => init());
}

startTransition(() => {
	hydrateRoot(document, <RemixBrowser />);
});
