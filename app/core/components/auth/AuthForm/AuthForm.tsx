import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  Link,
  useActionData,
  useNavigation,
  useSearchParams,
} from '@remix-run/react';
import { Loader2 } from 'lucide-react';
import * as z from 'zod';

import { Button } from '~/shared/ui';

const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

const authFormSchema = z.object({
  email: z
    .string()
    .min(1, { message: 'Email is required' })
    .email({
      message: 'Must be a valid email',
    })
    .transform((email) => email.trim()),
  password: z.string().refine((pass) => passwordRegex.test(pass), {
    message:
      'Password must contain at least 8 characters, one uppercase, one lowercase, one number and one special character',
  }),
});

type AuthFormData = z.infer<typeof authFormSchema>;

const authFormResolver = zodResolver(authFormSchema);

export const AuthForm = () => {
  const [searchParams] = useSearchParams();
  const validationErrors = useActionData();
  const navigation = useNavigation();

  const isSubmitting = navigation.state === 'submitting';

  const authMode = searchParams.get('type') ?? 'signin';

  const formTitle =
    authMode === 'register' ? 'Become a member' : 'Sign in to your account';

  const submitBtnCaption = authMode === 'register' ? 'Register' : 'Sign in';

  const toggleBtnCaption =
    authMode === 'register'
      ? 'Already have an account?'
      : 'Do not have an account yet?';

  return (
    <div className="flex h-full">
      <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:px-20 xl:flex-none xl:border-r-4 xl:border-[#F7BE38] xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <Link to="/">
            <img
              className="mx-auto h-12 w-auto"
              src="/images/brain.png"
              alt="App Logo"
            />
          </Link>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-white">
            {formTitle}
          </h2>
          <div className="mt-6">
            <Form method="post" className="space-y-6">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-yellow-400"
              >
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="block w-full rounded-lg border border-gray-600 bg-white p-2.5 text-sm text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-[#F7BE38]/90 focus:ring-[#F7BE38]/90"
              />
              <div className="space-y-1">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-yellow-400"
                >
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="block w-full rounded-lg border border-gray-600 bg-white p-2.5 text-sm text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-[#F7BE38]/90 focus:ring-[#F7BE38]/90"
                />
              </div>
              {authMode === 'register' ? (
                <div
                  className="mb-4 rounded-lg bg-yellow-100 p-4 text-center text-sm font-bold text-yellow-700 dark:bg-yellow-200 dark:text-yellow-800"
                  role="alert"
                >
                  Password must contain at least 8 characters, one uppercase,
                  one lowercase, one number and one special character
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <Link
                    to="/"
                    className="font-medium text-[#6873B9] hover:text-[#6873B9]/90"
                  >
                    Forgot your password?
                  </Link>
                </div>
              )}
              {validationErrors !== undefined && (
                <ul>
                  {Object.values(validationErrors).map((error: any) => (
                    <li
                      className="my-4 rounded-lg bg-red-100 p-4 text-center text-sm font-bold text-red-700"
                      role="alert"
                      key={error}
                    >
                      {error}
                    </li>
                  ))}
                </ul>
              )}
              <div>
                <Button disabled={isSubmitting} className="w-full">
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Please wait
                    </>
                  ) : (
                    submitBtnCaption
                  )}
                </Button>
                <div className="mt-4 text-center text-sm">
                  <Link
                    to={
                      authMode === 'register'
                        ? '?type=signin'
                        : '?type=register'
                    }
                    className="font-medium text-[#4250A8] hover:text-[#4250A8]/90"
                  >
                    {toggleBtnCaption}
                  </Link>
                </div>
              </div>
            </Form>
          </div>
        </div>
      </div>
      <div className="hidden w-0 flex-1 items-center justify-center xl:flex">
        <h2>PLACEHOLDER</h2>
      </div>
    </div>
  );
};
