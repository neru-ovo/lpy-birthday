import { useState } from 'react';
import { Plus, X, Heart, Sparkles, Edit2 } from 'lucide-react';
import { useStore } from '../store/useStore';
import { Message } from '../types';

export const Messages = () => {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingMessage, setEditingMessage] = useState<Message | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
  });
  const { messages, addMessage, updateMessage, deleteMessage } = useStore();

  const openCreate = () => {
    setEditingMessage(null);
    setFormData({ title: '', content: '' });
    setIsCreateOpen(true);
  };

  const openEdit = (message: Message) => {
    setEditingMessage(message);
    setFormData({ title: message.title, content: message.content });
    setIsCreateOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingMessage) {
        await updateMessage(editingMessage.id, {
          title: formData.title || '寄语',
          content: formData.content,
        });
      } else {
        await addMessage({
          title: formData.title || '寄语',
          content: formData.content,
          date: new Date().toISOString().split('T')[0],
          cardColor: 'pink',
          createdAt: new Date().toISOString(),
        });
      }
      setIsCreateOpen(false);
      setFormData({ title: '', content: '' });
      setEditingMessage(null);
    } catch (error) {
      alert('操作失败，请重试');
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-birthday-purple/30 via-birthday-light to-birthday-pink/20 pt-20">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              <span className="text-birthday-rose">💌</span> 关关寄语
            </h1>
            <p className="text-gray-500 mt-1">世界上确实有很多东西不会一成不变，但是闲会永远爱你~</p>
          </div>
          <button
            onClick={openCreate}
            className="flex items-center space-x-2 px-4 py-2 bg-birthday-rose text-white rounded-full hover:bg-red-500 transition-all duration-300 transform hover:scale-105 shadow-md"
          >
            <Plus className="w-5 h-5" />
            <span>写寄语</span>
          </button>
        </div>

        {messages.length === 0 ? (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-birthday-rose/20 rounded-full mb-6">
              <Heart className="w-12 h-12 text-birthday-rose" />
            </div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">还没有寄语</h3>
            <p className="text-gray-400 mb-6">写下你的第一份祝福吧！</p>
            <button
              onClick={openCreate}
              className="px-6 py-3 bg-birthday-rose text-white rounded-full hover:bg-red-500 transition-all"
            >
              写寄语
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {messages.map((message) => (
              <div
                key={message.id}
                className="relative bg-gradient-to-br from-white via-birthday-pink/10 to-birthday-purple/10 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-birthday-pink/20"
              >
                <div className="absolute top-4 right-4 flex space-x-1">
                  <button
                    onClick={() => openEdit(message)}
                    className="p-1.5 bg-white/80 rounded-full hover:bg-blue-100 hover:text-blue-500 transition-colors"
                    aria-label="编辑寄语"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteMessage(message.id)}
                    className="p-1.5 bg-white/80 rounded-full hover:bg-red-100 hover:text-red-500 transition-colors"
                    aria-label="删除寄语"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="text-center">
                  <div className="flex justify-center mb-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-birthday-pink to-birthday-rose rounded-full flex items-center justify-center shadow-lg">
                      <Sparkles className="w-8 h-8 text-white" />
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-gray-800 mb-4">
                    {message.title}
                  </h3>

                  <div className="relative">
                    <div className="absolute -top-2 left-4 w-4 h-4 border-l-2 border-t-2 border-birthday-gold/50" />
                    <div className="absolute -top-2 right-4 w-4 h-4 border-r-2 border-t-2 border-birthday-gold/50" />
                    <div className="absolute -bottom-2 left-4 w-4 h-4 border-l-2 border-b-2 border-birthday-gold/50" />
                    <div className="absolute -bottom-2 right-4 w-4 h-4 border-r-2 border-b-2 border-birthday-gold/50" />

                    <div className="bg-white/60 backdrop-blur-sm rounded-lg p-4 border border-birthday-gold/30">
                      <p className="text-gray-700 leading-relaxed text-sm whitespace-pre-line">
                        {message.content}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-center space-x-1 text-birthday-gold">
                    <Heart className="w-4 h-4 fill-current" />
                    <span className="text-sm">{message.date}</span>
                  </div>
                </div>

                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-birthday-pink via-birthday-gold to-birthday-purple rounded-b-2xl" />
              </div>
            ))}
          </div>
        )}
      </div>

      {isCreateOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b border-birthday-pink/20">
              <h2 className="text-xl font-bold text-gray-800 flex items-center space-x-2">
                <Heart className="w-5 h-5 text-birthday-rose" />
                <span>{editingMessage ? '编辑寄语' : '写一份寄语'}</span>
              </h2>
              <button
                onClick={() => {
                  setIsCreateOpen(false);
                  setFormData({ title: '', content: '' });
                  setEditingMessage(null);
                }}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  标题
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-birthday-rose focus:border-transparent"
                  placeholder="例如：生日快乐"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  寄语内容
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-birthday-rose focus:border-transparent"
                  rows={6}
                  placeholder="写下你想对朋友说的话..."
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreateOpen(false);
                    setFormData({ title: '', content: '' });
                    setEditingMessage(null);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-birthday-rose text-white rounded-lg hover:bg-red-500 transition-colors flex items-center justify-center space-x-2"
                >
                  <Heart className="w-4 h-4" />
                  <span>{editingMessage ? '保存修改' : '发送祝福'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
