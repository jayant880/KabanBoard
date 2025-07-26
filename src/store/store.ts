import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Board, Column, Task } from '../types/types';

interface KabanState {
  board: Board;
  columns: Record<string, Column>;
  tasks: Record<string, Task>;

  // Actions
  // Task
  addTask: (columnId: string, task: Omit<Task, 'id' | 'createdAt' | 'isCompleted'>) => void;
  updateTask: (taskId: string, updatedFields: Partial<Task>) => void;
  deleteTask: (taskId: string) => void;
  // Column
  addColumn: (name: string) => void;
  updateColumnName: (columnId: string, name: string) => void;
  deleteColumn: (columnId: string) => void;
  // Board
  updateBoardName: (name: string) => void;
}

const initialState = {
  board: {
    id: 'board-1',
    name: 'My Kanban Board',
    columnOrder: [],
  },
  columns: {},
  tasks: {},
};

export const useKabanStore = create<KabanState>()(
  persist(
    set => ({
      ...initialState,

      // Task actions
      addTask: (columnId, task) => {
        const newTask: Task = {
          ...task,
          id: crypto.randomUUID(),
          createdAt: new Date(),
          isCompleted: false,
        };

        set(state => {
          const column = state.columns[columnId];
          if (!column) return state;

          return {
            tasks: {
              ...state.tasks,
              [newTask.id]: newTask,
            },
            columns: {
              ...state.columns,
              [columnId]: {
                ...column,
                taskIds: [...column.taskIds, newTask.id],
              },
            },
          };
        });
      },

      updateTask: (taskId, updatedFields) =>
        set(state => {
          if (!state.tasks[taskId]) return state;
          return {
            tasks: {
              ...state.tasks,
              [taskId]: {
                ...state.tasks[taskId],
                ...updatedFields,
              },
            },
          };
        }),

      deleteTask: taskId =>
        set(state => {
          const updatedColumns = { ...state.columns };
          let columnUpdated = false;

          // Remove task from all columns
          for (const column of Object.values(updatedColumns)) {
            const taskIndex = column.taskIds.indexOf(taskId);
            if (taskIndex !== -1) {
              column.taskIds = column.taskIds.filter(id => id !== taskId);
              columnUpdated = true;
            }
          }

          if (!columnUpdated) return state;

          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { [taskId]: _, ...remainingTasks } = state.tasks;
          return {
            tasks: remainingTasks,
            columns: updatedColumns,
          };
        }),

      // Column actions
      addColumn: name =>
        set(state => {
          const newColumn: Column = {
            id: crypto.randomUUID(),
            name,
            taskIds: [],
          };

          return {
            columns: {
              ...state.columns,
              [newColumn.id]: newColumn,
            },
            board: {
              ...state.board,
              columnOrder: [...state.board.columnOrder, newColumn.id],
            },
          };
        }),

      updateColumnName: (columnId: string, name: string) =>
        set(state => ({
          columns: {
            ...state.columns,
            [columnId]: {
              ...state.columns[columnId],
              name,
            },
          },
        })),

      deleteColumn: columnId =>
        set(state => {
          // Remove column from columnOrder
          const newColumnOrder = state.board.columnOrder.filter(id => id !== columnId);

          // Get task IDs to delete
          const tasksToDelete = state.columns[columnId]?.taskIds || [];

          // Remove column
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { [columnId]: _, ...remainingColumns } = state.columns;

          // Remove tasks that were in this column
          const remainingTasks = Object.fromEntries(
            Object.entries(state.tasks).filter(([id]) => !tasksToDelete.includes(id))
          );

          return {
            board: {
              ...state.board,
              columnOrder: newColumnOrder,
            },
            columns: remainingColumns,
            tasks: remainingTasks,
          };
        }),

      // Board actions
      updateBoardName: name =>
        set(state => ({
          board: {
            ...state.board,
            name,
          },
        })),
    }),
    {
      name: 'kanban-storage', // unique name for localStorage key
      storage: createJSONStorage(() => localStorage), // use localStorage
      version: 1, // version for potential future migrations
    }
  )
);
