import React from 'react';
import { motion, Reorder, useDragControls } from 'framer-motion';
import { Check, Trash2, Calendar, Square, CheckSquare, GripVertical, ListTree, Repeat } from 'lucide-react';
import { Task, Priority } from '../../types';
import { Badge } from '../ui/Badge';
import { useStore } from '../../store';
import { getDateLabel, isOverdue } from '../../backend/utils/dateUtils';

interface TaskItemProps {
  task: Task;
  isSelected?: boolean;
  onSelect?: (id: string) => void;
  onEdit?: (task: Task) => void;
  onDelete?: (id: string) => void;
  selectionMode?: boolean;
  draggable?: boolean;
}

export const TaskItem: React.FC<TaskItemProps> = ({
  task,
  isSelected,
  onSelect,
  onEdit,
  onDelete,
  selectionMode,
  draggable = false
}) => {
  const { toggleTask, tags } = useStore();
  const dragControls = useDragControls();
  const dateLabel = getDateLabel(task.dueDate);
  const overdue = isOverdue(task.dueDate);

  const getPriorityVariant = (p: Priority) => {
    switch (p) {
      case Priority.HIGH: return 'danger';
      case Priority.MEDIUM: return 'warning';
      case Priority.LOW: return 'success';
      default: return 'default';
    }
  };

  const taskTags = tags.filter(t => task.tags?.includes(t.id));
  const subtasksCount = task.subtasks?.length || 0;
  const subtasksCompleted = task.subtasks?.filter(s => s.completed).length || 0;

  const content = (
    <div
      className={`group flex items-center gap-4 p-4 rounded-2xl border transition-all duration-200 cursor-pointer ${isSelected
          ? 'bg-accent-50 dark:bg-accent/10 border-accent-200 dark:border-accent/30'
          : 'border-transparent hover:border-neutral-200 dark:hover:border-neutral-700 hover:bg-white dark:hover:bg-neutral-800'
        } ${task.completed ? 'opacity-50' : ''}`}
      onClick={() => selectionMode ? onSelect?.(task.id) : onEdit?.(task)}
    >
      {draggable && !selectionMode && (
        <div
          onPointerDown={(e) => dragControls.start(e)}
          className="cursor-grab active:cursor-grabbing text-neutral-300 hover:text-neutral-500 dark:text-neutral-600 transition-colors p-1 -ml-1"
        >
          <GripVertical size={18} />
        </div>
      )}

      {selectionMode ? (
        <button
          aria-label={isSelected ? "Unselect task" : "Select task"}
          onClick={(e) => { e.stopPropagation(); onSelect?.(task.id); }}
          className="flex-shrink-0 text-accent"
        >
          {isSelected ? <CheckSquare size={20} /> : <Square size={20} className="text-neutral-300 dark:text-neutral-600" />}
        </button>
      ) : (
        <button
          aria-label={task.completed ? "Mark as incomplete" : "Mark as complete"}
          onClick={(e) => { e.stopPropagation(); toggleTask(task.id); }}
          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0 ${task.completed
              ? 'bg-emerald-500 border-emerald-500 shadow-sm'
              : 'border-neutral-300 dark:border-neutral-600 hover:border-accent'
            }`}
        >
          {task.completed && <Check size={14} className="text-white" strokeWidth={3} />}
        </button>
      )}

      <div className="flex-1 min-w-0">
        <h3 className={`text-sm font-semibold transition-all truncate ${task.completed ? 'line-through text-neutral-400 dark:text-neutral-500' : 'text-neutral-900 dark:text-neutral-100'}`}>
          {task.title}
        </h3>
        <div className="flex flex-wrap items-center gap-2.5 mt-1.5">
          {dateLabel && (
            <div className={`flex items-center gap-1.5 text-[11px] ${overdue && !task.completed ? 'text-rose-500 font-bold' : 'text-neutral-400 dark:text-neutral-500'}`}>
              <Calendar size={12} />
              {dateLabel}
              {task.recurrence && (
                <Repeat size={10} className="text-accent ml-0.5" aria-label={`Repeats ${task.recurrence}`} />
              )}
            </div>
          )}
          {subtasksCount > 0 && (
            <div className={`flex items-center gap-1.5 text-[11px] font-bold ${subtasksCompleted === subtasksCount ? 'text-emerald-500' : 'text-neutral-400 dark:text-neutral-500'}`}>
              <ListTree size={12} />
              {subtasksCompleted}/{subtasksCount}
            </div>
          )}
          {taskTags.map(tag => (
            <div key={tag.id} className="flex items-center gap-1.5 text-[11px] text-neutral-400 dark:text-neutral-500">
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: tag.color }}></span>
              {tag.name}
            </div>
          ))}
          {task.description && !dateLabel && subtasksCount === 0 && taskTags.length === 0 && (
            <span className="text-[11px] text-neutral-400 dark:text-neutral-500 italic truncate">Has notes</span>
          )}
        </div>
      </div>

      <div className={`flex items-center gap-2 transition-opacity ${selectionMode ? 'hidden' : 'opacity-0 group-hover:opacity-100'}`}>
        <Badge variant={getPriorityVariant(task.priority)} className="capitalize">
          {task.priority}
        </Badge>
        <button
          aria-label="Delete task"
          onClick={(e) => { e.stopPropagation(); onDelete?.(task.id); }}
          className="p-1.5 text-neutral-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );

  if (draggable && !selectionMode) {
    return (
      <Reorder.Item
        value={task}
        dragControls={dragControls}
        dragListener={false}
        className="relative"
      >
        {content}
      </Reorder.Item>
    );
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -2 }}
    >
      {content}
    </motion.div>
  );
};