import { z } from 'zod';

export const DeleteBookFormSchema = z.object({
	intent: z.literal('delete-book'),
	bookId: z.string(),
});
