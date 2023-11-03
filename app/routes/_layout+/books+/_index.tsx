import { ExclamationTriangleIcon } from '@radix-ui/react-icons';
import {
	json,
	type DataFunctionArgs,
	type MetaFunction,
} from '@remix-run/node';
import { Link, useActionData, useLoaderData } from '@remix-run/react';
import { useEffect } from 'react';

import { BookCard } from '~/core/components/booksIndexComponents/index.ts';
import { getSession } from '~/core/server/index.ts';
import { type action } from '~/routes/books.$bookId.destroy.tsx';
import { SUCCESS_DELETE_COOKIE_NAME } from '~/shared/consts/index.ts';
import { invariantResponse } from '~/shared/lib/utils/index.ts';
import {
	Alert,
	AlertDescription,
	AlertTitle,
	Button,
	GeneralErrorBoundary,
	useToast,
} from '~/shared/ui/index.ts';

export const meta: MetaFunction = () => {
	return [
		{ title: 'Books collection | Geek Console' },
		{ name: 'description', content: 'Your full books collection' },
	];
};

export default function Books() {
	const { mappedBooks, success } = useLoaderData<typeof loader>();
	const response = useActionData<typeof action>();
	const { toast } = useToast();

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
			{mappedBooks && mappedBooks.length > 0 ? (
				<div className="grid grid-cols-5 gap-4">
					{mappedBooks.map((book) => (
						<BookCard key={book.id} book={book} />
					))}
				</div>
			) : (
				<div className="flex flex-col items-center justify-center">
					<p>There are no books to display.</p>
					<Button asChild variant="link">
						<Link to="/books/new" prefetch="intent">
							Add your own
						</Link>
					</Button>
				</div>
			)}
		</>
	);
}

export const loader = async ({ request }: DataFunctionArgs) => {
	const headers = new Headers(request.headers);
	const cookies = headers.get('cookie');
	const isDeleted = cookies?.includes('deleteSuccess=true');

	const response = new Response();

	const { supabaseClient, session } = await getSession(request);

	invariantResponse(session, 'Unauthorized', { status: 401 });

	const { data: books, error: getBooksError } = await supabaseClient
		.from('books')
		.select(
			`
        id,
        status,
        title,
        books_images (id, alt_text, url)
      `,
		)
		.eq('user_id', session.user.id);

	invariantResponse(!getBooksError, getBooksError?.message, { status: 500 });

	const mappedBooks = [];

	if (books && books.length > 0) {
		for (const book of books) {
			const bookImg = Array.isArray(book.books_images)
				? book.books_images[0]
				: book.books_images;

			mappedBooks.push({
				...book,
				books_images: bookImg,
			});
		}
	}

	return json(
		{ mappedBooks, success: isDeleted },
		{
			headers: {
				...response.headers,
				'Set-Cookie': `${SUCCESS_DELETE_COOKIE_NAME}; expires=Thu, 01 Jan 1970 00:00:00 GMT`,
			},
		},
	);
};

export const ErrorBoundary = () => {
	return (
		<GeneralErrorBoundary
			statusHandlers={{
				401: () => (
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
				),
				500: () => (
					<Alert variant="destructive" className="w-2/4">
						<ExclamationTriangleIcon className="h-4 w-4" />
						<AlertTitle>Server error</AlertTitle>
						<AlertDescription>
							Looks like something bad happened on our server. Already fixing!
						</AlertDescription>
					</Alert>
				),
			}}
			unexpectedErrorHandler={() => (
				<div>Something unexpected happened. Sorry about that.</div>
			)}
		/>
	);
};
