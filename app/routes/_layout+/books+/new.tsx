import { randomUUID } from 'crypto';
import { conform, useForm } from '@conform-to/react';
import { getFieldsetConstraint, parse } from '@conform-to/zod';
import { ExclamationTriangleIcon } from '@radix-ui/react-icons';
import {
	type DataFunctionArgs,
	json,
	redirect,
	unstable_parseMultipartFormData as parseMultipartFormData,
	unstable_createMemoryUploadHandler as createMemoryUploadHandler,
} from '@remix-run/node';
import { type MetaFunction, Link, useActionData, Form } from '@remix-run/react';
import { Loader2 } from 'lucide-react';
import { useSpinDelay } from 'spin-delay';
import { z } from 'zod';

import { getSession } from '~/core/server/index.ts';
import { BUCKET_BOOKS_URL } from '~/shared/consts/index.ts';
import { useSubmitting } from '~/shared/lib/hooks/index.ts';
import { invariantResponse } from '~/shared/lib/utils/index.ts';
import { type ReadingStatus } from '~/shared/types/index.ts';
import {
	Alert,
	AlertDescription,
	AlertTitle,
	Button,
	Card,
	CardContent,
	ErrorList,
	GeneralErrorBoundary,
	Input,
	Label,
	RadioGroup,
	RadioGroupItem,
} from '~/shared/ui/index.ts';

export const meta: MetaFunction = () => {
	return [
		{ title: 'New book | Geek Console' },
		{ name: 'description', content: 'Add new book to your collection' },
	];
};

const MAX_UPLOAD_SIZE = 1024 * 1024 * 3; // 3MB
const READING_STATUSES: ReadingStatus[] = [
	'want to read',
	'reading',
	'have read',
];

const newBookFormSchema = z.object({
	title: z
		.string()
		.min(1, { message: 'Please, provide a title' })
		.max(100, { message: 'Title is too long' }),
	author: z
		.string()
		.min(1, { message: 'Please, provide an author' })
		.max(100, { message: 'Author name is too long' }),
	year: z.number().positive(),
	coverImg: z
		.instanceof(File)
		.refine(
			(file) => file.size <= MAX_UPLOAD_SIZE,
			'File size must be less than 3MB',
		)
		.optional(),
	readingStatus: z.string(),
	description: z
		.string()
		.min(10, { message: 'Please, provide at least some description' }),
	comments: z.string().optional(),
});

