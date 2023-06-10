import {
  redirect,
  type LoaderArgs,
  type V2_MetaFunction,
} from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';

import { createSupabaseServerClient } from '~/core/server';

export const meta: V2_MetaFunction = () => {
  return [{ title: 'Your books collection' }];
};

export default function Books() {
  const books = useLoaderData();

  return (
    <div>
      <h2>Hello my books!</h2>

      <div>
        {books.map((book: any) => (
          <p key={book.id}>{book.title}</p>
        ))}
      </div>
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

  return books;
};
