import { Link } from '@remix-run/react';

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
  book: { id: string; title: string; status: ReadingStatus; image_url: string };
};

export const BookCard = ({ book }: BookCardProps) => {
  const { id, title, status, image_url } = book;

  return (
    <Card className="flex flex-col items-center">
      <CardHeader>{title}</CardHeader>
      <CardContent className="flex flex-col items-center gap-2">
        <img
          className="h-40 w-40 max-w-full rounded-xl align-middle"
          src={image_url}
          alt={title}
        />
        <Badge variant="outline">{status}</Badge>
      </CardContent>
      <CardFooter>
        <Button asChild variant="link">
          <Link to={`${id}`}>See more</Link>
        </Button>
      </CardFooter>
    </Card>
  );
};
