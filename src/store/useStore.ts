import { create } from 'zustand';
import { PhotoAlbum, PhotoItem, Diary, Message } from '../types';
import { mockPhotoAlbums, mockDiaries, mockMessages } from '../data/mockData';
import { supabase } from '../lib/supabase';

interface Store {
  photoAlbums: PhotoAlbum[];
  diaries: Diary[];
  messages: Message[];
  loading: boolean;
  addPhotoAlbum: (album: Omit<PhotoAlbum, 'id' | 'orderIndex'>) => Promise<void>;
  addDiary: (diary: Omit<Diary, 'id' | 'orderIndex'>) => Promise<void>;
  addMessage: (message: Omit<Message, 'id'>) => Promise<void>;
  updateMessage: (id: string, message: Partial<Message>) => Promise<void>;
  updatePhotoAlbum: (id: string, album: Partial<PhotoAlbum>) => Promise<void>;
  updateDiary: (id: string, diary: Partial<Diary>) => Promise<void>;
  likePhoto: (albumId: string, photoId: string) => Promise<void>;
  deletePhotoAlbum: (id: string) => Promise<void>;
  deleteDiary: (id: string) => Promise<void>;
  deleteMessage: (id: string) => Promise<void>;
  getPhotoAlbumById: (id: string) => PhotoAlbum | undefined;
  getDiaryById: (id: string) => Diary | undefined;
  getMessageById: (id: string) => Message | undefined;
  reorderPhotos: (albumId: string, photoIds: string[]) => Promise<void>;
  reorderDiaryImages: (diaryId: string, imageUrls: string[]) => Promise<void>;
  reorderPhotoAlbums: (albums: PhotoAlbum[]) => Promise<void>;
  reorderDiaries: (diaries: Diary[]) => Promise<void>;
  loadFromSupabase: () => Promise<void>;
  uploadPhoto: (file: File, path: string) => Promise<string>;
}

const convertPhotoAlbum = (row: any): PhotoAlbum => ({
  id: row.id.toString(),
  title: row.title,
  description: row.description || '',
  location: row.location || '',
  date: row.date || '',
  photos: typeof row.photos === 'string' ? JSON.parse(row.photos) : (row.photos || []),
  orderIndex: row.order_index ?? 0,
});

const convertDiary = (row: any): Diary => ({
  id: row.id.toString(),
  title: row.title,
  content: row.content || '',
  location: row.location || '',
  date: row.date || '',
  imageUrls: typeof row.image_urls === 'string' ? JSON.parse(row.image_urls) : (row.image_urls || []),
  orderIndex: row.order_index ?? 0,
});

const convertMessage = (row: any): Message => ({
  id: row.id.toString(),
  title: row.title || '',
  content: row.content,
  date: row.date || new Date().toISOString().split('T')[0],
  cardColor: row.card_color || 'pink',
  createdAt: row.created_at || new Date().toISOString(),
});

