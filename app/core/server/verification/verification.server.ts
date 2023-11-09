import { createCookieSessionStorage } from '@remix-run/node';

export const ONBOARDING_EMAIL_SESSION_KEY = 'onboardingEmail';

export const verifySessionStorage = createCookieSessionStorage({
	cookie: {
		name: 'gk_verification',
		sameSite: 'lax',
		path: '/',
		httpOnly: true,
		maxAge: 60 * 10, // 10 minutes
		secrets: process.env.SESSION_SECRET.split(','),
		secure: process.env.NODE_ENV === 'production',
	},
});
