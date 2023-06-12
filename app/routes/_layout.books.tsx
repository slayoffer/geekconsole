import {
  json,
  redirect,
  type LoaderArgs,
  type V2_MetaFunction,
} from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';

import { createSupabaseServerClient } from '~/core/server';
import { type BookDTO } from '~/shared/models';

export const meta: V2_MetaFunction = () => {
  return [{ title: 'Your books collection' }];
};

export default function Books() {
  const books = useLoaderData<BookDTO[]>();

  return (
    <div>
      {books.length !== 0 ? (
        books.map((book) => (
          <div
            key={book.id}
            className="flex w-full flex-col items-center justify-center rounded-lg border border-[#2e2e2e] bg-[#232323] p-4 shadow-md transition duration-300 hover:scale-105 hover:shadow-md hover:shadow-yellow-400"
          >
            <img
              className="h-56 w-40 max-w-full rounded-xl align-middle"
              src={book.image_url}
              alt={book.title}
            />
            <div
              className="mx-auto mt-4 w-max rounded-lg bg-[#e11d48] px-2 text-center text-sm font-bold text-white"
              role="alert"
            >
              {book.status}
            </div>
            <div className="flex flex-col items-center justify-center p-4">
              <p className="mb-3 text-sm font-normal text-gray-400">
                {book.author}
              </p>
              <div className="mb-3 h-12">
                <h5 className="text-center text-lg font-bold tracking-tight text-white">
                  {book.title}
                </h5>
              </div>
              <div className="flex justify-between gap-4">
                <button
                  type="button"
                  className="rounded-lg border border-yellow-300 px-3 py-2 text-center text-sm font-bold text-yellow-300 hover:bg-yellow-300/20 focus:outline-none focus:ring-4 focus:ring-yellow-900"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        ))
      ) : (
        <p>No books yet</p>
      )}
    </div>
  );
}

export const loader = async ({ request }: LoaderArgs) => {
  const response = new Response();

  const supabaseClient = createSupabaseServerClient({ response, request });

  const {
    data: { session },
  } = await supabaseClient.auth.getSession();

  if (session === null) {
    throw redirect('/', 401);
  }

  const { data: books } = await supabaseClient
    .from('books')
    .select('*')
    .eq('user_id', session.user.id);

  return json(books, { headers: response.headers });
};
