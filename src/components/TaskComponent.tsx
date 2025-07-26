import { useReducer, useState } from 'react';
import { useKabanStore } from '../store/store';
import { Edit, Trash2, Check, X, Calendar, Bookmark, AlignLeft } from 'lucide-react';
import { format } from 'date-fns';
import type { Priority, Task } from '../types/types';

interface TaskComponentProps {
  taskId: string;
}

type EditState = {
  isEditing: boolean;
  title: string;
  description: string;
  priority: string;
  dueDate: Date | null;
};

type EditAction =
  | { type: 'TOGGLE_EDIT' }
  | { type: 'SET_TITLE'; payload: string }
  | { type: 'SET_DESCRIPTION'; payload: string }
  | { type: 'SET_PRIORITY'; payload: string }
  | { type: 'SET_DUEDATE'; payload: Date | null }
  | { type: 'RESET'; payload: Task };

const editReducer = (state: EditState, action: EditAction): EditState => {
  switch (action.type) {
    case 'TOGGLE_EDIT':
      return { ...state, isEditing: !state.isEditing };
    case 'SET_TITLE':
      return { ...state, title: action.payload };
    case 'SET_DESCRIPTION':
      return { ...state, description: action.payload };
    case 'SET_PRIORITY':
      return { ...state, priority: action.payload };
    case 'SET_DUEDATE':
      return { ...state, dueDate: action.payload };
    case 'RESET':
      return {
        isEditing: false,
        title: action.payload.title,
        description: action.payload.description || '',
        priority: action.payload.priority,
        dueDate: action.payload.dueDate,
      };
    default:
      return state;
  }
};

const TaskComponent = ({ taskId }: TaskComponentProps) => {
  const { tasks, updateTask, deleteTask } = useKabanStore();
  const task = tasks[taskId];
  const [showConfirm, setShowConfirm] = useState(false);

  const [editState, dispatch] = useReducer(editReducer, {
    isEditing: false,
    title: task.title,
    description: task.description || '',
    priority: task.priority,
    dueDate: task.dueDate,
  });

  const handleSave = () => {
    updateTask(taskId, {
      title: editState.title,
      description: editState.description || null,
      priority: editState.priority as Priority,
      dueDate: editState.dueDate,
    });
    dispatch({ type: 'TOGGLE_EDIT' });
  };

  const handleCancel = () => {
    dispatch({ type: 'RESET', payload: task });
  };

  const handleDelete = () => {
    deleteTask(taskId);
  };

  const priorityColors = {
    High: 'bg-red-100 text-red-800',
    Medium: 'bg-yellow-100 text-yellow-800',
    Low: 'bg-green-100 text-green-800',
    None: 'bg-gray-100 text-gray-800',
  };

  return (
    <div className="bg-white rounded-lg p-4 shadow-sm border border-slate-200 hover:shadow-md transition-shadow duration-200 mb-3">
      {editState.isEditing ? (
        <div className="space-y-3">
          <input
            type="text"
            className="w-full p-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={editState.title}
            onChange={e => dispatch({ type: 'SET_TITLE', payload: e.target.value })}
          />
          <textarea
            className="w-full p-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-20"
            value={editState.description}
            onChange={e => dispatch({ type: 'SET_DESCRIPTION', payload: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-3">
            <select
              className="p-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={editState.priority}
              onChange={e => dispatch({ type: 'SET_PRIORITY', payload: e.target.value })}
            >
              {['None', 'High', 'Medium', 'Low'].map(option => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <input
              type="date"
              className="p-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={editState.dueDate ? format(editState.dueDate, 'yyyy-MM-dd') : ''}
              onChange={e =>
                dispatch({
                  type: 'SET_DUEDATE',
                  payload: e.target.value ? new Date(e.target.value) : null,
                })
              }
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="flex items-center gap-2 bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Check size={16} /> Save
            </button>
            <button
              onClick={handleCancel}
              className="flex items-center gap-2 bg-slate-200 text-slate-700 px-3 py-1 rounded-lg hover:bg-slate-300 transition-colors"
            >
              <X size={16} /> Cancel
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-semibold text-slate-800">{task.title}</h3>
            <div className="flex gap-1">
              <button
                onClick={() => dispatch({ type: 'TOGGLE_EDIT' })}
                className="text-slate-400 hover:text-blue-600 transition-colors p-1"
                title="Edit task"
              >
                <Edit size={16} />
              </button>
              <button
                onClick={() => setShowConfirm(true)}
                className="text-slate-400 hover:text-red-600 transition-colors p-1"
                title="Delete task"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>

          {task.description && (
            <p className="text-slate-600 text-sm mb-2 flex items-start gap-2">
              <AlignLeft size={16} className="flex-shrink-0 mt-0.5 text-slate-400" />
              <span>{task.description}</span>
            </p>
          )}

          <div className="flex flex-wrap gap-2 mt-3">
            {task.priority !== 'None' && (
              <span
                className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 ${priorityColors[task.priority]}`}
              >
                <Bookmark size={12} /> {task.priority}
              </span>
            )}
            {task.dueDate && (
              <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800 flex items-center gap-1">
                <Calendar size={12} /> {format(task.dueDate, 'MMM dd, yyyy')}
              </span>
            )}
          </div>

          {showConfirm && (
            <div className="mt-3 p-2 bg-red-50 rounded-lg border border-red-200">
              <p className="text-sm text-red-800 mb-2">Delete this task?</p>
              <div className="flex gap-2">
                <button
                  onClick={handleDelete}
                  className="text-xs bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700 transition-colors"
                >
                  Delete
                </button>
                <button
                  onClick={() => setShowConfirm(false)}
                  className="text-xs bg-slate-200 text-slate-700 px-2 py-1 rounded hover:bg-slate-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default TaskComponent;
