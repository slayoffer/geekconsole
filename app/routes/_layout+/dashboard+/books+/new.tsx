import {
	type FieldConfig,
	conform,
	useFieldset,
	useForm,
	list,
	useFieldList,
} from '@conform-to/react';
import { getFieldsetConstraint, parse } from '@conform-to/zod';
import { type SEOHandle } from '@nasa-gcn/remix-seo';
import {
	type LoaderFunctionArgs,
	json,
	redirect,
	unstable_parseMultipartFormData as parseMultipartFormData,
	unstable_createMemoryUploadHandler as createMemoryUploadHandler,
} from '@remix-run/node';
import { type MetaFunction, useActionData, Form, Link } from '@remix-run/react';
import { useRef, useState } from 'react';
import { AuthenticityTokenInput } from 'remix-utils/csrf/react';
import { useSpinDelay } from 'spin-delay';
import { z } from 'zod';
import {
	prisma,
	requireUserId,
	validateCSRF,
} from '~/app/core/server/index.ts';

import { useSubmitting } from '~/app/shared/lib/hooks/index.ts';
import { cn, getBookImgSrc } from '~/app/shared/lib/utils/index.ts';
import { type BreadcrumbHandle } from '~/app/shared/schemas/index.ts';
import {
	Alert,
	AlertDescription,
	AlertTitle,
	Button,
	Card,
	CardContent,
	ErrorList,
	GeneralErrorBoundary,
	Icon,
	Input,
	Label,
	RadioGroup,
	RadioGroupItem,
	Textarea,
} from '~/app/shared/ui/index.ts';

export const meta: MetaFunction = () => {
	return [
		{ title: 'New book | Geek Console' },
		{ name: 'description', content: 'Add new book to your collection' },
	];
};

export const handle: BreadcrumbHandle & SEOHandle = {
	breadcrumb: 'New Book',
	getSitemapEntries: () => null,
};

const MAX_UPLOAD_SIZE = 1024 * 1024 * 3; // 3MB
const READING_STATUSES = ['want to read', 'reading', 'have read'];

const ImageFieldsetSchema = z.object({
	id: z.string().optional(),
	file: z
		.instanceof(File)
		.optional()
		.refine((file) => {
			return !file || file.size <= MAX_UPLOAD_SIZE;
		}, 'File size must be less than 3MB'),
	altText: z.string().optional(),
});

type ImageFieldset = z.infer<typeof ImageFieldsetSchema>;

function imageHasFile(
	image: ImageFieldset,
): image is ImageFieldset & { file: NonNullable<ImageFieldset['file']> } {
	return Boolean(image.file?.size && image.file?.size > 0);
}

const NewBookFormSchema = z.object({
	id: z.string().optional(),
	title: z
		.string()
		.min(1, { message: 'Please, provide a title' })
		.max(100, { message: 'Title is too long' }),
	author: z
		.string()
		.min(1, { message: 'Please, provide an author' })
		.max(100, { message: 'Author name is too long' }),
	year: z.number().positive(),
	images: z.array(ImageFieldsetSchema).max(5).optional(),
	readingStatus: z.string(),
	description: z
		.string()
		.min(10, { message: 'Please, provide at least some description' }),
	comment: z.string().optional(),
});

export default function NewBook() {
	const actionData = useActionData<typeof action>();

	const isSubmitting = useSubmitting();
	const showSpinner = useSpinDelay(isSubmitting);

	const [form, fields] = useForm({
		id: 'newBook',
		constraint: getFieldsetConstraint(NewBookFormSchema),
		lastSubmission: actionData?.submission,
		shouldValidate: 'onBlur',
		shouldRevalidate: 'onBlur',
		onValidate({ formData }) {
			return parse(formData, {
				schema: NewBookFormSchema,
			});
		},
		defaultValue: {
			title: '',
			author: '',
			year: new Date().getFullYear(),
			images: [{}],
			readingStatus: '',
			description: '',
			comment: '',
		},
	});

	const imageList = useFieldList(form.ref, fields.images);

	return (
		<div>
			<Card className="pt-6">
				<CardContent>
					<Form
						method="post"
						encType="multipart/form-data"
						className="relative grid w-full grid-cols-2 gap-4"
						{...form.props}
					>
						<AuthenticityTokenInput />
						{/*
					This hidden submit button is here to ensure that when the user hits
					"enter" on an input field, the primary form function is submitted
					rather than the first button in the form (which is delete/add image).
				*/}
						<button type="submit" className="hidden" />

						{/* TODO: this will be used for update also */}
						{/* {book ? <input type="hidden" name="id" value={book.id} /> : null} */}

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

						{/* IMAGES */}
						<div>
							<Label>Images</Label>
							<ul className="flex flex-col gap-4">
								{imageList.map((image, index) => (
									<li
										key={image.key}
										className="relative border-b-2 border-muted-foreground"
									>
										<button
											className="absolute right-0 top-0 text-foreground-destructive"
											{...list.remove(fields.images.name, { index })}
										>
											<span aria-hidden>
												<Icon name="cross-1" />
											</span>{' '}
											<span className="sr-only">Remove image {index + 1}</span>
										</button>
										<ImageChooser config={image} />
									</li>
								))}
							</ul>
						</div>

						{/* READING STATUS */}
						<div>
							<Label htmlFor={fields.readingStatus.id}>Reading status</Label>
							<RadioGroup
								className="flex space-y-1"
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

						{/* Comments */}
						<div>
							<Label htmlFor={fields.comment.id}>Your comments</Label>
							<Input
								placeholder="Share your thoughts about this book or leave some comments for your future reference"
								{...conform.input(fields.comment)}
							/>
							<div className="min-h-[32px] px-4 pb-3 pt-1">
								<ErrorList
									id={fields.comment.errorId}
									errors={fields.comment.errors}
								/>
							</div>
						</div>

						<ErrorList id={form.errorId} errors={form.errors} />

						<Button
							type="submit"
							disabled={showSpinner}
							className="absolute bottom-0 right-0"
						>
							Add this book to collection
						</Button>
					</Form>
				</CardContent>
			</Card>
		</div>
	);
}

