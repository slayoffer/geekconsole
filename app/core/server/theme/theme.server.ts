import * as cookie from 'cookie';

const COOKIE_NAME = 'theme';
export type Theme = 'light' | 'dark';

export function getTheme(request: Request): Theme {
	const cookieHeader = request.headers.get('cookie');

	const parsed = cookieHeader
		? cookie.parse(cookieHeader)[COOKIE_NAME]
		: 'light';

	if (parsed === 'light' || parsed === 'dark') return parsed;

	return 'light';
}

export function setTheme(theme: Theme) {
	return cookie.serialize(COOKIE_NAME, theme, { path: '/' });
}
