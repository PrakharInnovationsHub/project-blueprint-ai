import { useState, useEffect } from 'react';
import { X, Sparkles } from 'lucide-react';
import { taskService } from '../services/taskService';
import { projectService } from '../services/projectService';
import { Project } from '../types';
import toast from 'react-hot-toast';
import AIBreakdownModal from './AIBreakdownModal';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function TaskModal({ isOpen, onClose, onSuccess }: TaskModalProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [showAIBreakdown, setShowAIBreakdown] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'todo',
    priority: 'medium',
    dueDate: '',
    project: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchProjects();
    }
  }, [isOpen]);

  const fetchProjects = async () => {
    try {
      const data = await projectService.getProjects();
      setProjects(data.projects);
    } catch (error) {
      console.error('Failed to fetch projects');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const taskData: any = {
        title: formData.title,
        description: formData.description,
        status: formData.status,
        priority: formData.priority,
      };
      
      if (formData.project) {
        taskData.project = formData.project;
      }
      
      if (formData.dueDate) {
        taskData.dueDate = formData.dueDate;
      }
      
      await taskService.createTask(taskData);
      toast.success('Task created successfully!');
      onSuccess();
      handleClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create task');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      title: '',
      description: '',
      status: 'todo',
      priority: 'medium',
      dueDate: '',
      project: '',
    });
    setShowAIBreakdown(false);
    onClose();
  };

  const handleAIBreakdownApply = (subtasks: string[]) => {
    // Format subtasks as numbered list
    const formattedSubtasks = subtasks.map((task, index) => `${index + 1}. ${task}`).join('\n');
    
    // Add to description (append if there's already content)
    const newDescription = formData.description 
      ? `${formData.description}\n\n📋 AI Breakdown:\n${formattedSubtasks}`
      : `📋 AI Breakdown:\n${formattedSubtasks}`;
    
    setFormData({ ...formData, description: newDescription });
    setShowAIBreakdown(false);
    toast.success('AI breakdown added to description!');
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay animate-fade-in">
      <div className="modal-content animate-scale-in max-w-2xl">
        {/* Enhanced Header with Gradient */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6 rounded-t-2xl">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-white">Create New Task</h2>
              <p className="text-purple-100 text-sm mt-1">Add a new task to your workflow</p>
            </div>
            <button 
              onClick={handleClose} 
              className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-all"
              aria-label="Close modal"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Title Field */}
          <div className="form-group">
            <label className="form-label flex items-center gap-2">
              <span>Title</span>
              <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              className="input focus-visible-ring"
              placeholder="Enter a clear, descriptive title..."
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
            <p className="form-helper">Be specific about what needs to be done</p>
          </div>

          {/* Description Field with AI Button */}
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              className="input focus-visible-ring"
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Add more details about this task..."
            />
            
            {/* Enhanced AI Breakdown Button */}
            <div className="mt-3 flex items-center justify-between p-3 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200">
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <Sparkles className="w-4 h-4 text-purple-600" />
                <span>Let AI break down complex tasks into steps</span>
              </div>
              <button
                type="button"
                onClick={() => setShowAIBreakdown(true)}
                disabled={!formData.title}
                className="btn btn-sm bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {formData.title ? 'AI Breakdown' : 'Add title first'}
              </button>
            </div>
          </div>

          {/* Status and Priority Row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="form-group">
              <label className="form-label">Status</label>
              <select
                className="input focus-visible-ring"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="todo">To Do</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Priority</label>
              <select
                className="input focus-visible-ring"
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              >
                <option value="low">🟢 Low Priority</option>
                <option value="medium">🟡 Medium Priority</option>
                <option value="high">🔴 High Priority</option>
              </select>
              <p className="form-helper text-xs mt-1">Choose based on urgency and importance</p>
            </div>
          </div>

          {/* Due Date and Project Row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="form-group">
              <label className="form-label">Due Date</label>
              <input
                type="date"
                className="input focus-visible-ring"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Project</label>
              <select
                className="input focus-visible-ring"
                value={formData.project}
                onChange={(e) => setFormData({ ...formData, project: e.target.value })}
              >
                <option value="">📁 No Project</option>
                {projects.map((project) => (
                  <option key={project._id} value={project._id}>
                    📁 {project.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              className="btn btn-secondary flex-1"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary flex-1"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <div className="spinner w-4 h-4"></div>
                  Creating...
                </span>
              ) : (
                'Create Task'
              )}
            </button>
          </div>
        </form>
      </div>

      {/* AI Breakdown Modal */}
      <AIBreakdownModal
        isOpen={showAIBreakdown}
        onClose={() => setShowAIBreakdown(false)}
        onApply={handleAIBreakdownApply}
        taskTitle={formData.title}
        taskDescription={formData.description}
      />
    </div>
  );
}
