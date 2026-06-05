import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useStore } from './store/useStore';
import { Header } from './components/layout/Header';
import { OverviewPage } from './pages/OverviewPage';
import { ExperimentDetailPage } from './pages/ExperimentDetailPage';
import { ComparePage } from './pages/ComparePage';

export default function App() {
  const init = useStore((state) => state.init);
  const loading = useStore((state) => state.loading);

  useEffect(() => {
    init();
  }, [init]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-slate-950">
        <Header />
        <Routes>
          <Route path="/" element={<OverviewPage />} />
          <Route path="/experiments/:id" element={<ExperimentDetailPage />} />
          <Route path="/experiments/:id/compare" element={<ComparePage />} />
        </Routes>
      </div>
    </Router>
  );
}
