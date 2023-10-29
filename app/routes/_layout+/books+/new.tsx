import { useEffect } from 'react';
import { ExclamationTriangleIcon } from '@radix-ui/react-icons';
import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import {
  isRouteErrorResponse,
  Link,
  useActionData,
  useRouteError,
} from '@remix-run/react';

import { NewBookForm } from '~/core/components/newBookComponents';
import { getSession } from '~/core/server';
import { BUCKET_BOOKS_URL } from '~/shared/consts';
import { invariantResponse } from '~/shared/lib/utils';
import type { ReadingStatus } from '~/shared/types';
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Button,
  useToast,
} from '~/shared/ui';

export default function NewBook() {
  const { toast } = useToast();
  const errorMsg = useActionData<any>();

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

export const action = async ({ request }: ActionFunctionArgs) => {
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

    invariantResponse(!error, error?.message, { status: 500 });
  }

  const status = formData.get('status') as ReadingStatus;
  const title = formData.get('title') as string;
  const description = formData.get('description') as string;
  const comments = formData.get('comments') as string;
  const author = formData.get('author') as string;
  const year = Number(formData.get('year'));

  const { error } = await supabaseClient.from('books').insert([
    {
      user_id: session?.user.id ?? '',
      image_url: `${BUCKET_BOOKS_URL}/${imgPath}`,
      status: status,
      title: title,
      description: description,
      comments: comments,
      author: author,
      year: year,
    },
  ]);

  invariantResponse(!error, error?.message, { status: 500 });

  return redirect('/books', { headers: response.headers });
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await getSession(request);

  invariantResponse(session, 'Unauthorized', { status: 401 });

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
