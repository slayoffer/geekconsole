import type { ChangeEvent } from 'react';
import { useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { json, redirect } from '@remix-run/node';
import type { ActionArgs, LoaderArgs } from '@remix-run/node';
import { Form as RemixForm, useActionData, useSubmit } from '@remix-run/react';
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
  useToast,
} from '~/shared/ui';

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
  const { toast } = useToast();
  const submit = useSubmit();
  const [coverImg, setCoverImg] = useState<File | undefined>(undefined);
  const errorMsg = useActionData();

  useEffect(() => {
    if (errorMsg) {
      toast({
        title: errorMsg.message,
        variant: 'destructive',
      });
    }
  }, [errorMsg, toast]);

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
  const { randomUUID } = require('crypto');

  const formData = await request.formData();

  const response = new Response();
  const { supabaseClient, session } = await getSession(request);

  const coverImg = formData.get('coverImg');

  let imgPath: string | null = null;

  if (coverImg && coverImg instanceof File) {
    const fileExt = coverImg.name.split('.').at(-1);

    const { data, error } = await supabaseClient.storage
      .from('books')
      .upload(`${session?.user.id}/${randomUUID()}.${fileExt}`, coverImg);

    if (data) imgPath = data.path;
    else if (error) return json({ message: error.message });
  }

  const { error } = await supabaseClient.from('books').insert([
    {
      user_id: session?.user.id,
      image_url: imgPath,
      status: formData.get('status'),
      title: formData.get('title'),
      description: formData.get('description'),
      comments: formData.get('comments'),
      author: formData.get('author'),
      year: formData.get('year'),
    },
  ]);

  if (error) return json({ message: error.message });

  return redirect('/books', { headers: response.headers });
};

export const loader = ({ request }: LoaderArgs) => {
  const session = getSession(request);

  if (session === null) {
    throw redirect('/', 401);
  }

  return json({ ok: true });
};
