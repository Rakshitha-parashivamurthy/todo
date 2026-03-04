import React from 'react';
import { signOut } from "firebase/auth";
import { auth } from "../../firebase";
import {
  Inbox, Calendar, Clock, CheckCircle2,
  Target, BarChart3, Settings, Tag as TagIcon,
  Plus, LayoutDashboard, AlertCircle
} from 'lucide-react';
import { useStore } from '../../store';
import { View } from '../../types';
import { isToday, isFuture, isValid } from 'date-fns';
import { isOverdue } from '../../backend/utils/dateUtils';

interface SidebarProps {
  onNavigate?: () => void;
  onAddTagRequest?: () => void; // New prop
}

export const Sidebar: React.FC<SidebarProps> = ({ onNavigate, onAddTagRequest }) => {
  const { activeView, setView, tasks, tags, filterTagId, setFilterTagId } = useStore(); // removed addTag

  // ... (keep rest)


  const counts = {
    inbox: tasks.filter(t => !t.completed).length,
    today: tasks.filter(t => {
      if (t.completed || !t.dueDate) return false;
      const d = new Date(t.dueDate);
      return isValid(d) && isToday(d);
    }).length,
    upcoming: tasks.filter(t => {
      if (t.completed || !t.dueDate) return false;
      const d = new Date(t.dueDate);
      return isValid(d) && isFuture(d);
    }).length,
    overdue: tasks.filter(t => !t.completed && isOverdue(t.dueDate)).length,
  };

  const navItems = [
    { id: 'inbox', label: 'Inbox', icon: Inbox, count: counts.inbox },
    { id: 'today', label: 'Today', icon: Calendar, count: counts.today },
    { id: 'upcoming', label: 'Upcoming', icon: Clock, count: counts.upcoming },
    { id: 'overdue', label: 'Overdue', icon: AlertCircle, count: counts.overdue, color: 'text-rose-500' },
    { id: 'completed', label: 'Completed', icon: CheckCircle2 },
  ];

const tools = [
  { id: 'focus', label: 'Focus Mode', icon: Target },
  { id: 'insights', label: 'Insights', icon: BarChart3 },
  { id: 'settings', label: 'Settings', icon: Settings },
];

  const handleNavClick = (view: string) => {
    setView(view as View);
    onNavigate?.();
  };

  const handleTagClick = (tagId: string) => {
    setView('inbox');
    setFilterTagId(tagId === filterTagId ? null : tagId);
    onNavigate?.();
  };

  return (
    <aside className="w-64 border-r border-neutral-100 dark:border-neutral-800 flex flex-col h-full bg-white dark:bg-neutral-900 transition-all shadow-xl lg:shadow-none">
      <div className="p-6 overflow-y-auto flex-1">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center text-white shadow-xl shadow-accent/20 dark:shadow-none">
            <LayoutDashboard size={22} />
          </div>
          <span className="font-bold text-xl tracking-tight text-neutral-800 dark:text-white">ToDoS</span>
        </div>

        <nav className="space-y-1.5">
          <p className="text-[10px] uppercase font-black text-neutral-400 dark:text-neutral-500 tracking-[0.2em] mb-4 px-3">System</p>
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`w-full group flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm transition-all duration-200 ${activeView === item.id && !filterTagId
                ? 'bg-accent-50 dark:bg-accent/10 text-accent font-bold'
                : 'text-neutral-500 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 hover:text-neutral-900 dark:hover:text-white font-medium'
                }`}
            >
              <div className="flex items-center gap-3">
                <item.icon size={18} className={`${activeView === item.id && !filterTagId ? 'text-accent' : (item.color || '')}`} />
                {item.label}
              </div>
              {item.count !== undefined && item.count > 0 && (
                <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold transition-colors ${activeView === item.id && !filterTagId
                  ? 'bg-accent-100 dark:bg-accent/20 text-accent'
                  : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-500 group-hover:bg-neutral-200 dark:group-hover:bg-neutral-700'
                  }`}>
                  {item.count}
                </span>
              )}
            </button>
          ))}
        </nav>

        <nav className="mt-10 space-y-1.5">
          <div className="flex items-center justify-between px-3 mb-4">
            <p className="text-[10px] uppercase font-black text-neutral-400 dark:text-neutral-500 tracking-[0.2em]">Tags</p>
          </div>
          {tags.map(tag => (
            <button
              key={tag.id}
              onClick={() => handleTagClick(tag.id)}
              className={`w-full group flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm transition-all duration-200 ${filterTagId === tag.id
                ? 'bg-accent-50 dark:bg-accent/10 text-accent font-bold'
                : 'text-neutral-500 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 hover:text-neutral-900 dark:hover:text-white font-medium'
                }`}
            >
              <span className={`w-2.5 h-2.5 rounded-full shadow-sm transition-transform ${filterTagId === tag.id ? 'scale-125' : 'group-hover:scale-110'}`} style={{ backgroundColor: tag.color }}></span>
              {tag.name}
              {filterTagId === tag.id && (
                <span className="ml-auto w-1 h-1 rounded-full bg-accent" />
              )}
            </button>
          ))}
          <button
            onClick={onAddTagRequest}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm text-neutral-400 hover:text-accent hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors font-medium mt-2"
          >
            <Plus size={16} />
            New Tag
          </button>
        </nav>
      </div>

      <div className="mt-auto p-6 space-y-1.5 border-t border-neutral-100 dark:border-neutral-800">
        {tools.map(item => (
          <button
            key={item.id}
            onClick={() => handleNavClick(item.id)}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm transition-all duration-200 ${activeView === item.id
              ? 'bg-accent-50 dark:bg-accent/10 text-accent font-bold'
              : 'text-neutral-500 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 hover:text-neutral-900 dark:hover:text-white font-medium'
              }`}
          >
            <item.icon size={18} className={activeView === item.id ? 'text-accent' : ''} />
            {item.label}
          </button>
        ))}
        <button
          onClick={() => signOut(auth)}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 mt-4 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all font-medium"
        >
          Logout
        </button>
      </div>
    </aside>
  );
};