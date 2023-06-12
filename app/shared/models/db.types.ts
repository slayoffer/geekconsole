type ReadStatus = 'want to read' | 'have read' | 'reading';

export type UserProfileDTO = {
  id: string;
  username: string;
};

export type BookDTO = {
  id: string;
  createdAt: string;
  updatedAt: string;
  status: ReadStatus;
  title: string;
  description: string;
  author: string;
  year: number;
  image_url: string;
  user_id: string;
};
