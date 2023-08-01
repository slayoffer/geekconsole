import { Link, useOutletContext } from '@remix-run/react';

import type { BookDTO, OutletContextValues } from '~/shared/models';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '~/shared/ui';

type BookCardProps = {
  book: BookDTO;
};

export const BookCard = ({ book }: BookCardProps) => {
  const { id, title, status, image_url } = book;

  const { session } = useOutletContext<OutletContextValues>();

  return (
    <Card className="flex flex-col items-center">
      <CardHeader>{title}</CardHeader>
      <CardContent className="flex flex-col items-center gap-2">
        <img
          className="h-56 w-40 max-w-full rounded-xl align-middle"
          src={image_url}
          alt={title}
        />
        <Badge variant="outline">{status}</Badge>
      </CardContent>
      <CardFooter>
        <Button asChild variant="link">
          <Link to={`${session.user.id}/${id}`}>See more</Link>
        </Button>
      </CardFooter>
    </Card>
  );
};
