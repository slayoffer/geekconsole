import { useEffect } from 'react';
import { ExclamationTriangleIcon } from '@radix-ui/react-icons';
import { json, type LoaderFunction, type MetaFunction } from '@remix-run/node';
import {
  isRouteErrorResponse,
  Link,
  useActionData,
  useLoaderData,
  useRouteError,
} from '@remix-run/react';

import { BookCard } from '~/core/components/booksIndexComponents';
import { getSession } from '~/core/server';
import { SUCCESS_DELETE_COOKIE_NAME } from '~/shared/consts';
import type { BookDto } from '~/shared/types';
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Button,
  useToast,
} from '~/shared/ui';

export const meta: MetaFunction = () => {
  return [{ title: 'Your books collection' }];
};

export default function Books() {
  const { books, success } = useLoaderData<{
    books: BookDto[];
    success: boolean | undefined;
  }>();
  const { toast } = useToast();
  const response = useActionData<{
    error: string;
  }>();

  useEffect(() => {
    if (response && response.error) {
      toast({
        title: response.error,
        variant: 'destructive',
      });
    }

    if (success) {
      toast({
        title: 'Book has been successfully deleted',
        variant: 'default',
      });
    }
  }, [response, success, toast]);

  return (
    <>
      {books.length > 0 ? (
        <div className="grid grid-cols-5 gap-4">
          {books.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center">
          <p>There are no books to display.</p>
          <Button asChild variant="link">
            <Link to="/books/new">Add your own</Link>
          </Button>
        </div>
      )}
    </>
  );
}

export const loader: LoaderFunction = async ({ request }) => {
  const headers = new Headers(request.headers);
  const cookies = headers.get('cookie');
  const isDeleted = cookies?.includes('deleteSuccess=true');

  const response = new Response();

  const { supabaseClient, session } = await getSession(request);

  if (!session) throw new Response('Unauthorized', { status: 401 });

  const { data: books } = await supabaseClient
    .from('books')
    .select('id, status, title, image_url')
    .eq('user_id', session.user.id);

  return json(
    { books, success: isDeleted },
    {
      headers: {
        ...response.headers,
        'Set-Cookie': `${SUCCESS_DELETE_COOKIE_NAME}; expires=Thu, 01 Jan 1970 00:00:00 GMT`,
      },
    },
  );
};

export const ErrorBoundary = () => {
  const error = useRouteError();

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
