import type { ChangeEvent } from 'react';
import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { json, redirect } from '@remix-run/node';
import type { ActionArgs, LoaderArgs } from '@remix-run/node';
import { Form as RemixForm, useSubmit } from '@remix-run/react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { getSession } from '~/core/server';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
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
} from '~/shared/ui';

const READING_STATUSES: { name: string; value: string }[] = [
  { name: 'Want to read', value: 'wantToRead' },
  { name: 'Reading', value: 'reading' },
  { name: 'Have read', value: 'haveRead' },
];

const newBookFormSchema = z.object({
  title: z.string().min(1, { message: 'Please, provide a title' }),
  author: z.string().min(1, { message: 'Please, provide an author' }),
  publishDate: z.string().min(1, { message: 'Please, provide a publish date' }),
  coverImg: z.any(),
  readingStatus: z.enum(['wantToRead', 'reading', 'haveRead'], {
    required_error: 'You need to select a reading status',
  }),
  description: z
    .string()
    .min(10, { message: 'Please, provide at least some description' }),
  comments: z.string().optional(),
});
type NewBookFormData = z.infer<typeof newBookFormSchema>;
const authFormResolver = zodResolver(newBookFormSchema);

export default function NewBook() {
  const submit = useSubmit();
  const [coverImg, setCoverImg] = useState<File | undefined>(undefined);

  const form = useForm<NewBookFormData>({
    resolver: authFormResolver,
    defaultValues: {
      title: '',
      author: '',
      publishDate: '',
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
    bookFormData.append('publishData', data.publishDate);
    bookFormData.append('readingStatus', data.readingStatus);
    bookFormData.append('description', data.description);
    bookFormData.append('comments', data.comments ?? '');

    if (coverImg) bookFormData.append('File', coverImg, coverImg.name);

    submit(bookFormData, { method: 'post' });
  };

  return (
    <div className="mx-auto max-w-screen-md">
      <h1 className="mb-4 text-center text-4xl font-extrabold tracking-tight text-white md:text-5xl lg:text-6xl">
        Remember a Book
      </h1>
      <p className="mb-4 text-center font-light text-yellow-400 sm:text-xl lg:mb-12">
        Want to track a book you have read or reading now? Just add it here.
      </p>
      <Card>
        <CardHeader>Da Book</CardHeader>
        <CardContent>
          <Form {...form}>
            <RemixForm
              onSubmit={form.handleSubmit(onSubmit)}
              action="/books/new-form"
              method="post"
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
              {/* PUBLISH DATE */}
              <FormField
                name="publishDate"
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
                name="coverImg"
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
                name="readingStatus"
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
              <Button type="submit">
                Add this book to collection &#128230;
              </Button>
            </RemixForm>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

export const action = async ({ request }: ActionArgs) => {
  const formData = await request.formData();

  console.log(formData);
  return json({ ok: true });
};

export const loader = ({ request }: LoaderArgs) => {
  const session = getSession(request);

  if (session === null) {
    throw redirect('/', 401);
  }

  return json({ ok: true });
};
