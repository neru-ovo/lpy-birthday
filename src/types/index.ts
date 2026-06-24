export interface PhotoItem {
  id: string;
  url: string;
  description: string;
  likes: number;
}

export interface PhotoAlbum {
  id: string;
  title: string;
  description: string;
  location: string;
  date: string;
  photos: PhotoItem[];
  orderIndex: number;
}

export interface Diary {
  id: string;
  title: string;
  content: string;
  location: string;
  date: string;
  imageUrls: string[];
  orderIndex: number;
}

export interface Message {
  id: string;
  title: string;
  content: string;
  date: string;
  cardColor: string;
  createdAt: string;
}
