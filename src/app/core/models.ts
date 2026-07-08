export type Priority = 'low' | 'medium' | 'high';

export interface Task {
  id: number;
  title: string;
  priority: Priority;
  done: boolean;
  createdAt: number; // epoch ms
}

export type TaskFilter = 'all' | 'active' | 'done';
