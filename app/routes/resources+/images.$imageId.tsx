import fs from 'node:fs';
import { PassThrough } from 'node:stream';
import {
	createReadableStreamFromReadable,
	type DataFunctionArgs,
} from '@remix-run/node';
import { invariantResponse } from '~/shared/lib/utils/index.ts';

export async function loader({ params }: DataFunctionArgs) {
	invariantResponse(params.imageId, 'Invalid image ID');

	// TODO GET IMAGE LOGIC
	const image: any = 'lol';

	invariantResponse(image, 'Image not found', { status: 404 });

	const { filepath, contentType } = image;
	const fileStat = await fs.promises.stat(filepath);
	const body = new PassThrough();

	const stream = fs.createReadStream(filepath);
	stream.on('open', () => stream.pipe(body));
	stream.on('error', (err) => body.end(err));
	stream.on('end', () => body.end());

	return new Response(createReadableStreamFromReadable(body), {
		status: 200,
		headers: {
			'content-type': contentType,
			'content-length': fileStat.size.toString(),
			'content-disposition': `inline; filename="${params.imageId}"`,
			'cache-control': 'public, max-age=31536000, immutable',
		},
	});
}
