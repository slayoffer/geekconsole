import { generateSitemap } from '@nasa-gcn/remix-seo';
// @ts-expect-error - this does work, though it's not exactly a public API
import { routes } from '@remix-run/dev/server-build';
import { type DataFunctionArgs } from '@remix-run/node';
import { getDomainUrl } from '~/app/shared/lib/utils/index.ts';

export function loader({ request }: DataFunctionArgs) {
	return generateSitemap(request, routes, {
		siteUrl: getDomainUrl(request),
		headers: {
			'Cache-Control': `public, max-age=${60 * 5}`,
		},
	});
}
