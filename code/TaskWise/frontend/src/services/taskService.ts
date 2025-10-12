import api from '../lib/axios';
import { Task, TaskStats, ApiResponse } from '../types';

export const taskService = {
  // Get all tasks with optional filters
  getTasks: async (filters?: {
    status?: string;
    priority?: string;
    project?: string;
    assignedTo?: string;
  }) => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
    }
    const { data } = await api.get<ApiResponse<{ tasks: Task[]; count: number }>>(
      `/tasks?${params.toString()}`
    );
    return data.data!;
  },

  // Get single task
  getTask: async (id: string) => {
    const { data } = await api.get<ApiResponse<{ task: Task }>>(`/tasks/${id}`);
    return data.data!.task;
  },

  // Create new task
  createTask: async (taskData: Partial<Task>) => {
    const { data } = await api.post<ApiResponse<{ task: Task }>>('/tasks', taskData);
    return data.data!.task;
  },

  // Update task
  updateTask: async (id: string, taskData: Partial<Task>) => {
    const { data } = await api.put<ApiResponse<{ task: Task }>>(`/tasks/${id}`, taskData);
    return data.data!.task;
  },

  // Delete task
  deleteTask: async (id: string) => {
    const { data } = await api.delete<ApiResponse<{ message: string }>>(`/tasks/${id}`);
    return data;
  },

  // Get dashboard stats
  getStats: async () => {
    const { data } = await api.get<ApiResponse<{ stats: TaskStats }>>('/tasks/stats');
    return data.data!.stats;
  }
};
