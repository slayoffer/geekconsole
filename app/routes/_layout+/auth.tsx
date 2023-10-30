import { conform, useForm } from '@conform-to/react';
import { parse, refine } from '@conform-to/zod';
import {
	type DataFunctionArgs,
	json,
	redirect,
	type MetaFunction,
} from '@remix-run/node';
import { Form, Link, useActionData, useSearchParams } from '@remix-run/react';
import { Loader2 } from 'lucide-react';
import { useSpinDelay } from 'spin-delay';
import { z } from 'zod';

import { createSupabaseServerClient } from '~/core/server/index.ts';
import { useSubmitting } from '~/shared/lib/hooks/index.ts';
import { invariantResponse } from '~/shared/lib/utils/index.ts';
import {
	Button,
	Card,
	CardContent,
	CardHeader,
	ErrorList,
	GeneralErrorBoundary,
	Input,
	Label,
} from '~/shared/ui/index.ts';

const passwordRegex =
	/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

const createRegisterSchema = (
	intent: string,
	constraint?: {
		isEmailUnique?: (email: string) => Promise<boolean>;
	},
) => {
	return z
		.object({
			email: z
				.string()
				.min(1, { message: 'Email is required' })
				.email({
					message: 'Must be a valid email',
				})
				.transform((email) => email.trim())
				.pipe(
					z.string().superRefine((email, ctx) =>
						refine(ctx, {
							validate: () => constraint?.isEmailUnique?.(email),
							when: intent === 'submit' || intent === 'validate/email',
							message: 'User is already registered',
						}),
					),
				),
			password: z.string().refine((pass) => passwordRegex.test(pass), {
				message:
					'Password must contain at least 8 characters, one uppercase, one lowercase, one number and one special character',
			}),
			confirmPassword: z.string(),
		})
		.refine((data) => data.password === data.confirmPassword, {
			message: 'Passwords do not match',
			path: ['confirmPassword'],
		});
};

const loginSchema = z.object({
	email: z
		.string()
		.min(1, { message: 'Email is required' })
		.email({
			message: 'Must be a valid email',
		})
		.transform((email) => email.trim()),
	password: z.string().min(1, { message: 'Password is required' }),
});

export const meta: MetaFunction = () => {
	return [{ title: 'Welcome, friend!' }];
};

export default function Auth() {
	const [searchParams] = useSearchParams();
	const actionData = useActionData<typeof action>();

	const isSubmitting = useSubmitting();
	const showSpinner = useSpinDelay(isSubmitting);

	const authMode = searchParams.get('type') ?? 'signin';
	const isRegister = authMode === 'register';
	const formTitle = isRegister ? 'Become a member' : 'Sign in to your account';
	const submitBtnCaption = isRegister ? 'Register' : 'Sign in';
	const toggleBtnCaption = isRegister
		? 'Already have an account?'
		: 'Do not have an account yet?';

	const [form, fields] = useForm({
		id: 'auth',
		lastSubmission: actionData?.submission,
		shouldValidate: 'onBlur',
		shouldRevalidate: 'onBlur',
		onValidate({ formData }) {
			return parse(formData, {
				schema: (intent) =>
					isRegister ? createRegisterSchema(intent) : loginSchema,
			});
		},
		defaultValue: {
			email: '',
			password: '',
			confirmPassword: '',
		},
	});

	return (
		<div className="flex h-full items-center justify-center">
			<Card className="w-[500px]">
				<CardHeader>{formTitle}</CardHeader>
				<CardContent>
					<Form method="post" {...form.props}>
						<div>
							<Label htmlFor={fields.email.id}>Email</Label>
							<Input
								autoFocus
								type="email"
								{...conform.input(fields.email, { type: 'email' })}
							/>
							<div className="min-h-[32px] px-4 pb-3 pt-1">
								<ErrorList
									id={fields.email.errorId}
									errors={fields.email.errors}
								/>
							</div>
						</div>

						<div>
							<Label htmlFor={fields.password.id}>Password</Label>
							<Input
								{...conform.input(fields.password, { type: 'password' })}
							/>
							<div className="min-h-[32px] px-4 pb-3 pt-1">
								<ErrorList
									id={fields.password.errorId}
									errors={fields.password.errors}
								/>
							</div>
						</div>

						{isRegister && (
							<div>
								<Label htmlFor={fields.confirmPassword.id}>Password</Label>
								<Input
									{...conform.input(fields.confirmPassword, {
										type: 'password',
									})}
								/>
								<div className="min-h-[32px] px-4 pb-3 pt-1">
									<ErrorList
										id={fields.confirmPassword.errorId}
										errors={fields.confirmPassword.errors}
									/>
								</div>
							</div>
						)}

						<div className="mt-2 flex flex-col space-y-3">
							<Button type="submit" disabled={showSpinner}>
								{showSpinner ? (
									<>
										<Loader2 className="mr-2 h-4 w-4 animate-spin" />
										Please wait
									</>
								) : (
									submitBtnCaption
								)}
							</Button>
							<Link
								to={authMode === 'register' ? '?type=signin' : '?type=register'}
								className="font-medium text-[#4250A8] hover:text-[#4250A8]/90"
							>
								{toggleBtnCaption}
							</Link>
							<Link
								to={'/'}
								className="font-medium text-[#4250A8] hover:text-[#4250A8]/90"
							>
								Go Home
							</Link>
						</div>
					</Form>
				</CardContent>
			</Card>
		</div>
	);
}

export const loader = async ({ request }: DataFunctionArgs) => {
	const response = new Response();

	const supabaseClient = createSupabaseServerClient({ response, request });

	const {
		data: { session },
	} = await supabaseClient.auth.getSession();

	if (session) return redirect('/');

	return json({ ok: true });
};

export const action = async ({ request }: DataFunctionArgs) => {
	const { searchParams } = new URL(request.url);
	const authMode = searchParams.get('type');

	const response = new Response();
	const supabaseClient = createSupabaseServerClient({ response, request });

	const formData = await request.formData();
	const submission = await parse(formData, {
		schema: (intent) =>
			authMode === 'register'
				? createRegisterSchema(intent, {
						async isEmailUnique(email) {
							const { data, error } = await supabaseClient
								.from('user_profiles')
								.select('*')
								.eq('email', email)
								.single();

							return !error && !data;
						},
				  })
				: loginSchema,

		async: true,
	});

	if (!submission.value) {
		return json({ status: 'error', submission } as const, { status: 400 });
	}

	if (authMode === 'register') {
		const { data, error: registerError } = await supabaseClient.auth.signUp({
			email: submission.value.email,
			password: submission.value.password,
		});

		invariantResponse(!registerError, registerError?.message, { status: 500 });

		const { error: insertError } = await supabaseClient
			.from('user_profiles')
			.insert([
				{
					id: data.user!.id,
					username: data.user!.email!,
					email: data.user!.email,
				},
			]);

		invariantResponse(!insertError, insertError?.message, { status: 500 });

		return redirect('/auth?type=signin', { headers: response.headers });
	} else {
		const { error: loginError } = await supabaseClient.auth.signInWithPassword({
			email: submission.value.email,
			password: submission.value.password,
		});

		invariantResponse(!loginError, loginError?.message, { status: 500 });

		return redirect('/books', { headers: response.headers });
	}
};

export function ErrorBoundary() {
	return (
		<GeneralErrorBoundary
			statusHandlers={{
				500: () => (
					<p>
						Shoot. Something bad happened on our side. Sorry. Try again later
					</p>
				),
			}}
			unexpectedErrorHandler={() => <div>Error trying to log in. Sorry</div>}
		/>
	);
}
