import { Form, Link } from '@remix-run/react';

export const SignInForm = () => {
  return (
    <div className="mx-auto w-full max-w-sm lg:w-96">
      <Link to="/">
        <img
          className="mx-auto h-12 w-auto"
          src="/images/brain.png"
          alt="Your Company"
        />
      </Link>
      <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-white">
        Sign in to your account
      </h2>
      <div className="mt-6">
        <Form className="space-y-6">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-yellow-400"
            >
              Email
            </label>
            <div className="mt-1">
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="block w-full rounded-lg border border-gray-600 bg-white p-2.5 text-sm text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-[#F7BE38]/90 focus:ring-[#F7BE38]/90"
              />
            </div>
          </div>
          <div className="space-y-1">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-yellow-400"
            >
              Password
            </label>
            <div className="mt-1">
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="block w-full rounded-lg border border-gray-600 bg-white p-2.5 text-sm text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-[#F7BE38]/90 focus:ring-[#F7BE38]/90"
              />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="text-sm">
              <Link
                to="/"
                className="font-medium text-[#6873B9] hover:text-[#6873B9]/90"
              >
                Forgot your password?
              </Link>
            </div>
          </div>
          <div>
            <button
              type="submit"
              className="flex w-full justify-center rounded-md border border-transparent bg-[#F7BE38] px-4 py-2 text-sm font-bold text-gray-900 shadow-sm hover:bg-[#F7BE38]/90 focus:outline-none focus:ring-2 focus:ring-[#F7BE38]/50 focus:ring-offset-2"
            >
              Sign in
            </button>
            <div className="mt-4 text-center text-sm">
              <Link
                to="/auth?type=register"
                className="font-medium text-[#4250A8] hover:text-[#4250A8]/90"
              >
                Do not have an account yet?
              </Link>
            </div>
          </div>
        </Form>
      </div>
    </div>
  );
};
