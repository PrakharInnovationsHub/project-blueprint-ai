import { Task } from '../types';
import { Calendar } from 'lucide-react';

interface Props {
  tasks: Task[];
  onStatusChange: (taskId: string, newStatus: string) => void;
}

export default function ProjectKanban({ tasks, onStatusChange }: Props) {
  const columns = [
    { id: 'todo', title: 'To Do', color: 'bg-gray-100', textColor: 'text-gray-800' },
    { id: 'in-progress', title: 'In Progress', color: 'bg-blue-100', textColor: 'text-blue-800' },
    { id: 'completed', title: 'Completed', color: 'bg-green-100', textColor: 'text-green-800' }
  ];

  const getTasksByStatus = (status: string) => {
    return tasks.filter(task => task.status === status);
  };

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('taskId', taskId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, newStatus: string) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('taskId');
    if (taskId) {
      onStatusChange(taskId, newStatus);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {columns.map(column => {
        const columnTasks = getTasksByStatus(column.id);
        return (
          <div
            key={column.id}
            className="bg-gray-50 rounded-lg p-4 min-h-[500px]"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, column.id)}
          >
            <div className={`${column.color} rounded-lg px-4 py-2 mb-4 flex justify-between items-center`}>
              <h3 className={`font-bold ${column.textColor}`}>{column.title}</h3>
              <span className={`text-sm font-semibold ${column.textColor}`}>
                {columnTasks.length}
              </span>
            </div>

            <div className="space-y-3">
              {columnTasks.map(task => (
                <div
                  key={task._id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, task._id)}
                  className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 hover:shadow-md transition-all cursor-move group"
                >
                  <h4 className="font-semibold text-gray-800 mb-2 group-hover:text-primary-600 transition">
                    {task.title}
                  </h4>
                  
                  {task.description && (
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {task.description}
                    </p>
                  )}

                  <div className="space-y-2">
                    {/* Priority Badge */}
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        task.priority === 'high' ? 'bg-red-100 text-red-800' :
                        task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {task.priority}
                      </span>
                    </div>

                    {/* Due Date */}
                    {task.dueDate && (
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Calendar className="w-3 h-3" />
                        <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                      </div>
                    )}

                    {/* Assigned To */}
                    {task.assignedTo && (
                      <div className="flex items-center gap-2 mt-2 pt-2 border-t border-gray-100">
                        <div className="w-6 h-6 bg-primary-600 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                          {task.assignedTo.name?.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-xs text-gray-600">{task.assignedTo.name}</span>
                      </div>
                    )}
                  </div>

                  {/* Status Dropdown for mobile */}
                  <select
                    value={task.status}
                    onChange={(e) => onStatusChange(task._id, e.target.value)}
                    className="mt-3 w-full px-2 py-1 text-xs border border-gray-300 rounded bg-white md:hidden"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <option value="todo">To Do</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              ))}

              {columnTasks.length === 0 && (
                <div className="text-center py-8 text-gray-400 text-sm">
                  Drag tasks here
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
