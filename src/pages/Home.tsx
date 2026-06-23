import { Link } from 'react-router-dom';
import { Images, BookOpen, Heart, Calendar, Sparkles } from 'lucide-react';
import { useStore } from '../store/useStore';

export const Home = () => {
  const { photoAlbums, diaries, messages } = useStore();

  return (
    <div className="min-h-screen bg-gradient-to-b from-birthday-light via-white to-birthday-purple/20">
      <section className="relative pt-24 pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-birthday-pink/30 via-birthday-gold/20 to-birthday-purple/30" />
        <div className="absolute top-20 left-10 w-32 h-32 bg-birthday-pink/20 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-48 h-48 bg-birthday-purple/20 rounded-full blur-3xl" />

        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white/80 rounded-full shadow-lg mb-6">
            <span className="text-4xl">🎂</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            LPY22岁生日快乐！
          </h1>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            用ai浅浅做了个网站，希望可以继续承载我们即将发生的故事^-^
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/photos"
              className="flex items-center space-x-2 px-6 py-3 bg-birthday-pink text-white rounded-full hover:bg-birthday-rose transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              <Images className="w-5 h-5" />
              <span>浏览相册</span>
            </Link>
            <Link
              to="/diary"
              className="flex items-center space-x-2 px-6 py-3 bg-birthday-gold text-gray-800 rounded-full hover:bg-yellow-400 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              <BookOpen className="w-5 h-5" />
              <span>写日记</span>
            </Link>
            <Link
              to="/messages"
              className="flex items-center space-x-2 px-6 py-3 bg-birthday-rose text-white rounded-full hover:bg-red-500 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              <Heart className="w-5 h-5" />
              <span>关关寄语</span>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link
              to="/photos"
              className="group bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
            >
              <div className="w-16 h-16 bg-birthday-pink/20 rounded-xl flex items-center justify-center mb-4 group-hover:bg-birthday-pink/40 transition-colors">
                <Images className="w-8 h-8 text-birthday-pink" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">我的相册</h3>
              <p className="text-gray-500 mb-4">记录一切瞬间，美好与不美好都好·̩͙꒰ঌ✞໒꒱· ﾟ </p>
              <div className="flex items-center space-x-2">
                <span className="px-3 py-1 bg-birthday-pink/10 text-birthday-pink rounded-full text-sm font-medium">
                  {photoAlbums.length} 个相册
                </span>
              </div>
            </Link>

            <Link
              to="/diary"
              className="group bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
            >
              <div className="w-16 h-16 bg-birthday-gold/20 rounded-xl flex items-center justify-center mb-4 group-hover:bg-birthday-gold/40 transition-colors">
                <BookOpen className="w-8 h-8 text-birthday-gold" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">随笔日记</h3>
              <p className="text-gray-500 mb-4">永远保持落笔记录的勇气·̩͙꒰ঌ✞໒꒱· ﾟ </p>
              <div className="flex items-center space-x-2">
                <span className="px-3 py-1 bg-birthday-gold/10 text-birthday-gold rounded-full text-sm font-medium">
                  {diaries.length} 篇日记
                </span>
              </div>
            </Link>

            <Link
              to="/messages"
              className="group bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
            >
              <div className="w-16 h-16 bg-birthday-rose/20 rounded-xl flex items-center justify-center mb-4 group-hover:bg-birthday-rose/40 transition-colors">
                <Heart className="w-8 h-8 text-birthday-rose" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">关关寄语</h3>
              <p className="text-gray-500 mb-4">如果没力气了可以来找闲♡·̩͙꒰ঌ✞໒꒱· ﾟ </p>
              <div className="flex items-center space-x-2">
                <span className="px-3 py-1 bg-birthday-rose/10 text-birthday-rose rounded-full text-sm font-medium">
                  {messages.length} 条寄语
                </span>
              </div>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 bg-gradient-to-r from-birthday-purple/20 via-birthday-pink/20 to-birthday-gold/20">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full shadow-lg mb-6">
            <Sparkles className="w-8 h-8 text-birthday-gold" />
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-4">最新回忆</h2>
          <p className="text-gray-600 mb-8">最近记录的美好时光</p>

          {photoAlbums.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {photoAlbums.slice(0, 4).map((album) => (
                <Link
                  key={album.id}
                  to={`/photos/${album.id}`}
                  className="group relative aspect-square rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all"
                >
                  <img
                    src={album.photos[0]?.url}
                    alt={album.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors" />
                </Link>
              ))}
            </div>
          )}

          {diaries.length > 0 && (
            <div className="bg-white rounded-2xl p-6 shadow-md text-left">
              <div className="flex items-center space-x-3 mb-3">
                <Calendar className="w-5 h-5 text-birthday-gold" />
                <span className="text-sm text-gray-500">最新日记</span>
              </div>
              <Link to={`/diary/${diaries[0].id}`}>
                <h3 className="text-lg font-semibold text-gray-800 hover:text-birthday-gold transition-colors">
                  {diaries[0].title}
                </h3>
                <p className="text-gray-500 text-sm mt-1 line-clamp-2">
                  {diaries[0].content}
                </p>
              </Link>
            </div>
          )}
        </div>
      </section>

      <footer className="py-8 px-4 text-center border-t">
        <p className="text-gray-500 text-sm">
          Happy Birthday © 2026 - 送给闲永远爱着的LPY
        </p>
      </footer>
    </div>
  );
};
