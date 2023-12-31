import { conform, useForm } from '@conform-to/react';
import { getFieldsetConstraint, parse } from '@conform-to/zod';
import { invariant } from '@epic-web/invariant';
import {
	json,
	redirect,
	type LoaderFunctionArgs,
	type ActionFunctionArgs,
	type MetaFunction,
} from '@remix-run/node';
import { Form, useActionData, useLoaderData } from '@remix-run/react';
import {
	prisma,
	requireAnonymous,
	resetUserPassword,
	verifySessionStorage,
} from '~/app/core/server/index.ts';
import { useIsPending } from '~/app/shared/lib/hooks/index.ts';
import { PasswordAndConfirmPasswordSchema } from '~/app/shared/schemas/index.ts';
import {
	ErrorList,
	Field,
	GeneralErrorBoundary,
	StatusButton,
} from '~/app/shared/ui/index.ts';
import { type VerifyFunctionArgs } from './verify.tsx';

const RESET_PASSWORD_USERNAME_SESSION_KEY = 'resetPasswordUsername';

export async function handleVerification({ submission }: VerifyFunctionArgs) {
	invariant(submission.value, 'submission.value should be defined by now');

	const target = submission.value.target;

	const user = await prisma.user.findFirst({
		where: { OR: [{ email: target }, { username: target }] },
		select: { email: true, username: true },
	});

	// we don't want to say the user is not found if the email is not found
	// because that would allow an attacker to check if an email is registered
	if (!user) {
		submission.error.code = ['Invalid code'];
		return json({ status: 'error', submission } as const, { status: 400 });
	}

	const verifySession = await verifySessionStorage.getSession();
	verifySession.set(RESET_PASSWORD_USERNAME_SESSION_KEY, user.username);

	return redirect('/reset-password', {
		headers: {
			'set-cookie': await verifySessionStorage.commitSession(verifySession),
		},
	});
}

const ResetPasswordSchema = PasswordAndConfirmPasswordSchema;

async function requireResetPasswordUsername(request: Request) {
	await requireAnonymous(request);

	const verifySession = await verifySessionStorage.getSession(
		request.headers.get('cookie'),
	);

	const resetPasswordUsername = verifySession.get(
		RESET_PASSWORD_USERNAME_SESSION_KEY,
	);

	if (typeof resetPasswordUsername !== 'string' || !resetPasswordUsername) {
		throw redirect('/login');
	}

	return resetPasswordUsername;
}

export async function loader({ request }: LoaderFunctionArgs) {
	const resetPasswordUsername = await requireResetPasswordUsername(request);
	return json({ resetPasswordUsername });
}

export async function action({ request }: ActionFunctionArgs) {
	const resetPasswordUsername = await requireResetPasswordUsername(request);

	const formData = await request.formData();

	const submission = parse(formData, {
		schema: ResetPasswordSchema,
	});

	if (submission.intent !== 'submit') {
		return json({ status: 'idle', submission } as const);
	}

	if (!submission.value?.password) {
		return json({ status: 'error', submission } as const, { status: 400 });
	}

	const { password } = submission.value;

	await resetUserPassword({ username: resetPasswordUsername, password });

	const verifySession = await verifySessionStorage.getSession();

	return redirect('/login', {
		headers: {
			'set-cookie': await verifySessionStorage.destroySession(verifySession),
		},
	});
}

export default function ResetPasswordRoute() {
	const data = useLoaderData<typeof loader>();
	const actionData = useActionData<typeof action>();
	const isPending = useIsPending();

	const [form, fields] = useForm({
		id: 'reset-password',
		constraint: getFieldsetConstraint(ResetPasswordSchema),
		lastSubmission: actionData?.submission,
		onValidate({ formData }) {
			return parse(formData, { schema: ResetPasswordSchema });
		},
		shouldRevalidate: 'onBlur',
	});

	return (
		<div className="container flex flex-col justify-center pb-32 pt-20">
			<div className="text-center">
				<h1 className="text-h1">Password Reset</h1>
				<p className="mt-3 text-body-md text-muted-foreground">
					Hi, {data.resetPasswordUsername}. No worries. It happens all the time.
				</p>
			</div>
			<div className="mx-auto mt-16 min-w-[368px] max-w-sm">
				<Form method="POST" {...form.props}>
					<Field
						labelProps={{
							htmlFor: fields.password.id,
							children: 'New Password',
						}}
						inputProps={{
							...conform.input(fields.password, { type: 'password' }),
							autoComplete: 'new-password',
							autoFocus: true,
						}}
						errors={fields.password.errors}
					/>
					<Field
						labelProps={{
							htmlFor: fields.confirmPassword.id,
							children: 'Confirm Password',
						}}
						inputProps={{
							...conform.input(fields.confirmPassword, { type: 'password' }),
							autoComplete: 'new-password',
						}}
						errors={fields.confirmPassword.errors}
					/>

					<ErrorList errors={form.errors} id={form.errorId} />

					<StatusButton
						className="w-full"
						status={isPending ? 'pending' : actionData?.status ?? 'idle'}
						type="submit"
						disabled={isPending}
					>
						Reset password
					</StatusButton>
				</Form>
			</div>
		</div>
	);
}

export const meta: MetaFunction = () => {
	return [{ title: 'Reset Password | Geek Console' }];
};

export function ErrorBoundary() {
	return <GeneralErrorBoundary />;
}
