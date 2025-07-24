import { useKabanStore } from '../store/store';
import TaskComponent from './TaskComponent';

interface ColumnComponentProps {
  columnId: string;
}
const ColumnComponent = ({ columnId }: ColumnComponentProps) => {
  const { columns } = useKabanStore();
  return (
    <div className="bg-emerald-50 min-w-72 rounded-2xl p-2">
      <div className="border-b-red-300 border-b-2 p-2">
        <p className="font-semibold text-2xl">{columns[columnId].name}</p>
      </div>
      <div className="p-2 mb-2">
        {columns[columnId].taskIds.map(taskid => {
          return <TaskComponent taskId={taskid} />;
        })}
      </div>
    </div>
  );
};

export default ColumnComponent;
