import React, { useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, PieChart, Pie
} from 'recharts';
import { format, isSameDay } from 'date-fns';
import { useStore } from '../../../store';
import { Target, Zap, CheckCircle, TrendingUp, AlertTriangle, BarChart4, PieChart as PieIcon } from 'lucide-react';
import { Priority } from '../../../types';

export const Insights: React.FC = () => {
  const { tasks, streak, dailyGoal } = useStore();

  const chartData = useMemo(() => {
    const last7Days = Array.from({ length: 7 }).map((_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return format(date, 'MMM d');
    }).reverse();

    return last7Days.map(day => {
      const completedOnDay = tasks.filter(t =>
        t.completed &&
        t.completedAt &&
        format(new Date(t.completedAt), 'MMM d') === day
      ).length;

      return {
        name: day,
        completed: completedOnDay,
        goal: dailyGoal
      };
    });
  }, [tasks, dailyGoal]);

  const stats = useMemo(() => {
    const completedTasks = tasks.filter(t => t.completed);
    const total = tasks.length;
    const completed = completedTasks.length;
    const overdue = tasks.filter(t => !t.completed && t.dueDate && new Date(t.dueDate) < new Date() && !isSameDay(new Date(t.dueDate), new Date())).length;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    // Calculate Average
    const last7DaysCount = chartData.reduce((acc, curr) => acc + curr.completed, 0);
    const dailyAverage = Math.round((last7DaysCount / 7) * 10) / 10;

    // Find Busiest Day
    const busiest = [...chartData].sort((a, b) => b.completed - a.completed)[0];

    return { total, completed, overdue, completionRate, dailyAverage, busiest };
  }, [tasks, chartData]);

  const priorityDistribution = useMemo(() => {
    const counts = {
      [Priority.HIGH]: tasks.filter(t => t.priority === Priority.HIGH).length,
      [Priority.MEDIUM]: tasks.filter(t => t.priority === Priority.MEDIUM).length,
      [Priority.LOW]: tasks.filter(t => t.priority === Priority.LOW).length,
    };
    return [
      { name: 'High', value: counts[Priority.HIGH], color: '#f43f5e' },
      { name: 'Medium', value: counts[Priority.MEDIUM], color: '#f59e0b' },
      { name: 'Low', value: counts[Priority.LOW], color: '#10b981' },
    ].filter(d => d.value > 0);
  }, [tasks]);

  return (
    <div className="p-8 max-w-5xl mx-auto dark:text-neutral-200 pb-32">
      <header className="mb-12">
        <h1 className="text-3xl font-black text-neutral-900 dark:text-white tracking-tight mb-2">Productivity Insights</h1>
        <p className="text-neutral-500 dark:text-neutral-400">Deep analysis of your local focus patterns and velocity.</p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <div className="bg-white dark:bg-neutral-800 p-6 rounded-[2rem] border border-neutral-100 dark:border-neutral-700 shadow-sm flex items-center gap-4 hover:border-accent transition-colors">
          <div className="w-12 h-12 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 rounded-2xl flex items-center justify-center">
            <Zap size={24} fill="currentColor" />
          </div>
          <div>
            <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Active Streak</p>
            <p className="text-2xl font-black text-neutral-900 dark:text-white">{streak}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-neutral-800 p-6 rounded-[2rem] border border-neutral-100 dark:border-neutral-700 shadow-sm flex items-center gap-4 hover:border-accent transition-colors">
          <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center">
            <CheckCircle size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Completed</p>
            <p className="text-2xl font-black text-neutral-900 dark:text-white">{stats.completed}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-neutral-800 p-6 rounded-[2rem] border border-neutral-100 dark:border-neutral-700 shadow-sm flex items-center gap-4 hover:border-accent transition-colors">
          <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center">
            <TrendingUp size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Efficiency</p>
            <p className="text-2xl font-black text-neutral-900 dark:text-white">{stats.completionRate}%</p>
          </div>
        </div>

        <div className="bg-white dark:bg-neutral-800 p-6 rounded-[2rem] border border-neutral-100 dark:border-neutral-700 shadow-sm flex items-center gap-4 hover:border-accent transition-colors">
          <div className="w-12 h-12 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 rounded-2xl flex items-center justify-center">
            <AlertTriangle size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Overdue</p>
            <p className="text-2xl font-black text-neutral-900 dark:text-white">{stats.overdue}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Completion Flow */}
        <div className="lg:col-span-2 bg-white dark:bg-neutral-800 p-8 rounded-[2.5rem] border border-neutral-100 dark:border-neutral-700 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-lg font-black text-neutral-800 dark:text-white flex items-center gap-2">
              <BarChart4 size={18} className="text-accent" /> Productivity Velocity
            </h2>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Daily Average</p>
                <p className="text-sm font-bold text-accent">{stats.dailyAverage} tasks</p>
              </div>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 30 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" className="dark:opacity-10" />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fontWeight: 700, fill: '#9ca3af' }}
                  dy={15}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fontWeight: 700, fill: '#9ca3af' }}
                />
                <Tooltip
                  cursor={{ fill: 'var(--accent-color-50)' }}
                  contentStyle={{
                    borderRadius: '20px',
                    border: 'none',
                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
                    backgroundColor: 'white',
                    padding: '12px 16px'
                  }}
                  itemStyle={{ fontSize: '12px', fontWeight: 800, color: 'var(--accent-color)' }}
                  labelStyle={{ fontSize: '10px', fontWeight: 900, marginBottom: '4px', textTransform: 'uppercase', color: '#9ca3af' }}
                />
                <Bar dataKey="completed" radius={[8, 8, 0, 0]} barSize={40}>
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.completed >= entry.goal ? 'var(--accent-color)' : '#e5e7eb'}
                      className="dark:opacity-80"
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Priority Distribution & Patterns */}
        <div className="space-y-8">
          <div className="bg-white dark:bg-neutral-800 p-8 rounded-[2.5rem] border border-neutral-100 dark:border-neutral-700 shadow-sm">
            <h2 className="text-lg font-black text-neutral-800 dark:text-white flex items-center gap-2 mb-6">
              <PieIcon size={18} className="text-accent" /> Priority Mix
            </h2>
            <div className="h-[200px] w-full relative flex items-center justify-center">
              {priorityDistribution.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={priorityDistribution}
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {priorityDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center px-4">
                  <p className="text-xs text-neutral-400 font-bold">Priority data will appear as you add tasks.</p>
                </div>
              )}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-black">{stats.total}</span>
                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Total</span>
              </div>
            </div>
            <div className="mt-6 space-y-2">
              {priorityDistribution.map(item => (
                <div key={item.name} className="flex items-center justify-between text-xs font-bold">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-neutral-500">{item.name}</span>
                  </div>
                  <span>{Math.round((item.value / stats.total) * 100)}%</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-accent p-8 rounded-[2.5rem] text-white shadow-xl shadow-accent/20">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80 mb-4">Focus Peak</h3>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                <Target size={24} />
              </div>
              <div>
                <p className="text-lg font-black">{stats.busiest?.completed > 0 ? stats.busiest.name : 'N/A'}</p>
                <p className="text-xs opacity-80 font-bold">Your most active day this week.</p>
              </div>
            </div>
          </div>


        </div>
      </div>
    </div>
  );
};