export const action = async ({ request }: LoaderFunctionArgs) => {
	const userId = await requireUserId(request);

	const uploadHandler = createMemoryUploadHandler({
		maxPartSize: MAX_UPLOAD_SIZE,
	});

	const formData = await parseMultipartFormData(request, uploadHandler);

	await validateCSRF(formData, request.headers);

	const submission = await parse(formData, {
		schema: NewBookFormSchema.superRefine(async (data, ctx) => {
			if (!data.id) return;

			const book = await prisma.book.findUnique({
				select: { id: true },
				where: { id: data.id, ownerId: userId },
			});

			if (!book) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: 'Book not found',
				});
			}
		}).transform(async ({ images = [], ...data }) => {
			return {
				...data,
				newImages: await Promise.all(
					images
						.filter(imageHasFile)
						.filter((i) => !i.id)
						.map(async (image) => {
							return {
								altText: image.altText,
								contentType: image.file.type,
								blob: Buffer.from(await image.file.arrayBuffer()),
							};
						}),
				),
			};
		}),
		async: true,
	});

	if (submission.intent !== 'submit') return json({ submission } as const);
	if (!submission.value) return json({ submission } as const, { status: 400 });

	const {
		title,
		author,
		year,
		readingStatus,
		description,
		comment,
		newImages = [],
	} = submission.value;

	const { id } = await prisma.book.create({
		select: { id: true },
		data: {
			ownerId: userId,
			title,
			author,
			year,
			readingStatus,
			description,
			comment,
			images: { create: newImages },
		},
	});

	return redirect(`/dashboard/books/${id}`);
};

export const loader = async (_: LoaderFunctionArgs) => {
	return json({});
};

function ImageChooser({
	config,
}: {
	config: FieldConfig<z.infer<typeof ImageFieldsetSchema>>;
}) {
	const ref = useRef<HTMLFieldSetElement>(null);
	const fields = useFieldset(ref, config);
	const existingImage = Boolean(fields.id.defaultValue);
	const [previewImage, setPreviewImage] = useState<string | null>(
		fields.id.defaultValue ? getBookImgSrc(fields.id.defaultValue) : null,
	);
	const [altText, setAltText] = useState(fields.altText.defaultValue ?? '');

	return (
		<fieldset
			ref={ref}
			aria-invalid={Boolean(config.errors?.length) || undefined}
			aria-describedby={config.errors?.length ? config.errorId : undefined}
		>
			<div className="flex gap-3">
				<div className="w-32">
					<div className="relative h-32 w-32">
						<label
							htmlFor={fields.file.id}
							className={cn('group absolute h-32 w-32 rounded-lg', {
								'bg-accent opacity-40 focus-within:opacity-100 hover:opacity-100':
									!previewImage,
								'cursor-pointer focus-within:ring-4': !existingImage,
							})}
						>
							{previewImage ? (
								<div className="relative">
									<img
										src={previewImage}
										alt={altText ?? ''}
										className="h-32 w-32 rounded-lg object-cover"
									/>
									{existingImage ? null : (
										<div className="pointer-events-none absolute -right-0.5 -top-0.5 rotate-12 rounded-sm bg-secondary px-2 py-1 text-xs text-secondary-foreground shadow-md">
											new
										</div>
									)}
								</div>
							) : (
								<div className="flex h-32 w-32 items-center justify-center rounded-lg border border-muted-foreground text-4xl text-muted-foreground">
									<Icon name="plus" />
								</div>
							)}

							{existingImage ? (
								<input
									{...conform.input(fields.id, {
										type: 'hidden',
										ariaAttributes: true,
									})}
								/>
							) : null}

							<input
								aria-label="Image"
								className="absolute left-0 top-0 z-0 h-32 w-32 cursor-pointer opacity-0"
								onChange={(event) => {
									const file = event.target.files?.[0];

									if (file) {
										const reader = new FileReader();
										reader.onloadend = () => {
											setPreviewImage(reader.result as string);
										};
										reader.readAsDataURL(file);
									} else {
										setPreviewImage(null);
									}
								}}
								accept="image/*"
								{...conform.input(fields.file, {
									type: 'file',
									ariaAttributes: true,
								})}
							/>
						</label>
					</div>
					<div className="min-h-[32px] px-4 pb-3 pt-1">
						<ErrorList id={fields.file.errorId} errors={fields.file.errors} />
					</div>
				</div>
				<div className="flex-1">
					<Label htmlFor={fields.altText.id}>Alt Text</Label>
					<Textarea
						onChange={(e) => setAltText(e.currentTarget.value)}
						{...conform.textarea(fields.altText, { ariaAttributes: true })}
					/>
					<div className="min-h-[32px] px-4 pb-3 pt-1">
						<ErrorList
							id={fields.altText.errorId}
							errors={fields.altText.errors}
						/>
					</div>
				</div>
			</div>
			<div className="min-h-[32px] px-4 pb-3 pt-1">
				<ErrorList id={config.errorId} errors={config.errors} />
			</div>
		</fieldset>
	);
}

export const ErrorBoundary = () => {
	return (
		<GeneralErrorBoundary
			statusHandlers={{
				401: () => (
					<Alert variant="destructive" className="w-2/4">
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
