import fs from 'node:fs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const firstBook = await prisma.book.findFirst();

if (!firstBook) {
	throw new Error('You need to have a book in the database first');
}

await prisma.book.update({
	where: { id: firstBook.id },
	data: {
		images: {
			create: [
				{
					altText: 'an adorable koala cartoon illustration',
					contentType: 'image/png',
					blob: await fs.promises.readFile(
						'./tests/fixtures/images/my-books/cute-koala.png',
					),
				},
				{
					altText: 'a cartoon illustration of a koala in a tree eating',
					contentType: 'image/png',
					blob: await fs.promises.readFile(
						'./tests/fixtures/images/my-books/koala-eating.png',
					),
				},
			],
		},
	},
});
