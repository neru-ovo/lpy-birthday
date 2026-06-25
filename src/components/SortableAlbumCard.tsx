import { Link } from 'react-router-dom';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ChevronRight, GripVertical } from 'lucide-react';
import { PhotoAlbum } from '../types';

interface SortableAlbumCardProps {
  album: PhotoAlbum;
}

export const SortableAlbumCard = ({ album }: SortableAlbumCardProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: album.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    willChange: 'transform',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative ${isDragging ? 'z-50 shadow-2xl scale-105' : ''}`}
    >
      <div
        {...attributes}
        {...listeners}
        className="absolute top-2 left-2 z-10 p-2 bg-white/90 rounded-full cursor-grab active:cursor-grabbing hover:bg-white hover:scale-110 transition-all shadow-md"
      >
        <GripVertical className="w-4 h-4 text-gray-500" />
      </div>
      <Link
        to={`/photos/${album.id}`}
        className="block bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 group"
      >
        <div className="relative h-48 overflow-hidden ml-8">
          <img
            src={album.photos[0]?.url}
            alt={album.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="flex items-center space-x-2 text-white">
              <ChevronRight className="w-5 h-5" />
              <span className="font-medium">查看相册</span>
            </div>
          </div>
        </div>
        <div className="p-4">
          <h3 className="font-bold text-gray-800 text-lg mb-1">{album.title}</h3>
          <p className="text-gray-500 text-sm mb-2 line-clamp-2">{album.description}</p>
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>{album.location}</span>
            <span>{album.date}</span>
          </div>
          <div className="mt-3 flex items-center space-x-2">
            <span className="text-birthday-pink text-sm">
              📸 {album.photos.length} 张照片
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
};
