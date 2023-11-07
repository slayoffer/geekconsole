import fs from 'node:fs';
import { faker } from '@faker-js/faker';
import { PrismaClient } from '@prisma/client';
import { promiseHash } from 'remix-utils/promise';
import { createPassword, createUser } from '~/tests/db-utils.ts';

const prisma = new PrismaClient();

async function img({
	altText,
	filepath,
}: {
	altText?: string;
	filepath: string;
}) {
	return {
		altText,
		contentType: filepath.endsWith('.png') ? 'image/png' : 'image/jpeg',
		blob: await fs.promises.readFile(filepath),
	};
}

async function seed() {
	console.log('🌱 Seeding...');
	console.time(`🌱 Database has been seeded`);

	console.time('🧹 Cleaned up the database...');
	await prisma.user.deleteMany();
	console.timeEnd('🧹 Cleaned up the database...');

	const totalUsers = 5;
	console.time(`👤 Created ${totalUsers} users...`);

	const bookImages = await Promise.all([
		img({
			altText: 'a nice country house',
			filepath: './tests/fixtures/images/books/0.png',
		}),
		img({
			altText: 'a city scape',
			filepath: './tests/fixtures/images/books/1.png',
		}),
		img({
			altText: 'a sunrise',
			filepath: './tests/fixtures/images/books/2.png',
		}),
		img({
			altText: 'a group of friends',
			filepath: './tests/fixtures/images/books/3.png',
		}),
		img({
			altText: 'friends being inclusive of someone who looks lonely',
			filepath: './tests/fixtures/images/books/4.png',
		}),
		img({
			altText: 'an illustration of a hot air balloon',
			filepath: './tests/fixtures/images/books/5.png',
		}),
		img({
			altText:
				'an office full of laptops and other office equipment that look like it was abandond in a rush out of the building in an emergency years ago.',
			filepath: './tests/fixtures/images/books/6.png',
		}),
		img({
			altText: 'a rusty lock',
			filepath: './tests/fixtures/images/books/7.png',
		}),
		img({
			altText: 'something very happy in nature',
			filepath: './tests/fixtures/images/books/8.png',
		}),
		img({
			altText: `someone at the end of a cry session who's starting to feel a little better.`,
			filepath: './tests/fixtures/images/books/9.png',
		}),
	]);

	const userImages = await Promise.all(
		Array.from({ length: 10 }, (_, index) =>
			img({ filepath: `./tests/fixtures/images/user/${index}.jpg` }),
		),
	);

	for (let index = 0; index < totalUsers; index++) {
		const userData = createUser();

		await prisma.user
			.create({
				select: { id: true },
				data: {
					...userData,
					password: { create: createPassword(userData.username) },
					image: { create: userImages[index % 10] },
					roles: { connect: { name: 'user' } },
					books: {
						create: Array.from({
							length: faker.number.int({ min: 1, max: 3 }),
						}).map(() => ({
							title: faker.lorem.sentence(),
							author: faker.person.fullName(),
							year: 2023,
							readingStatus: 'want to read',
							description: faker.lorem.paragraph(),
							comment: faker.lorem.paragraph(),
							images: {
								create: Array.from({
									length: faker.number.int({ min: 1, max: 3 }),
								}).map(() => {
									const imgNumber = faker.number.int({ min: 0, max: 9 });
									return bookImages[imgNumber];
								}),
							},
						})),
					},
				},
			})
			.catch((e: any) => {
				console.error('Error creating a user:', e);
				return null;
			});
	}

	console.timeEnd(`👤 Created ${totalUsers} users...`);

	console.time(`🐨 Created user "volodya"`);

	const volodyaImages = await promiseHash({
		volodyaUser: img({
			filepath: './tests/fixtures/images/user/kody.png',
			altText: 'My profile image, lol',
		}),
		cuteKoala: img({
			altText: 'an adorable koala cartoon illustration',
			filepath: './tests/fixtures/images/my-books/cute-koala.png',
		}),
		koalaEating: img({
			altText: 'a cartoon illustration of a koala in a tree eating',
			filepath: './tests/fixtures/images/my-books/koala-eating.png',
		}),
		koalaCuddle: img({
			altText: 'a cartoon illustration of koalas cuddling',
			filepath: './tests/fixtures/images/my-books/koala-cuddle.png',
		}),
		mountain: img({
			altText: 'a beautiful mountain covered in snow',
			filepath: './tests/fixtures/images/my-books/mountain.png',
		}),
		koalaCoder: img({
			altText: 'a koala coding at the computer',
			filepath: './tests/fixtures/images/my-books/koala-coder.png',
		}),
		koalaMentor: img({
			altText:
				'a koala in a friendly and helpful posture. The Koala is standing next to and teaching a woman who is coding on a computer and shows positive signs of learning and understanding what is being explained.',
			filepath: './tests/fixtures/images/my-books/koala-mentor.png',
		}),
		koalaSoccer: img({
			altText: 'a cute cartoon koala kicking a soccer ball on a soccer field ',
			filepath: './tests/fixtures/images/my-books/koala-soccer.png',
		}),
	});

	await prisma.user.create({
		select: { id: true },
		data: {
			email: 'skinner.vova@gmail.com',
			username: 'vvolodya',
			name: 'Volodya',
			password: { create: createPassword('Qwerty!23') },
			image: { create: volodyaImages.volodyaUser },
			roles: { connect: [{ name: 'admin' }, { name: 'user' }] },
			books: {
				create: [
					{
						id: 'd27a197e',
						title: 'My best book',
						author: 'Volodya',
						year: 2022,
						readingStatus: 'want to read',
						description: 'My best book ever',
						comment: 'My best book ever for real',
						images: {
							create: [volodyaImages.cuteKoala, volodyaImages.koalaEating],
						},
					},
					{
						id: '414f0c09',
						title: 'My best book2',
						author: 'Volodya',
						year: 2022,
						readingStatus: 'want to read',
						description: 'My best book ever',
						comment: 'My best book ever for real',
						images: {
							create: [volodyaImages.cuteKoala, volodyaImages.koalaEating],
						},
					},
					{
						id: 'bb79cf45',
						title: 'My best book3',
						author: 'Volodya',
						year: 2022,
						readingStatus: 'want to read',
						description: 'My best book ever',
						comment: 'My best book ever for real',
						images: {
							create: [volodyaImages.cuteKoala, volodyaImages.koalaEating],
						},
					},
					{
						id: '9f4308be',
						title: 'My best book4',
						author: 'Volodya',
						year: 2022,
						readingStatus: 'want to read',
						description: 'My best book ever',
						comment: 'My best book ever for real',
						images: {
							create: [volodyaImages.cuteKoala, volodyaImages.koalaEating],
						},
					},
				],
			},
		},
	});
	console.timeEnd(`🐨 Created user "volodya"`);

	console.timeEnd(`🌱 Database has been seeded`);
}

seed()
	.catch((e: any) => {
		console.error(e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
