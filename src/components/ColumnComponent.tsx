import { useReducer } from 'react';
import { useKabanStore } from '../store/store';
import TaskComponent from './TaskComponent';
import { AlignLeft, Bookmark, Calendar, Check, Plus, RotateCcw, Text, X } from 'lucide-react';
import type { Priority, Task } from '../types/types';
import { format, parseISO } from 'date-fns';

type newTask = {
  title: string;
  description: string | null;
  priority: Priority;
  dueDate: Date | null;
};

type AddTaskState = {
  isOpen: boolean;
  task: newTask;
};
type AddTaskAction =
  | { type: 'TOGGLE' }
  | {
      type: 'SET_TASK_FIELD';
      payload: { field: keyof newTask; value: string | null | Date | Priority };
    }
  | { type: 'SUBMIT' }
  | { type: 'RESET' };

const INITIAL_TASK: newTask = {
  title: '',
  description: null,
  priority: 'None',
  dueDate: null,
};

const INTIIAL_ADDTASKSTATE: AddTaskState = {
  isOpen: false,
  task: INITIAL_TASK,
};

const addTaskReducer = (state: AddTaskState, action: AddTaskAction): AddTaskState => {
  switch (action.type) {
    case 'TOGGLE':
      return { ...state, isOpen: !state.isOpen };
    case 'SET_TASK_FIELD':
      return {
        ...state,
        task: {
          ...state.task,
          [action.payload.field]:
            action.payload.field === 'dueDate'
              ? action.payload.value
                ? typeof action.payload.value === 'string'
                  ? parseISO(action.payload.value)
                  : action.payload.value
                : null
              : action.payload.value,
        },
      };
    case 'SUBMIT':
      return { ...state, isOpen: false, task: INITIAL_TASK };
    case 'RESET':
      return { ...state, task: INITIAL_TASK };
    default:
      return state;
  }
};

interface ColumnComponentProps {
  columnId: string;
}
const ColumnComponent = ({ columnId }: ColumnComponentProps) => {
  const { columns, addTask } = useKabanStore();
  const [state, dispatch] = useReducer(addTaskReducer, INTIIAL_ADDTASKSTATE);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (state.task.title.trim()) {
      const newTask: Task = {
        id: crypto.randomUUID(),
        title: state.task.title,
        description: state.task.description,
        priority: state.task.priority,
        dueDate: state.task.dueDate,
        isCompleted: false,
        createdAt: new Date(),
      };
      addTask(columnId, newTask);
      dispatch({ type: 'SUBMIT' });
    }
  };

  return (
    <div className="bg-white min-w-72 rounded-xl p-3 shadow-sm border border-slate-200">
      <div className="border-b border-slate-200 pb-3 mb-3">
        <h2 className="font-semibold text-lg text-slate-800">{columns[columnId].name}</h2>
      </div>

      <div className="space-y-3 mb-3">
        {columns[columnId].taskIds.map(taskid => (
          <TaskComponent key={taskid} taskId={taskid} />
        ))}
      </div>

      {state.isOpen ? (
        <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-medium text-slate-700 flex items-center gap-2">
              <Bookmark className="w-4 h-4" /> New Task
            </h3>
            <button
              onClick={() => dispatch({ type: 'TOGGLE' })}
              className="text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-600 flex items-center gap-2">
                <Text className="w-4 h-4" /> Title
              </label>
              <input
                type="text"
                className="w-full p-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Task title"
                value={state.task.title}
                onChange={e =>
                  dispatch({
                    type: 'SET_TASK_FIELD',
                    payload: { field: 'title', value: e.target.value },
                  })
                }
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-600 flex items-center gap-2">
                <AlignLeft className="w-4 h-4" /> Description
              </label>
              <textarea
                className="w-full p-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-20"
                placeholder="Task description"
                value={state.task.description || ''}
                onChange={e =>
                  dispatch({
                    type: 'SET_TASK_FIELD',
                    payload: { field: 'description', value: e.target.value || null },
                  })
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-600 flex items-center gap-2">
                  <Bookmark className="w-4 h-4" /> Priority
                </label>
                <select
                  className="w-full p-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={state.task.priority}
                  onChange={e =>
                    dispatch({
                      type: 'SET_TASK_FIELD',
                      payload: { field: 'priority', value: e.target.value as Priority },
                    })
                  }
                >
                  {['None', 'High', 'Medium', 'Low'].map(option => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-600 flex items-center gap-2">
                  <Calendar className="w-4 h-4" /> Due Date
                </label>
                <input
                  type="date"
                  className="w-full p-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={state.task.dueDate ? format(state.task.dueDate, 'yyyy-MM-dd') : ''}
                  onChange={e =>
                    dispatch({
                      type: 'SET_TASK_FIELD',
                      payload: { field: 'dueDate', value: e.target.value },
                    })
                  }
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white rounded-lg p-2 hover:bg-blue-700 transition-colors duration-200"
              >
                <Check className="w-4 h-4" /> Save Task
              </button>
              <button
                type="button"
                onClick={() => dispatch({ type: 'RESET' })}
                className="flex items-center justify-center gap-2 bg-slate-100 text-slate-700 rounded-lg p-2 hover:bg-slate-200 transition-colors duration-200"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      ) : (
        <button
          className="flex items-center justify-center gap-2 w-full bg-white rounded-lg p-3 text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200 shadow-sm border-2 border-dashed border-slate-300 hover:border-blue-300"
          onClick={() => dispatch({ type: 'TOGGLE' })}
        >
          <Plus className="w-4 h-4" />
          <span>Add Task</span>
        </button>
      )}
    </div>
  );
};

export default ColumnComponent;
