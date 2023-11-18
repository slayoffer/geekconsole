export type ReadingStatus = 'want to read' | 'reading' | 'have read';

export type BookDto = {
	id: string;
	createdAt: string;
	updatedAt: string;
	status: ReadingStatus;
	title: string;
	description: string;
	comments: string;
	author: string;
	year: number;
	image_url: string;
	user_id: string;
};
