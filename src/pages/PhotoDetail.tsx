import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Calendar, Edit2, X, Trash2, GripVertical, ImagePlus } from 'lucide-react';
import { useStore } from '../store/useStore';
import { useState, useCallback } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, rectSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface SortablePhotoItemProps {
  photo: { id: string; url: string; description: string; likes: number };
  index: number;
  albumTitle: string;
  isEditing: boolean;
  editingPhotoId: string | null;
  photoEditForm: { description: string };
  onEditClick: (photoId: string) => void;
  onEditChange: (description: string) => void;
  onEditSave: (photoId: string) => void;
  onEditCancel: () => void;
  onDelete: (photoId: string) => void;
}

const SortablePhotoItem = ({
  photo,
  index,
  albumTitle,
  isEditing,
  editingPhotoId,
  photoEditForm,
  onEditClick,
  onEditChange,
  onEditSave,
  onEditCancel,
  onDelete,
}: SortablePhotoItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: photo.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white rounded-xl overflow-hidden shadow-md relative group ${isDragging ? 'z-50' : ''}`}
    >
      {isEditing && (
        <div
          {...attributes}
          {...listeners}
          className="absolute top-2 left-2 z-10 p-2 bg-white/90 rounded-full cursor-grab active:cursor-grabbing hover:bg-white transition-colors"
        >
          <GripVertical className="w-4 h-4 text-gray-500" />
        </div>
      )}
      <div className="relative aspect-square overflow-hidden">
        <img
          src={photo.url}
          alt={photo.description || albumTitle}
          className={`w-full h-full object-cover ${isEditing ? 'ml-10' : ''}`}
        />
      </div>

      <div className="p-3">
        {editingPhotoId === photo.id ? (
          <div className="space-y-2">
            <textarea
              value={photoEditForm.description}
              onChange={(e) => onEditChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-birthday-pink focus:border-transparent"
              rows={2}
              placeholder="添加照片描述..."
            />
            <div className="flex space-x-2">
              <button
                onClick={onEditCancel}
                className="flex-1 px-2 py-1 text-xs border border-gray-300 text-gray-600 rounded hover:bg-gray-50"
              >
                取消
              </button>
              <button
                onClick={() => onEditSave(photo.id)}
                className="flex-1 px-2 py-1 text-xs bg-birthday-pink text-white rounded hover:bg-birthday-rose"
              >
                保存
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600 truncate flex-1">
              {photo.description || '点击编辑添加描述'}
            </p>
            {isEditing && (
              <div className="flex items-center space-x-1 ml-2">
                <button
                  onClick={() => onEditClick(photo.id)}
                  className="p-1 text-gray-400 hover:text-birthday-rose transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onDelete(photo.id)}
                  className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}
        <div className="mt-2 text-xs text-gray-400">
          <span>照片 {index + 1}</span>
        </div>
      </div>
    </div>
  );
};

export const PhotoDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { getPhotoAlbumById, updatePhotoAlbum, deletePhotoAlbum, reorderPhotos, uploadPhoto } = useStore();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [editingPhotoId, setEditingPhotoId] = useState<string | null>(null);
  const [isDragMode, setIsDragMode] = useState(false);

  const album = getPhotoAlbumById(id || '');

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    location: '',
    year: '',
    month: '',
    day: '',
  });

  const [photoEditForm, setPhotoEditForm] = useState({
    description: '',
  });

  const [newPhotos, setNewPhotos] = useState<string[]>([]);
  const [newPhotoFiles, setNewPhotoFiles] = useState<File[]>([]);

  const handleImageChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const urls: string[] = [...newPhotos];
      const newFiles: File[] = [...newPhotoFiles];
      Array.from(files).forEach((file) => {
        if (file.type.startsWith('image/')) {
          newFiles.push(file);
          const reader = new FileReader();
          reader.onload = (event) => {
            urls.push(event.target?.result as string);
            setNewPhotos([...urls]);
          };
          reader.readAsDataURL(file);
        }
      });
      setNewPhotoFiles(newFiles);
    }
  }, [newPhotos, newPhotoFiles]);

  const removeNewPhoto = (index: number) => {
    setNewPhotos(newPhotos.filter((_, i) => i !== index));
    setNewPhotoFiles(newPhotoFiles.filter((_, i) => i !== index));
  };

  if (!album) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-birthday-light via-white to-birthday-purple/20 pt-20 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-600 mb-4">相册不存在</h2>
          <Link to="/photos" className="text-birthday-rose hover:underline">
            返回相册列表
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
    const dateParts = album.date.split('-');
    setEditForm({
      title: album.title,
      description: album.description,
      location: album.location,
      year: dateParts[0] || '',
      month: dateParts[1] || '',
      day: dateParts[2] || '',
    });
    setIsEditing(true);
  };

  const handlePhotoEditClick = (photoId: string) => {
    const photo = album.photos.find((p) => p.id === photoId);
    if (photo) {
      setPhotoEditForm({ description: photo.description });
      setEditingPhotoId(photoId);
    }
  };

  const getDateValue = () => {
    if (editForm.year && editForm.month && editForm.day) {
      return `${editForm.year}-${editForm.month.padStart(2, '0')}-${editForm.day.padStart(2, '0')}`;
    } else if (editForm.year && editForm.month) {
      return `${editForm.year}-${editForm.month.padStart(2, '0')}`;
    } else if (editForm.year) {
      return editForm.year;
    }
    return album.date;
  };

  const handleSave = async () => {
    try {
      let newPhotosToAdd = [];
      if (newPhotoFiles.length > 0) {
        const photoUrls = await Promise.all(
          newPhotoFiles.map(async (file, index) => {
            // 处理文件名：移除中文字符，只保留扩展名
            const ext = file.name.split('.').pop() || 'jpg';
            const safeName = `${album.id}-${Date.now()}-${index}.${ext}`;
            const path = `albums/${safeName}`;
            return await uploadPhoto(file, path);
          })
        );
        newPhotosToAdd = photoUrls.map((url, index) => ({
          id: `new-${Date.now()}-${index}`,
          url,
          description: '',
          likes: 0,
        }));
      }

      await updatePhotoAlbum(album.id, {
        title: editForm.title || album.title,
        description: editForm.description,
        location: editForm.location,
        date: getDateValue(),
        photos: [...album.photos, ...newPhotosToAdd],
      });

      setNewPhotos([]);
      setNewPhotoFiles([]);
      setIsEditing(false);
      setIsDragMode(false);
    } catch (error) {
      alert('保存失败，请重试');
    }
  };

  const handlePhotoSave = async (photoId: string) => {
    const updatedPhotos = album.photos.map((p) =>
      p.id === photoId ? { ...p, description: photoEditForm.description } : p
    );
    await updatePhotoAlbum(album.id, { photos: updatedPhotos });
    setEditingPhotoId(null);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = album.photos.findIndex((p) => p.id === active.id);
      const newIndex = album.photos.findIndex((p) => p.id === over.id);
      const newPhotos = arrayMove(album.photos, oldIndex, newIndex);
      await reorderPhotos(album.id, newPhotos.map((p) => p.id));
    }
  };

  const handleDeletePhoto = async (photoId: string) => {
    const updatedPhotos = album.photos.filter((p) => p.id !== photoId);
    await updatePhotoAlbum(album.id, { photos: updatedPhotos });
  };

  const handleDeleteAlbum = async () => {
    if (window.confirm('确定要删除这个相册吗？')) {
      await deletePhotoAlbum(album.id);
      navigate('/photos');
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setIsDragMode(false);
    setEditingPhotoId(null);
    setNewPhotos([]);
    setNewPhotoFiles([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-birthday-light via-white to-birthday-purple/20 pt-20">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <Link
            to="/photos"
            className="flex items-center space-x-2 text-gray-600 hover:text-birthday-rose transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>返回相册列表</span>
          </Link>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                if (isEditing) {
                  handleCancelEdit();
                } else {
                  handleEditClick();
                }
              }}
              className="flex items-center space-x-1 px-4 py-2 bg-birthday-pink/20 text-birthday-rose rounded-full hover:bg-birthday-pink hover:text-white transition-all"
            >
              <Edit2 className="w-4 h-4" />
              <span>{isEditing ? '完成' : '编辑相册'}</span>
            </button>
            {isEditing && (
              <button
                onClick={() => setIsDragMode(!isDragMode)}
                className="flex items-center space-x-1 px-4 py-2 bg-birthday-gold/20 text-birthday-gold rounded-full hover:bg-birthday-gold hover:text-gray-800 transition-all"
              >
                <GripVertical className="w-4 h-4" />
                <span>{isDragMode ? '完成排序' : '调整顺序'}</span>
              </button>
            )}
            {isEditing && (
              <button
                onClick={handleDeleteAlbum}
                className="flex items-center space-x-1 px-4 py-2 bg-gray-100 text-gray-600 rounded-full hover:bg-red-100 hover:text-red-500 transition-all"
              >
                <Trash2 className="w-4 h-4" />
                <span>删除相册</span>
              </button>
            )}
          </div>
        </div>

        {isEditing && !isDragMode ? (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">编辑相册</h2>
              <button
                onClick={handleCancelEdit}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">相册标题</label>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-birthday-pink focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">描述</label>
                <textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-birthday-pink focus:border-transparent"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">地点</label>
                <input
                  type="text"
                  value={editForm.location}
                  onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-birthday-pink focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">日期</label>
                <div className="flex items-center space-x-2">
                  <select
                    value={editForm.year}
                    onChange={(e) => setEditForm({ ...editForm, year: e.target.value, month: '', day: '' })}
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
                  {editForm.year && (
                    <select
                      value={editForm.month}
                      onChange={(e) => setEditForm({ ...editForm, month: e.target.value, day: '' })}
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
                  {editForm.year && editForm.month && (
                    <select
                      value={editForm.day}
                      onChange={(e) => setEditForm({ ...editForm, day: e.target.value })}
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">添加新照片</label>
                <div className="border-2 border-dashed rounded-xl p-4 text-center">
                  {newPhotos.length > 0 ? (
                    <div>
                      <div className="grid grid-cols-4 gap-2 mb-4">
                        {newPhotos.map((url, index) => (
                          <div key={index} className="relative">
                            <img
                              src={url}
                              alt={`新照片${index + 1}`}
                              className="w-full aspect-square object-cover rounded-lg"
                            />
                            <button
                              type="button"
                              onClick={() => removeNewPhoto(index)}
                              className="absolute top-1 right-1 p-1 bg-black/50 text-white rounded-full hover:bg-black/70"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                      <p className="text-gray-500 text-sm">已选择 {newPhotos.length} 张照片</p>
                    </div>
                  ) : (
                    <div>
                      <ImagePlus className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500 text-sm">点击或拖拽上传新照片</p>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    id="photo-edit-upload"
                    multiple
                  />
                  <label
                    htmlFor="photo-edit-upload"
                    className="inline-block mt-2 px-4 py-2 bg-birthday-pink/20 text-birthday-pink rounded-full cursor-pointer hover:bg-birthday-pink/30 transition-colors text-sm"
                  >
                    {newPhotos.length > 0 ? '添加更多照片' : '选择照片'}
                  </label>
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={handleCancelEdit}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={handleSave}
                  className="flex-1 px-4 py-2 bg-birthday-pink text-white rounded-lg hover:bg-birthday-rose transition-colors"
                >
                  保存修改
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
                  {album.title}
                </h1>
                <p className="text-gray-500">{album.description}</p>
              </div>
              <div className="flex items-center space-x-4 mt-4 md:mt-0">
                <span className="flex items-center space-x-2 text-gray-600">
                  <MapPin className="w-5 h-5 text-birthday-pink" />
                  <span>{album.location || '未知地点'}</span>
                </span>
                <span className="flex items-center space-x-2 text-gray-600">
                  <Calendar className="w-5 h-5 text-birthday-gold" />
                  <span>{formatDate(album.date)}</span>
                </span>
              </div>
            </div>
          </div>
        )}

        {isDragMode ? (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <div className="mb-4 p-3 bg-birthday-gold/20 rounded-lg">
              <p className="text-sm text-birthday-gold font-medium text-center">
                拖拽照片可以调整顺序，调整完成后点击"完成排序"
              </p>
            </div>
            <SortableContext
              items={album.photos.map((p) => p.id)}
              strategy={rectSortingStrategy}
            >
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {album.photos.map((photo, index) => (
                  <SortablePhotoItem
                      key={photo.id}
                      photo={photo}
                      index={index}
                      albumTitle={album.title}
                      isEditing={isDragMode}
                      editingPhotoId={null}
                      photoEditForm={photoEditForm}
                      onEditClick={() => {}}
                      onEditChange={() => {}}
                      onEditSave={() => {}}
                      onEditCancel={() => {}}
                      onDelete={handleDeletePhoto}
                    />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {album.photos.map((photo, index) => (
              <SortablePhotoItem
                key={photo.id}
                photo={photo}
                index={index}
                albumTitle={album.title}
                isEditing={isEditing}
                editingPhotoId={editingPhotoId}
                photoEditForm={photoEditForm}
                onEditClick={handlePhotoEditClick}
                onEditChange={(desc) => setPhotoEditForm({ description: desc })}
                onEditSave={handlePhotoSave}
                onEditCancel={() => setEditingPhotoId(null)}
                onDelete={handleDeletePhoto}
              />
            ))}
          </div>
        )}

        {album.photos.length === 0 && (
          <div className="text-center py-16 bg-white rounded-2xl shadow-lg">
            <p className="text-gray-500">这个相册还没有照片</p>
          </div>
        )}

        <div className="mt-8 text-center">
          <Link
            to="/photos"
            className="inline-flex items-center space-x-2 px-6 py-3 bg-birthday-pink text-white rounded-full hover:bg-birthday-rose transition-all duration-300"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>返回相册列表</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
