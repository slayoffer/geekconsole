import { Link } from '@remix-run/react';

export default function Register() {
  return (
    <div className="flex h-full">
      <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:px-20 xl:flex-none xl:border-r-4 xl:border-[#F7BE38] xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div>
            <Link to="/">
              <img
                className="mx-auto h-12 w-auto"
                src="/images/brain.png"
                alt="Your Company"
              />
            </Link>
            <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-white">
              Become a member
            </h2>
          </div>
          <div className="mt-8">
            <div className="mt-6">
              <form action="#" method="POST" className="space-y-6">
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
                <div
                  className="mb-4 rounded-lg bg-yellow-100 p-4 text-center text-sm font-bold text-yellow-700 dark:bg-yellow-200 dark:text-yellow-800"
                  role="alert"
                >
                  Password must contain at least 8 characters, one uppercase,
                  one lowercase, one number and one special character
                </div>
                <div>
                  <button
                    type="submit"
                    className="flex w-full justify-center rounded-md border border-transparent bg-[#F7BE38] px-4 py-2 text-sm font-bold text-gray-900 shadow-sm hover:bg-[#F7BE38]/90 focus:outline-none focus:ring-2 focus:ring-[#F7BE38]/50 focus:ring-offset-2"
                  >
                    Register
                  </button>
                  <div className="mt-4 text-center text-sm">
                    <Link
                      to="/login"
                      className="font-medium text-[#4250A8] hover:text-[#4250A8]/90"
                    >
                      Already have an account?
                    </Link>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
      <div className="hidden w-0 flex-1 items-center justify-center xl:flex">
        <h2>PLACEHOLDER</h2>
      </div>
    </div>
  );
}
