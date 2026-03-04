import React, { useState, useRef, useEffect } from 'react';
import { Plus, Calendar, Flag, Repeat, X, CircleHelp } from 'lucide-react';
import { useStore } from '../../store';
import { Priority, Recurrence } from '../../types';
import { format, addDays, isToday, isTomorrow } from 'date-fns';

interface TaskInputProps {
  defaultDate?: Date;
}

export const TaskInput: React.FC<TaskInputProps> = ({ defaultDate }) => {
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<Priority>(Priority.MEDIUM);
  const [dueDate, setDueDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [recurrence, setRecurrence] = useState<Recurrence>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const { addTask, tags, setView } = useStore();

  // UI State for Popovers
  const [activePopover, setActivePopover] = useState<'date' | 'priority' | 'recurrence' | null>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const dateInputRef = useRef<HTMLInputElement>(null);

  // Sync with defaultDate prop when it changes
  useEffect(() => {
    if (defaultDate) {
      setDueDate(format(defaultDate, 'yyyy-MM-dd'));
    }
  }, [defaultDate]);

  // Close popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setActivePopover(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const parseInput = (input: string) => {
    let cleanedTitle = input;
    let detectedPriority = priority;
    let detectedRecurrence = recurrence;
    let detectedDate = dueDate;
    let detectedTags = [...selectedTags];

    const lowerInput = input.toLowerCase();

    // 1. Parse Priority (!)
    if (lowerInput.match(/!(p1|high|urgent)/)) {
      detectedPriority = Priority.HIGH;
      cleanedTitle = cleanedTitle.replace(/!(p1|high|urgent)/gi, '');
    } else if (lowerInput.match(/!(p2|med|medium)/)) {
      detectedPriority = Priority.MEDIUM;
      cleanedTitle = cleanedTitle.replace(/!(p2|med|medium)/gi, '');
    } else if (lowerInput.match(/!(p3|low)/)) {
      detectedPriority = Priority.LOW;
      cleanedTitle = cleanedTitle.replace(/!(p3|low)/gi, '');
    }

    // 2. Parse Recurrence (*)
    // Matches *daily, *weekly, *monthly
    const recurrenceMatch = lowerInput.match(/\*(daily|weekly|monthly)/);
    if (recurrenceMatch) {
      detectedRecurrence = recurrenceMatch[1] as Recurrence;
      cleanedTitle = cleanedTitle.replace(recurrenceMatch[0], '');
    }

    // 3. Parse Dates (@)
    // Matches @today, @tomorrow, @tmrw, @next week
    const today = new Date();
    if (lowerInput.match(/@today\b/)) {
      detectedDate = format(today, 'yyyy-MM-dd');
      cleanedTitle = cleanedTitle.replace(/@today\b/gi, '');
    } else if (lowerInput.match(/@(tomorrow|tmrw)\b/)) {
      detectedDate = format(addDays(today, 1), 'yyyy-MM-dd');
      cleanedTitle = cleanedTitle.replace(/@(tomorrow|tmrw)\b/gi, '');
    } else if (lowerInput.match(/@next\s+week\b/)) {
      const daysToNextMonday = (8 - today.getDay()) % 7 || 7;
      detectedDate = format(addDays(today, daysToNextMonday), 'yyyy-MM-dd');
      cleanedTitle = cleanedTitle.replace(/@next\s+week\b/gi, '');
    }

    // 4. Parse Tags (#)
    const tagMatches = input.match(/#(\w+)/g);
    if (tagMatches) {
      tagMatches.forEach(match => {
        const tagName = match.substring(1).toLowerCase();
        const existingTag = tags.find(t => t.name.toLowerCase() === tagName);
        if (existingTag && !detectedTags.includes(existingTag.id)) {
          detectedTags.push(existingTag.id);
        }
        cleanedTitle = cleanedTitle.replace(match, '');
      });
    }

    cleanedTitle = cleanedTitle.replace(/\s+/g, ' ').trim();

    return {
      title: cleanedTitle,
      priority: detectedPriority,
      recurrence: detectedRecurrence,
      dueDate: detectedDate,
      tags: detectedTags
    };
  };

  const handleAdd = () => {
    if (!title.trim()) return;
    const { title: finalTitle, priority: finalPriority, recurrence: finalRecurrence, dueDate: finalDate, tags: finalTags } = parseInput(title);

    let validDate: string | null = null;
    if (finalDate) {
      const d = new Date(finalDate);
      if (!isNaN(d.getTime())) {
        validDate = d.toISOString();
      }
    }

    addTask({
      title: finalTitle || title,
      priority: finalPriority,
      dueDate: validDate,
      tags: finalTags,
      recurrence: finalRecurrence
    });

    setTitle('');
    setSelectedTags([]);
    setRecurrence(null);
    setPriority(Priority.MEDIUM);
    // Reset to default date if provided, otherwise today
    setDueDate(defaultDate ? format(defaultDate, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'));
    setActivePopover(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleAdd();
  };

  const toggleTag = (id: string) => {
    setSelectedTags(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const getDateLabel = () => {
    if (!dueDate) return 'No Date';
    const date = new Date(dueDate);
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    return format(date, 'MMM d');
  };

  const getPriorityLabel = (p: Priority) => {
    switch (p) {
      case Priority.HIGH: return 'High';
      case Priority.MEDIUM: return 'Medium';
      case Priority.LOW: return 'Low';
    }
  };

  const getPriorityColor = (p: Priority) => {
    switch (p) {
      case Priority.HIGH: return 'bg-rose-500';
      case Priority.MEDIUM: return 'bg-amber-500';
      case Priority.LOW: return 'bg-emerald-500';
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-6 relative" ref={popoverRef}>
      {/* Popover Menus */}
      {activePopover && (
        <div className="absolute bottom-full mb-3 left-6 bg-white dark:bg-neutral-800 rounded-2xl shadow-xl border border-neutral-100 dark:border-neutral-700 p-2 min-w-[200px] z-50">

          {/* Date Popover */}
          {activePopover === 'date' && (
            <div className="flex flex-col gap-1">
              <button onClick={() => { setDueDate(format(new Date(), 'yyyy-MM-dd')); setActivePopover(null); }} className="flex items-center justify-between px-3 py-2 text-sm rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-700/50 text-neutral-700 dark:text-neutral-200 font-medium">
                <div className="flex items-center gap-2"><Calendar size={14} className="text-neutral-400" /> Today</div>
                <span className="text-xs text-neutral-400 font-mono">{format(new Date(), 'EEE')}</span>
              </button>
              <button onClick={() => { setDueDate(format(addDays(new Date(), 1), 'yyyy-MM-dd')); setActivePopover(null); }} className="flex items-center justify-between px-3 py-2 text-sm rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-700/50 text-neutral-700 dark:text-neutral-200 font-medium">
                <div className="flex items-center gap-2"><Calendar size={14} className="text-neutral-400" /> Tomorrow</div>
                <span className="text-xs text-neutral-400 font-mono">{format(addDays(new Date(), 1), 'EEE')}</span>
              </button>
              <button onClick={() => {
                const d = new Date();
                const days = (8 - d.getDay()) % 7 || 7;
                setDueDate(format(addDays(d, days), 'yyyy-MM-dd'));
                setActivePopover(null);
              }} className="flex items-center justify-between px-3 py-2 text-sm rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-700/50 text-neutral-700 dark:text-neutral-200 font-medium">
                <div className="flex items-center gap-2"><Calendar size={14} className="text-neutral-400" /> Next Week</div>
                <span className="text-xs text-neutral-400 font-mono">{format(addDays(new Date(), (8 - new Date().getDay()) % 7 || 7), 'EEE')}</span>
              </button>
              <div className="h-px bg-neutral-100 dark:bg-neutral-700 my-1" />
              <button onClick={() => dateInputRef.current?.showPicker()} className="flex items-center gap-2 px-3 py-2 text-sm rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-700/50 text-neutral-700 dark:text-neutral-200 w-full text-left font-medium">
                <Calendar size={14} className="text-accent" />
                <span>Custom Date...</span>
              </button>
              <input
                ref={dateInputRef}
                type="date"
                className="absolute opacity-0 pointer-events-none top-0 left-0"
                onChange={(e) => { if (e.target.value) { setDueDate(e.target.value); setActivePopover(null); } }}
              />
            </div>
          )}

          {/* Recurrence Popover */}
          {activePopover === 'recurrence' && (
            <div className="flex flex-col gap-1">
              <button onClick={() => { setRecurrence(null); setActivePopover(null); }} className={`flex items-center gap-2 px-3 py-2 text-sm rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-700/50 font-medium ${!recurrence ? 'text-accent bg-accent-50 dark:bg-accent/10' : 'text-neutral-700 dark:text-neutral-200'}`}>
                <X size={14} /> One-off
              </button>
              {(['daily', 'weekly', 'monthly'] as const).map(r => (
                <button key={r} onClick={() => { setRecurrence(r); setActivePopover(null); }} className={`flex items-center gap-2 px-3 py-2 text-sm rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-700/50 capitalize font-medium ${recurrence === r ? 'text-accent bg-accent-50 dark:bg-accent/10' : 'text-neutral-700 dark:text-neutral-200'}`}>
                  <Repeat size={14} /> {r}
                </button>
              ))}
            </div>
          )}

          {/* Priority Popover */}
          {activePopover === 'priority' && (
            <div className="flex flex-col gap-1">
              {[Priority.LOW, Priority.MEDIUM, Priority.HIGH].map(p => (
                <button key={p} onClick={() => { setPriority(p); setActivePopover(null); }} className={`flex items-center gap-2 px-3 py-2 text-sm rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-700/50 capitalize font-medium ${priority === p ? 'bg-neutral-50 dark:bg-neutral-700/50' : 'text-neutral-700 dark:text-neutral-200'}`}>
                  <div className={`w-2 h-2 rounded-full ${getPriorityColor(p)}`} />
                  {getPriorityLabel(p)}
                </button>
              ))}
            </div>
          )}

        </div>
      )}

      <div className="bg-white dark:bg-neutral-800 rounded-3xl border border-neutral-200 dark:border-neutral-700 shadow-2xl shadow-accent/10 dark:shadow-none p-3.5 flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <input
            autoFocus
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type task... (e.g. 'Pay bills @tomorrow !high #personal *daily')"
            className="flex-1 px-4 py-1.5 text-sm outline-none placeholder:text-neutral-400 dark:placeholder:text-neutral-500 bg-transparent text-neutral-900 dark:text-white"
          />
          <button
            onClick={handleAdd}
            disabled={!title.trim()}
            className="p-3 bg-accent text-white rounded-2xl hover:bg-accent-700 disabled:opacity-30 transition-all shadow-lg shadow-accent/20 dark:shadow-none"
          >
            <Plus size={20} strokeWidth={3} />
          </button>
        </div>

        <div className="flex items-center flex-wrap gap-2 border-t border-neutral-100 dark:border-neutral-700 pt-3 px-1">

          <button
            onClick={() => setActivePopover(activePopover === 'date' ? null : 'date')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all text-xs font-bold ${activePopover === 'date' ? 'border-accent text-accent bg-accent-50 dark:bg-accent/10' : 'border-neutral-100 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 text-neutral-500 dark:text-neutral-400 hover:border-neutral-300'}`}
          >
            <Calendar size={14} />
            {getDateLabel()}
          </button>

          <button
            onClick={() => setActivePopover(activePopover === 'recurrence' ? null : 'recurrence')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all text-xs font-bold ${activePopover === 'recurrence' ? 'border-accent text-accent bg-accent-50 dark:bg-accent/10' : 'border-neutral-100 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 text-neutral-500 dark:text-neutral-400 hover:border-neutral-300'} ${recurrence ? 'text-accent border-accent/50' : ''}`}
          >
            <Repeat size={14} />
            {recurrence ? <span className="capitalize">{recurrence}</span> : 'One-off'}
          </button>

          <button
            onClick={() => setActivePopover(activePopover === 'priority' ? null : 'priority')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all text-xs font-bold ${activePopover === 'priority' ? 'border-accent bg-accent-50 dark:bg-accent/10' : 'border-neutral-100 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 hover:border-neutral-300'}`}
          >
            <Flag size={14} className={priority === Priority.HIGH ? 'text-rose-500' : priority === Priority.MEDIUM ? 'text-amber-500' : 'text-emerald-500'} />
            <span className={priority === Priority.HIGH ? 'text-rose-500' : priority === Priority.MEDIUM ? 'text-amber-500' : 'text-emerald-500'}>
              {getPriorityLabel(priority)}
            </span>
          </button>

          <div className="flex items-center gap-1.5 ml-auto">
            {tags.slice(0, 3).map(tag => (
              <button
                key={tag.id}
                onClick={() => toggleTag(tag.id)}
                className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all border ${selectedTags.includes(tag.id) ? 'scale-110 shadow-sm ring-2 ring-accent' : 'opacity-40 grayscale hover:opacity-100 hover:grayscale-0'
                  }`}
                style={{ backgroundColor: tag.color, borderColor: 'transparent' }}
                title={tag.name}
              >
                {selectedTags.includes(tag.id) && <Plus size={12} className="text-white" />}
              </button>
            ))}

            <div className="w-px h-4 bg-neutral-200 dark:bg-neutral-700 mx-1" />

            <button
              onClick={() => setView('help')}
              className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-[10px] font-bold text-neutral-400 hover:text-accent hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
              title="Documentation & Guide"
            >
              <CircleHelp size={14} />
              <span>How to</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};