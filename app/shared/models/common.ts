import { type Theme } from '~/core/server/index.ts';
import { type UserProfile } from '../types/index.ts';

export type OutletContextValues = {
	userProfile: UserProfile;
	theme: Theme;
	toast: any;
};
