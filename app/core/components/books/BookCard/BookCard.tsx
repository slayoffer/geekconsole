import { useForm } from '@conform-to/react';
import { getFieldsetConstraint, parse } from '@conform-to/zod';
import { type BookImage, type Book } from '@prisma/client';
import { Form, Link, useActionData } from '@remix-run/react';
import { AuthenticityTokenInput } from 'remix-utils/csrf/react';
import { type action } from '~/app/routes/_layout+/dashboard+/books+/collection.tsx';
import { useDoubleCheck } from '~/app/shared/lib/hooks/index.ts';
import { useDelayedIsPending } from '~/app/shared/lib/hooks/useDelayedIsPending/useDelayedIsPending.tsx';
import { getBookImgSrc } from '~/app/shared/lib/utils/index.ts';
import {
	DELETE_BOOK_INTENT,
	DeleteBookFormSchema,
} from '~/app/shared/schemas/DeleteBookSchema/DeleteBookSchema.ts';

import {
	Badge,
	Button,
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	ErrorList,
	Icon,
	StatusButton,
} from '~/app/shared/ui/index.ts';

type BookProps = Pick<Book, 'id' | 'title' | 'readingStatus'> & {
	images: Pick<BookImage, 'id'>[];
};
type BookCardProps = {
	book: BookProps;
};

export const BookCard = ({ book }: BookCardProps) => {
	const { id, title, readingStatus, images } = book;

	const actionData = useActionData<typeof action>();
	const isPending = useDelayedIsPending();
	const dc = useDoubleCheck();

	const [form] = useForm({
		id: 'delete-book',
		lastSubmission: actionData?.submission,
		constraint: getFieldsetConstraint(DeleteBookFormSchema),
		onValidate({ formData }) {
			return parse(formData, { schema: DeleteBookFormSchema });
		},
	});

	return (
		<Card className="flex flex-col items-center">
			<CardHeader className="flex-row items-center gap-4">
				<p>{title}</p>
				<Button variant="link" size="icon" asChild className="mt-0">
					<Link to={`${id}/edit`} prefetch="intent">
						Edit
					</Link>
				</Button>
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
				<Form method="post" {...form.props}>
					<AuthenticityTokenInput />

					<input type="hidden" name="bookId" value={id} />

					<StatusButton
						{...dc.getButtonProps({
							type: 'submit',
							name: 'intent',
							value: DELETE_BOOK_INTENT,
						})}
						variant={dc.doubleCheck ? 'destructive' : 'default'}
						status={isPending ? 'pending' : actionData?.status ?? 'idle'}
					>
						<Icon name="trash">
							{dc.doubleCheck ? 'Are you sure?' : 'Delete'}
						</Icon>
					</StatusButton>

					<ErrorList errors={form.errors} id={form.errorId} />
				</Form>
			</CardFooter>
		</Card>
	);
};
