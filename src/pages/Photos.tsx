import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, rectSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Upload, ImagePlus, X, MapPin, Calendar, Heart, GripVertical } from 'lucide-react';
import { useStore } from '../store/useStore';
import { SortableAlbumCard } from '../components/SortableAlbumCard';

interface SortablePreviewItemProps {
  id: string;
  url: string;
  onRemove: () => void;
}

const SortablePreviewItem = ({ id, url, onRemove }: SortablePreviewItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="relative group"
    >
      <img
        src={url}
        alt="预览"
        className="w-full aspect-square object-cover rounded-lg"
      />
      <div
        {...attributes}
        {...listeners}
        className="absolute top-1 left-1 p-1 bg-black/50 text-white rounded-full cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <GripVertical className="w-3 h-3" />
      </div>
      <button
        type="button"
        onClick={onRemove}
        className="absolute top-1 right-1 p-1 bg-black/50 text-white rounded-full hover:bg-black/70"
      >
        <X className="w-3 h-3" />
      </button>
    </div>
  );
};

export const Photos = () => {
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    year: '',
    month: '',
    day: '',
  });
  const [previewItems, setPreviewItems] = useState<{ id: string; url: string; file: File }[]>([]);
  const { photoAlbums, addPhotoAlbum, reorderPhotoAlbums, uploadPhoto } = useStore();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = photoAlbums.findIndex((album) => album.id === active.id);
      const newIndex = photoAlbums.findIndex((album) => album.id === over.id);
      const newAlbums = arrayMove(photoAlbums, oldIndex, newIndex);
      await reorderPhotoAlbums(newAlbums);
    }
  };

  const handlePreviewDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = previewItems.findIndex((item) => item.id === active.id);
      const newIndex = previewItems.findIndex((item) => item.id === over.id);
      setPreviewItems(arrayMove(previewItems, oldIndex, newIndex));
    }
  };

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newItems: { id: string; url: string; file: File }[] = [];
      const fileArray = Array.from(files).filter(f => f.type.startsWith('image/'));
      
      let loadedCount = 0;
      fileArray.forEach((file, index) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          newItems[index] = {
            id: `${Date.now()}-${index}-${file.name}`,
            url: event.target?.result as string,
            file,
          };
          loadedCount++;
          if (loadedCount === fileArray.length) {
            setPreviewItems(prev => [...prev, ...newItems.filter(Boolean)]);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  }, []);

  const removePreview = (id: string) => {
    setPreviewItems(previewItems.filter((item) => item.id !== id));
  };

  const getDateValue = () => {
    if (formData.year && formData.month && formData.day) {
      return `${formData.year}-${formData.month.padStart(2, '0')}-${formData.day.padStart(2, '0')}`;
    } else if (formData.year && formData.month) {
      return `${formData.year}-${formData.month.padStart(2, '0')}`;
    } else if (formData.year) {
      return formData.year;
    }
    return '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (previewItems.length === 0) return;

    try {
      const photoUrls = await Promise.all(
        previewItems.map(async (item, index) => {
          const ext = item.file.name.split('.').pop() || 'jpg';
          const safeName = `${Date.now()}-${index}.${ext}`;
          const path = `albums/${safeName}`;
          return await uploadPhoto(item.file, path);
        })
      );

      await addPhotoAlbum({
        title: formData.title || '未命名相册',
        description: formData.description,
        location: formData.location,
        date: getDateValue() || new Date().toISOString().split('T')[0],
        photos: photoUrls.map((url, index) => ({
          id: `${Date.now()}-${index}`,
          url,
          description: '',
          likes: 0,
        })),
      });

      setIsUploadOpen(false);
      setPreviewItems([]);
      setFormData({
        title: '',
        description: '',
        location: '',
        year: '',
        month: '',
        day: '',
      });
    } catch (error) {
      console.error('上传失败:', error);
      const errorMessage = error instanceof Error ? error.message : '未知错误';
      alert(`上传失败：${errorMessage}\n请检查网络连接和 Supabase 配置`);
    }
  };

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const files = e.dataTransfer.files;
      if (files) {
        const newItems: { id: string; url: string; file: File }[] = [];
        const fileArray = Array.from(files).filter(f => f.type.startsWith('image/'));
        
        let loadedCount = 0;
        fileArray.forEach((file, index) => {
          const reader = new FileReader();
          reader.onload = (event) => {
            newItems[index] = {
              id: `${Date.now()}-${index}-${file.name}`,
              url: event.target?.result as string,
              file,
            };
            loadedCount++;
            if (loadedCount === fileArray.length) {
              setPreviewItems(prev => [...prev, ...newItems.filter(Boolean)]);
            }
          };
          reader.readAsDataURL(file);
        });
      }
    },
    []
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleYearChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      year: value,
      month: '',
      day: '',
    }));
  };

  const handleMonthChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      month: value,
      day: '',
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-birthday-light via-white to-birthday-purple/20 pt-20">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              <span className="text-birthday-pink">📷</span> 我的相册
            </h1>
            <p className="text-gray-500 mt-1">拖拽卡片可以调整相册顺序</p>
          </div>
          <button
            onClick={() => setIsUploadOpen(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-birthday-pink text-white rounded-full hover:bg-birthday-rose transition-all duration-300 transform hover:scale-105 shadow-md"
          >
            <Upload className="w-5 h-5" />
            <span>上传相册</span>
          </button>
        </div>

        {photoAlbums.length === 0 ? (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-birthday-purple/30 rounded-full mb-6">
              <ImagePlus className="w-12 h-12 text-birthday-pink" />
            </div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">还没有相册</h3>
            <p className="text-gray-400 mb-6">上传你的第一个相册，开始记录美好时光吧！</p>
            <button
              onClick={() => setIsUploadOpen(true)}
              className="px-6 py-3 bg-birthday-pink text-white rounded-full hover:bg-birthday-rose transition-all"
            >
              上传相册
            </button>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={photoAlbums.map((album) => album.id)}
              strategy={rectSortingStrategy}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {photoAlbums.map((album) => (
                  <SortableAlbumCard key={album.id} album={album} />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>

      {isUploadOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-xl font-bold text-gray-800">上传新相册</h2>
              <button
                onClick={() => {
                  setIsUploadOpen(false);
                  setPreviewItems([]);
                  setFormData({ title: '', description: '', location: '', year: '', month: '', day: '' });
                }}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
                  previewItems.length > 0
                    ? 'border-birthday-pink bg-birthday-pink/10'
                    : 'border-gray-300 hover:border-birthday-pink hover:bg-birthday-pink/5'
                }`}
              >
                {previewItems.length > 0 ? (
                  <div>
                    <DndContext
                      sensors={sensors}
                      collisionDetection={closestCenter}
                      onDragEnd={handlePreviewDragEnd}
                    >
                      <SortableContext
                        items={previewItems.map((item) => item.id)}
                        strategy={rectSortingStrategy}
                      >
                        <div className="grid grid-cols-3 gap-2 mb-4">
                          {previewItems.map((item) => (
                            <SortablePreviewItem
                              key={item.id}
                              id={item.id}
                              url={item.url}
                              onRemove={() => removePreview(item.id)}
                            />
                          ))}
                        </div>
                      </SortableContext>
                    </DndContext>
                    <p className="text-gray-600 mb-2">已选择 {previewItems.length} 张照片（拖拽可调整顺序）</p>
                  </div>
                ) : (
                  <div>
                    <ImagePlus className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600 mb-2">点击或拖拽上传照片（可多选）</p>
                    <p className="text-gray-400 text-sm">支持 JPG、PNG 格式</p>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  id="photo-upload"
                  multiple
                />
                <label
                  htmlFor="photo-upload"
                  className="inline-block mt-3 px-4 py-2 bg-birthday-pink text-white rounded-full cursor-pointer hover:bg-birthday-rose transition-colors"
                >
                  {previewItems.length > 0 ? '添加更多照片' : '选择照片'}
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">相册标题</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-birthday-pink focus:border-transparent"
                  placeholder="给相册起个名字，如：红海湾之旅"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">描述</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-birthday-pink focus:border-transparent"
                  rows={3}
                  placeholder="记录下这个相册背后的故事..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <span className="flex items-center space-x-1">
                    <MapPin className="w-4 h-4" />
                    <span>地点</span>
                  </span>
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-birthday-pink focus:border-transparent"
                  placeholder="在哪里拍的？"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <span className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4" />
                    <span>日期（可选填年、年月、年月日）</span>
                  </span>
                </label>
                <div className="flex items-center space-x-2">
                  <select
                    value={formData.year}
                    onChange={(e) => handleYearChange(e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-birthday-pink focus:border-transparent"
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
                  {formData.year && (
                    <select
                      value={formData.month}
                      onChange={(e) => handleMonthChange(e.target.value)}
                      className="w-24 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-birthday-pink focus:border-transparent"
                    >
                      <option value="">月份</option>
                      {Array.from({ length: 12 }, (_, i) => (
                        <option key={i + 1} value={(i + 1).toString()}>
                          {i + 1}月
                        </option>
                      ))}
                    </select>
                  )}
                  {formData.year && formData.month && (
                    <select
                      value={formData.day}
                      onChange={(e) => setFormData({ ...formData, day: e.target.value })}
                      className="w-20 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-birthday-pink focus:border-transparent"
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
                  type="button"
                  onClick={() => {
                    setIsUploadOpen(false);
                    setPreviewItems([]);
                    setFormData({ title: '', description: '', location: '', year: '', month: '', day: '' });
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  取消
                </button>
                <button
                  type="submit"
                  disabled={previewItems.length === 0}
                  className="flex-1 px-4 py-2 bg-birthday-pink text-white rounded-lg hover:bg-birthday-rose transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  <Heart className="w-4 h-4" />
                  <span>保存相册</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
