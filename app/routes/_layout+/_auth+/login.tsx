import { conform, useForm } from '@conform-to/react';
import { getFieldsetConstraint, parse } from '@conform-to/zod';
import { json, type DataFunctionArgs, redirect } from '@remix-run/node';
import {
	type MetaFunction,
	Form,
	Link,
	useActionData,
	useSearchParams,
} from '@remix-run/react';
import { AuthenticityTokenInput } from 'remix-utils/csrf/react';
import { HoneypotInputs } from 'remix-utils/honeypot/react';
import { safeRedirect } from 'remix-utils/safe-redirect';
import { z } from 'zod';
import {
	SESSION_KEY,
	authSessionStorage,
	checkHoneypot,
	login,
	prisma,
	redirectWithToast,
	requireAnonymous,
	validateCSRF,
	verifySessionStorage,
} from '~/app/core/server/index.ts';
import {
	getRedirectToUrl,
	type VerifyFunctionArgs,
} from '~/app/routes/_layout+/_auth+/verify.tsx';
import { twoFAVerificationType } from '~/app/routes/_layout+/settings+/profile.two-factor.tsx';

import { useIsPending } from '~/app/shared/lib/hooks/index.ts';
import { invariant } from '~/app/shared/lib/utils/index.ts';
import { PasswordSchema, UsernameSchema } from '~/app/shared/schemas/index.ts';
import {
	CheckboxField,
	ErrorList,
	Field,
	GeneralErrorBoundary,
	Spacer,
	StatusButton,
} from '~/app/shared/ui/index.ts';

export const meta: MetaFunction = () => {
	return [{ title: 'Login to Geek Console' }];
};

const UNVERIFIED_SESSION_KEY = 'unverified-session-id';
const REMEMBER_ME_KEY = 'remember-me';

export async function handleVerification({
	request,
	submission,
}: VerifyFunctionArgs) {
	invariant(submission.value, 'Submission should have a value by this point');

	const cookieSession = await authSessionStorage.getSession(
		request.headers.get('cookie'),
	);

	const verifySession = await verifySessionStorage.getSession(
		request.headers.get('cookie'),
	);

	const session = await prisma.session.findUnique({
		select: { expirationDate: true },
		where: { id: verifySession.get(UNVERIFIED_SESSION_KEY) },
	});

	if (!session) {
		throw await redirectWithToast('/login', {
			type: 'error',
			title: 'Invalid session',
			description: 'Could not find session to verify. Please try again.',
		});
	}

	cookieSession.set(SESSION_KEY, verifySession.get(UNVERIFIED_SESSION_KEY));

	const remember = verifySession.get(REMEMBER_ME_KEY);
	const { redirectTo } = submission.value;

	const headers = new Headers();

	headers.append(
		'set-cookie',
		await authSessionStorage.commitSession(cookieSession, {
			expires: remember ? session.expirationDate : undefined,
		}),
	);

	headers.append(
		'set-cookie',
		await verifySessionStorage.destroySession(verifySession),
	);

	return redirect(safeRedirect(redirectTo), { headers });
}

const LoginFormSchema = z.object({
	username: UsernameSchema,
	password: PasswordSchema,
	redirectTo: z.string().optional(),
	remember: z.boolean().optional(),
});

export async function loader({ request }: DataFunctionArgs) {
	await requireAnonymous(request);
	return json({});
}

