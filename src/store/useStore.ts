import { create } from 'zustand';
import { PhotoAlbum, PhotoItem, Diary, Message } from '../types';
import { mockPhotoAlbums, mockDiaries, mockMessages } from '../data/mockData';

interface Store {
  photoAlbums: PhotoAlbum[];
  diaries: Diary[];
  messages: Message[];
  addPhotoAlbum: (album: Omit<PhotoAlbum, 'id'>) => void;
  addDiary: (diary: Omit<Diary, 'id'>) => void;
  addMessage: (message: Omit<Message, 'id'>) => void;
  updatePhotoAlbum: (id: string, album: Partial<PhotoAlbum>) => void;
  updateDiary: (id: string, diary: Partial<Diary>) => void;
  likePhoto: (albumId: string, photoId: string) => void;
  deletePhotoAlbum: (id: string) => void;
  deleteDiary: (id: string) => void;
  deleteMessage: (id: string) => void;
  getPhotoAlbumById: (id: string) => PhotoAlbum | undefined;
  getDiaryById: (id: string) => Diary | undefined;
  getMessageById: (id: string) => Message | undefined;
  reorderPhotos: (albumId: string, photoIds: string[]) => void;
  reorderDiaryImages: (diaryId: string, imageUrls: string[]) => void;
  reorderPhotoAlbums: (albums: PhotoAlbum[]) => void;
  reorderDiaries: (diaries: Diary[]) => void;
  loadFromStorage: () => void;
  resetToMockData: () => void;
}

const STORAGE_KEY_PHOTO_ALBUMS = 'birthday_photo_albums';
const STORAGE_KEY_DIARIES = 'birthday_diaries';
const STORAGE_KEY_MESSAGES = 'birthday_messages';
const STORAGE_KEY_VERSION = 'birthday_version';
const CURRENT_VERSION = '4';

const saveToStorage = (key: string, data: unknown) => {
  localStorage.setItem(key, JSON.stringify(data));
};

const loadFromStorage = <T>(key: string, defaultValue: T): T => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
  } catch {
    return defaultValue;
  }
};

const checkAndResetStorage = (): boolean => {
  const storedVersion = localStorage.getItem(STORAGE_KEY_VERSION);
  if (storedVersion !== CURRENT_VERSION) {
    localStorage.removeItem(STORAGE_KEY_PHOTO_ALBUMS);
    localStorage.removeItem(STORAGE_KEY_DIARIES);
    localStorage.removeItem(STORAGE_KEY_MESSAGES);
    localStorage.removeItem('birthday_photos');
    localStorage.setItem(STORAGE_KEY_VERSION, CURRENT_VERSION);
    return true;
  }
  return false;
};

const shouldReset = checkAndResetStorage();

