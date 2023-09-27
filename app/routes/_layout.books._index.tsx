import { ExclamationTriangleIcon } from '@radix-ui/react-icons';
import { json, type LoaderFunction, type MetaFunction } from '@remix-run/node';
import {
  isRouteErrorResponse,
  Link,
  useLoaderData,
  useRouteError,
} from '@remix-run/react';
import { notFound, unauthorized } from 'remix-utils';

import { BookCard } from '~/core/components/books';
import { getSession } from '~/core/server';
import type { BookDto } from '~/shared/types';
import { Alert, AlertDescription, AlertTitle, Button } from '~/shared/ui';

export const meta: MetaFunction = () => {
  return [{ title: 'Your books collection' }];
};

export default function Books() {
  const booksPreview = useLoaderData<BookDto[]>();

  return (
    <div className="grid grid-cols-5 gap-4">
      {booksPreview.map((book) => (
        <BookCard key={book.id} book={book} />
      ))}
    </div>
  );
}

export const loader: LoaderFunction = async ({ request }) => {
  const response = new Response();

  const { supabaseClient, session } = await getSession(request);

  if (!session) throw unauthorized({ message: 'Unauthorized' });

  const { data: books } = await supabaseClient
    .from('books')
    .select('id, status, title, image_url')
    .eq('user_id', session.user.id);

  if (!books || books.length === 0) {
    throw notFound({ message: 'Not found' });
  }

  return json(books, { headers: response.headers });
};

export const ErrorBoundary = () => {
  const error = useRouteError();

  if (isRouteErrorResponse(error) && error.status === 404) {
    return (
      <div className="flex flex-col items-center justify-center">
        <p>There are no books to display.</p>
        <Button asChild variant="link">
          <Link to="/books/new">Add your own</Link>
        </Button>
      </div>
    );
  }

  if (isRouteErrorResponse(error) && error.status === 401) {
    return (
      <Alert variant="destructive" className="w-2/4">
        <ExclamationTriangleIcon className="h-4 w-4" />
        <AlertTitle>Unauthorized</AlertTitle>
        <AlertDescription>
          You must be logged in to view your books.
          <Button asChild variant="link">
            <Link to="/auth?type=signin">Login</Link>
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  return <div>Oops, can not load your books. Sorry.</div>;
};
