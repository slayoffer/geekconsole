import { parse } from '@conform-to/zod';
import { invariantResponse } from '@epic-web/invariant';
import { type SEOHandle } from '@nasa-gcn/remix-seo';
import { createId } from '@paralleldrive/cuid2';
import {
	type ActionFunctionArgs,
	type LoaderFunctionArgs,
	json,
} from '@remix-run/node';
import { Link, Outlet, useLoaderData } from '@remix-run/react';
import { BookCard } from '~/app/core/components/books/index.ts';
import {
	requireUserId,
	prisma,
	redirectWithToast,
	requireUserWithPermission,
	validateCSRF,
} from '~/app/core/server/index.ts';
import {
	DeleteBookFormSchema,
	type BreadcrumbHandle,
} from '~/app/shared/schemas/index.ts';
import {
	GeneralErrorBoundary,
	Alert,
	AlertTitle,
	AlertDescription,
	Button,
} from '~/app/shared/ui/index.ts';

export const handle: BreadcrumbHandle & SEOHandle = {
	breadcrumb: 'Collection',
	getSitemapEntries: () => null,
};

export default function BooksCollectionRoute() {
	const { usersBooks } = useLoaderData<typeof loader>();

	return (
		<>
			{usersBooks && usersBooks.length > 0 ? (
				<div className="grid grid-cols-4 gap-4">
					{usersBooks.map((book) => (
						<BookCard key={book.id} book={book} />
					))}
					<Outlet />
				</div>
			) : (
				<div className="flex flex-col items-center justify-center">
					<p>There are no books to display :(</p>
				</div>
			)}
		</>
	);
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
	const userId = await requireUserId(request);

	const usersBooks = await prisma.book.findMany({
		select: {
			id: true,
			title: true,
			readingStatus: true,
			images: {
				select: {
					id: true,
				},
			},
		},
		where: { ownerId: userId },
	});

	return json({ usersBooks });
};

export const action = async ({ request }: ActionFunctionArgs) => {
	const userId = await requireUserId(request);

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
		select: { id: true, ownerId: true },
		where: { id: bookId },
	});

	invariantResponse(book, 'Not found', { status: 404 });

	const isOwner = userId === book.ownerId;
	await requireUserWithPermission(
		request,
		isOwner ? 'delete:book:own' : 'delete:book:any',
	);

	await prisma.book.delete({ where: { id: book.id } });

	return redirectWithToast('/dashboard/books/collection', {
		id: createId(),
		type: 'success',
		title: 'Book deleted',
		description: 'Your book has been deleted',
	});
};

export const ErrorBoundary = () => {
	return (
		<GeneralErrorBoundary
			statusHandlers={{
				401: () => (
					<Alert variant="destructive" className="w-2/4">
						<AlertTitle>Unauthorized</AlertTitle>
						<AlertDescription>
							You must be logged in to view your books.
							<Button asChild variant="link">
								<Link to="/auth?type=signin">Login</Link>
							</Button>
						</AlertDescription>
					</Alert>
				),
				403: () => <p>You are not allowed to do that</p>,
				500: () => (
					<Alert variant="destructive" className="w-2/4">
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
