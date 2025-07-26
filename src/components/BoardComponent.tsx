import React, { useReducer, useState } from 'react';
import { useKabanStore } from '../store/store';
import ColumnComponent from './ColumnComponent';
import { Plus, X, Columns, Check, RotateCcw, Edit, Trash2, Pencil } from 'lucide-react';

type AddColumnState = {
  isOpen: boolean;
  name: string;
  error: string | null;
};

type AddColumnAction =
  | { type: 'TOGGLE' }
  | { type: 'SET_NAME'; payload: string }
  | { type: 'SUBMIT' }
  | { type: 'RESET' };

const INITIAL_ADDCOLUMNSTATE: AddColumnState = {
  isOpen: false,
  name: '',
  error: null,
};

const addColumnReducer = (state: AddColumnState, action: AddColumnAction): AddColumnState => {
  switch (action.type) {
    case 'TOGGLE':
      return { ...state, isOpen: !state.isOpen, error: null };
    case 'SET_NAME':
      return { ...state, name: action.payload, error: null };
    case 'SUBMIT':
      if (!state.name.trim()) return { ...state, error: 'Column name cannot be empty' };
      return { ...state, isOpen: false, name: '', error: null };
    case 'RESET':
      return { ...state, name: '', error: null };
    default:
      return state;
  }
};

const BoardComponent = () => {
  const { board, addColumn, deleteColumn, updateBoardName, updateColumnName } = useKabanStore();
  const [state, dispatch] = useReducer(addColumnReducer, INITIAL_ADDCOLUMNSTATE);
  const [isEditingBoardName, setIsEditingBoardName] = useState(false);
  const [newBoardName, setNewBoardName] = useState(board.name);
  const [editingColumnId, setEditingColumnId] = useState<string | null>(null);
  const [newColumnName, setNewColumnName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch({ type: 'SUBMIT' });
    if (state.name.trim()) addColumn(state.name);
  };

  const handleSaveBoardName = () => {
    if (newBoardName.trim()) {
      updateBoardName(newBoardName);
      setIsEditingBoardName(false);
    }
  };

  const startEditingColumn = (columnId: string, currentName: string) => {
    setEditingColumnId(columnId);
    setNewColumnName(currentName);
  };

  const saveColumnName = (columnId: string) => {
    if (newColumnName.trim()) {
      updateColumnName(columnId, newColumnName);
      setEditingColumnId(null);
    }
  };

  const cancelEditingColumn = () => {
    setEditingColumnId(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="flex items-center gap-3 mb-6">
        <Columns className="w-6 h-6 text-blue-600" />
        {isEditingBoardName ? (
          <div className="flex items-center gap-2">
            <input
              type="text"
              className="text-3xl font-bold text-slate-800 border-b-2 border-blue-500 focus:outline-none"
              value={newBoardName}
              onChange={e => setNewBoardName(e.target.value)}
              autoFocus
            />
            <button
              onClick={handleSaveBoardName}
              className="text-green-600 hover:text-green-800 transition-colors"
              title="Save"
            >
              <Check className="w-5 h-5" />
            </button>
            <button
              onClick={() => {
                setIsEditingBoardName(false);
                setNewBoardName(board.name);
              }}
              className="text-red-600 hover:text-red-800 transition-colors"
              title="Cancel"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        ) : (
          <>
            <h1 className="text-3xl font-bold text-slate-800">{board.name}</h1>
            <button
              onClick={() => setIsEditingBoardName(true)}
              className="text-slate-400 hover:text-blue-600 transition-colors"
              title="Edit board name"
            >
              <Edit className="w-5 h-5" />
            </button>
          </>
        )}
      </div>

      <div className="flex gap-6 bg-slate-100 rounded-xl p-6 overflow-x-auto scroll-smooth">
        {board.columnOrder.length > 0 &&
          board.columnOrder.map((columnId: string) => (
            <div key={columnId} className="relative group">
              {editingColumnId === columnId ? (
                <div className="bg-white w-72 rounded-xl p-4 shadow-md shrink-0 border border-blue-200">
                  <div className="flex items-center gap-2 mb-4">
                    <input
                      type="text"
                      className="flex-1 font-semibold text-lg border-b-2 border-blue-500 focus:outline-none"
                      value={newColumnName}
                      onChange={e => setNewColumnName(e.target.value)}
                      autoFocus
                    />
                    <button
                      onClick={() => saveColumnName(columnId)}
                      className="text-green-600 hover:text-green-800 transition-colors"
                      title="Save"
                    >
                      <Check className="w-5 h-5" />
                    </button>
                    <button
                      onClick={cancelEditingColumn}
                      className="text-red-600 hover:text-red-800 transition-colors"
                      title="Cancel"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <ColumnComponent columnId={columnId} />
                </div>
              ) : (
                <div className="relative">
                  <ColumnComponent columnId={columnId} />
                  <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() =>
                        startEditingColumn(
                          columnId,
                          useKabanStore.getState().columns[columnId].name
                        )
                      }
                      className="bg-blue-100 text-blue-600 p-1 rounded hover:bg-blue-200 transition-colors"
                      title="Edit column name"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (
                          confirm('Are you sure you want to delete this column and all its tasks?')
                        ) {
                          deleteColumn(columnId);
                        }
                      }}
                      className="bg-red-100 text-red-600 p-1 rounded hover:bg-red-200 transition-colors"
                      title="Delete column"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}

        {state.isOpen ? (
          <div className="bg-white w-72 rounded-xl p-4 shadow-md shrink-0 border border-slate-200">
            <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
              <div className="flex justify-between items-center border-b border-slate-200 pb-3">
                <h3 className="font-semibold text-lg text-slate-700 flex items-center gap-2">
                  <Columns className="w-5 h-5" /> New Column
                </h3>
                <button
                  type="button"
                  onClick={() => dispatch({ type: 'TOGGLE' })}
                  className="text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-2">
                <label htmlFor="column-name" className="text-sm font-medium text-slate-600">
                  Column Name
                </label>
                <input
                  id="column-name"
                  className="w-full p-3 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g. 'In Progress'"
                  type="text"
                  value={state.name}
                  onChange={e => dispatch({ type: 'SET_NAME', payload: e.target.value })}
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white rounded-lg p-3 hover:bg-blue-700 transition-colors duration-200"
                >
                  <Check className="w-4 h-4" /> Create Column
                </button>
                <button
                  type="reset"
                  className="flex items-center justify-center gap-2 bg-slate-100 text-slate-700 rounded-lg p-3 hover:bg-slate-200 transition-colors duration-200"
                  onClick={() => dispatch({ type: 'RESET' })}
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>
        ) : (
          <button
            className="flex items-center gap-2 h-min bg-white rounded-xl p-4 text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200 shrink-0 shadow-sm border-2 border-dashed border-slate-300 hover:border-blue-300"
            onClick={() => dispatch({ type: 'TOGGLE' })}
          >
            <Plus className="w-5 h-5" />
            <span>Add Column</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default BoardComponent;
