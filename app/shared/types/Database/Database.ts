export type Json =
	| string
	| number
	| boolean
	| null
	| { [key: string]: Json | undefined }
	| Json[];

export type Database = {
	public: {
		Tables: {
			books: {
				Row: {
					author: string;
					comments: string | null;
					created_at: string;
					description: string;
					id: string;
					status: Database['public']['Enums']['Reading status'];
					title: string;
					updated_at: string;
					user_id: string;
					year: number;
				};
				Insert: {
					author: string;
					comments?: string | null;
					created_at?: string;
					description: string;
					id?: string;
					status?: Database['public']['Enums']['Reading status'];
					title: string;
					updated_at?: string;
					user_id: string;
					year: number;
				};
				Update: {
					author?: string;
					comments?: string | null;
					created_at?: string;
					description?: string;
					id?: string;
					status?: Database['public']['Enums']['Reading status'];
					title?: string;
					updated_at?: string;
					user_id?: string;
					year?: number;
				};
				Relationships: [
					{
						foreignKeyName: 'books_user_id_fkey';
						columns: ['user_id'];
						referencedRelation: 'user_profiles';
						referencedColumns: ['id'];
					},
				];
			};
			books_images: {
				Row: {
					alt_text: string;
					book_id: string;
					created_at: string;
					id: string;
					updated_at: string;
					url: string;
				};
				Insert: {
					alt_text: string;
					book_id: string;
					created_at?: string;
					id?: string;
					updated_at?: string;
					url: string;
				};
				Update: {
					alt_text?: string;
					book_id?: string;
					created_at?: string;
					id?: string;
					updated_at?: string;
					url?: string;
				};
				Relationships: [
					{
						foreignKeyName: 'books_images_book_id_fkey';
						columns: ['book_id'];
						referencedRelation: 'books';
						referencedColumns: ['id'];
					},
				];
			};
			user_profiles: {
				Row: {
					created_at: string;
					email: string;
					id: string;
					username: string;
				};
				Insert: {
					created_at?: string;
					email?: string;
					id: string;
					username: string;
				};
				Update: {
					created_at?: string;
					email?: string;
					id?: string;
					username?: string;
				};
				Relationships: [
					{
						foreignKeyName: 'user_profiles_id_fkey';
						columns: ['id'];
						referencedRelation: 'users';
						referencedColumns: ['id'];
					},
				];
			};
		};
		Views: {
			[_ in never]: never;
		};
		Functions: {
			[_ in never]: never;
		};
		Enums: {
			'Reading status': 'want to read' | 'reading' | 'have read';
		};
		CompositeTypes: {
			[_ in never]: never;
		};
	};
};