export const useStore = create<Store>((set, get) => ({
  photoAlbums: shouldReset ? mockPhotoAlbums : loadFromStorage(STORAGE_KEY_PHOTO_ALBUMS, mockPhotoAlbums),
  diaries: shouldReset ? mockDiaries : loadFromStorage(STORAGE_KEY_DIARIES, mockDiaries),
  messages: shouldReset ? mockMessages : loadFromStorage(STORAGE_KEY_MESSAGES, mockMessages),

  addPhotoAlbum: (album) => {
    const newAlbum: PhotoAlbum = {
      ...album,
      id: Date.now().toString(),
    };
    set((state) => {
      const newAlbums = [newAlbum, ...state.photoAlbums];
      saveToStorage(STORAGE_KEY_PHOTO_ALBUMS, newAlbums);
      return { photoAlbums: newAlbums };
    });
  },

  addDiary: (diary) => {
    const newDiary: Diary = {
      ...diary,
      id: Date.now().toString(),
    };
    set((state) => {
      const newDiaries = [newDiary, ...state.diaries];
      saveToStorage(STORAGE_KEY_DIARIES, newDiaries);
      return { diaries: newDiaries };
    });
  },

  addMessage: (message) => {
    const newMessage: Message = {
      ...message,
      id: Date.now().toString(),
    };
    set((state) => {
      const newMessages = [newMessage, ...state.messages];
      saveToStorage(STORAGE_KEY_MESSAGES, newMessages);
      return { messages: newMessages };
    });
  },

  updatePhotoAlbum: (id, album) => {
    set((state) => {
      const newAlbums = state.photoAlbums.map((a) =>
        a.id === id ? { ...a, ...album } : a
      );
      saveToStorage(STORAGE_KEY_PHOTO_ALBUMS, newAlbums);
      return { photoAlbums: newAlbums };
    });
  },

  updateDiary: (id, diary) => {
    set((state) => {
      const newDiaries = state.diaries.map((d) =>
        d.id === id ? { ...d, ...diary } : d
      );
      saveToStorage(STORAGE_KEY_DIARIES, newDiaries);
      return { diaries: newDiaries };
    });
  },

  likePhoto: (albumId, photoId) => {
    set((state) => {
      const newAlbums = state.photoAlbums.map((album) => {
        if (album.id === albumId) {
          return {
            ...album,
            photos: album.photos.map((photo) =>
              photo.id === photoId
                ? { ...photo, likes: photo.likes + 1 }
                : photo
            ),
          };
        }
        return album;
      });
      saveToStorage(STORAGE_KEY_PHOTO_ALBUMS, newAlbums);
      return { photoAlbums: newAlbums };
    });
  },

  deletePhotoAlbum: (id) => {
    set((state) => {
      const newAlbums = state.photoAlbums.filter((album) => album.id !== id);
      saveToStorage(STORAGE_KEY_PHOTO_ALBUMS, newAlbums);
      return { photoAlbums: newAlbums };
    });
  },

  deleteDiary: (id) => {
    set((state) => {
      const newDiaries = state.diaries.filter((diary) => diary.id !== id);
      saveToStorage(STORAGE_KEY_DIARIES, newDiaries);
      return { diaries: newDiaries };
    });
  },

  deleteMessage: (id) => {
    set((state) => {
      const newMessages = state.messages.filter((message) => message.id !== id);
      saveToStorage(STORAGE_KEY_MESSAGES, newMessages);
      return { messages: newMessages };
    });
  },

  getPhotoAlbumById: (id) => get().photoAlbums.find((album) => album.id === id),

  getDiaryById: (id) => get().diaries.find((diary) => diary.id === id),

  getMessageById: (id) => get().messages.find((message) => message.id === id),

  reorderPhotos: (albumId, photoIds) => {
    set((state) => {
      const newAlbums = state.photoAlbums.map((album) => {
        if (album.id === albumId) {
          const newPhotos: PhotoItem[] = [];
          photoIds.forEach((photoId) => {
            const photo = album.photos.find((p) => p.id === photoId);
            if (photo) newPhotos.push(photo);
          });
          return { ...album, photos: newPhotos };
        }
        return album;
      });
      saveToStorage(STORAGE_KEY_PHOTO_ALBUMS, newAlbums);
      return { photoAlbums: newAlbums };
    });
  },

  reorderDiaryImages: (diaryId, imageUrls) => {
    set((state) => {
      const newDiaries = state.diaries.map((diary) =>
        diary.id === diaryId ? { ...diary, imageUrls } : diary
      );
      saveToStorage(STORAGE_KEY_DIARIES, newDiaries);
      return { diaries: newDiaries };
    });
  },

  reorderPhotoAlbums: (albums) => {
    set((state) => {
      saveToStorage(STORAGE_KEY_PHOTO_ALBUMS, albums);
      return { photoAlbums: albums };
    });
  },

  reorderDiaries: (diaries) => {
    set((state) => {
      saveToStorage(STORAGE_KEY_DIARIES, diaries);
      return { diaries };
    });
  },

  loadFromStorage: () => {
    const albums = loadFromStorage(STORAGE_KEY_PHOTO_ALBUMS, mockPhotoAlbums);
    const diaries = loadFromStorage(STORAGE_KEY_DIARIES, mockDiaries);
    const messages = loadFromStorage(STORAGE_KEY_MESSAGES, mockMessages);
    set({ photoAlbums: albums, diaries, messages });
  },

  resetToMockData: () => {
    localStorage.removeItem(STORAGE_KEY_PHOTO_ALBUMS);
    localStorage.removeItem(STORAGE_KEY_DIARIES);
    localStorage.removeItem(STORAGE_KEY_MESSAGES);
    localStorage.removeItem('birthday_photos');
    localStorage.setItem(STORAGE_KEY_VERSION, CURRENT_VERSION);
    set({ photoAlbums: mockPhotoAlbums, diaries: mockDiaries, messages: mockMessages });
  },
}));
