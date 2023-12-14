import { json, type LoaderFunctionArgs } from '@remix-run/node';
import { type MetaFunction, Link, useLoaderData } from '@remix-run/react';
import invariant from 'tiny-invariant';

import {
	Alert,
	AlertDescription,
	AlertTitle,
	Button,
	GeneralErrorBoundary,
} from '~/app/shared/ui/index.ts';

export const meta: MetaFunction<typeof loader> = ({ data }) => {
	const bookName = data?.book.title ?? 'Book';
	const bookSummary =
		data && data.book.description.length > 100
			? data.book.description.slice(0, 97) + '...'
			: 'No description';

	return [
		{ title: `${bookName} | Geek Console` },
		{ name: 'description', content: bookSummary },
	];
};

export default function BookOverview() {
	const { book } = useLoaderData<typeof loader>();

	return (
		<div>
			<h1 className="mb-16 text-center text-4xl font-extrabold leading-none tracking-tight text-white md:text-5xl lg:text-6xl">
				Book Details
			</h1>
			<article className="mx-auto flex items-center justify-start space-x-10 rounded-lg border border-[#2e2e2e] bg-[#232323] p-8 shadow-md dark:border-gray-800 dark:bg-gray-800">
				<div className="w-1/4">
					<img
						className="h-full w-full rounded-lg"
						src={'images/noCover.gif'}
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

export const loader = async ({ params }: LoaderFunctionArgs) => {
	const response = new Response();
	const { bookId } = params;
	invariant(bookId, 'Missing bookId param');

	return json(
		{
			book: {
				id: '123',
				title: 'Book',
				description: 'mock',
				author: 'me',
				year: 2023,
				comments: 'mock',
			},
		},
		{ headers: response.headers },
	);
};

export function ErrorBoundary() {
	return (
		<GeneralErrorBoundary
			statusHandlers={{
				404: ({ params }) => <p>Huh? What the heck is "{params.bookId}"?</p>,
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
			}}
			unexpectedErrorHandler={() => (
				<div>There was an error loading book. Sorry.</div>
			)}
		/>
	);
}
