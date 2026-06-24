import { useState, useCallback } from 'react';
import { Plus, X, MapPin, Calendar, BookOpen, ImagePlus } from 'lucide-react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, rectSortingStrategy } from '@dnd-kit/sortable';
import { SortableDiaryCard } from '../components/SortableDiaryCard';
import { useStore } from '../store/useStore';

export const Diary = () => {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [uploadingFiles, setUploadingFiles] = useState<File[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    location: '',
    year: '',
    month: '',
    day: '',
  });
  const { diaries, addDiary, reorderDiaries, uploadPhoto } = useStore();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = diaries.findIndex((d) => d.id === active.id);
      const newIndex = diaries.findIndex((d) => d.id === over.id);
      const newDiaries = arrayMove(diaries, oldIndex, newIndex);
      await reorderDiaries(newDiaries);
    }
  };

  const handleImageChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const urls: string[] = [...selectedImages];
      const newFiles: File[] = [...uploadingFiles];
      Array.from(files).forEach((file) => {
        if (file.type.startsWith('image/')) {
          newFiles.push(file);
          const reader = new FileReader();
          reader.onload = (event) => {
            urls.push(event.target?.result as string);
            setSelectedImages([...urls]);
          };
          reader.readAsDataURL(file);
        }
      });
      setUploadingFiles(newFiles);
    }
  }, [selectedImages, uploadingFiles]);

  const removeImage = (index: number) => {
    setSelectedImages(selectedImages.filter((_, i) => i !== index));
    setUploadingFiles(uploadingFiles.filter((_, i) => i !== index));
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

    try {
      let imageUrls: string[] = [];
      if (uploadingFiles.length > 0) {
        imageUrls = await Promise.all(
          uploadingFiles.map(async (file, index) => {
            // 处理文件名：移除中文字符，只保留扩展名
            const ext = file.name.split('.').pop() || 'jpg';
            const safeName = `${Date.now()}-${index}.${ext}`;
            const path = `diaries/${safeName}`;
            return await uploadPhoto(file, path);
          })
        );
      }

      await addDiary({
        title: formData.title || '未命名日记',
        content: formData.content,
        location: formData.location,
        date: getDateValue() || new Date().toISOString().split('T')[0],
        imageUrls,
      });

      setIsCreateOpen(false);
      setSelectedImages([]);
      setUploadingFiles([]);
      setFormData({
        title: '',
        content: '',
        location: '',
        year: '',
        month: '',
        day: '',
      });
    } catch (error) {
      alert('保存失败，请重试');
    }
  };

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
              <span className="text-birthday-gold">📝</span> 我的日记
            </h1>
            <p className="text-gray-500 mt-1">拖拽卡片可以调整日记顺序</p>
          </div>
          <button
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-birthday-gold text-gray-800 rounded-full hover:bg-yellow-400 transition-all duration-300 transform hover:scale-105 shadow-md"
          >
            <Plus className="w-5 h-5" />
            <span>写日记</span>
          </button>
        </div>

        {diaries.length === 0 ? (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-birthday-gold/20 rounded-full mb-6">
              <BookOpen className="w-12 h-12 text-birthday-gold" />
            </div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">还没有日记</h3>
            <p className="text-gray-400 mb-6">写下你的第一篇日记，记录美好的回忆吧！</p>
            <button
              onClick={() => setIsCreateOpen(true)}
              className="px-6 py-3 bg-birthday-gold text-gray-800 rounded-full hover:bg-yellow-400 transition-all"
            >
              写日记
            </button>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={diaries.map((diary) => diary.id)}
              strategy={rectSortingStrategy}
            >
              <div className="space-y-6">
                {diaries.map((diary) => (
                  <SortableDiaryCard key={diary.id} diary={diary} showDelete />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>

      {isCreateOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-xl font-bold text-gray-800">写一篇新日记</h2>
              <button
                onClick={() => {
                  setIsCreateOpen(false);
                  setSelectedImages([]);
                  setUploadingFiles([]);
                  setFormData({ title: '', content: '', location: '', year: '', month: '', day: '' });
                }}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div className="border-2 border-dashed rounded-xl p-6 text-center hover:border-birthday-gold hover:bg-birthday-gold/5 transition-all">
                {selectedImages.length > 0 ? (
                  <div>
                    <div className="grid grid-cols-3 gap-2 mb-4">
                      {selectedImages.map((image, index) => (
                        <div key={index} className="relative">
                          <img
                            src={image}
                            alt={`配图${index + 1}`}
                            className="w-full aspect-square object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute top-1 right-1 p-1 bg-black/50 text-white rounded-full hover:bg-black/70"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                    <p className="text-gray-500 text-sm">已选择 {selectedImages.length} 张图片</p>
                  </div>
                ) : (
                  <div>
                    <ImagePlus className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500 text-sm">可选：上传配图（可多选）</p>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  id="diary-image"
                  multiple
                />
                <label
                  htmlFor="diary-image"
                  className="inline-block mt-2 px-3 py-1 bg-birthday-gold/20 text-birthday-gold rounded-full cursor-pointer hover:bg-birthday-gold/30 transition-colors text-sm"
                >
                  {selectedImages.length > 0 ? '添加更多图片' : '选择图片'}
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">标题</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-birthday-gold focus:border-transparent"
                  placeholder="给日记起个标题"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">内容</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-birthday-gold focus:border-transparent"
                  rows={6}
                  placeholder="写下你的故事..."
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-birthday-gold focus:border-transparent"
                  placeholder="在哪里写的？"
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
                  {formData.year && (
                    <select
                      value={formData.month}
                      onChange={(e) => handleMonthChange(e.target.value)}
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
                  {formData.year && formData.month && (
                    <select
                      value={formData.day}
                      onChange={(e) => setFormData({ ...formData, day: e.target.value })}
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
                  type="button"
                  onClick={() => {
                    setIsCreateOpen(false);
                    setSelectedImages([]);
                    setUploadingFiles([]);
                    setFormData({ title: '', content: '', location: '', year: '', month: '', day: '' });
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-birthday-gold text-gray-800 rounded-lg hover:bg-yellow-400 transition-colors flex items-center justify-center space-x-2"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>保存日记</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
