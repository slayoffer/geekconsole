import { parse } from '@conform-to/zod';
import { createId } from '@paralleldrive/cuid2';
import { ExclamationTriangleIcon } from '@radix-ui/react-icons';
import {
	json,
	type DataFunctionArgs,
	type MetaFunction,
} from '@remix-run/node';
import { Link, useLoaderData } from '@remix-run/react';

import { BookCard } from '~/core/components/booksIndexComponents/index.ts';
import {
	prisma,
	redirectWithToast,
	validateCSRF,
} from '~/core/server/index.ts';
import { invariantResponse } from '~/shared/lib/utils/index.ts';
import { DeleteBookFormSchema } from '~/shared/schemas/DeleteBookSchema/DeleteBookSchema.ts';
import {
	Alert,
	AlertDescription,
	AlertTitle,
	Button,
	GeneralErrorBoundary,
} from '~/shared/ui/index.ts';

export const meta: MetaFunction = () => {
	return [
		{ title: 'Books collection | Geek Console' },
		{ name: 'description', content: 'Your full books collection' },
	];
};

export default function Books() {
	const { allBooks } = useLoaderData<typeof loader>();

	return (
		<>
			{allBooks && allBooks.length > 0 ? (
				<div className="grid grid-cols-5 gap-4">
					{allBooks.map((book) => (
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

export const action = async ({ request }: DataFunctionArgs) => {
	const formData = await request.formData();

	await validateCSRF(formData, request.headers);

	const submission = parse(formData, {
		schema: DeleteBookFormSchema,
	});

	if (submission.intent !== 'submit') {
		return json({ status: 'idle', submission } as const);
	}

	if (!submission.value) {
		return json({ status: 'error', submission } as const, { status: 400 });
	}

	const { bookId } = submission.value;

	const book = await prisma.book.findFirst({
		select: { id: true },
		where: { id: bookId },
	});

	invariantResponse(book, 'Not found', { status: 404 });

	await prisma.book.delete({ where: { id: book.id } });

	return redirectWithToast('/books', {
		id: createId(),
		type: 'success',
		title: 'Book deleted',
		description: 'Your book has been deleted',
	});
};

export const loader = async (args: DataFunctionArgs) => {
	// TODO fix this later for particular user
	const allBooks = await prisma.book.findMany();

	return json({ allBooks });
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
