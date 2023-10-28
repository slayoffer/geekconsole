import { ExclamationTriangleIcon } from '@radix-ui/react-icons';
import { json, type LoaderFunction } from '@remix-run/node';
import {
  isRouteErrorResponse,
  Link,
  useLoaderData,
  useParams,
  useRouteError,
} from '@remix-run/react';

import { getSession } from '~/core/server';
import type { BookDto } from '~/shared/types';
import { Alert, AlertDescription, AlertTitle, Button } from '~/shared/ui';

export default function BookOverview() {
  const book = useLoaderData<BookDto>();

  return (
    <div>
      <h1 className="mb-16 text-center text-4xl font-extrabold leading-none tracking-tight text-white md:text-5xl lg:text-6xl">
        Book Details
      </h1>
      <article className="mx-auto flex items-center justify-start space-x-10 rounded-lg border border-[#2e2e2e] bg-[#232323] p-8 shadow-md dark:border-gray-800 dark:bg-gray-800">
        <div className="w-1/4">
          <img
            className="h-full w-full rounded-lg"
            src={book.image_url ? book.image_url : '../images/noCover.gif'}
            alt={book.title}
          />
        </div>
        <div className="w-3/4">
          <h2 className="mb-2 text-left text-xl font-bold tracking-tight text-white lg:text-2xl">
            {book.title}
          </h2>
          <div>
            <h4 className="font-bold text-yellow-400">Author</h4>
            <p className="mb-3 font-light text-gray-500 dark:text-gray-400">
              {book.author ? book.author : 'Author unknown'}
            </p>
          </div>
          <div>
            <h4 className="font-bold text-yellow-400">Year</h4>
            <p className="mb-3 font-light text-gray-500 dark:text-gray-400">
              {book.year ? book.year : 'Year unknown'}
            </p>
          </div>
          <div>
            <h4 className="font-bold text-yellow-400">Description</h4>
            <p className="mb-3 font-light text-gray-500 dark:text-gray-400">
              {book.description ? book.description : 'No description'}
            </p>
          </div>
          <div>
            <h4 className="font-bold text-yellow-400">Your comments</h4>
            <p className="mb-3 font-light text-gray-500 dark:text-gray-400">
              {book.comments ? book.comments : 'No comments yet. Add one!'}
            </p>
          </div>
        </div>
      </article>
    </div>
  );
}

export const loader: LoaderFunction = async ({ request, params }) => {
  const response = new Response();
  const { bookId } = params;

  const { supabaseClient, session } = await getSession(request);

  if (!session) throw new Response('Unauthorized', { status: 401 });

  const { data: book } = await supabaseClient
    .from('books')
    .select('*')
    .eq('id', bookId);

  if (!book || book.length === 0) {
    throw new Response('Not found', { status: 404 });
  }

  return json(book[0], { headers: response.headers });
};

export function ErrorBoundary() {
  const { bookId } = useParams();
  const error = useRouteError();

  if (isRouteErrorResponse(error) && error.status === 404) {
    return <div>Huh? What the heck is "{bookId}"?</div>;
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

  return <div>There was an error loading book by the id {bookId}. Sorry.</div>;
}
