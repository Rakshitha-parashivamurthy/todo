import React, { useMemo, useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, RotateCcw, X, Target, Coffee, CheckCircle2, ListChecks } from 'lucide-react';
import { useStore } from '../../../store';

export const FocusMode: React.FC = () => {
  const { 
    focusState, toggleFocusTimer, resetFocusTimer, setFocusState,
    setView, tasks, toggleSubtask, toggleTask 
  } = useStore();
  
  const { timeLeft, isActive, mode } = focusState;

  const [isEditingTime, setIsEditingTime] = useState(false);
  const [editMinutes, setEditMinutes] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const totalTime = mode === 'work' ? 25 * 60 : 5 * 60;
  // Use current set time as max if it's larger than default, to avoid weird progress bars when editing
  const effectiveTotal = Math.max(totalTime, timeLeft); 
  const progress = (timeLeft / effectiveTotal) * 100;

  const activeTask = useMemo(() => tasks.find(t => !t.completed), [tasks]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  useEffect(() => {
    if (isEditingTime && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditingTime]);

  const handleTimeClick = () => {
    if (isActive) toggleFocusTimer(); // Pause first
    setEditMinutes(Math.floor(timeLeft / 60).toString());
    setIsEditingTime(true);
  };

  const handleTimeSave = () => {
    const mins = parseInt(editMinutes);
    if (!isNaN(mins) && mins > 0) {
      setFocusState({ timeLeft: mins * 60 });
    }
    setIsEditingTime(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleTimeSave();
    if (e.key === 'Escape') setIsEditingTime(false);
  };

  return (
    <div className="fixed inset-0 bg-white dark:bg-neutral-900 z-[100] flex flex-col items-center justify-center p-8 text-center transition-colors overflow-y-auto">
      <button 
        onClick={() => setView('inbox')}
        className="absolute top-8 right-8 p-3 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-full transition-colors text-neutral-500 z-10"
      >
        <X size={24} />
      </button>

      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center min-h-min">
        {/* Timer Section */}
        <div className="flex flex-col items-center">
          <div className="relative mb-12 flex items-center justify-center group">
            {/* Background Circle */}
            <svg className="w-64 h-64 sm:w-80 sm:h-80 transform -rotate-90">
              <circle
                cx="50%" cy="50%" r="44%"
                stroke="currentColor" strokeWidth="8"
                fill="transparent"
                className="text-neutral-100 dark:text-neutral-800"
              />
              <motion.circle
                cx="50%" cy="50%" r="44%"
                stroke="currentColor" strokeWidth="8"
                fill="transparent"
                strokeDasharray="100"
                strokeDashoffset={100 - progress}
                pathLength="100"
                className={mode === 'work' ? 'text-accent' : 'text-emerald-500'}
                initial={false}
                animate={{ strokeDashoffset: 100 - progress }}
                transition={{ duration: 1, ease: "linear" }}
              />
            </svg>
            
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="flex items-center gap-2 mb-2">
                 {mode === 'work' ? <Target size={16} className="text-accent" /> : <Coffee size={16} className="text-emerald-500" />}
                 <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${mode === 'work' ? 'text-accent' : 'text-emerald-500'}`}>
                   {mode === 'work' ? 'Deep Work' : 'Refuel Break'}
                 </span>
              </div>
              
              {isEditingTime ? (
                <div className="flex items-center justify-center">
                   <input
                    ref={inputRef}
                    type="number"
                    min="1"
                    max="180"
                    value={editMinutes}
                    onChange={(e) => setEditMinutes(e.target.value)}
                    onBlur={handleTimeSave}
                    onKeyDown={handleKeyDown}
                    className="w-32 text-6xl sm:text-7xl font-black text-neutral-900 dark:text-white bg-transparent text-center outline-none border-b-4 border-accent"
                   />
                   <span className="text-xl font-bold text-neutral-400 absolute mt-20">min</span>
                </div>
              ) : (
                <motion.div
                  onClick={handleTimeClick}
                  className="cursor-pointer rounded-2xl p-2 -m-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                  title="Click to edit time"
                >
                  <motion.h1 
                    initial={false}
                    animate={isActive ? { scale: [1, 1.02, 1] } : { scale: 1 }}
                    transition={{ repeat: isActive ? Infinity : 0, duration: 2 }}
                    className="text-6xl sm:text-7xl font-black text-neutral-900 dark:text-white tracking-tighter tabular-nums"
                  >
                    {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
                  </motion.h1>
                </motion.div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-center gap-6">
            <button 
              onClick={resetFocusTimer}
              title="Reset Timer"
              className="p-8 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-500 rounded-[2.5rem] transition-all hover:scale-105 active:scale-95 flex items-center justify-center"
            >
              <RotateCcw size={28} />
            </button>
            <button 
              onClick={toggleFocusTimer}
              className={`p-8 rounded-[2.5rem] text-white transition-all shadow-2xl flex items-center justify-center min-w-[140px] hover:scale-105 active:scale-95 ${
                mode === 'work' 
                  ? 'bg-accent hover:bg-accent-700 shadow-accent/20 dark:shadow-none' 
                  : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20 dark:shadow-none'
              }`}
            >
              {isActive ? <Pause size={36} strokeWidth={2.5} /> : <Play size={36} fill="currentColor" strokeWidth={2.5} />}
            </button>
          </div>
        </div>

        {/* Task Context Section */}
        <div className="text-left space-y-8 w-full">
          {activeTask ? (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-neutral-50 dark:bg-neutral-800/50 p-8 rounded-[2.5rem] border border-neutral-100 dark:border-neutral-800 shadow-sm max-h-[60vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                 <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Main Mission</span>
                 <button 
                  onClick={() => toggleTask(activeTask.id)}
                  className="flex items-center gap-2 text-xs font-bold text-accent hover:underline"
                 >
                   <CheckCircle2 size={14} /> Finish
                 </button>
              </div>
              <h2 className="text-2xl font-black text-neutral-900 dark:text-white leading-tight mb-8">
                {activeTask.title}
              </h2>
              
              {activeTask.subtasks && activeTask.subtasks.length > 0 && (
                <div className="space-y-3">
                   <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                     <ListChecks size={14} /> Sub-steps
                   </p>
                   <div className="space-y-2">
                      {activeTask.subtasks.map(sub => (
                        <button
                          key={sub.id}
                          onClick={() => toggleSubtask(activeTask.id, sub.id)}
                          className={`w-full flex items-center gap-3 p-4 rounded-2xl border text-sm text-left transition-all ${
                            sub.completed 
                              ? 'bg-emerald-50/50 border-emerald-100 dark:bg-emerald-900/10 dark:border-emerald-900/30 text-emerald-600 opacity-60' 
                              : 'bg-white dark:bg-neutral-800 border-neutral-100 dark:border-neutral-700 text-neutral-700 dark:text-neutral-200 hover:border-accent shadow-sm'
                          }`}
                        >
                           <div className={`w-5 h-5 shrink-0 rounded-full border flex items-center justify-center transition-colors ${sub.completed ? 'bg-emerald-500 border-emerald-500' : 'border-neutral-300'}`}>
                              {sub.completed && <CheckCircle2 size={12} className="text-white" />}
                           </div>
                           <span className={sub.completed ? 'line-through' : 'font-bold'}>{sub.title}</span>
                        </button>
                      ))}
                   </div>
                </div>
              )}
            </motion.div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 opacity-50">
               <div className="w-16 h-16 bg-neutral-100 dark:bg-neutral-800 rounded-3xl flex items-center justify-center mb-4">
                  <Target size={32} className="text-neutral-300" />
               </div>
               <p className="text-neutral-400 font-bold">No active tasks found.</p>
               <button onClick={() => setView('inbox')} className="mt-4 text-accent text-sm font-black uppercase tracking-widest hover:underline">Return to Workspace</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};