import { Task } from '../types';
import toast from 'react-hot-toast';
import { taskService } from '../services/taskService';

interface KanbanBoardProps {
  tasks: Task[];
  onUpdate: () => void;
}

const columns = [
  { id: 'todo', title: 'To Do', color: 'bg-gray-100' },
  { id: 'in-progress', title: 'In Progress', color: 'bg-blue-100' },
  { id: 'completed', title: 'Completed', color: 'bg-green-100' },
];

export default function KanbanBoard({ tasks, onUpdate }: KanbanBoardProps) {
  const handleStatusChange = async (taskId: string, newStatus: string) => {
    try {
      await taskService.updateTask(taskId, { status: newStatus as any });
      toast.success('Task moved successfully!');
      onUpdate();
    } catch (error) {
      toast.error('Failed to update task');
    }
  };

  const getTasksByStatus = (status: string) => {
    return tasks.filter((task) => task.status === status);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {columns.map((column) => (
        <div key={column.id} className={`${column.color} rounded-lg p-4`}>
          <h3 className="font-bold text-lg mb-4 flex items-center justify-between">
            {column.title}
            <span className="text-sm bg-white px-2 py-1 rounded-full">
              {getTasksByStatus(column.id).length}
            </span>
          </h3>
          <div className="space-y-3">
            {getTasksByStatus(column.id).map((task) => (
              <div
                key={task._id}
                className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow cursor-move"
              >
                <h4 className="font-semibold mb-2">{task.title}</h4>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {task.description}
                </p>
                <div className="flex items-center justify-between">
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      task.priority === 'high'
                        ? 'bg-red-100 text-red-800'
                        : task.priority === 'medium'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-green-100 text-green-800'
                    }`}
                  >
                    {task.priority}
                  </span>
                  {task.dueDate && (
                    <span className="text-xs text-gray-500">
                      {new Date(task.dueDate).toLocaleDateString()}
                    </span>
                  )}
                </div>
                
                {/* Quick Status Change Buttons */}
                <div className="mt-3 flex gap-2">
                  {column.id !== 'todo' && (
                    <button
                      onClick={() => handleStatusChange(task._id, column.id === 'completed' ? 'in-progress' : 'todo')}
                      className="text-xs px-2 py-1 bg-gray-200 hover:bg-gray-300 rounded transition"
                    >
                      ← Move Back
                    </button>
                  )}
                  {column.id !== 'completed' && (
                    <button
                      onClick={() => handleStatusChange(task._id, column.id === 'todo' ? 'in-progress' : 'completed')}
                      className="text-xs px-2 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded transition"
                    >
                      Move Forward →
                    </button>
                  )}
                </div>
              </div>
            ))}
            {getTasksByStatus(column.id).length === 0 && (
              <p className="text-center text-gray-400 text-sm py-8">
                No tasks here
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
