import { zodResolver } from '@hookform/resolvers/zod';
import { Form as RemixForm, useSubmit } from '@remix-run/react';
import { Loader2 } from 'lucide-react';
import { useState, type ChangeEvent } from 'react';
import { useForm } from 'react-hook-form';
import { useSpinDelay } from 'spin-delay';
import { z } from 'zod';
import { useIsSubmitting } from '~/shared/lib/utils/index.ts';

import {
	Button,
	Card,
	CardContent,
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
	Input,
	RadioGroup,
	RadioGroupItem,
	Textarea,
} from '~/shared/ui/index.ts';

const READING_STATUSES: { name: string; value: string }[] = [
	{ name: 'Want to read', value: 'want to read' },
	{ name: 'Reading', value: 'reading' },
	{ name: 'Have read', value: 'have read' },
];

const newBookFormSchema = z.object({
	title: z.string().min(1, { message: 'Please, provide a title' }),
	author: z.string().min(1, { message: 'Please, provide an author' }),
	year: z.string().min(1, { message: 'Please, provide a publish date' }),
	image_url: z.any(),
	status: z.enum(['want to read', 'reading', 'have read'], {
		required_error: 'Please, select a reading status',
	}),
	description: z
		.string()
		.min(10, { message: 'Please, provide at least some description' }),
	comments: z.string().optional(),
});
type NewBookFormData = z.infer<typeof newBookFormSchema>;
const authFormResolver = zodResolver(newBookFormSchema);

export const NewBookForm = () => {
	const submit = useSubmit();
	const [coverImg, setCoverImg] = useState<File | undefined>(undefined);

	const isSubmitting = useIsSubmitting();
	const showSpinner = useSpinDelay(isSubmitting);

	const form = useForm<NewBookFormData>({
		resolver: authFormResolver,
		defaultValues: {
			title: '',
			author: '',
			year: '',
			description: '',
			comments: '',
		},
	});

	const onChangeCoverImg = (e: ChangeEvent<HTMLInputElement>) => {
		if (!e.target.files) return;
		setCoverImg(e.target.files[0]);
	};

	const onSubmit = (data: NewBookFormData) => {
		const bookFormData = new FormData();

		bookFormData.append('title', data.title);
		bookFormData.append('author', data.author);
		bookFormData.append('year', data.year);
		bookFormData.append('status', data.status);
		bookFormData.append('description', data.description);
		bookFormData.append('comments', data.comments ?? '');

		if (coverImg) bookFormData.append('coverImg', coverImg, coverImg.name);

		submit(bookFormData, { method: 'post', encType: 'multipart/form-data' });
	};

	return (
		<Card className="pt-6">
			<CardContent>
				<Form {...form}>
					<RemixForm
						onSubmit={form.handleSubmit(onSubmit)}
						className="flex flex-col justify-center space-y-8"
					>
						{/* TITLE */}
						<FormField
							name="title"
							control={form.control}
							render={({ field }) => (
								<FormItem>
									<FormLabel>Title</FormLabel>
									<FormControl>
										<Input
											placeholder="Romeo & Juliet"
											type="text"
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						{/* AUTHOR */}
						<FormField
							name="author"
							control={form.control}
							render={({ field }) => (
								<FormItem>
									<FormLabel>Author</FormLabel>
									<FormControl>
										<Input
											placeholder="William Shakespear"
											type="text"
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						{/* YEAR */}
						<FormField
							name="year"
							control={form.control}
							render={({ field }) => (
								<FormItem>
									<FormLabel>Publish Date</FormLabel>
									<FormControl>
										<Input placeholder="1597" type="number" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						{/* COVER IMG */}
						<FormField
							name="image_url"
							control={form.control}
							render={() => (
								<FormItem>
									<FormLabel>Upload Cover Image</FormLabel>
									<Input
										type="file"
										accept="image/jpg, image/jpeg, image/png, image/webp"
										onChange={onChangeCoverImg}
									/>
									<FormMessage />
								</FormItem>
							)}
						/>
						{/* READING STATUS */}
						<FormField
							name="status"
							control={form.control}
							render={({ field }) => (
								<FormItem>
									<FormLabel>Reading Status</FormLabel>
									<FormControl>
										<RadioGroup
											className="flex flex-col space-y-1"
											onValueChange={field.onChange}
											{...field}
										>
											{READING_STATUSES.map((status) => (
												<FormItem
													key={status.value}
													className="flex items-center space-x-3 space-y-0"
												>
													<FormControl>
														<RadioGroupItem
															value={status.value}
															id={status.value}
														/>
													</FormControl>
													<FormLabel>{status.name}</FormLabel>
												</FormItem>
											))}
										</RadioGroup>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						{/* DESCRIPTION */}
						<FormField
							name="description"
							control={form.control}
							render={({ field }) => (
								<FormItem>
									<FormLabel>Description</FormLabel>
									<FormControl>
										<Textarea
											{...field}
											rows={6}
											placeholder="Book description"
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						{/* COMMENTS */}
						<FormField
							name="comments"
							control={form.control}
							render={({ field }) => (
								<FormItem>
									<FormLabel>Your comments</FormLabel>
									<FormControl>
										<Textarea
											{...field}
											rows={6}
											placeholder="Share your thoughts about this book or leave some comments for your future reference"
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
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
					</RemixForm>
				</Form>
			</CardContent>
		</Card>
	);
};
