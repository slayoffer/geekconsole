import { startTransition } from 'react';
import { RemixBrowser } from '@remix-run/react';
import { hydrateRoot } from 'react-dom/client';

if (ENV.MODE === 'development' && ENV.SENTRY_DSN) {
	import('./core/utils/monitoring/monitoring.client.ts').then(({ init }) =>
		init(),
	);
}

startTransition(() => {
	hydrateRoot(document, <RemixBrowser />);
});
