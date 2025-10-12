import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { taskService } from '../services/taskService';
import { projectService } from '../services/projectService';
import { Task, TaskStats, Project } from '../types';
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  TrendingUp,
  Plus,
  Calendar
} from 'lucide-react';
import { format } from 'date-fns';

export default function Dashboard() {
  const [stats, setStats] = useState<TaskStats | null>(null);
  const [recentTasks, setRecentTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsData, tasksData, projectsData] = await Promise.all([
        taskService.getStats(),
        taskService.getTasks(),
        projectService.getProjects()
      ]);
      
      setStats(statsData);
      setRecentTasks(tasksData.tasks.slice(0, 5));
      setProjects(projectsData.projects.slice(0, 3));
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-600';
      case 'medium':
        return 'text-yellow-600';
      default:
        return 'text-green-600';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4 animate-fade-in">
          <div className="spinner w-12 h-12 mx-auto"></div>
          <p className="text-gray-500 font-medium">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Enhanced Header with Gradient */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 p-8 shadow-xl">
        <div className="absolute inset-0 bg-black opacity-5"></div>
        <div className="relative z-10">
          <h1 className="text-4xl font-bold text-white mb-2">Dashboard</h1>
          <p className="text-purple-100 text-lg">Welcome back! Here's your productivity overview</p>
        </div>
        {/* Decorative Elements */}
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-white opacity-10 rounded-full blur-3xl"></div>
        <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-white opacity-10 rounded-full blur-3xl"></div>
      </div>

      {/* Enhanced Stats Grid with Animations */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card card-interactive group hover:border-purple-200 transition-all duration-300 animate-slide-up" style={{ animationDelay: '0ms' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Total Tasks</p>
              <p className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                {stats?.total || 0}
              </p>
              <p className="text-xs text-gray-500 mt-2">All time</p>
            </div>
            <div className="p-4 bg-gradient-to-br from-purple-100 to-blue-100 rounded-xl group-hover:scale-110 transition-transform duration-300">
              <TrendingUp className="w-8 h-8 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="card card-interactive group hover:border-blue-200 transition-all duration-300 animate-slide-up" style={{ animationDelay: '100ms' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">In Progress</p>
              <p className="text-4xl font-bold text-blue-600">{stats?.inProgress || 0}</p>
              <p className="text-xs text-gray-500 mt-2">Active tasks</p>
            </div>
            <div className="p-4 bg-blue-100 rounded-xl group-hover:scale-110 transition-transform duration-300">
              <Clock className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-center gap-2 text-sm text-blue-600">
              <div className="status-dot bg-blue-500"></div>
              <span className="font-medium">Active</span>
            </div>
          </div>
        </div>

        <div className="card card-interactive group hover:border-green-200 transition-all duration-300 animate-slide-up" style={{ animationDelay: '200ms' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Completed</p>
              <p className="text-4xl font-bold text-green-600">{stats?.completed || 0}</p>
              <p className="text-xs text-gray-500 mt-2">
                {stats?.total ? Math.round((stats.completed / stats.total) * 100) : 0}% completion
              </p>
            </div>
            <div className="p-4 bg-green-100 rounded-xl group-hover:scale-110 transition-transform duration-300">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="progress-bar">
              <div 
                className="progress-fill bg-gradient-to-r from-green-500 to-emerald-500" 
                style={{ width: `${stats?.total ? (stats.completed / stats.total) * 100 : 0}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="card card-interactive group hover:border-red-200 transition-all duration-300 animate-slide-up" style={{ animationDelay: '300ms' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Overdue</p>
              <p className="text-4xl font-bold text-red-600">{stats?.overdue || 0}</p>
              <p className="text-xs text-gray-500 mt-2">Needs attention</p>
            </div>
            <div className="p-4 bg-red-100 rounded-xl group-hover:scale-110 transition-transform duration-300">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
          </div>
          {(stats?.overdue || 0) > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex items-center gap-2 text-sm text-red-600">
                <div className="status-dot-error"></div>
                <span className="font-medium">Action required</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Enhanced Recent Tasks */}
        <div className="card card-elevated animate-slide-up" style={{ animationDelay: '400ms' }}>
          <div className="section-header">
            <h2 className="section-title">
              <Clock className="w-6 h-6 text-purple-600" />
              Recent Tasks
            </h2>
            <Link to="/tasks" className="text-sm text-purple-600 hover:text-purple-700 font-medium flex items-center gap-1 transition-colors">
              View All →
            </Link>
          </div>

          <div className="space-y-4">
            {recentTasks.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No tasks yet</p>
                <Link to="/tasks" className="btn btn-primary mt-4 inline-flex items-center">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Task
                </Link>
              </div>
            ) : (
              recentTasks.map((task) => (
                <div
                  key={task._id}
                  className="flex items-start p-4 border border-gray-200 rounded-lg hover:border-primary-300 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-gray-900">{task.title}</h3>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(task.status)}`}>
                        {task.status}
                      </span>
                    </div>
                    {task.description && (
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">{task.description}</p>
                    )}
                    {task.dueDate && (
                      <div className="flex items-center text-xs text-gray-500 mt-2">
                        <Calendar className="w-3 h-3 mr-1" />
                        {format(new Date(task.dueDate), 'MMM d, yyyy')}
                      </div>
                    )}
                  </div>
                  <AlertCircle className={`w-5 h-5 ${getPriorityColor(task.priority)}`} />
                </div>
              ))
            )}
          </div>
        </div>

        {/* Projects */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Projects</h2>
            <Link to="/projects" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
              View All
            </Link>
          </div>

          <div className="space-y-4">
            {projects.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No projects yet</p>
                <Link to="/projects" className="btn btn-primary mt-4 inline-flex items-center">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Project
                </Link>
              </div>
            ) : (
              projects.map((project) => (
                <Link
                  key={project._id}
                  to={`/projects/${project._id}`}
                  className="block p-4 border border-gray-200 rounded-lg hover:border-primary-300 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold"
                      style={{ backgroundColor: project.color }}
                    >
                      {project.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{project.name}</h3>
                      {project.description && (
                        <p className="text-sm text-gray-600 line-clamp-1">{project.description}</p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">
                        {project.members.length} member{project.members.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
