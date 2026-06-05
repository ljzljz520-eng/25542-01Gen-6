import { FlaskConical, ArrowLeft } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { cn } from '../../lib/utils';

interface HeaderProps {
  className?: string;
}

export function Header({ className }: HeaderProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const isDetailPage = location.pathname.startsWith('/experiments/');

  return (
    <header
      className={cn(
        'h-16 border-b border-slate-700 bg-slate-900/80 backdrop-blur-sm sticky top-0 z-40',
        className
      )}
    >
      <div className="h-full max-w-7xl mx-auto px-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {isDetailPage && (
            <button
              onClick={() => navigate('/')}
              className="p-2 rounded-md text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center">
              <FlaskConical className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">实验版本记录系统</h1>
              <p className="text-xs text-slate-400">Experiment Version Control</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm font-medium text-slate-200">研究员</p>
            <p className="text-xs text-slate-400">已保存全部数据</p>
          </div>
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-medium">
            R
          </div>
        </div>
      </div>
    </header>
  );
}
