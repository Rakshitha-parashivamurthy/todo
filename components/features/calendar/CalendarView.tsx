import React, { useState, useMemo } from 'react';
import { 
  format, endOfMonth, endOfWeek, 
  eachDayOfInterval, isSameMonth, addMonths, 
  isToday, isSameDay, addDays
} from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Task, Priority } from '../../../types';

interface CalendarViewProps {
  tasks: Task[];
  onEdit: (task: Task) => void;
  selectedDate?: Date;
  onSelectDate?: (date: Date) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({ tasks, onEdit, selectedDate, onSelectDate }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const days = useMemo(() => {
    // Replacement for startOfMonth: get first day of month manually
    const startMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    // Replacement for startOfWeek: subtract current day index from date (0=Sunday)
    const start = addDays(startMonth, -startMonth.getDay());
    
    // endOfMonth and endOfWeek are reportedly available
    const end = endOfWeek(endOfMonth(currentDate));
    return eachDayOfInterval({ start, end });
  }, [currentDate]);

  const getTasksForDay = (date: Date) => {
    return tasks.filter(task => {
      if (!task.dueDate) return false;
      try {
        const d = new Date(task.dueDate);
        // Check for invalid date
        if (isNaN(d.getTime())) return false;
        
        const taskDate = format(d, 'yyyy-MM-dd');
        const currentDay = format(date, 'yyyy-MM-dd');
        return taskDate === currentDay;
      } catch (e) {
        return false;
      }
    });
  };

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  // Replacement for subMonths
  const prevMonth = () => setCurrentDate(addMonths(currentDate, -1));
  const resetToday = () => {
    const today = new Date();
    setCurrentDate(today);
    onSelectDate?.(today);
  };

  return (
    <div className="bg-white dark:bg-neutral-800 rounded-[2.5rem] p-6 border border-neutral-200 dark:border-neutral-700 shadow-sm animate-in fade-in duration-300">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-black text-neutral-900 dark:text-white capitalize tracking-tight">
          {format(currentDate, 'MMMM yyyy')}
        </h2>
        <div className="flex items-center gap-2">
           <button onClick={prevMonth} className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-xl transition-colors">
             <ChevronLeft size={20} />
           </button>
           <button onClick={resetToday} className="px-3 py-1.5 text-xs font-bold bg-neutral-100 dark:bg-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-600 rounded-lg transition-colors">
             Today
           </button>
           <button onClick={nextMonth} className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-xl transition-colors">
             <ChevronRight size={20} />
           </button>
        </div>
      </div>

      <div className="grid grid-cols-7 mb-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-center text-[10px] font-black uppercase tracking-widest text-neutral-400 py-2">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 auto-rows-[1fr] gap-2">
        {days.map(day => {
          const dayTasks = getTasksForDay(day);
          const isCurrentMonth = isSameMonth(day, currentDate);
          const isDayToday = isToday(day);
          const isSelected = selectedDate && isSameDay(day, selectedDate);

          return (
            <div 
              key={day.toISOString()} 
              onClick={() => onSelectDate?.(day)}
              className={`min-h-[120px] p-2 rounded-2xl border transition-all flex flex-col gap-2 cursor-pointer relative group ${
                isSelected 
                  ? 'bg-accent/5 border-accent ring-1 ring-accent z-10'
                  : isCurrentMonth 
                    ? 'bg-neutral-50 dark:bg-neutral-900/50 border-neutral-100 dark:border-neutral-700/50 hover:border-accent/50' 
                    : 'bg-transparent border-transparent opacity-30'
              } ${isDayToday && !isSelected ? 'ring-2 ring-accent/20 ring-inset' : ''}`}
            >
              <div className={`text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full transition-colors ${
                isSelected 
                  ? 'bg-accent text-white' 
                  : isDayToday 
                    ? 'bg-accent/20 text-accent' 
                    : 'text-neutral-500'
              }`}>
                {format(day, 'd')}
              </div>
              
              <div className="flex-1 flex flex-col gap-1 overflow-y-auto custom-scrollbar">
                {dayTasks.map(task => (
                  <button
                    key={task.id}
                    onClick={(e) => { e.stopPropagation(); onEdit(task); }}
                    className={`w-full text-left text-[10px] font-bold truncate px-2 py-1.5 rounded-lg transition-all border shadow-sm hover:scale-[1.02] active:scale-95 ${
                      task.completed 
                        ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-400 line-through border-neutral-200 dark:border-neutral-700'
                        : task.priority === Priority.HIGH 
                          ? 'bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800'
                          : task.priority === Priority.MEDIUM
                            ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800'
                            : 'bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300'
                    }`}
                  >
                    {task.title}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};