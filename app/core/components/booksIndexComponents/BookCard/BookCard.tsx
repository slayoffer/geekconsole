import { useForm } from '@conform-to/react';
import { getFieldsetConstraint, parse } from '@conform-to/zod';
import { Pencil2Icon } from '@radix-ui/react-icons';
import { Form, Link, useActionData } from '@remix-run/react';
import { Loader2 } from 'lucide-react';
import { AuthenticityTokenInput } from 'remix-utils/csrf/react';
import { type action } from '~/routes/_layout+/books+/_index.tsx';
import { useDelayedIsPending } from '~/shared/lib/hooks/useDelayedIsPending/useDelayedIsPending.tsx';
import { DeleteBookFormSchema } from '~/shared/schemas/DeleteBookSchema/DeleteBookSchema.ts';

import {
	Badge,
	Button,
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	ErrorList,
} from '~/shared/ui/index.ts';

type BookCardProps = {
	book: {
		id: string;
		title: string;
		author: string;
		year: number;
		readingStatus: string;
		description: string;
		comment: string | null;
		ownerId: string;
	};
};

const getFormAction = (id: string) => `/books/${id}/destroy` as const;

export const BookCard = ({ book }: BookCardProps) => {
	const { id, title, readingStatus } = book;

	const actionData = useActionData<typeof action>();

	const isPending = useDelayedIsPending({
		formAction: getFormAction(id),
	});

	const [form] = useForm({
		id: 'delete-note',
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
						<Pencil2Icon />
					</Link>
				</Button>
			</CardHeader>
			<CardContent className="flex flex-col items-center gap-2">
				<img
					className="h-40 w-40 max-w-full rounded-xl align-middle"
					src={'images/noCover.gif'}
					alt={book.title}
				/>
				<Badge variant="outline">{readingStatus}</Badge>
			</CardContent>
			<CardFooter>
				<Button asChild variant="link">
					<Link to={`${id}`} prefetch="intent">
						See more
					</Link>
				</Button>
				<Form method="post" {...form.props}>
					<AuthenticityTokenInput />
					<input type="hidden" name="bookId" value={id} />
					<Button
						name="intent"
						value="delete-book"
						type="submit"
						variant="destructive"
						disabled={isPending}
					>
						{isPending ? (
							<>
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								Deleting...
							</>
						) : (
							'Delete'
						)}
					</Button>
					<ErrorList errors={form.errors} id={form.errorId} />
				</Form>
			</CardFooter>
		</Card>
	);
};
