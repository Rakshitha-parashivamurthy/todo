import React from 'react';
import { motion } from 'framer-motion';
import {
  Zap, Target, Keyboard, CircleHelp,
  Terminal, Command, Calendar, CheckSquare
} from 'lucide-react';

export const HelpView: React.FC = () => {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-3xl mx-auto px-6 py-12 pb-32">
      <header className="mb-12">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-accent/10 rounded-2xl text-accent">
            <CircleHelp size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-neutral-900 dark:text-white tracking-tight">How to use ToDoS</h1>
            <p className="text-neutral-500 dark:text-neutral-400 font-medium">
              Master your workflow with our step-by-step guide.
            </p>
          </div>
        </div>
      </header>

      <div className="space-y-12">
        {/* Quick Start Section */}
        <section className="space-y-6">
          <div className="flex items-center gap-2 text-accent">
            <Zap size={20} />
            <h2 className="text-lg font-black uppercase tracking-widest">Quick Start</h2>
          </div>

          <div className="bg-white dark:bg-neutral-800 rounded-[2rem] p-8 border border-neutral-100 dark:border-neutral-700 shadow-sm">
            <h3 className="font-bold text-xl mb-4 text-neutral-900 dark:text-white">Smart Task Creation</h3>
            <p className="text-neutral-500 dark:text-neutral-400 mb-6">
              The input bar is designed for speed. Use symbols to set properties instantly.
            </p>

            <div className="bg-neutral-900 rounded-xl p-4 mb-6 font-mono text-sm text-neutral-300 overflow-x-auto">
              <span className="text-white">"Finish report</span> <span className="text-emerald-400">@tomorrow</span> <span className="text-rose-400">!high</span> <span className="text-indigo-400">#work</span> <span className="text-amber-400">*daily"</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex gap-3 items-start">
                <div className="mt-1 p-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-md">
                  <Calendar size={14} />
                </div>
                <div>
                  <span className="block font-bold text-sm text-neutral-800 dark:text-neutral-200">Dates (@)</span>
                  <span className="text-xs text-neutral-500">@tomorrow, @next week, @today</span>
                </div>
              </div>
              <div className="flex gap-3 items-start">
                <div className="mt-1 p-1 bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-md">
                  <Command size={14} />
                </div>
                <div>
                  <span className="block font-bold text-sm text-neutral-800 dark:text-neutral-200">Priority (!)</span>
                  <span className="text-xs text-neutral-500">!high, !medium, !low</span>
                </div>
              </div>
              <div className="flex gap-3 items-start">
                <div className="mt-1 p-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-md">
                  <Terminal size={14} />
                </div>
                <div>
                  <span className="block font-bold text-sm text-neutral-800 dark:text-neutral-200">Tags (#)</span>
                  <span className="text-xs text-neutral-500">#personal, #work, #fitness</span>
                </div>
              </div>
              <div className="flex gap-3 items-start">
                <div className="mt-1 p-1 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-md">
                  <CheckSquare size={14} />
                </div>
                <div>
                  <span className="block font-bold text-sm text-neutral-800 dark:text-neutral-200">Recurring (*)</span>
                  <span className="text-xs text-neutral-500">*daily, *weekly, *monthly</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Focus Mode Section */}
        <section className="space-y-6">
          <div className="flex items-center gap-2 text-accent">
            <Target size={20} />
            <h2 className="text-lg font-black uppercase tracking-widest">Focus Mode</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-neutral-800 p-6 rounded-3xl border border-neutral-100 dark:border-neutral-700">
              <div className="w-8 h-8 bg-neutral-100 dark:bg-neutral-700 rounded-full flex items-center justify-center font-bold mb-4">1</div>
              <h4 className="font-bold text-neutral-900 dark:text-white mb-2">Enter Focus</h4>
              <p className="text-xs text-neutral-500">Click the target icon in the sidebar or press <kbd className="font-mono bg-neutral-100 dark:bg-neutral-700 px-1 rounded">f</kbd>.</p>
            </div>
            <div className="bg-white dark:bg-neutral-800 p-6 rounded-3xl border border-neutral-100 dark:border-neutral-700">
              <div className="w-8 h-8 bg-neutral-100 dark:bg-neutral-700 rounded-full flex items-center justify-center font-bold mb-4">2</div>
              <h4 className="font-bold text-neutral-900 dark:text-white mb-2">Start Timer</h4>
              <p className="text-xs text-neutral-500">25-minute sessions by default. Click the timer text to edit the duration.</p>
            </div>
            <div className="bg-white dark:bg-neutral-800 p-6 rounded-3xl border border-neutral-100 dark:border-neutral-700">
              <div className="w-8 h-8 bg-neutral-100 dark:bg-neutral-700 rounded-full flex items-center justify-center font-bold mb-4">3</div>
              <h4 className="font-bold text-neutral-900 dark:text-white mb-2">Work</h4>
              <p className="text-xs text-neutral-500">Your top active task is pinned automatically. Focus on one thing.</p>
            </div>
          </div>
        </section>

        {/* Shortcuts Section */}
        <section className="space-y-6">
          <div className="flex items-center gap-2 text-accent">
            <Keyboard size={20} />
            <h2 className="text-lg font-black uppercase tracking-widest">Shortcuts</h2>
          </div>

          <div className="bg-white dark:bg-neutral-800 rounded-[2rem] border border-neutral-100 dark:border-neutral-700 overflow-hidden">
            <table className="w-full text-sm text-left">
              <thead className="bg-neutral-50 dark:bg-neutral-900/50 text-neutral-500 dark:text-neutral-400 font-bold uppercase text-xs tracking-wider">
                <tr>
                  <th className="px-6 py-4">Key</th>
                  <th className="px-6 py-4">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-700 text-neutral-700 dark:text-neutral-300">
                <tr><td className="px-6 py-4"><kbd className="bg-neutral-100 dark:bg-neutral-700 px-2 py-1 rounded font-mono font-bold">/</kbd></td><td className="px-6 py-4">Focus Search</td></tr>
                <tr><td className="px-6 py-4"><kbd className="bg-neutral-100 dark:bg-neutral-700 px-2 py-1 rounded font-mono font-bold">i</kbd></td><td className="px-6 py-4">Go to Inbox</td></tr>
                <tr><td className="px-6 py-4"><kbd className="bg-neutral-100 dark:bg-neutral-700 px-2 py-1 rounded font-mono font-bold">t</kbd></td><td className="px-6 py-4">Go to Today</td></tr>
                <tr><td className="px-6 py-4"><kbd className="bg-neutral-100 dark:bg-neutral-700 px-2 py-1 rounded font-mono font-bold">f</kbd></td><td className="px-6 py-4">Open Focus Mode</td></tr>
                <tr><td className="px-6 py-4"><kbd className="bg-neutral-100 dark:bg-neutral-700 px-2 py-1 rounded font-mono font-bold">s</kbd></td><td className="px-6 py-4">Open Settings</td></tr>
                <tr><td className="px-6 py-4"><kbd className="bg-neutral-100 dark:bg-neutral-700 px-2 py-1 rounded font-mono font-bold">b</kbd></td><td className="px-6 py-4">Toggle Sidebar</td></tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="space-y-6">
          <div className="flex items-center gap-2 text-accent">
            <CircleHelp size={20} />
            <h2 className="text-lg font-black uppercase tracking-widest">FAQ</h2>
          </div>

          <div className="space-y-4">
            <div className="bg-white dark:bg-neutral-800 p-6 rounded-3xl border border-neutral-100 dark:border-neutral-700">
              <h4 className="font-bold text-neutral-900 dark:text-white mb-2">How do I delete a tag?</h4>
              <p className="text-sm text-neutral-500">Go to Settings &gt; Tag Management. Hover over a tag and click the trash icon. This removes the tag from all tasks.</p>
            </div>
            <div className="bg-white dark:bg-neutral-800 p-6 rounded-3xl border border-neutral-100 dark:border-neutral-700">
              <h4 className="font-bold text-neutral-900 dark:text-white mb-2">Where is my data stored?</h4>
              <p className="text-sm text-neutral-500">Locally in your browser's LocalStorage. You can export a JSON backup from Settings.</p>
            </div>
          </div>
        </section>
      </div>
    </motion.div>
  );
};