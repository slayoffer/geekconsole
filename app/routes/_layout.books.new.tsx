import { useEffect } from 'react';
import { ExclamationTriangleIcon } from '@radix-ui/react-icons';
import { json, redirect } from '@remix-run/node';
import type { ActionArgs, LoaderArgs } from '@remix-run/node';
import {
  isRouteErrorResponse,
  Link,
  useActionData,
  useRouteError,
} from '@remix-run/react';
import { badRequest, unauthorized } from 'remix-utils';

import { NewBookForm } from '~/core/components/books';
import { getSession } from '~/core/server';
import { BUCKET_BOOKS_URL } from '~/shared/consts';
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Button,
  useToast,
} from '~/shared/ui';

export default function NewBook() {
  const { toast } = useToast();
  const errorMsg = useActionData();

  useEffect(() => {
    if (errorMsg) {
      toast({
        title: errorMsg.message,
        variant: 'destructive',
      });
    }
  }, [errorMsg, toast]);

  return (
    <div>
      <h1 className="mb-4 text-center text-4xl font-extrabold tracking-tight text-white md:text-5xl lg:text-6xl">
        Remember a Book
      </h1>
      <p className="mb-4 text-center font-light text-yellow-400 sm:text-xl lg:mb-12">
        Want to track a book you have read or reading now? Just add it here.
      </p>
      <NewBookForm />
    </div>
  );
}

export const action = async ({ request }: ActionArgs) => {
  const { randomUUID } = require('crypto');

  const formData = await request.formData();

  const response = new Response();
  const { supabaseClient, session } = await getSession(request);

  const coverImg = formData.get('coverImg');

  let imgPath: string | null = null;

  if (coverImg && coverImg instanceof File) {
    const fileExt = coverImg.name.split('.').at(-1);

    const { data, error } = await supabaseClient.storage
      .from('books')
      .upload(`${session?.user.id}/${randomUUID()}.${fileExt}`, coverImg);

    if (data) imgPath = data.path;
    else if (error) throw badRequest({ message: error.message });
  }

  const { error } = await supabaseClient.from('books').insert([
    {
      user_id: session?.user.id,
      image_url: `${BUCKET_BOOKS_URL}/${imgPath}`,
      status: formData.get('status'),
      title: formData.get('title'),
      description: formData.get('description'),
      comments: formData.get('comments'),
      author: formData.get('author'),
      year: formData.get('year'),
    },
  ]);

  if (error) throw badRequest({ message: error.message });

  return redirect('/books', { headers: response.headers });
};

export const loader = async ({ request }: LoaderArgs) => {
  const { session } = await getSession(request);

  if (!session) throw unauthorized({ message: 'Unauthorized' });

  return json({ ok: true });
};

export const ErrorBoundary = () => {
  const error = useRouteError();

  if (isRouteErrorResponse(error) && error.status === 401) {
    return (
      <Alert variant="destructive" className="w-2/4">
        <ExclamationTriangleIcon className="h-4 w-4" />
        <AlertTitle>Unauthorized</AlertTitle>
        <AlertDescription>
          You must be logged in to add a book.
          <Button asChild variant="link">
            <Link to="/auth?type=signin">Login</Link>
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  return <div>Something unexpected went wrong. Sorry about that.</div>;
};