export const useStore = create<Store>((set, get) => ({
  photoAlbums: mockPhotoAlbums,
  diaries: mockDiaries,
  messages: mockMessages,
  loading: false,

  uploadPhoto: async (file: File, path: string) => {
    const { data, error } = await supabase.storage.from('birthday-photos').upload(path, file, {
      cacheControl: '604800',
      upsert: false,
    });
    if (error) throw error;
    const { data: urlData } = supabase.storage.from('birthday-photos').getPublicUrl(data.path);
    return urlData.publicUrl;
  },

  loadFromSupabase: async () => {
    set({ loading: true });
    try {
      const [albumsRes, diariesRes, messagesRes] = await Promise.all([
        supabase.from('photo_albums').select('*').order('order_index', { ascending: true }),
        supabase.from('diaries').select('*').order('order_index', { ascending: true }),
        supabase.from('messages').select('*').order('id', { ascending: false }),
      ]);

      if (albumsRes.error) {
        console.error('加载相册失败:', albumsRes.error);
      }
      if (diariesRes.error) {
        console.error('加载日记失败:', diariesRes.error);
      }
      if (messagesRes.error) {
        console.error('加载寄语失败:', messagesRes.error);
      }

      const photoAlbums = albumsRes.data?.map(convertPhotoAlbum) || mockPhotoAlbums;
      const diaries = diariesRes.data?.map(convertDiary) || mockDiaries;
      const messages = messagesRes.data?.map(convertMessage) || mockMessages;

      set({ photoAlbums, diaries, messages });
    } catch (error) {
      console.error('加载数据异常:', error);
      set({ photoAlbums: mockPhotoAlbums, diaries: mockDiaries, messages: mockMessages });
    }
    set({ loading: false });
  },

  addPhotoAlbum: async (album) => {
    const maxOrder = get().photoAlbums.length > 0 
      ? Math.max(...get().photoAlbums.map(a => a.orderIndex)) 
      : -1;
    
    const { data, error } = await supabase.from('photo_albums').insert({
      title: album.title,
      description: album.description,
      location: album.location,
      date: album.date,
      photos: JSON.stringify(album.photos),
      order_index: maxOrder + 1,
    }).select();

    if (error) throw error;
    if (data && data[0]) {
      set((state) => ({ photoAlbums: [...state.photoAlbums, convertPhotoAlbum(data[0])] }));
    }
  },

  addDiary: async (diary) => {
    const maxOrder = get().diaries.length > 0 
      ? Math.max(...get().diaries.map(d => d.orderIndex)) 
      : -1;
    
    const { data, error } = await supabase.from('diaries').insert({
      title: diary.title,
      content: diary.content,
      location: diary.location,
      date: diary.date,
      image_urls: JSON.stringify(diary.imageUrls),
      order_index: maxOrder + 1,
    }).select();

    if (error) throw error;
    if (data && data[0]) {
      set((state) => ({ diaries: [...state.diaries, convertDiary(data[0])] }));
    }
  },

  addMessage: async (message) => {
    const { data, error } = await supabase.from('messages').insert({
      title: message.title,
      content: message.content,
      date: message.date,
      card_color: message.cardColor,
    }).select();

    if (error) throw error;
    if (data && data[0]) {
      set((state) => ({ messages: [convertMessage(data[0]), ...state.messages] }));
    }
  },

  updateMessage: async (id, message) => {
    const updateData: Record<string, unknown> = {};
    if (message.title !== undefined) updateData.title = message.title;
    if (message.content !== undefined) updateData.content = message.content;
    if (message.date !== undefined) updateData.date = message.date;
    if (message.cardColor !== undefined) updateData.card_color = message.cardColor;

    const { error } = await supabase.from('messages').update(updateData).eq('id', id);
    if (error) throw error;

    set((state) => ({
      messages: state.messages.map((m) =>
        m.id === id ? { ...m, ...message } : m
      ),
    }));
  },

  updatePhotoAlbum: async (id, album) => {
    const updateData: Record<string, unknown> = {};
    if (album.title !== undefined) updateData.title = album.title;
    if (album.description !== undefined) updateData.description = album.description;
    if (album.location !== undefined) updateData.location = album.location;
    if (album.date !== undefined) updateData.date = album.date;
    if (album.photos !== undefined) updateData.photos = JSON.stringify(album.photos);

    const { error } = await supabase.from('photo_albums').update(updateData).eq('id', id);
    if (error) throw error;

    set((state) => ({
      photoAlbums: state.photoAlbums.map((a) =>
        a.id === id ? { ...a, ...album } : a
      ),
    }));
  },

  updateDiary: async (id, diary) => {
    const updateData: Record<string, unknown> = {};
    if (diary.title !== undefined) updateData.title = diary.title;
    if (diary.content !== undefined) updateData.content = diary.content;
    if (diary.location !== undefined) updateData.location = diary.location;
    if (diary.date !== undefined) updateData.date = diary.date;
    if (diary.imageUrls !== undefined) updateData.image_urls = JSON.stringify(diary.imageUrls);

    const { error } = await supabase.from('diaries').update(updateData).eq('id', id);
    if (error) throw error;

    set((state) => ({
      diaries: state.diaries.map((d) =>
        d.id === id ? { ...d, ...diary } : d
      ),
    }));
  },

  likePhoto: async (albumId, photoId) => {
    const album = get().photoAlbums.find((a) => a.id === albumId);
    if (!album) return;

    const updatedPhotos = album.photos.map((photo) =>
      photo.id === photoId ? { ...photo, likes: photo.likes + 1 } : photo
    );

    await get().updatePhotoAlbum(albumId, { photos: updatedPhotos });
  },

  deletePhotoAlbum: async (id) => {
    const { error } = await supabase.from('photo_albums').delete().eq('id', id);
    if (error) throw error;

    set((state) => ({
      photoAlbums: state.photoAlbums.filter((album) => album.id !== id),
    }));
  },

  deleteDiary: async (id) => {
    const { error } = await supabase.from('diaries').delete().eq('id', id);
    if (error) throw error;

    set((state) => ({
      diaries: state.diaries.filter((diary) => diary.id !== id),
    }));
  },

  deleteMessage: async (id) => {
    const { error } = await supabase.from('messages').delete().eq('id', id);
    if (error) throw error;

    set((state) => ({
      messages: state.messages.filter((message) => message.id !== id),
    }));
  },

  getPhotoAlbumById: (id) => get().photoAlbums.find((album) => album.id === id),

  getDiaryById: (id) => get().diaries.find((diary) => diary.id === id),

  getMessageById: (id) => get().messages.find((message) => message.id === id),

  reorderPhotos: async (albumId, photoIds) => {
    const album = get().photoAlbums.find((a) => a.id === albumId);
    if (!album) return;

    const newPhotos: PhotoItem[] = [];
    photoIds.forEach((photoId) => {
      const photo = album.photos.find((p) => p.id === photoId);
      if (photo) newPhotos.push(photo);
    });

    await get().updatePhotoAlbum(albumId, { photos: newPhotos });
  },

  reorderDiaryImages: async (diaryId, imageUrls) => {
    await get().updateDiary(diaryId, { imageUrls });
  },

  reorderPhotoAlbums: async (albums) => {
    const updates = albums.map((album, index) => 
      supabase.from('photo_albums').update({ order_index: index }).eq('id', album.id)
    );
    await Promise.all(updates);
    set({ photoAlbums: albums.map((album, index) => ({ ...album, orderIndex: index })) });
  },

  reorderDiaries: async (diaries) => {
    const updates = diaries.map((diary, index) => 
      supabase.from('diaries').update({ order_index: index }).eq('id', diary.id)
    );
    await Promise.all(updates);
    set({ diaries: diaries.map((diary, index) => ({ ...diary, orderIndex: index })) });
  },
}));