export async function action({ request }: DataFunctionArgs) {
	await requireAnonymous(request);

	const formData = await request.formData();

	await validateCSRF(formData, request.headers);
	checkHoneypot(formData);

	const submission = await parse(formData, {
		schema: (intent) =>
			LoginFormSchema.transform(async (data, ctx) => {
				if (intent !== 'submit') return { ...data, session: null };

				const session = await login(data);

				if (!session) {
					ctx.addIssue({
						code: 'custom',
						message: 'Invalid username or password',
					});

					return z.NEVER;
				}

				return { ...data, session };
			}),
		async: true,
	});

	// get the password off the payload that's sent back
	delete submission.payload.password;

	if (submission.intent !== 'submit') {
		// @ts-expect-error - conform should probably have support for doing this
		delete submission.value?.password;
		return json({ status: 'idle', submission } as const);
	}

	if (!submission.value?.session) {
		return json({ status: 'error', submission } as const, { status: 400 });
	}

	const { session, remember, redirectTo } = submission.value;

	const verification = await prisma.verification.findUnique({
		select: { id: true },
		where: {
			target_type: { target: session.userId, type: twoFAVerificationType },
		},
	});

	const userHasTwoFactor = Boolean(verification);

	if (userHasTwoFactor) {
		const verifySession = await verifySessionStorage.getSession();

		verifySession.set(UNVERIFIED_SESSION_KEY, session.id);
		verifySession.set(REMEMBER_ME_KEY, remember);

		const redirectUrl = getRedirectToUrl({
			request,
			type: twoFAVerificationType,
			target: session.userId,
		});

		return redirect(redirectUrl.toString(), {
			headers: {
				'set-cookie': await verifySessionStorage.commitSession(verifySession),
			},
		});
	} else {
		const cookieSession = await authSessionStorage.getSession(
			request.headers.get('cookie'),
		);

		cookieSession.set(SESSION_KEY, session.id);

		return redirect(safeRedirect(redirectTo), {
			headers: {
				'set-cookie': await authSessionStorage.commitSession(cookieSession, {
					expires: remember ? session.expirationDate : undefined,
				}),
			},
		});
	}
}

export default function LoginRoute() {
	const actionData = useActionData<typeof action>();
	const isPending = useIsPending();
	const [searchParams] = useSearchParams();
	const redirectTo = searchParams.get('redirectTo');

	const [form, fields] = useForm({
		id: 'login-form',
		constraint: getFieldsetConstraint(LoginFormSchema),
		defaultValue: { redirectTo },
		lastSubmission: actionData?.submission,
		onValidate({ formData }) {
			return parse(formData, { schema: LoginFormSchema });
		},
		shouldRevalidate: 'onBlur',
	});

	return (
		<div className="flex min-h-full flex-col justify-center pb-32 pt-20">
			<div className="mx-auto w-full max-w-md">
				<div className="flex flex-col gap-3 text-center">
					<h1 className="text-h1">Welcome back!</h1>
					<p className="text-body-md text-muted-foreground">
						Please enter your details.
					</p>
				</div>
				<Spacer size="xs" />

				<div>
					<div className="mx-auto w-full max-w-md px-8">
						<Form method="POST" {...form.props}>
							<AuthenticityTokenInput />
							<HoneypotInputs />

							<Field
								labelProps={{ children: 'Username' }}
								inputProps={{
									...conform.input(fields.username),
									autoFocus: true,
									className: 'lowercase',
								}}
								errors={fields.username.errors}
							/>

							<Field
								labelProps={{ children: 'Password' }}
								inputProps={conform.input(fields.password, {
									type: 'password',
								})}
								errors={fields.password.errors}
							/>

							<div className="flex justify-between">
								<CheckboxField
									labelProps={{
										htmlFor: fields.remember.id,
										children: 'Remember me',
									}}
									buttonProps={conform.input(fields.remember, {
										type: 'checkbox',
									})}
									errors={fields.remember.errors}
								/>
								<div>
									<Link
										to="/forgot-password"
										className="text-body-xs font-semibold"
									>
										Forgot password?
									</Link>
								</div>
							</div>

							<input
								{...conform.input(fields.redirectTo, { type: 'hidden' })}
							/>

							<ErrorList errors={form.errors} id={form.errorId} />

							<div className="flex items-center justify-between gap-6 pt-3">
								<StatusButton
									className="w-full"
									status={isPending ? 'pending' : actionData?.status ?? 'idle'}
									type="submit"
									disabled={isPending}
								>
									Log in
								</StatusButton>
							</div>
						</Form>
						<div className="flex items-center justify-center gap-2 pt-6">
							<span className="text-muted-foreground">New here?</span>
							<Link
								to={
									redirectTo
										? `/signup?${encodeURIComponent(redirectTo)}`
										: '/signup'
								}
							>
								Create an account
							</Link>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

export function ErrorBoundary() {
	return <GeneralErrorBoundary />;
}
