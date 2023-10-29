import { Pencil2Icon } from '@radix-ui/react-icons';
import { Form, Link } from '@remix-run/react';

import type { ReadingStatus } from '~/shared/types';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '~/shared/ui';

type BookCardProps = {
  book: {
    id: string;
    title: string;
    status: ReadingStatus;
    image_url: string | null;
  };
};

export const BookCard = ({ book }: BookCardProps) => {
  const { id, title, status, image_url } = book;

  const onSubmit = (event: any) => {
    const response = confirm('Please confirm you want to delete this book.');
    if (!response) event.preventDefault();
  };

  return (
    <Card className="flex flex-col items-center">
      <CardHeader className="flex-row items-center gap-4">
        <p>{title}</p>
        <Button variant="link" size="icon" asChild className="mt-0">
          <Link to={`${id}/edit`}>
            <Pencil2Icon />
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-2">
        <img
          className="h-40 w-40 max-w-full rounded-xl align-middle"
          src={image_url ?? ''}
          alt={title}
        />
        <Badge variant="outline">{status}</Badge>
      </CardContent>
      <CardFooter>
        <Button asChild variant="link">
          <Link to={`${id}`}>See more</Link>
        </Button>
        <Form action={`${id}/destroy`} method="post" onSubmit={onSubmit}>
          <Button type="submit" variant="destructive">
            Delete
          </Button>
        </Form>
      </CardFooter>
    </Card>
  );
};
