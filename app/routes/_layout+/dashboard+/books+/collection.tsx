import { type SEOHandle } from '@nasa-gcn/remix-seo';
import { type Book, type BookImage } from '@prisma/client';
import {
	type SerializeFrom,
	type LoaderFunctionArgs,
	json,
} from '@remix-run/node';
import { Link, Outlet, useLoaderData } from '@remix-run/react';
import { requireUserId, prisma } from '~/app/core/server/index.ts';
import { getBookImgSrc } from '~/app/shared/lib/utils';
import { type BreadcrumbHandle } from '~/app/shared/schemas/index.ts';
import {
	GeneralErrorBoundary,
	Alert,
	AlertTitle,
	AlertDescription,
	Button,
	Badge,
	Card,
	CardContent,
	CardFooter,
	CardHeader,
} from '~/app/shared/ui/index.ts';

type BookProps = Pick<Book, 'id' | 'title' | 'readingStatus'> & {
	images: Pick<BookImage, 'id'>[];
};
type BookCardProps = {
	book: BookProps;
};

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

export const BookCard = ({ book }: SerializeFrom<BookCardProps>) => {
	const { id, title, readingStatus, images } = book;

	return (
		<Card className="flex flex-col items-center">
			<CardHeader className="flex-row items-center gap-4">
				<p>{title}</p>
			</CardHeader>
			<CardContent className="flex flex-col items-center gap-2">
				<img
					className="h-40 w-40 max-w-full rounded-xl align-middle"
					src={images[0] ? getBookImgSrc(images[0].id) : 'images/noCover.gif'}
					alt={book.title}
				/>
				<Badge variant="outline">{readingStatus}</Badge>
			</CardContent>
			<CardFooter className="flex flex-col gap-2">
				<Button asChild variant="link">
					<Link to={`/dashboard/books/${id}`} prefetch="intent">
						See more
					</Link>
				</Button>
			</CardFooter>
		</Card>
	);
};

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
