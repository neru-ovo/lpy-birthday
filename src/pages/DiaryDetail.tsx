import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Calendar, Edit2, X, BookOpen, Trash2, ImagePlus, GripVertical } from 'lucide-react';
import { useStore } from '../store/useStore';
import { useState, useCallback } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, rectSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface SortableImageItemProps {
  image: string;
  index: number;
  onRemove: (index: number) => void;
}

const SortableImageItem = ({ image, index, onRemove }: SortableImageItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: image });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative group ${isDragging ? 'z-50' : ''}`}
    >
      <div
        {...attributes}
        {...listeners}
        className="absolute top-2 left-2 z-10 p-2 bg-white/90 rounded-full cursor-grab active:cursor-grabbing hover:bg-white transition-colors"
      >
        <GripVertical className="w-4 h-4 text-gray-500" />
      </div>
      <div className="relative">
        <img
          src={image}
          alt={`配图${index + 1}`}
          className="w-full aspect-square object-cover rounded-lg ml-8"
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors ml-8 rounded-lg" />
        <button
          onClick={() => onRemove(index)}
          className="absolute top-2 right-2 p-1 bg-white/90 rounded-full hover:bg-white"
        >
          <X className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};

export const DiaryDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { getDiaryById, updateDiary, deleteDiary, uploadPhoto } = useStore();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const diary = getDiaryById(id || '');

  const [editForm, setEditForm] = useState({
    title: '',
    content: '',
    location: '',
    year: '',
    month: '',
    day: '',
  });

  const [editImages, setEditImages] = useState<string[]>([]);
  const [newImageFiles, setNewImageFiles] = useState<File[]>([]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleImageDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = editImages.findIndex((img) => img === active.id);
      const newIndex = editImages.findIndex((img) => img === over.id);
      const newImages = arrayMove(editImages, oldIndex, newIndex);
      setEditImages(newImages);
    }
  };

  if (!diary) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-birthday-light via-white to-birthday-purple/20 pt-20 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-600 mb-4">日记不存在</h2>
          <Link to="/diary" className="text-birthday-gold hover:underline">
            返回日记列表
          </Link>
        </div>
      </div>
    );
  }

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

  const handleEditClick = () => {
    const dateParts = diary.date.split('-');
    setEditForm({
      title: diary.title,
      content: diary.content,
      location: diary.location,
      year: dateParts[0] || '',
      month: dateParts[1] || '',
      day: dateParts[2] || '',
    });
    setEditImages([...diary.imageUrls]);
    setNewImageFiles([]);
    setIsEditing(true);
  };

  const handleImageChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const urls: string[] = [...editImages];
      const newFiles: File[] = [...newImageFiles];
      Array.from(files).forEach((file) => {
        if (file.type.startsWith('image/')) {
          newFiles.push(file);
          const reader = new FileReader();
          reader.onload = (event) => {
            urls.push(event.target?.result as string);
            setEditImages([...urls]);
          };
          reader.readAsDataURL(file);
        }
      });
      setNewImageFiles(newFiles);
    }
  }, [editImages, newImageFiles]);

  const removeImage = (index: number) => {
    setEditImages(editImages.filter((_, i) => i !== index));
    setNewImageFiles(newImageFiles.filter((_, i) => i !== index));
  };

  const getDateValue = () => {
    if (editForm.year && editForm.month && editForm.day) {
      return `${editForm.year}-${editForm.month.padStart(2, '0')}-${editForm.day.padStart(2, '0')}`;
    } else if (editForm.year && editForm.month) {
      return `${editForm.year}-${editForm.month.padStart(2, '0')}`;
    } else if (editForm.year) {
      return editForm.year;
    }
    return diary.date;
  };

  const handleSave = async () => {
    try {
      let finalImages = [...editImages];
      const existingUrls = new Set(diary.imageUrls);

      if (newImageFiles.length > 0) {
        const uploadedUrls = await Promise.all(
          newImageFiles.map(async (file, index) => {
            const path = `diaries/${diary.id}-${Date.now()}-${index}-${file.name}`;
            return await uploadPhoto(file, path);
          })
        );
        finalImages = [...diary.imageUrls.filter(u => existingUrls.has(u)), ...uploadedUrls];
      }

      await updateDiary(diary.id, {
        title: editForm.title || diary.title,
        content: editForm.content,
        location: editForm.location,
        date: getDateValue(),
        imageUrls: finalImages,
      });
      setIsEditing(false);
    } catch (error) {
      alert('保存失败，请重试');
    }
  };

  const handleDelete = async () => {
    if (window.confirm('确定要删除这篇日记吗？')) {
      await deleteDiary(diary.id);
      navigate('/diary');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-birthday-light via-white to-birthday-purple/20 pt-20">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <Link
            to="/diary"
            className="flex items-center space-x-2 text-gray-600 hover:text-birthday-gold transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>返回日记列表</span>
          </Link>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleEditClick}
              className="flex items-center space-x-1 px-4 py-2 bg-birthday-gold/20 text-birthday-gold rounded-full hover:bg-birthday-gold hover:text-gray-800 transition-all"
            >
              <Edit2 className="w-4 h-4" />
              <span>编辑</span>
            </button>
            <button
              onClick={handleDelete}
              className="flex items-center space-x-1 px-4 py-2 bg-gray-100 text-gray-600 rounded-full hover:bg-red-100 hover:text-red-500 transition-all"
            >
              <Trash2 className="w-4 h-4" />
              <span>删除</span>
            </button>
          </div>
        </div>

        {isEditing ? (
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">编辑日记</h2>
              <button
                onClick={() => setIsEditing(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">标题</label>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-birthday-gold focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">内容</label>
                <textarea
                  value={editForm.content}
                  onChange={(e) => setEditForm({ ...editForm, content: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-birthday-gold focus:border-transparent"
                  rows={8}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">配图（拖拽调整顺序）</label>
                <div className="border-2 border-dashed rounded-xl p-4">
                  {editImages.length > 0 && (
                    <DndContext
                      sensors={sensors}
                      collisionDetection={closestCenter}
                      onDragEnd={handleImageDragEnd}
                    >
                      <SortableContext
                        items={editImages}
                        strategy={rectSortingStrategy}
                      >
                        <div className="grid grid-cols-3 gap-2 mb-4">
                          {editImages.map((image, index) => (
                            <SortableImageItem
                              key={image}
                              image={image}
                              index={index}
                              onRemove={removeImage}
                            />
                          ))}
                        </div>
                      </SortableContext>
                    </DndContext>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    id="diary-image-edit"
                    multiple
                  />
                  <label
                    htmlFor="diary-image-edit"
                    className="inline-flex items-center space-x-2 px-4 py-2 bg-birthday-gold/20 text-birthday-gold rounded-full cursor-pointer hover:bg-birthday-gold/30 transition-colors text-sm"
                  >
                    <ImagePlus className="w-4 h-4" />
                    <span>{editImages.length > 0 ? '添加更多图片' : '添加图片'}</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">地点</label>
                <input
                  type="text"
                  value={editForm.location}
                  onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-birthday-gold focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">日期</label>
                <div className="flex items-center space-x-2">
                  <select
                    value={editForm.year}
                    onChange={(e) => setEditForm({ ...editForm, year: e.target.value, month: '', day: '' })}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-birthday-gold focus:border-transparent"
                  >
                    <option value="">年份</option>
                    {Array.from({ length: 24 }, (_, i) => {
                      const year = new Date().getFullYear() - i + 4;
                      return (
                        <option key={year} value={year.toString()}>
                          {year}年
                        </option>
                      );
                    })}
                  </select>
                  {editForm.year && (
                    <select
                      value={editForm.month}
                      onChange={(e) => setEditForm({ ...editForm, month: e.target.value, day: '' })}
                      className="w-24 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-birthday-gold focus:border-transparent"
                    >
                      <option value="">月份</option>
                      {Array.from({ length: 12 }, (_, i) => (
                        <option key={i + 1} value={(i + 1).toString()}>
                          {i + 1}月
                        </option>
                      ))}
                    </select>
                  )}
                  {editForm.year && editForm.month && (
                    <select
                      value={editForm.day}
                      onChange={(e) => setEditForm({ ...editForm, day: e.target.value })}
                      className="w-20 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-birthday-gold focus:border-transparent"
                    >
                      <option value="">日期</option>
                      {Array.from({ length: 31 }, (_, i) => (
                        <option key={i + 1} value={(i + 1).toString()}>
                          {i + 1}日
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => setIsEditing(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={handleSave}
                  className="flex-1 px-4 py-2 bg-birthday-gold text-gray-800 rounded-lg hover:bg-yellow-400 transition-colors"
                >
                  保存修改
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            {diary.imageUrls.length > 0 && (
              <div className="relative">
                <img
                  src={diary.imageUrls[0]}
                  alt={diary.title}
                  className="w-full h-64 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
                    {diary.title}
                  </h1>
                </div>
              </div>
            )}

            <div className="p-6">
              <div className="flex items-center space-x-6 mb-6">
                <span className="flex items-center space-x-2 text-gray-600">
                  <MapPin className="w-5 h-5 text-birthday-pink" />
                  <span>{diary.location || '未知地点'}</span>
                </span>
                <span className="flex items-center space-x-2 text-gray-600">
                  <Calendar className="w-5 h-5 text-birthday-gold" />
                  <span>{formatDate(diary.date)}</span>
                </span>
              </div>

              {diary.imageUrls.length > 1 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
                  {diary.imageUrls.slice(1).map((image, index) => (
                    <img
                      key={index}
                      src={image}
                      alt={`配图${index + 2}`}
                      className="w-full aspect-square object-cover rounded-lg"
                    />
                  ))}
                </div>
              )}

              <div className="border-t pt-6">
                <h3 className="font-semibold text-gray-800 mb-4 flex items-center space-x-2">
                  <BookOpen className="w-5 h-5 text-birthday-gold" />
                  <span>日记内容</span>
                </h3>
                <div className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                  {diary.content || '这篇日记还没有内容，快来记录吧！'}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="mt-8 text-center">
          <Link
            to="/diary"
            className="inline-flex items-center space-x-2 px-6 py-3 bg-birthday-gold text-gray-800 rounded-full hover:bg-yellow-400 transition-all duration-300"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>返回日记列表</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
