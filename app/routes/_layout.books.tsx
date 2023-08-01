import {
  json,
  type LoaderArgs,
  type LoaderFunction,
  type V2_MetaFunction,
} from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';

import { BookCard } from '~/core/components/books';
import { getSession } from '~/core/server';
import { type BookDTO } from '~/shared/models';

export const meta: V2_MetaFunction = () => {
  return [{ title: 'Your books collection' }];
};

export default function Books() {
  const books = useLoaderData<BookDTO[]>();

  return (
    <div className="grid grid-cols-5 gap-4">
      {books !== null && books.length !== 0 ? (
        books.map((book) => <BookCard key={book.id} book={book} />)
      ) : (
        <p>No books yet</p>
      )}
    </div>
  );
}

export const loader: LoaderFunction = async ({ request }: LoaderArgs) => {
  const response = new Response();

  const { supabaseClient, session } = await getSession(request);

  const { data: books } = await supabaseClient
    .from('books')
    .select('*')
    .eq('user_id', session.user.id);

  return json(books, { headers: response.headers });
};
