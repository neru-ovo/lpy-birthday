import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Images, BookOpen, Menu, X, Heart } from 'lucide-react';

export const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { path: '/', icon: Home, label: '首页' },
    { path: '/photos', icon: Images, label: '相册' },
    { path: '/diary', icon: BookOpen, label: '日记' },
    { path: '/messages', icon: Heart, label: '关关寄语' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-md shadow-sm z-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-2xl">💛</span>
            <span 
              className="text-xl font-bold text-gray-700"
              style={{ fontFamily: "'Noto Serif SC', serif", letterSpacing: '0.05em' }}
            >
              LOVE From 闲
            </span>
          </Link>

          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-all duration-300 ${
                  location.pathname === item.path
                    ? 'bg-birthday-pink/20 text-birthday-rose'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            ))}
          </div>

          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {isMenuOpen && (
          <div className="md:hidden py-4 border-t">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsMenuOpen(false)}
                className={`flex items-center space-x-2 px-4 py-3 rounded-lg transition-colors ${
                  location.pathname === item.path
                    ? 'bg-birthday-pink/20 text-birthday-rose'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
};
