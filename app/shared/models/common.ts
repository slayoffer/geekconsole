import { type Theme } from '~/core/server/index.ts';
import { type User } from '../types/index.ts';

export type OutletContextValues = {
	user: User;
	theme: Theme;
	toast: any;
};
