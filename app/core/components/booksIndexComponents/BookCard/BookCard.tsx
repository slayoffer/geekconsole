import { Pencil2Icon } from '@radix-ui/react-icons';
import { Form, Link } from '@remix-run/react';
import { Loader2 } from 'lucide-react';
import { useSpinDelay } from 'spin-delay';
import { useSubmitting } from '~/shared/lib/hooks/index.ts';

import { type ReadingStatus } from '~/shared/types/index.ts';
import {
	Badge,
	Button,
	Card,
	CardContent,
	CardFooter,
	CardHeader,
} from '~/shared/ui/index.ts';

type BookCardProps = {
	book: {
		id: string;
		status: ReadingStatus;
		title: string;
		books_images: {
			id: string;
			alt_text: string;
			url: string;
		} | null;
	};
};

const getFormAction = (id: string) => `/books/${id}/destroy`;

export const BookCard = ({ book }: BookCardProps) => {
	const { id, title, status, books_images } = book;

	const isSubmitting = useSubmitting({ formAction: getFormAction(id) });
	const showSpinner = useSpinDelay(isSubmitting);

	const onSubmit = (event: any) => {
		const response = confirm('Please confirm you want to delete this book.');
		if (!response) event.preventDefault();
	};

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
					src={books_images ? books_images.url : 'images/noCover.gif'}
					alt={books_images ? books_images.alt_text : book.title}
				/>
				<Badge variant="outline">{status}</Badge>
			</CardContent>
			<CardFooter>
				<Button asChild variant="link">
					<Link to={`${id}`} prefetch="intent">
						See more
					</Link>
				</Button>
				<Form action={getFormAction(id)} method="post" onSubmit={onSubmit}>
					<Button type="submit" variant="destructive" disabled={showSpinner}>
						{showSpinner ? (
							<>
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								Deleting...
							</>
						) : (
							'Delete'
						)}
					</Button>
				</Form>
			</CardFooter>
		</Card>
	);
};
