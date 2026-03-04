
export enum Priority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high'
}

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
}

export type Recurrence = 'daily' | 'weekly' | 'monthly' | null;

export interface Task {
  id: string;
  title: string;
  description?: string;
  dueDate: string | null;
  priority: Priority;
  tags: string[]; // Tag IDs
  subtasks: SubTask[];
  completed: boolean;
  completedAt: string | null;
  createdAt: string;
  position: number;
  aiBreakdownRequested?: boolean;
  recurrence: Recurrence;
}

export type View = 'inbox' | 'today' | 'upcoming' | 'overdue' | 'completed' | 'focus' | 'insights' | 'settings' | 'help';

export interface FocusState {
  timeLeft: number;
  isActive: boolean;
  mode: 'work' | 'break';
}

export interface AppState {
  tasks: Task[];
  tags: Tag[];
  activeView: View;
  theme: 'light' | 'dark';
  accentColor: string;
  streak: number;
  dailyGoal: number;
  lastCompletedDate: string | null;
  focusState: FocusState;
}