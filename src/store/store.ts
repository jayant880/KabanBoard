import { create } from 'zustand';
import type { Board, Column, Task } from '../types/types';

interface KabanState {
  board: Board;
  columns: Record<string, Column>;
  tasks: Record<string, Task>;

  // Actions
  // Task
  addTask: (columnId: string, task: Task) => void;
  updateTask: (taskId: string, updatedFields: Partial<Task>) => void;
  deleteTask: (taskId: string) => void;
  // Column
  addColumn: (name: string) => void;
}

export const useKabanStore = create<KabanState>(set => ({
  board: {
    id: 'board-1',
    name: 'Project Tasks',
    columnOrder: ['col-1', 'col-2', 'col-3'],
  },
  columns: {
    'col-1': { id: 'col-1', name: 'To Do', taskIds: ['task-1', 'task-2'] },
    'col-2': { id: 'col-2', name: 'In Progress', taskIds: ['task-3'] },
    'col-3': { id: 'col-3', name: 'Done', taskIds: [] },
  },
  tasks: {
    'task-1': {
      id: 'task-1',
      title: 'Design homepage',
      description: 'Create wireframes for the homepage',
      priority: 'High',
      isCompleted: false,
      dueDate: new Date('2023-12-15'),
      createdAt: new Date('2023-11-20T09:15:00Z'),
    },
    'task-2': {
      id: 'task-2',
      title: 'Setup database',
      description: 'Initialize PostgreSQL database',
      priority: 'Medium',
      isCompleted: false,
      dueDate: null,
      createdAt: new Date('2023-11-18T14:30:00Z'),
    },
    'task-3': {
      id: 'task-3',
      title: 'API endpoints',
      description: 'Create user authentication endpoints',
      priority: 'High',
      isCompleted: false,
      dueDate: new Date('2023-12-01'),
      createdAt: new Date('2023-11-15T11:20:00Z'),
    },
  },

  // Actions
  addTask: (columnId, task) =>
    set(state => {
      const column = state.columns[columnId];
      return {
        tasks: {
          ...state.tasks,
          [task.id]: { ...task, createdAt: new Date(), isCompleted: false },
        },
        columns: {
          ...state.columns,
          [column.id]: {
            ...column,
            taskIds: [...column.taskIds, task.id],
          },
        },
      };
    }),

  updateTask: (taskId, updatedFields) =>
    set(state => ({
      tasks: {
        ...state.tasks,
        [taskId]: {
          ...state.tasks[taskId],
          ...updatedFields,
        },
      },
    })),

  deleteTask: taskId => {
    set(state => {
      const updateColumns = { ...state.columns };
      for (const col of Object.values(updateColumns)) {
        col.taskIds = col.taskIds.filter(id => id !== taskId);
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { [taskId]: _, ...remainigTasks } = state.tasks;
      return {
        tasks: remainigTasks,
        columns: updateColumns,
      };
    });
  },

  addColumn: name => {
    set(state => {
      const column: Column = {
        id: crypto.randomUUID(),
        name: name,
        taskIds: [],
      };
      return {
        columns: {
          ...state.columns,
          [column.id]: column,
        },
        board: {
          ...state.board,
          columnOrder: [...state.board.columnOrder, column.id],
        },
      };
    });
  },
}));
