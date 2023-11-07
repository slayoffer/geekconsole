import { conform, useForm } from '@conform-to/react';
import { getFieldsetConstraint, parse } from '@conform-to/zod';
import {
	type MetaFunction,
	json,
	type DataFunctionArgs,
	redirect,
} from '@remix-run/node';
import { Form, useActionData, useSearchParams } from '@remix-run/react';
import { AuthenticityTokenInput } from 'remix-utils/csrf/react';
import { HoneypotInputs } from 'remix-utils/honeypot/react';
import { safeRedirect } from 'remix-utils/safe-redirect';
import { z } from 'zod';
import {
	authSessionStorage,
	checkHoneypot,
	prisma,
	requireAnonymous,
	signup,
	validateCSRF,
} from '~/app/core/server/index.ts';
import { useIsPending } from '~/app/shared/lib/hooks/index.ts';
import {
	EmailSchema,
	NameSchema,
	PasswordSchema,
	UsernameSchema,
} from '~/app/shared/schemas/index.ts';
import {
	CheckboxField,
	ErrorList,
	Field,
	Spacer,
	StatusButton,
} from '~/app/shared/ui/index.ts';

const SignupFormSchema = z
	.object({
		username: UsernameSchema,
		name: NameSchema,
		email: EmailSchema,
		password: PasswordSchema,
		confirmPassword: PasswordSchema,
		remember: z.boolean().optional(),
		redirectTo: z.string().optional(),
		agreeToTermsOfServiceAndPrivacyPolicy: z.boolean({
			required_error:
				'You must agree to the terms of service and privacy policy',
		}),
	})
	.superRefine(({ confirmPassword, password }, ctx) => {
		if (confirmPassword !== password) {
			ctx.addIssue({
				path: ['confirmPassword'],
				code: 'custom',
				message: 'The passwords must match',
			});
		}
	});

export const meta: MetaFunction = () => {
	return [{ title: 'Setup Geek Console Account' }];
};

export default function SignupRoute() {
	const actionData = useActionData<typeof action>();
	const isPending = useIsPending();
	const [searchParams] = useSearchParams();

	const redirectTo = searchParams.get('redirectTo');

	const [form, fields] = useForm({
		id: 'signup-form',
		constraint: getFieldsetConstraint(SignupFormSchema),
		defaultValue: { redirectTo },
		lastSubmission: actionData?.submission,
		onValidate({ formData }) {
			return parse(formData, { schema: SignupFormSchema });
		},
		shouldRevalidate: 'onBlur',
	});

	return (
		<div className="container flex min-h-full flex-col justify-center pb-32 pt-20">
			<div className="mx-auto w-full max-w-lg">
				<div className="flex flex-col gap-3 text-center">
					<h1 className="text-h1">Welcome aboard!</h1>
					<p className="text-body-md text-muted-foreground">
						Please enter your details.
					</p>
				</div>

				<Spacer size="xs" />

				<Form
					method="post"
					className="mx-auto min-w-[368px] max-w-sm"
					{...form.props}
				>
					<AuthenticityTokenInput />
					<HoneypotInputs />

					<Field
						labelProps={{ htmlFor: fields.email.id, children: 'Email' }}
						inputProps={{
							...conform.input(fields.email),
							autoComplete: 'email',
							autoFocus: true,
							className: 'lowercase',
						}}
						errors={fields.email.errors}
					/>

					<Field
						labelProps={{ htmlFor: fields.username.id, children: 'Username' }}
						inputProps={{
							...conform.input(fields.username),
							autoComplete: 'username',
							className: 'lowercase',
						}}
						errors={fields.username.errors}
					/>

					<Field
						labelProps={{ htmlFor: fields.name.id, children: 'Name' }}
						inputProps={{
							...conform.input(fields.name),
							autoComplete: 'name',
						}}
						errors={fields.name.errors}
					/>

					<Field
						labelProps={{ htmlFor: fields.password.id, children: 'Password' }}
						inputProps={{
							...conform.input(fields.password, { type: 'password' }),
							autoComplete: 'new-password',
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

					<CheckboxField
						labelProps={{
							htmlFor: fields.agreeToTermsOfServiceAndPrivacyPolicy.id,
							children:
								'Do you agree to our Terms of Service and Privacy Policy?',
						}}
						buttonProps={conform.input(
							fields.agreeToTermsOfServiceAndPrivacyPolicy,
							{ type: 'checkbox' },
						)}
						errors={fields.agreeToTermsOfServiceAndPrivacyPolicy.errors}
					/>

					<CheckboxField
						labelProps={{
							htmlFor: fields.remember.id,
							children: 'Remember me',
						}}
						buttonProps={conform.input(fields.remember, { type: 'checkbox' })}
						errors={fields.remember.errors}
					/>

					<input {...conform.input(fields.redirectTo, { type: 'hidden' })} />

					<ErrorList errors={form.errors} id={form.errorId} />

					<div className="flex items-center justify-between gap-6">
						<StatusButton
							className="w-full"
							status={isPending ? 'pending' : actionData?.status ?? 'idle'}
							type="submit"
							disabled={isPending}
						>
							Create an account
						</StatusButton>
					</div>
				</Form>
			</div>
		</div>
	);
}

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
		schema: SignupFormSchema.superRefine(async (data, ctx) => {
			const existingUser = await prisma.user.findUnique({
				where: { username: data.username },
				select: { id: true },
			});

			if (existingUser) {
				ctx.addIssue({
					path: ['username'],
					code: z.ZodIssueCode.custom,
					message: 'A user already exists with this username',
				});

				return;
			}
		}).transform(async (data) => {
			const session = await signup(data);

			return { ...data, session };
		}),

		async: true,
	});

	if (submission.intent !== 'submit') {
		return json({ status: 'idle', submission } as const);
	}

	if (!submission.value?.session) {
		return json({ status: 'error', submission } as const, { status: 400 });
	}

	const { session, remember, redirectTo } = submission.value;

	const cookieSession = await authSessionStorage.getSession(
		request.headers.get('cookie'),
	);
	cookieSession.set('userId', session.id);

	return redirect(safeRedirect(redirectTo), {
		headers: {
			'set-cookie': await authSessionStorage.commitSession(cookieSession, {
				expires: remember ? session.expirationDate : undefined,
			}),
		},
	});
}
