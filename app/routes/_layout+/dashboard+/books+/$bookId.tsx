import { useForm } from '@conform-to/react';
import { parse } from '@conform-to/zod';
import { invariantResponse } from '@epic-web/invariant';
import { type SEOHandle } from '@nasa-gcn/remix-seo';
import { createId } from '@paralleldrive/cuid2';
import {
	type ActionFunctionArgs,
	json,
	type LoaderFunctionArgs,
} from '@remix-run/node';
import {
	type MetaFunction,
	useLoaderData,
	Link,
	Form,
	useActionData,
} from '@remix-run/react';
import { formatDistanceToNow } from 'date-fns';
import { AuthenticityTokenInput } from 'remix-utils/csrf/react';
import {
	prisma,
	redirectWithToast,
	requireUserId,
	requireUserWithPermission,
	validateCSRF,
} from '~/app/core/server';
import { useIsPending } from '~/app/shared/lib/hooks';
import { getBookImgSrc } from '~/app/shared/lib/utils';
import {
	DeleteBookFormSchema,
	type BreadcrumbHandle,
	DELETE_BOOK_INTENT,
} from '~/app/shared/schemas/index.ts';
import {
	Badge,
	Button,
	ErrorList,
	GeneralErrorBoundary,
	Icon,
	StatusButton,
} from '~/app/shared/ui/index.ts';

export const handle: BreadcrumbHandle & SEOHandle = {
	breadcrumb: 'Overview',
	getSitemapEntries: () => null,
};

export default function BookOverview() {
	const { book, timeAgo } = useLoaderData<typeof loader>();

	return (
		<div>
			<article className="mx-auto flex items-center justify-start space-x-10 rounded-lg border bg-muted p-8 shadow-md">
				<div className="overflow-y-auto pb-24">
					<div>
						<span className="text-sm text-foreground/90 max-[524px]:hidden">
							<Icon name="clock" className="scale-125">
								{timeAgo} ago
							</Icon>
						</span>
					</div>
					<ul className="flex flex-wrap gap-5 py-5">
						{book.images.map((image) => (
							<li key={image.id}>
								<a href={getBookImgSrc(image.id)}>
									<img
										src={getBookImgSrc(image.id)}
										alt={image.altText ?? ''}
										className="h-32 w-32 rounded-lg object-cover"
									/>
								</a>
							</li>
						))}
					</ul>
				</div>
				<div className="w-3/4">
					<h2 className="mb-4 text-left text-xl font-bold tracking-tight text-foreground lg:text-2xl">
						{book.title}
					</h2>
					<div>
						<h4 className="font-bold">Author</h4>
						<p className="mb-3 font-light text-muted-foreground">
							{book.author}
						</p>
					</div>
					<div>
						<h4 className="font-bold ">Year</h4>
						<p className="mb-3 font-light text-muted-foreground">{book.year}</p>
					</div>
					<div>
						<h4 className="font-bold">Description</h4>
						<p className="mb-3 font-light text-muted-foreground">
							{book.description}
						</p>
					</div>
					<div>
						<h4 className="font-bold">Your comments</h4>
						<p className="mb-3 font-light text-muted-foreground">
							{book.comment ? book.comment : 'No comments yet. Add one!'}
						</p>
					</div>

					<Badge className="mb-3">{book.readingStatus}</Badge>

					<div className="flex gap-4">
						<DeleteBook id={book.id} />

						<Button
							asChild
							className="min-[525px]:max-md:aspect-square min-[525px]:max-md:px-0"
						>
							<Link to="edit">
								<Icon name="pencil-1" className="scale-125 max-md:scale-150">
									<span className="max-md:hidden">Edit</span>
								</Icon>
							</Link>
						</Button>
					</div>
				</div>
			</article>
		</div>
	);
}

export function DeleteBook({ id }: { id: string }) {
	const actionData = useActionData<typeof action>();
	const isPending = useIsPending();
	const [form] = useForm({
		id: 'deleteBook',
		lastSubmission: actionData?.submission,
	});

	return (
		<Form method="POST" {...form.props}>
			<AuthenticityTokenInput />
			<input type="hidden" name="bookId" value={id} />
			<StatusButton
				type="submit"
				name="intent"
				value={DELETE_BOOK_INTENT}
				variant="destructive"
				status={isPending ? 'pending' : actionData?.status ?? 'idle'}
				disabled={isPending}
				className="w-full max-md:aspect-square max-md:px-0"
			>
				<Icon name="trash" className="scale-125 max-md:scale-150">
					<span className="max-md:hidden">Delete</span>
				</Icon>
			</StatusButton>
			<ErrorList errors={form.errors} id={form.errorId} />
		</Form>
	);
}

export const loader = async ({ params }: LoaderFunctionArgs) => {
	const book = await prisma.book.findUnique({
		where: { id: params.bookId },
		select: {
			id: true,
			title: true,
			author: true,
			year: true,
			readingStatus: true,
			description: true,
			comment: true,
			ownerId: true,
			updatedAt: true,
			images: {
				select: {
					id: true,
					altText: true,
				},
			},
		},
	});

	invariantResponse(book, 'Not found', { status: 404 });

	const date = new Date(book.updatedAt);
	const timeAgo = formatDistanceToNow(date);

	return json({
		book,
		timeAgo,
	});
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

export function ErrorBoundary() {
	return (
		<GeneralErrorBoundary
			statusHandlers={{
				403: () => <p>You are not allowed to do that</p>,
				404: ({ params }) => (
					<p>No book with the id "{params.bookId}" exists</p>
				),
			}}
		/>
	);
}
