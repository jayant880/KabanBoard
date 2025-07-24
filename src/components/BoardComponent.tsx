import { useKabanStore } from '../store/store';
import ColumnComponent from './ColumnComponent';

const BoardComponent = () => {
  const { board } = useKabanStore();
  return (
    <div className="h-screen bg-slate-200 p-3">
      <div className="text-2xl font-bold p-2">{board.name}</div>
      <div className="flex gap-4 bg-slate-400 rounded-2xl p-5 justify-center scroll-auto">
        {board.columnOrder.length > 0 &&
          board.columnOrder.map((columnId: string) => {
            return <ColumnComponent columnId={columnId} key={columnId} />;
          })}
      </div>
    </div>
  );
};

export default BoardComponent;
