export type Priority = 'High' | 'Medium' | 'Low' | 'None';

export interface Task {
  id: string;
  title: string;
  description: string | null;
  isCompleted: boolean;
  priority: Priority;
  dueDate: Date | null;
  createdAt: Date | null;
}

export interface Column {
  id: string;
  name: string;
  taskIds: string[];
}

export interface Board {
  id: string;
  name: string;
  columnOrder: string[];
}
