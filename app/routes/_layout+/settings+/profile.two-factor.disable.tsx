import { json, type DataFunctionArgs } from '@remix-run/node';
import { Form } from '@remix-run/react';
import { AuthenticityTokenInput } from 'remix-utils/csrf/react';
import {
	prisma,
	redirectWithToast,
	requireUserId,
	validateCSRF,
} from '~/app/core/server/index.ts';
import { requireRecentVerification } from '~/app/routes/_layout+/_auth+/verify.tsx';
import { useDoubleCheck, useIsPending } from '~/app/shared/lib/hooks/index.ts';
import { Icon, StatusButton } from '~/app/shared/ui/index.ts';
import { twoFAVerificationType } from './profile.two-factor.tsx';

export const handle = {
	breadcrumb: <Icon name="lock-open-1">Disable</Icon>,
};

export async function loader({ request }: DataFunctionArgs) {
	await requireRecentVerification({
		request,
		userId: await requireUserId(request),
	});

	return json({});
}

export async function action({ request }: DataFunctionArgs) {
	const userId = await requireUserId(request);

	await requireRecentVerification({
		request,
		userId: userId,
	});

	const formData = await request.formData();

	await validateCSRF(formData, request.headers);

	await prisma.verification.delete({
		where: { target_type: { target: userId, type: twoFAVerificationType } },
	});

	throw await redirectWithToast('/settings/profile/two-factor', {
		title: '2FA Disabled',
		description: 'Two factor authentication has been disabled.',
	});
}

export default function TwoFactorDisableRoute() {
	const isPending = useIsPending();
	const dc = useDoubleCheck();

	return (
		<div className="mx-auto max-w-sm">
			<Form method="POST">
				<AuthenticityTokenInput />
				<p>
					Disabling two factor authentication is not recommended. However, if
					you would like to do so, click here:
				</p>
				<StatusButton
					variant="destructive"
					status={isPending ? 'pending' : 'idle'}
					disabled={isPending}
					{...dc.getButtonProps({
						className: 'mx-auto',
						name: 'intent',
						value: 'disable',
						type: 'submit',
					})}
				>
					{dc.doubleCheck ? 'Are you sure?' : 'Disable 2FA'}
				</StatusButton>
			</Form>
		</div>
	);
}
