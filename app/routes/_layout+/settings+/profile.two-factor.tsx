import { Outlet } from '@remix-run/react';
import { type VerificationTypes } from '~/app/routes/_layout+/_auth+/verify.tsx';
import { Icon } from '~/app/shared/ui/index.ts';

export const handle = {
	breadcrumb: <Icon name="lock-closed">2FA</Icon>,
};

export const twoFAVerificationType = '2fa' satisfies VerificationTypes;

export default function TwoFactorRoute() {
	return <Outlet />;
}
