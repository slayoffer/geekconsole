import { ExclamationTriangleIcon } from '@radix-ui/react-icons';
import { json, type DataFunctionArgs } from '@remix-run/node';
import {
	type MetaFunction,
	isRouteErrorResponse,
	Link,
	useLoaderData,
	useParams,
	useRouteError,
} from '@remix-run/react';
import invariant from 'tiny-invariant';

import { getSession } from '~/core/server/index.ts';
import { invariantResponse } from '~/shared/lib/utils/index.ts';
import {
	Alert,
	AlertDescription,
	AlertTitle,
	Button,
} from '~/shared/ui/index.ts';

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

export const loader = async ({ request, params }: DataFunctionArgs) => {
	const response = new Response();
	const { bookId } = params;
	invariant(bookId, 'Missing bookId param');

	const { supabaseClient, session } = await getSession(request);

	invariantResponse(session, 'Unauthorized', { status: 401 });

	const { data: book } = await supabaseClient
		.from('books')
		.select('*')
		.eq('id', bookId)
		.single();

	invariantResponse(book, 'Book is not found', { status: 404 });

	return json({ book: book }, { headers: response.headers });
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
