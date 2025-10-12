import api from '../lib/axios';
import { Project, Task, ApiResponse } from '../types';

export const projectService = {
  // Get all projects
  getProjects: async () => {
    const { data } = await api.get<ApiResponse<{ projects: Project[]; count: number }>>('/projects');
    return data.data!;
  },

  // Get single project
  getProject: async (id: string) => {
    const { data } = await api.get<ApiResponse<{ project: Project; tasks: Task[] }>>(`/projects/${id}`);
    return data.data!;
  },

  // Create new project
  createProject: async (projectData: Partial<Project>) => {
    const { data } = await api.post<ApiResponse<{ project: Project }>>('/projects', projectData);
    return data.data!.project;
  },

  // Update project
  updateProject: async (id: string, projectData: Partial<Project>) => {
    const { data } = await api.put<ApiResponse<{ project: Project }>>(`/projects/${id}`, projectData);
    return data.data!.project;
  },

  // Delete project
  deleteProject: async (id: string) => {
    const { data } = await api.delete<ApiResponse<{ message: string }>>(`/projects/${id}`);
    return data;
  },

  // Add member to project
  addMember: async (projectId: string, memberId: string) => {
    const { data } = await api.post<ApiResponse<{ project: Project }>>(
      `/projects/${projectId}/members`,
      { memberId }
    );
    return data.data!.project;
  },

  // Remove member from project
  removeMember: async (projectId: string, memberId: string) => {
    const { data } = await api.delete<ApiResponse<{ project: Project }>>(
      `/projects/${projectId}/members/${memberId}`
    );
    return data.data!.project;
  }
};
