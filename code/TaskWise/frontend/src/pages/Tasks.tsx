import { useEffect, useState } from 'react';
import { taskService } from '../services/taskService';
import { Task } from '../types';
import { Plus, Filter, LayoutGrid, List } from 'lucide-react';
import toast from 'react-hot-toast';
import TaskModal from '../components/TaskModal';
import KanbanBoard from '../components/KanbanBoard';

export default function Tasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<{status?: string; priority?: string}>({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');

  useEffect(() => {
    fetchTasks();
  }, [filter]);

  const fetchTasks = async () => {
    try {
      const data = await taskService.getTasks(filter);
      setTasks(data.tasks);
    } catch (error) {
      toast.error('Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (taskId: string, status: string) => {
    try {
      await taskService.updateTask(taskId, { status: status as any });
      toast.success('Task updated');
      fetchTasks();
    } catch (error) {
      toast.error('Failed to update task');
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Tasks</h1>
        <div className="flex gap-3">
          {/* View Toggle */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-2 rounded flex items-center gap-2 transition ${
                viewMode === 'list' ? 'bg-white shadow' : 'text-gray-600'
              }`}
            >
              <List className="w-4 h-4" />
              List
            </button>
            <button
              onClick={() => setViewMode('kanban')}
              className={`px-3 py-2 rounded flex items-center gap-2 transition ${
                viewMode === 'kanban' ? 'bg-white shadow' : 'text-gray-600'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              Board
            </button>
          </div>
          
          <button 
            className="btn btn-primary flex items-center"
            onClick={() => setIsModalOpen(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            New Task
          </button>
        </div>
      </div>

      {/* Filter - Only show in list view */}
      {viewMode === 'list' && (
        <div className="flex gap-4">
          <select className="input" onChange={(e) => setFilter({...filter, status: e.target.value})}>
            <option value="">All Status</option>
            <option value="todo">To Do</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
          <select className="input" onChange={(e) => setFilter({...filter, priority: e.target.value})}>
            <option value="">All Priority</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
      )}

      {/* Conditional Rendering based on view mode */}
      {viewMode === 'kanban' ? (
        <KanbanBoard tasks={tasks} onUpdate={fetchTasks} />
      ) : (
        <div className="grid gap-4">
          {tasks.map((task) => (
          <div key={task._id} className="card hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-bold text-lg">{task.title}</h3>
              <select
                className="text-sm border rounded px-2 py-1 cursor-pointer"
                value={task.status}
                onChange={(e) => handleStatusChange(task._id, e.target.value)}
              >
                <option value="todo">To Do</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            <p className="text-sm text-gray-600 mb-3">{task.description}</p>
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  task.priority === 'high' ? 'bg-red-100 text-red-800' :
                  task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {task.priority}
                </span>
                {task.dueDate && (
                  <span className="text-xs text-gray-500">
                    Due: {new Date(task.dueDate).toLocaleDateString()}
                  </span>
                )}
              </div>
              {typeof task.project === 'object' && task.project && (
                <span className="text-xs px-2 py-1 rounded" style={{ backgroundColor: task.project.color + '20', color: task.project.color }}>
                  {task.project.name}
                </span>
              )}
            </div>
          </div>
        ))}
        </div>
      )}

      {/* Task Creation Modal */}
      <TaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchTasks}
      />
    </div>
  );
}
