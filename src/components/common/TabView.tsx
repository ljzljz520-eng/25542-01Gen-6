import { useState, type ReactNode } from 'react';
import { cn } from '../../lib/utils';

interface TabItem {
  key: string;
  label: string;
  icon?: ReactNode;
  content: ReactNode;
}

interface TabViewProps {
  tabs: TabItem[];
  defaultTab?: string;
  onChange?: (key: string) => void;
  className?: string;
}

export function TabView({ tabs, defaultTab, onChange, className }: TabViewProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.key);

  const handleTabClick = (key: string) => {
    setActiveTab(key);
    onChange?.(key);
  };

  const activeContent = tabs.find((t) => t.key === activeTab)?.content;

  return (
    <div className={cn('flex flex-col h-full', className)}>
      <div className="flex border-b border-slate-700">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => handleTabClick(tab.key)}
            className={cn(
              'flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 -mb-px',
              activeTab === tab.key
                ? 'text-teal-400 border-teal-400'
                : 'text-slate-400 border-transparent hover:text-slate-200 hover:border-slate-500'
            )}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>
      <div className="flex-1 overflow-auto">{activeContent}</div>
    </div>
  );
}