export default function NewBook() {
	const actionData = useActionData<typeof action>();

	const isSubmitting = useSubmitting();
	const showSpinner = useSpinDelay(isSubmitting);

	const [form, fields] = useForm({
		id: 'newBook',
		constraint: getFieldsetConstraint(newBookFormSchema),
		lastSubmission: actionData?.submission,
		shouldValidate: 'onBlur',
		shouldRevalidate: 'onBlur',
		onValidate({ formData }) {
			return parse(formData, {
				schema: newBookFormSchema,
			});
		},
		defaultValue: {
			title: '',
			author: '',
			year: new Date().getFullYear(),
			readingStatus: '',
			description: '',
		},
	});

	return (
		<div>
			<h1 className="mb-4 text-center text-4xl font-extrabold tracking-tight text-white md:text-5xl lg:text-6xl">
				Remember a Book
			</h1>
			<p className="mb-4 text-center font-light text-yellow-400 sm:text-xl lg:mb-12">
				Want to track a book you have read or reading now? Just add it here.
			</p>

			<Card className="pt-6">
				<CardContent>
					<Form method="post" encType="multipart/form-data" {...form.props}>
						{/* TITLE */}
						<div>
							<Label htmlFor={fields.title.id}>Title</Label>
							<Input
								autoFocus
								placeholder="Romeo & Juliet"
								{...conform.input(fields.title, { type: 'string' })}
							/>
							<div className="min-h-[32px] px-4 pb-3 pt-1">
								<ErrorList
									id={fields.title.errorId}
									errors={fields.title.errors}
								/>
							</div>
						</div>

						{/* AUTHOR */}
						<div>
							<Label htmlFor={fields.author.id}>Author</Label>
							<Input
								placeholder="William Shakespear"
								{...conform.input(fields.author, { type: 'string' })}
							/>
							<div className="min-h-[32px] px-4 pb-3 pt-1">
								<ErrorList
									id={fields.author.errorId}
									errors={fields.author.errors}
								/>
							</div>
						</div>

						{/* YEAR */}
						<div>
							<Label htmlFor={fields.year.id}>Year</Label>
							<Input
								placeholder="1597"
								{...conform.input(fields.year, { type: 'number' })}
							/>
							<div className="min-h-[32px] px-4 pb-3 pt-1">
								<ErrorList
									id={fields.year.errorId}
									errors={fields.year.errors}
								/>
							</div>
						</div>

						{/* COVER IMG */}
						<div>
							<Label htmlFor={fields.coverImg.id}>Upload Cover Image</Label>
							<Input
								type="file"
								accept="image/jpg, image/jpeg, image/png, image/webp"
								{...conform.input(fields.coverImg, { type: 'file' })}
							/>
							<div className="min-h-[32px] px-4 pb-3 pt-1">
								<ErrorList
									id={fields.coverImg.errorId}
									errors={fields.coverImg.errors}
								/>
							</div>
						</div>

						{/* READING STATUS */}
						<div>
							<Label htmlFor={fields.readingStatus.id}>Reading status</Label>
							<RadioGroup
								className="flex flex-col space-y-1"
								{...conform.input(fields.readingStatus)}
							>
								{conform
									.collection(fields.readingStatus, {
										type: 'radio',
										options: READING_STATUSES,
									})
									.map((props) => (
										<div
											key={props.value}
											className="flex items-center space-x-3 space-y-0"
										>
											<RadioGroupItem {...props} type="button" />
											<Label>{props.value}</Label>
										</div>
									))}
							</RadioGroup>
							<div className="min-h-[32px] px-4 pb-3 pt-1">
								<ErrorList
									id={fields.readingStatus.errorId}
									errors={fields.readingStatus.errors}
								/>
							</div>
						</div>

						{/* DESCRIPTION */}
						<div>
							<Label htmlFor={fields.description.id}>Description</Label>
							<Input
								placeholder="Book description"
								{...conform.input(fields.description)}
							/>
							<div className="min-h-[32px] px-4 pb-3 pt-1">
								<ErrorList
									id={fields.description.errorId}
									errors={fields.description.errors}
								/>
							</div>
						</div>

						{/* Comments */}
						<div>
							<Label htmlFor={fields.comments.id}>Your comments</Label>
							<Input
								placeholder="Share your thoughts about this book or leave some comments for your future reference"
								{...conform.input(fields.comments)}
							/>
							<div className="min-h-[32px] px-4 pb-3 pt-1">
								<ErrorList
									id={fields.comments.errorId}
									errors={fields.comments.errors}
								/>
							</div>
						</div>

						<Button type="submit" disabled={showSpinner}>
							{showSpinner ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Please wait
								</>
							) : (
								'Add this book to collection'
							)}
						</Button>
					</Form>
				</CardContent>
			</Card>
		</div>
	);
}

export const action = async ({ request }: DataFunctionArgs) => {
	const response = new Response();
	const { supabaseClient, session } = await getSession(request);
	const uploadHandler = createMemoryUploadHandler({
		maxPartSize: MAX_UPLOAD_SIZE,
	});

	const formData = await parseMultipartFormData(request, uploadHandler);
	const submission = parse(formData, { schema: newBookFormSchema });

	if (submission.intent !== 'submit' || !submission.value) {
		return json({ status: 'error', submission } as const, { status: 400 });
	}

	const { title, author, year, readingStatus, description, comments } =
		submission.value;

	const coverImg = submission.value.coverImg;

	let imgPath: string | null = null;

	if (coverImg && coverImg instanceof File) {
		const fileExt = coverImg.name.split('.').at(-1);

		const { data, error } = await supabaseClient.storage
			.from('books')
			.upload(`${session?.user.id}/${randomUUID()}.${fileExt}`, coverImg);

		if (data) imgPath = data.path;

		invariantResponse(!error, error?.message, { status: 500 });
	}

	const { error } = await supabaseClient.from('books').insert([
		{
			user_id: session?.user.id ?? '',
			image_url: `${BUCKET_BOOKS_URL}/${imgPath}`,
			status: readingStatus as ReadingStatus,
			title,
			description,
			comments,
			author,
			year,
		},
	]);

	invariantResponse(!error, error?.message, { status: 500 });

	return redirect('/books', { headers: response.headers });
};

export const loader = async ({ request }: DataFunctionArgs) => {
	const { session } = await getSession(request);

	invariantResponse(session, 'Unauthorized', { status: 401 });

	return json({ ok: true });
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
							You must be logged in to add a book.
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
