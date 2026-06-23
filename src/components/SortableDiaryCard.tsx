import { Link } from 'react-router-dom';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { MapPin, Calendar, Trash2, BookOpen, GripVertical } from 'lucide-react';
import { Diary } from '../types';
import { useStore } from '../store/useStore';

interface SortableDiaryCardProps {
  diary: Diary;
  showDelete?: boolean;
}

export const SortableDiaryCard = ({ diary, showDelete = false }: SortableDiaryCardProps) => {
  const { deleteDiary } = useStore();

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: diary.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('确定要删除这篇日记吗？')) {
      deleteDiary(diary.id);
    }
  };

  const formatDate = (dateStr: string) => {
    if (dateStr.length === 4) {
      return `${dateStr}年`;
    } else if (dateStr.length === 7) {
      const [year, month] = dateStr.split('-');
      return `${year}年${parseInt(month)}月`;
    }
    const date = new Date(dateStr);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 ${isDragging ? 'z-50' : ''}`}
    >
      <div
        {...attributes}
        {...listeners}
        className="absolute top-2 left-2 z-10 p-2 bg-white/80 rounded-full cursor-grab active:cursor-grabbing hover:bg-white transition-colors"
      >
        <GripVertical className="w-4 h-4 text-gray-500" />
      </div>
      <div className="flex flex-col md:flex-row">
        <div className="md:w-1/3 relative overflow-hidden ml-8">
          <Link to={`/diary/${diary.id}`}>
            <img
              src={diary.imageUrls[0] || 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=beautiful%20travel%20journal%20notebook%20memories&image_size=landscape_16_9'}
              alt={diary.title}
              className="w-full h-48 md:h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
          </Link>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/50 hidden md:block" />
        </div>
        
        <div className="flex-1 p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <span className="px-3 py-1 bg-birthday-gold/20 text-birthday-gold text-xs font-semibold rounded-full">
                日记
              </span>
              <span className="flex items-center space-x-1 text-sm text-gray-500">
                <MapPin className="w-4 h-4" />
                <span>{diary.location}</span>
              </span>
            </div>
            
            <Link to={`/diary/${diary.id}`}>
              <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-birthday-rose transition-colors">
                {diary.title}
              </h3>
            </Link>
            
            <p className="text-gray-600 text-sm line-clamp-3 mb-4">
              {diary.content}
            </p>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="flex items-center space-x-1 text-sm text-gray-400">
              <Calendar className="w-4 h-4" />
              <span>{formatDate(diary.date)}</span>
            </span>
            
            <div className="flex items-center space-x-2">
              <Link
                to={`/diary/${diary.id}`}
                className="flex items-center space-x-1 px-3 py-1.5 bg-birthday-pink/20 text-birthday-rose rounded-full hover:bg-birthday-pink hover:text-white transition-all"
              >
                <BookOpen className="w-4 h-4" />
                <span>阅读</span>
              </Link>
              {showDelete && (
                <button
                  onClick={handleDelete}
                  className="p-1.5 rounded-full bg-red-50 text-red-400 hover:bg-red-100 hover:text-red-500 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
