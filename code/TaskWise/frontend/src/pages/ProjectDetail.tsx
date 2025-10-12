import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { projectService } from '../services/projectService';
import { taskService } from '../services/taskService';
import { Project, Task } from '../types';
import { UserPlus, Trash2, Clock, TrendingUp, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';
import AddMemberModal from '../components/AddMemberModal';
import ProjectKanban from '../components/ProjectKanban';
import TaskModal from '../components/TaskModal';

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');

  useEffect(() => {
    if (id) fetchProject();
  }, [id]);

  const fetchProject = async () => {
    try {
      const data = await projectService.getProject(id!);
      setProject(data.project);
      setTasks(data.tasks);
    } catch (error) {
      toast.error('Failed to fetch project');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!confirm('Are you sure you want to remove this member?')) return;
    
    try {
      await projectService.removeMember(id!, userId);
      toast.success('Member removed successfully!');
      fetchProject();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to remove member');
    }
  };

  const handleStatusChange = async (taskId: string, newStatus: string) => {
    try {
      await taskService.updateTask(taskId, { status: newStatus as any });
      toast.success('Task status updated!');
      fetchProject(); // Refresh to get updated tasks
    } catch (error: any) {
      toast.error('Failed to update task status');
    }
  };

  const getTaskStats = () => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === 'completed').length;
    const inProgress = tasks.filter(t => t.status === 'in-progress').length;
    const todo = tasks.filter(t => t.status === 'todo').length;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    // Calculate velocity (tasks completed per week)
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);
    const recentlyCompleted = tasks.filter(t => 
      t.status === 'completed' && 
      new Date(t.updatedAt || '') > lastWeek
    ).length;

    return { total, completed, inProgress, todo, completionRate, velocity: recentlyCompleted };
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
    </div>
  );
  if (!project) return <div>Project not found</div>;

  const stats = getTaskStats();

  return (
    <div className="space-y-6">
      {/* Project Header */}
      <div className="card">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 rounded-lg flex items-center justify-center text-white font-bold text-2xl shadow-lg"
               style={{ backgroundColor: project.color }}>
            {project.name.substring(0, 2).toUpperCase()}
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold">{project.name}</h1>
            <p className="text-gray-600">{project.description}</p>
          </div>
          <button
            onClick={() => setIsTaskModalOpen(true)}
            className="btn btn-primary"
          >
            + Add Task
          </button>
        </div>

        {/* Advanced Stats */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mt-6">
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-4 text-center border border-gray-200">
            <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
            <p className="text-xs text-gray-600 mt-1">Total Tasks</p>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 text-center border border-green-200">
            <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
            <p className="text-xs text-gray-600 mt-1">Completed</p>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 text-center border border-blue-200">
            <p className="text-2xl font-bold text-blue-600">{stats.inProgress}</p>
            <p className="text-xs text-gray-600 mt-1">In Progress</p>
          </div>
          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-4 text-center border border-yellow-200">
            <p className="text-2xl font-bold text-yellow-600">{stats.todo}</p>
            <p className="text-xs text-gray-600 mt-1">To Do</p>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 text-center border border-purple-200">
            <div className="flex items-center justify-center gap-1">
              <TrendingUp className="w-4 h-4 text-purple-600" />
              <p className="text-2xl font-bold text-purple-600">{stats.completionRate}%</p>
            </div>
            <p className="text-xs text-gray-600 mt-1">Completion</p>
          </div>
          <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg p-4 text-center border border-indigo-200">
            <div className="flex items-center justify-center gap-1">
              <Clock className="w-4 h-4 text-indigo-600" />
              <p className="text-2xl font-bold text-indigo-600">{stats.velocity}</p>
            </div>
            <p className="text-xs text-gray-600 mt-1">Weekly Velocity</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-6">
          <div className="flex justify-between text-sm mb-2">
            <span className="font-medium">Project Progress</span>
            <span className="text-gray-600">{stats.completed} of {stats.total} tasks completed</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-primary-500 to-primary-600 h-3 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${stats.completionRate}%` }}
            />
          </div>
        </div>
      </div>

      {/* View Mode Toggle */}
      <div className="flex gap-2">
        <button
          onClick={() => setViewMode('kanban')}
          className={`px-4 py-2 rounded-lg font-medium transition ${
            viewMode === 'kanban' 
              ? 'bg-primary-600 text-white' 
              : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
          }`}
        >
          Kanban Board
        </button>
        <button
          onClick={() => setViewMode('list')}
          className={`px-4 py-2 rounded-lg font-medium transition ${
            viewMode === 'list' 
              ? 'bg-primary-600 text-white' 
              : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
          }`}
        >
          List View
        </button>
      </div>

      {/* Project Tasks */}
      {viewMode === 'kanban' ? (
        <ProjectKanban tasks={tasks} onStatusChange={handleStatusChange} />
      ) : (
        <div className="card">
          <h2 className="text-xl font-bold mb-4">Project Tasks</h2>
          <div className="space-y-3">
            {tasks.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No tasks in this project yet</p>
            ) : (
              tasks.map((task) => (
                <div key={task._id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-lg">{task.title}</h3>
                    <select
                      value={task.status}
                      onChange={(e) => handleStatusChange(task._id, e.target.value)}
                      className="px-3 py-1 rounded-full text-xs font-medium border-none cursor-pointer"
                      style={{
                        backgroundColor: task.status === 'completed' ? '#dcfce7' : 
                                       task.status === 'in-progress' ? '#dbeafe' : '#f3f4f6',
                        color: task.status === 'completed' ? '#166534' : 
                               task.status === 'in-progress' ? '#1e40af' : '#374151'
                      }}
                    >
                      <option value="todo">To Do</option>
                      <option value="in-progress">In Progress</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{task.description}</p>
                  <div className="flex gap-2 items-center flex-wrap">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      task.priority === 'high' ? 'bg-red-100 text-red-800' :
                      task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {task.priority} priority
                    </span>
                    {task.dueDate && (
                      <span className="flex items-center gap-1 text-xs text-gray-500">
                        <Calendar className="w-3 h-3" />
                        {new Date(task.dueDate).toLocaleDateString()}
                      </span>
                    )}
                    {task.assignedTo && (
                      <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">
                        Assigned to {task.assignedTo.name}
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Team Members */}
      <div className="card">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Team Members ({project.members.length})</h2>
          <button
            onClick={() => setIsAddMemberModalOpen(true)}
            className="btn btn-primary flex items-center gap-2"
          >
            <UserPlus className="w-4 h-4" />
            Add Member
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {project.members.map((member) => (
            <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg hover:shadow-sm transition">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white font-semibold shadow">
                  {member.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-medium">{member.name}</p>
                  <p className="text-sm text-gray-600">{member.email}</p>
                </div>
              </div>
              <button
                onClick={() => handleRemoveMember(member.id)}
                className="p-2 text-red-600 hover:bg-red-50 rounded transition"
                title="Remove member"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Modals */}
      <AddMemberModal
        isOpen={isAddMemberModalOpen}
        onClose={() => setIsAddMemberModalOpen(false)}
        onSuccess={fetchProject}
        projectId={id!}
      />

      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSuccess={fetchProject}
        projectId={id}
      />
    </div>
  );
}
