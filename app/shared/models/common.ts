import { type User } from '@prisma/client';
import { type Theme } from '~/app/core/server/index.ts';

export type OutletContextValues = {
	user: User;
	theme: Theme;
	toast: any;
};
