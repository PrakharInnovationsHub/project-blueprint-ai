import { useEffect, useState } from 'react';
import { taskService } from '../services/taskService';
import { projectService } from '../services/projectService';
import { Task, Project } from '../types';
import { TrendingUp, CheckCircle2, Clock, AlertCircle, BarChart3, Calendar, Target } from 'lucide-react';
import PomodoroTimer from '../components/PomodoroTimer';

export default function Analytics() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [tasksData, projectsData] = await Promise.all([
        taskService.getTasks(),
        projectService.getProjects()
      ]);
      setTasks(tasksData.tasks);
      setProjects(projectsData.projects);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate analytics
  const getAnalytics = () => {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'completed').length;
    const inProgressTasks = tasks.filter(t => t.status === 'in-progress').length;
    const todoTasks = tasks.filter(t => t.status === 'todo').length;
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // Tasks by priority
    const highPriority = tasks.filter(t => t.priority === 'high').length;
    const mediumPriority = tasks.filter(t => t.priority === 'medium').length;
    const lowPriority = tasks.filter(t => t.priority === 'low').length;

    // Overdue tasks
    const now = new Date();
    const overdueTasks = tasks.filter(t => 
      t.dueDate && 
      new Date(t.dueDate) < now && 
      t.status !== 'completed'
    ).length;

    // Tasks completed this week
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const completedThisWeek = tasks.filter(t => 
      t.status === 'completed' && 
      t.updatedAt &&
      new Date(t.updatedAt) > weekAgo
    ).length;

    // Productivity trend (last 7 days)
    const productivityTrend = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);
      
      const completed = tasks.filter(t => 
        t.status === 'completed' && 
        t.updatedAt &&
        new Date(t.updatedAt) >= date &&
        new Date(t.updatedAt) < nextDate
      ).length;
      
      productivityTrend.push({
        date: date.toLocaleDateString('en-US', { weekday: 'short' }),
        completed
      });
    }

    return {
      totalTasks,
      completedTasks,
      inProgressTasks,
      todoTasks,
      completionRate,
      highPriority,
      mediumPriority,
      lowPriority,
      overdueTasks,
      completedThisWeek,
      productivityTrend,
      totalProjects: projects.length
    };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const analytics = getAnalytics();
  const maxCompleted = Math.max(...analytics.productivityTrend.map(d => d.completed), 1);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-gray-600 mt-1">Track your productivity and progress</p>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 font-medium">Total Tasks</p>
              <p className="text-3xl font-bold text-blue-900 mt-1">{analytics.totalTasks}</p>
              <p className="text-xs text-blue-600 mt-2">{analytics.totalProjects} projects</p>
            </div>
            <div className="bg-blue-500 text-white p-3 rounded-lg">
              <Target className="w-8 h-8" />
            </div>
          </div>
        </div>

        <div className="card bg-gradient-to-br from-green-50 to-green-100 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 font-medium">Completed</p>
              <p className="text-3xl font-bold text-green-900 mt-1">{analytics.completedTasks}</p>
              <p className="text-xs text-green-600 mt-2">{analytics.completionRate}% completion rate</p>
            </div>
            <div className="bg-green-500 text-white p-3 rounded-lg">
              <CheckCircle2 className="w-8 h-8" />
            </div>
          </div>
        </div>

        <div className="card bg-gradient-to-br from-yellow-50 to-yellow-100 border border-yellow-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-yellow-600 font-medium">In Progress</p>
              <p className="text-3xl font-bold text-yellow-900 mt-1">{analytics.inProgressTasks}</p>
              <p className="text-xs text-yellow-600 mt-2">{analytics.todoTasks} to do</p>
            </div>
            <div className="bg-yellow-500 text-white p-3 rounded-lg">
              <Clock className="w-8 h-8" />
            </div>
          </div>
        </div>

        <div className="card bg-gradient-to-br from-red-50 to-red-100 border border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-600 font-medium">Overdue</p>
              <p className="text-3xl font-bold text-red-900 mt-1">{analytics.overdueTasks}</p>
              <p className="text-xs text-red-600 mt-2">Need attention</p>
            </div>
            <div className="bg-red-500 text-white p-3 rounded-lg">
              <AlertCircle className="w-8 h-8" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Productivity Trend */}
        <div className="lg:col-span-2">
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary-600" />
                Weekly Productivity
              </h2>
              <span className="text-sm text-gray-600">
                {analytics.completedThisWeek} tasks this week
              </span>
            </div>

            <div className="flex items-end justify-between gap-2 h-64">
              {analytics.productivityTrend.map((day, index) => {
                const height = (day.completed / maxCompleted) * 100;
                return (
                  <div key={index} className="flex-1 flex flex-col items-center gap-2">
                    <div className="flex-1 w-full flex items-end">
                      <div
                        className="w-full bg-gradient-to-t from-primary-500 to-primary-400 rounded-t-lg transition-all duration-500 hover:from-primary-600 hover:to-primary-500 cursor-pointer relative group"
                        style={{ height: `${height}%`, minHeight: day.completed > 0 ? '10%' : '0%' }}
                      >
                        <span className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs font-bold opacity-0 group-hover:opacity-100 transition">
                          {day.completed}
                        </span>
                      </div>
                    </div>
                    <span className="text-xs text-gray-600 font-medium">{day.date}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Priority Distribution */}
          <div className="card mt-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary-600" />
              Tasks by Priority
            </h2>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-medium text-red-700">High Priority</span>
                  <span className="text-gray-600">{analytics.highPriority} tasks</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-red-500 to-red-600 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${(analytics.highPriority / analytics.totalTasks) * 100}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-medium text-yellow-700">Medium Priority</span>
                  <span className="text-gray-600">{analytics.mediumPriority} tasks</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-yellow-500 to-yellow-600 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${(analytics.mediumPriority / analytics.totalTasks) * 100}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-medium text-green-700">Low Priority</span>
                  <span className="text-gray-600">{analytics.lowPriority} tasks</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${(analytics.lowPriority / analytics.totalTasks) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Pomodoro Timer */}
        <div className="lg:col-span-1">
          <PomodoroTimer />
        </div>
      </div>

      {/* Completion Rate Circle */}
      <div className="card">
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-primary-600" />
          Overall Progress
        </h2>

        <div className="flex items-center justify-around">
          <div className="relative w-48 h-48">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="96"
                cy="96"
                r="88"
                stroke="currentColor"
                strokeWidth="12"
                fill="none"
                className="text-gray-200"
              />
              <circle
                cx="96"
                cy="96"
                r="88"
                stroke="currentColor"
                strokeWidth="12"
                fill="none"
                strokeDasharray={`${2 * Math.PI * 88}`}
                strokeDashoffset={`${2 * Math.PI * 88 * (1 - analytics.completionRate / 100)}`}
                className="text-primary-600 transition-all duration-1000"
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-5xl font-bold text-gray-800">{analytics.completionRate}%</div>
              <div className="text-sm text-gray-600 mt-2">Complete</div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <span className="text-gray-700">Completed: <span className="font-bold">{analytics.completedTasks}</span></span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 bg-blue-500 rounded"></div>
              <span className="text-gray-700">In Progress: <span className="font-bold">{analytics.inProgressTasks}</span></span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 bg-gray-400 rounded"></div>
              <span className="text-gray-700">To Do: <span className="font-bold">{analytics.todoTasks}</span></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
