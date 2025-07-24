import { useKabanStore } from '../store/store';

interface TaskComponentProps {
  taskId: string;
}

const TaskComponent = ({ taskId }: TaskComponentProps) => {
  const { tasks } = useKabanStore();
  const task = tasks[taskId];
  return (
    <div className="border-red-900 border m-2 p-2 rounded-2xl shadow-lg hover:-translate-y-1">
      <h1 className="font-bold text-2xl mb-1">{task.title}</h1>
      <p className="">{task.description}</p>
      <p>{task.priority}</p>
    </div>
  );
};

export default TaskComponent;
