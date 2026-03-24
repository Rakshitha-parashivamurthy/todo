import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Task, Tag, Priority, View, AppState, SubTask, FocusState, Recurrence, Role } from './types';
import { format, addDays, addWeeks, addMonths } from 'date-fns';
import { breakdownTask } from './lib/openrouter';
import { auth } from './firebase';
import { getFirestore, setDoc, doc, serverTimestamp } from 'firebase/firestore';
import {
  addTaskToFirestore,
  updateTaskInFirestore,
  deleteTaskFromFirestore,
} from './repos/firestoreTasks';
import {
  addTagToFirestore,
  updateTagInFirestore,
  deleteTagFromFirestore,
} from './repos/firestoreTags';
import {
  updateUserSettings,
  listenToSettings,
  listenToDailyTargets,
  listenToTaskHistory,
  setUserSettings,
} from './repos/firestoreMeta';

interface ToDoSStore extends AppState {
  searchQuery: string;
  filterTagId: string | null;
  setSearchQuery: (query: string) => void;
  setFilterTagId: (tagId: string | null) => void;
  setTheme: (theme: 'light' | 'dark') => void;
  setAccentColor: (color: string) => void;
  setView: (view: View) => void;
  addTask: (task: Partial<Task>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  reorderTasks: (newTasks: Task[]) => void;
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;
  bulkDelete: (ids: string[]) => void;
  bulkToggle: (ids: string[], completed: boolean) => void;
  addTag: (name: string, color: string) => void;
  updateTag: (id: string, name: string, color: string) => void;
  deleteTag: (id: string) => void;
  setTags: (tags: Tag[]) => void;
  setDailyGoal: (goal: number) => void;
  resetData: () => void;
  importData: (data: Partial<AppState>) => void;
  updateStreak: () => void;
  toggleSubtask: (taskId: string, subtaskId: string) => void;
  generateAIActionPlan: (taskId: string) => Promise<void>;
  setTasks: (tasks: Task[]) => void;

  // Focus Timer Actions
  setFocusState: (updates: Partial<FocusState>) => void;
  toggleFocusTimer: () => void;
  resetFocusTimer: () => void;
  tickFocusTimer: () => void;

  companyId: string | null;
  role: Role | null;
  status: 'pending' | 'active' | 'inactive' | null;
  companyStatus: 'pending' | 'pending_approval' | 'active' | null;
  subscriptionStatus: 'pending_approval' | 'active' | 'expired' | null;
  setAuthData: (
    companyId: string | null, 
    role: Role | null, 
    status: 'pending' | 'active' | 'inactive' | null,
    companyStatus?: 'pending' | 'pending_approval' | 'active' | null,
    subscriptionStatus?: 'pending_approval' | 'active' | 'expired' | null
  ) => void;
}

const DEFAULT_TAGS: Tag[] = [
  { id: '1', name: 'Work', color: '#6366f1' },
  { id: '2', name: 'Personal', color: '#10b981' },
  { id: '3', name: 'Fitness', color: '#f59e0b' },
];

const DEFAULT_TASKS: Task[] = [
  {
    id: 'default-task-1',
    title: 'Daily Progress Review and Performance Assessment',
    description: 'Review daily activities, track progress against goals, and assess overall performance. Identify completed tasks, outstanding items, and any challenges encountered. Use insights gained to adjust priorities, improve efficiency, and plan actions for the next day.',
    dueDate: '2026-02-05T12:00:00.000Z',
    priority: Priority.HIGH,
    tags: ['1'],
    completed: false,
    completedAt: null,
    createdAt: new Date().toISOString(),
    position: 0,
    recurrence: null,
    subtasks: [
      {
        id: 'st-1',
        title: 'Review completed tasks and evaluate their impact on productivity.',
        completed: false
      },
      {
        id: 'st-2',
        title: 'Identify any obstacles or roadblocks that hinder progress.',
        completed: false
      },
      {
        id: 'st-3',
        title: 'Assess the effectiveness of your current strategies and adjust as needed.',
        completed: false
      }
    ]
  },
  {
    id: 'default-task-2',
    title: 'Daily Financial Review and Expense Tracking Overview',
    description: 'Review daily financial transactions and track expenses to maintain accurate records. Monitor spending against budgets, identify variances, and highlight key financial insights. Use the review to ensure financial discipline and inform short-term financial decisions.',
    dueDate: '2026-01-29T12:00:00.000Z',
    priority: Priority.MEDIUM,
    tags: ['1'],
    completed: false,
    completedAt: null,
    createdAt: new Date().toISOString(),
    position: 1,
    recurrence: null,
    subtasks: [
      { id: 'st-2-1', title: 'Review completed tasks and evaluate their impact on productivity.', completed: false },
      { id: 'st-2-2', title: 'Identify any obstacles or roadblocks that hinder progress.', completed: false },
      { id: 'st-2-3', title: 'Assess the effectiveness of your current strategies and adjust as needed.', completed: false }
    ]
  }
];

const DEFAULT_FOCUS_STATE: FocusState = {
  timeLeft: 25 * 60,
  isActive: false,
  mode: 'work'
};

const updateAccentCSS = (color: string) => {
  const root = document.documentElement;
  root.style.setProperty('--accent-color', color);
  root.style.setProperty('--accent-color-50', `${color}15`);
  root.style.setProperty('--accent-color-100', `${color}30`);
  root.style.setProperty('--accent-color-200', `${color}50`);
  root.style.setProperty('--accent-color-600', color);
  root.style.setProperty('--accent-color-700', color);
};

// Error logger: writes to users/{uid}/errors/{id} and console
const _db = getFirestore();
async function logError(fn: string, error: unknown, payload?: any) {
  const errorMsg = (error as any)?.message || String(error);
  const errorStack = (error as any)?.stack || null;
  
  console.error(`❌ [${fn}] Error:`, errorMsg, payload);
  
  try {
    const uid = auth.currentUser?.uid;
    if (!uid) {
      console.warn('⚠️ No user ID available for error logging');
      return;
    }
    
    const id = crypto.randomUUID();
    const errorDoc = {
      fn,
      message: errorMsg,
      stack: errorStack,
      payload: payload ? JSON.stringify(payload) : null,
      createdAt: serverTimestamp(),
      timestamp: new Date().toISOString()
    };
    
    await setDoc(doc(_db, 'users', uid, 'errors', id), errorDoc);
    console.log(`✅ Error logged to Firestore for ${fn}`);
  } catch (e) {
    console.error('❌ Failed to write error log to Firestore:', e);
  }
}

// Exported listener setup functions for App.tsx
export const setupSettingsListener = (userId: string) => {
  return listenToSettings(userId, (settings) => {
    if (settings) {
      useStore.setState({
        theme: settings.theme || 'light',
        dailyGoal: (settings as any).daily_goal || 5,
        accentColor: (settings as any).accentColor || '#6366f1'
      });
      // Also update CSS for accent color
      updateAccentCSS((settings as any).accentColor || '#6366f1');
      console.log('✅ Settings synced from Firestore');
    } else {
      // no settings document yet; create default
      const defaultSettings = {
        user_id: userId,
        theme: 'light',
        daily_goal: 5,
        accentColor: '#6366f1',
        notification_enabled: true,
        default_priority: 'medium',
      };
      setUserSettings(defaultSettings as any).catch(err => logError('setUserSettings', err, { defaultSettings }));
    }
  });
};

export const setupDailyTargetsListener = (userId: string, companyId: string) => {
  return listenToDailyTargets(userId, companyId, (targets) => {
    // You can use this data to display daily target information
    console.log('📊 Daily targets updated:', targets);
  });
};

export const setupTaskHistoryListener = (userId: string, companyId: string) => {
  return listenToTaskHistory(userId, companyId, (entries) => {
    // You can use this data to display task history
    console.log('📜 Task history updated:', entries);
  });
};

export const useStore = create<ToDoSStore>()(
  persist(
    (set, get) => ({
      tasks: [],  // Empty - will be populated by Firestore listener ONLY
      tags: [],   // Empty - will be populated by Firestore listener ONLY
      activeView: 'inbox',
      theme: 'light',
      accentColor: '#6366f1',
      streak: 0,
      dailyGoal: 5,
      lastCompletedDate: null,
      searchQuery: '',
      filterTagId: null,
      focusState: DEFAULT_FOCUS_STATE,
      companyId: null,
      role: null,
      status: null,
      companyStatus: null,
      subscriptionStatus: null,

      setAuthData: (companyId, role, status, companyStatus = null, subscriptionStatus = null) => 
        set({ companyId, role, status, companyStatus, subscriptionStatus }),

      setSearchQuery: (searchQuery) => set({ searchQuery }),
      setFilterTagId: (filterTagId) => set({ filterTagId }),

      setTheme: (theme) => {
        set({ theme });
        if (theme === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
        // Persist to Firestore
        const uid = auth.currentUser?.uid;
        if (uid) {
          updateUserSettings(uid, { theme }).catch(err => logError('updateUserSettings', err, { theme }));
        }
      },

      setAccentColor: (accentColor) => {
        set({ accentColor });
        updateAccentCSS(accentColor);
        // Persist to Firestore
        const uid = auth.currentUser?.uid;
        if (uid) {
          updateUserSettings(uid, { accentColor } as any).catch(err => logError('updateUserSettings', err, { accentColor }));
        }
      },

      setView: (activeView) => set({ activeView, filterTagId: null }),

      addTask: (taskData) => {
        // build new task object before updating state
        const maxPos = useStore.getState().tasks.reduce((max, t) => Math.max(max, t.position), -1);
        const newTask: Task = {
          id: crypto.randomUUID(),
          title: taskData.title || 'Untitled Task',
          description: taskData.description || '',
          dueDate: taskData.dueDate || null,
          priority: taskData.priority || Priority.MEDIUM,
          tags: taskData.tags || [],
          recurrence: taskData.recurrence || null,
          subtasks: [],
          completed: false,
          completedAt: null,
          createdAt: new Date().toISOString(),
          position: maxPos + 1
        };
        // optimistic update
        set((state) => ({ tasks: [newTask, ...state.tasks] }));
        // persist to firestore
        const companyId = useStore.getState().companyId;
        if (companyId) {
          addTaskToFirestore(newTask, companyId).catch(err => logError('addTaskToFirestore', err, { task: newTask }));
        } else {
          console.error("No company ID available for adding task.");
        }
      },

      updateTask: (id, updates) => {
        set((state) => ({
          tasks: state.tasks.map(t => t.id === id ? { ...t, ...updates } : t)
        }));
        updateTaskInFirestore(id, updates).catch(err => logError('updateTaskInFirestore', err, { id, updates }));
      },

      setTasks: (tasks) => set({ tasks }),

      reorderTasks: (newTasks) => set((state) => {
        const reorderedIds = new Set(newTasks.map(t => t.id));
        const otherTasks = state.tasks.filter(t => !reorderedIds.has(t.id));
        const updatedOrderedTasks = newTasks.map((t, i) => ({ ...t, position: i }));
        return { tasks: [...updatedOrderedTasks, ...otherTasks] };
      }),

      toggleTask: (id) => {
        set((state) => {
          const taskToToggle = state.tasks.find(t => t.id === id);
          if (!taskToToggle) return state;

          const isNowCompleted = !taskToToggle.completed;
          let newTasks = [...state.tasks];

          // Recurrence Logic: If completing a recurring task, spawn the next one
          let nextTask: Task | null = null;
          if (isNowCompleted && taskToToggle.recurrence) {
            const baseDate = taskToToggle.dueDate ? new Date(taskToToggle.dueDate) : new Date();
            let nextDate = new Date(baseDate);

            switch (taskToToggle.recurrence) {
              case 'daily':
                nextDate = addDays(baseDate, 1);
                break;
              case 'weekly':
                nextDate = addWeeks(baseDate, 1);
                break;
              case 'monthly':
                nextDate = addMonths(baseDate, 1);
                break;
            }

            nextTask = {
              ...taskToToggle,
              id: crypto.randomUUID(),
              completed: false,
              completedAt: null,
              dueDate: nextDate.toISOString(),
              createdAt: new Date().toISOString(),
              // Ensure the new task is also recurring
              recurrence: taskToToggle.recurrence,
              subtasks: taskToToggle.subtasks.map(s => ({ ...s, completed: false })), // Reset subtasks
              position: -1 // Put at top
            };

            // DO NOT add to local state here - let Firestore listener bring it back
            // This prevents duplicates when the listener fetches from DB
          }

          // Update the original task
          newTasks = newTasks.map(t => {
            if (t.id === id) {
              return {
                ...t,
                completed: isNowCompleted,
                completedAt: isNowCompleted ? new Date().toISOString() : null
              };
            }
            return t;
          });

          // persist changes to Firestore
          if (isNowCompleted) {
            updateTaskInFirestore(id, {
              completed: isNowCompleted,
              completedAt: newTasks.find(t => t.id === id)?.completedAt
            }).catch(err => logError('updateTaskInFirestore', err, { id, completed: isNowCompleted }));
            // Write next task to Firestore (listener will fetch it)
            if (nextTask) {
              const companyId = useStore.getState().companyId;
              if (companyId) {
                addTaskToFirestore(nextTask, companyId).catch(err => logError('addTaskToFirestore', err, { task: nextTask }));
              }
            }
          } else {
            updateTaskInFirestore(id, { completed: false, completedAt: null }).catch(err => logError('updateTaskInFirestore', err, { id, completed: false }));
          }

          return { tasks: newTasks };
        });
      },

      toggleSubtask: (taskId, subtaskId) => {
        set((state) => {
          const updatedTasks = state.tasks.map(t => t.id === taskId ? {
            ...t,
            subtasks: t.subtasks.map(s => s.id === subtaskId ? { ...s, completed: !s.completed } : s)
          } : t);
          
          // Persist the updated task to Firestore
          const updatedTask = updatedTasks.find(t => t.id === taskId);
          if (updatedTask) {
            updateTaskInFirestore(taskId, { subtasks: updatedTask.subtasks }).catch(err => logError('updateTaskInFirestore', err, { taskId, subtasks: updatedTask.subtasks }));
          }
          
          return { tasks: updatedTasks };
        });
      },

      generateAIActionPlan: async (taskId: string) => {
        const task = get().tasks.find(t => t.id === taskId);
        if (!task) return;

        set((state) => ({
          tasks: state.tasks.map(t => t.id === taskId ? { ...t, aiBreakdownRequested: true } : t)
        }));

        try {
          const suggestions = await breakdownTask(task.title, task.description);
          const newSubtasks: SubTask[] = suggestions.map(title => ({
            id: crypto.randomUUID(),
            title,
            completed: false
          }));

          set((state) => ({
            tasks: state.tasks.map(t => t.id === taskId ? {
              ...t,
              subtasks: [...(t.subtasks || []), ...newSubtasks],
              aiBreakdownRequested: false
            } : t)
          }));
        } catch (e) {
          set((state) => ({
            tasks: state.tasks.map(t => t.id === taskId ? { ...t, aiBreakdownRequested: false } : t)
          }));
        }
      },

      deleteTask: (id) => {
        set((state) => ({
          tasks: state.tasks.filter(t => t.id !== id)
        }));
        deleteTaskFromFirestore(id).catch(err => logError('deleteTaskFromFirestore', err, { id }));
      },

      bulkDelete: (ids) => {
        set((state) => ({
          tasks: state.tasks.filter(t => !ids.includes(t.id))
        }));
        ids.forEach(id => deleteTaskFromFirestore(id).catch(err => logError('deleteTaskFromFirestore', err, { id })));
      },

      bulkToggle: (ids, completed) => {
        set((state) => ({
          tasks: state.tasks.map(t => ids.includes(t.id) ? {
            ...t,
            completed,
            completedAt: completed ? new Date().toISOString() : null
          } : t)
        }));
        ids.forEach(id => updateTaskInFirestore(id, {
          completed,
          completedAt: completed ? new Date().toISOString() : null
        }).catch(err => logError('updateTaskInFirestore', err, { id, completed })));
      },

      addTag: (name, color) => {
        console.log("🏷️ addTag called with:", { name, color });
        const newTag = { id: crypto.randomUUID(), name, color };
        set((state) => ({
          tags: [...state.tags, newTag]
        }));
        console.log("📤 Calling addTagToFirestore with:", newTag);
        const companyId = useStore.getState().companyId;
        if (companyId) {
          addTagToFirestore(newTag, companyId).catch(err => logError('addTagToFirestore', err, { tag: newTag }));
        }
      },

      updateTag: (id, name, color) => {
        set((state) => ({
          tags: state.tags.map(t => t.id === id ? { ...t, name, color } : t)
        }));
        updateTagInFirestore(id, { name, color }).catch(err => logError('updateTagInFirestore', err, { id, name, color }));
      },

      deleteTag: (id) => {
        set((state) => ({
          tags: state.tags.filter(t => t.id !== id),
          tasks: state.tasks.map(t => ({
            ...t,
            tags: t.tags.filter(tid => tid !== id)
          }))
        }));
        deleteTagFromFirestore(id).catch(err => logError('deleteTagFromFirestore', err, { id }));
      },

      setTags: (tags) => set({ tags }),

      setDailyGoal: (dailyGoal) => {
        set({ dailyGoal });
        // Persist to Firestore
        const uid = auth.currentUser?.uid;
        if (uid) {
          updateUserSettings(uid, { daily_goal: dailyGoal } as any).catch(err => logError('updateUserSettings', err, { dailyGoal }));
        }
      },

      // Focus Timer Logic
      setFocusState: (updates) => set((state) => ({
        focusState: { ...state.focusState, ...updates }
      })),

      toggleFocusTimer: () => set((state) => ({
        focusState: { ...state.focusState, isActive: !state.focusState.isActive }
      })),

      tickFocusTimer: () => set((state) => {
        const { timeLeft, isActive } = state.focusState;
        if (!isActive || timeLeft <= 0) return {};
        return {
          focusState: { ...state.focusState, timeLeft: timeLeft - 1 }
        };
      }),

      resetFocusTimer: () => set((state) => ({
        focusState: {
          ...state.focusState,
          isActive: false,
          timeLeft: state.focusState.mode === 'work' ? 25 * 60 : 5 * 60
        }
      })),

      resetData: () => set({
        tasks: [],  // Empty - will be fetched from Firestore
        tags: [],   // Empty - will be fetched from Firestore
        activeView: 'inbox',
        streak: 0,
        lastCompletedDate: null,
        theme: 'light',
        accentColor: '#6366f1',
        searchQuery: '',
        filterTagId: null,
        focusState: DEFAULT_FOCUS_STATE,
        // Authentication data shouldn't be fully wiped but resetData is usually for full purge.
        // We leave them as is, or reset if fully logging out.
        // companyId, role, status stay the same to not break access until logout.
      }),

      importData: (data) => set((state) => ({
        ...state,
        ...data,
        tasks: data.tasks || state.tasks,
        tags: data.tags || state.tags,
      })),

      updateStreak: () => {
        const state = get();
        const today = format(new Date(), 'yyyy-MM-dd');

        const yesterdayDate = new Date();
        yesterdayDate.setDate(yesterdayDate.getDate() - 1);
        const yesterday = format(yesterdayDate, 'yyyy-MM-dd');

        const tasksCompletedToday = state.tasks.filter(t =>
          t.completed && t.completedAt && format(new Date(t.completedAt), 'yyyy-MM-dd') === today
        ).length;

        if (state.lastCompletedDate !== today && state.lastCompletedDate !== yesterday && tasksCompletedToday < state.dailyGoal) {
          if (state.streak > 0) set({ streak: 0 });
          return;
        }

        if (tasksCompletedToday >= state.dailyGoal) {
          if (state.lastCompletedDate !== today) {
            set((state) => ({
              streak: state.streak + 1,
              lastCompletedDate: today
            }));
          }
        }
      },

    }),
    {
      name: 'todos-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        // Only persist UI state, NOT tasks or tags (those come from Firestore)
        theme: state.theme,
        accentColor: state.accentColor,
        dailyGoal: state.dailyGoal,
        streak: state.streak,
        lastCompletedDate: state.lastCompletedDate,
        searchQuery: state.searchQuery,
        filterTagId: state.filterTagId,
        activeView: state.activeView,
        focusState: state.focusState,
        // tasks and tags are deliberately EXCLUDED – they come from Firestore only
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          // always clear any cached tasks/tags from previous versions
          state.tasks = [];
          state.tags = [];
          if (state.theme === 'dark') document.documentElement.classList.add('dark');
          updateAccentCSS(state.accentColor || '#6366f1');
        }
      }
    }
  )
);