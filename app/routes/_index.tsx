import type { V2_MetaFunction } from '@remix-run/node';

export const meta: V2_MetaFunction = () => {
  return [{ title: 'Geek Console' }];
};

export default function Index() {
  return (
    <div className="mt-16 flex flex-col items-center mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-full">
      <div className="text-center">
        <img
          className="h-40 w-auto mx-auto"
          src="images/giphy.gif"
          alt="GeekConsole Logo"
        />
        <h1 className="text-xl mb-3 text-yellow-400">Welcome to GeekConsole</h1>
        <p className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
          Take full control of your books.
        </p>
        <p className="mx-auto mt-5 max-w-xl text-xl text-gray-400">
          Start tracking what you are reading and what you have read.
        </p>
      </div>
      <form className="mt-8 w-3/6">
        <label
          htmlFor="default-search"
          className="mb-2 text-sm font-medium text-gray-900 sr-only"
        >
          Search
        </label>
        <div className="relative">
          <div className="flex absolute inset-y-0 left-0 items-center pl-3 pointer-events-none">
            <svg
              aria-hidden="true"
              className="w-5 h-5 text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <input
            type="search"
            id="default-search"
            className="block p-4 pl-10 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-[#F7BE38]/90 focus:border-[#F7BE38]/90"
            placeholder="Search books"
            required
          />
          <button
            type="submit"
            id="search-btn"
            className="text-gray-900 absolute right-2.5 bottom-2.5 bg-[#F7BE38] hover:bg-[#F7BE38]/90 focus:ring-4 focus:outline-none focus:ring-[#F7BE38]/50 font-bold rounded-lg text-sm px-4 py-2"
          >
            Search
          </button>
        </div>
      </form>
    </div>
  );
}
