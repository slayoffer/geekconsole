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
          created_at: string | null;
          description: string;
          id: number;
          image_url: string | null;
          status: string;
          title: string;
          updated_at: string | null;
          user_id: string;
          year: number;
        };
        Insert: {
          author: string;
          comments?: string | null;
          created_at?: string | null;
          description: string;
          id?: number;
          image_url?: string | null;
          status: string;
          title: string;
          updated_at?: string | null;
          user_id: string;
          year: number;
        };
        Update: {
          author?: string;
          comments?: string | null;
          created_at?: string | null;
          description?: string;
          id?: number;
          image_url?: string | null;
          status?: string;
          title?: string;
          updated_at?: string | null;
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
      user_profiles: {
        Row: {
          created_at: string | null;
          id: string;
          username: string | null;
        };
        Insert: {
          created_at?: string | null;
          id: string;
          username?: string | null;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          username?: string | null;
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
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};
