import { json, redirect, type LoaderArgs } from '@remix-run/node';
import { Form } from '@remix-run/react';

import { getSession } from '~/core/server';
import {
  Button,
  Input,
  Label,
  RadioGroup,
  RadioGroupItem,
  Textarea,
} from '~/shared/ui';

export default function NewBook() {
  return (
    <div className="mx-auto max-w-screen-md px-4">
      <h1 className="mb-4 text-center text-4xl font-extrabold tracking-tight text-white md:text-5xl lg:text-6xl">
        Remember a Book
      </h1>
      <p className="mb-4 text-center font-light text-yellow-400 sm:text-xl lg:mb-12">
        Want to track a book you have read or reading now? Just add it here.
      </p>
      <Form
        action="/books/new-form"
        method="post"
        className="flex flex-col justify-center space-y-8"
      >
        <div>
          <Label htmlFor="title">Title</Label>
          <Input
            name="title"
            type="text"
            id="title"
            placeholder="Romeo & Juliet"
            required
          />
          <p className="text-sm text-muted-foreground">
            Enter the title of the book.
          </p>
        </div>
        <div>
          <Label htmlFor="author">Author</Label>
          <Input
            name="author"
            type="text"
            id="author"
            placeholder="William Shakespear"
            required
          />
          <p className="text-sm text-muted-foreground">
            Enter the author of the book.
          </p>
        </div>
        <div>
          <Label htmlFor="year">Publish date</Label>
          <Input
            name="year"
            type="number"
            id="publish-date"
            placeholder="1597"
          />
          <p className="text-sm text-muted-foreground">
            Enter the publish date of the book.
          </p>
        </div>
        <div className="grid w-full items-center gap-1.5">
          <Label htmlFor="picture">Upload cover image</Label>
          <Input id="picture" type="file" />
        </div>
        <div>
          <p className="text-sm">Status of reading</p>
          <RadioGroup className="flex" defaultValue="want to read">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="want to read" id="r1" />
              <Label htmlFor="r1">Want to read</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="reading" id="r2" />
              <Label htmlFor="r2">Reading</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="have read" id="r3" />
              <Label htmlFor="r3">Have read</Label>
            </div>
          </RadioGroup>
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="description">Book description</Label>
          <Textarea
            name="description"
            id="description"
            rows={6}
            placeholder="Book description"
          />
          <p className="text-sm text-muted-foreground">
            Enter the description of the book.
          </p>
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="comments">Your comments</Label>
          <Textarea
            name="comment"
            id="comments"
            rows={6}
            placeholder="Share your thoughts about this book or leave some comments for your future reference"
          />
        </div>
        <Button>Add this book to collection &#128230;</Button>
      </Form>
    </div>
  );
}

export const loader = ({ request }: LoaderArgs) => {
  const session = getSession(request);

  if (session === null) {
    throw redirect('/', 401);
  }

  return json({ ok: true });
};
