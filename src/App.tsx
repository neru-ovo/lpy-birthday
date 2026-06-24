import { useEffect } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Home } from '@/pages/Home';
import { Photos } from '@/pages/Photos';
import { PhotoDetail } from '@/pages/PhotoDetail';
import { Diary } from '@/pages/Diary';
import { DiaryDetail } from '@/pages/DiaryDetail';
import { Messages } from '@/pages/Messages';
import { useStore } from '@/store/useStore';

export default function App() {
  const { loadFromSupabase } = useStore();

  useEffect(() => {
    loadFromSupabase();
  }, [loadFromSupabase]);

  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/photos" element={<Photos />} />
        <Route path="/photos/:id" element={<PhotoDetail />} />
        <Route path="/diary" element={<Diary />} />
        <Route path="/diary/:id" element={<DiaryDetail />} />
        <Route path="/messages" element={<Messages />} />
      </Routes>
    </Router>
  );
}
