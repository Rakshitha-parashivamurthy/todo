
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
  companyId?: string;
  userId?: string;
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
  companyId?: string;
  userId?: string;
  createdByUserId?: string;
  status?: string;
}

export type View = 'inbox' | 'today' | 'upcoming' | 'overdue' | 'completed' | 'focus' | 'insights' | 'settings' | 'help' | 'subscription' | 'super_admin' | 'manage_users';

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

// SaaS Types
export type Role = 'super_admin' | 'admin' | 'user';

export interface User {
  uid: string;
  email: string | null;
  username: string;
  password_hash?: string;
  role: Role;
  companyId?: string;
  status: 'pending' | 'active' | 'inactive';
  created_at: Date;
  last_login: Date;
}

export interface Company {
  companyId: string;
  companyName: string;
  adminId: string;
  subscriptionId: string;
  status: 'pending' | 'pending_approval' | 'active';
  createdAt: Date;
}

export interface Subscription {
  subscriptionId: string;
  companyId: string;
  planName: string;
  price: number;
  paymentMethod: string;
  startDate: Date;
  endDate: Date;
  status: 'pending_approval' | 'active' | 'expired';
}

export interface DailyTarget {
  targetId: string;
  userId: string;
  companyId: string;
  targetTaskCount: number;
  completedTaskCount: number;
  targetDate: string;
  targetStatus: string;
  createdAt: Date;
}

export interface TaskHistory {
  historyId: string;
  taskId: string;
  userId: string;
  companyId: string;
  actionType: string;
  oldStatus?: string;
  newStatus?: string;
  actionTime: Date;
}

export interface Invite {
  inviteId: string;
  companyId: string;
  email: string;
  invitedBy: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: Date;
  expiresAt: Date;
}
