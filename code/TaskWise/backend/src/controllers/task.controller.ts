import { Response } from 'express';
import { body, validationResult } from 'express-validator';
import Task from '../models/Task.model';
import { AuthRequest } from '../middleware/auth.middleware';

// Validation rules for creating tasks
export const taskValidation = [
  body('title').trim().isLength({ min: 3, max: 200 }).withMessage('Title must be 3-200 characters'),
  body('description').optional().isLength({ max: 1000 }).withMessage('Description cannot exceed 1000 characters'),
  body('status').optional().isIn(['todo', 'in-progress', 'completed']).withMessage('Invalid status'),
  body('priority').optional().isIn(['low', 'medium', 'high']).withMessage('Invalid priority'),
  body('dueDate').optional().isISO8601().withMessage('Invalid date format')
];

// Validation rules for updating tasks (all fields optional)
export const taskUpdateValidation = [
  body('title').optional().trim().isLength({ min: 3, max: 200 }).withMessage('Title must be 3-200 characters'),
  body('description').optional().isLength({ max: 1000 }).withMessage('Description cannot exceed 1000 characters'),
  body('status').optional().isIn(['todo', 'in-progress', 'completed']).withMessage('Invalid status'),
  body('priority').optional().isIn(['low', 'medium', 'high']).withMessage('Invalid priority'),
  body('dueDate').optional().isISO8601().withMessage('Invalid date format')
];

// Get all tasks (with filters)
export const getTasks = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status, priority, project, assignedTo } = req.query;
    const filter: any = {};

    // Apply filters
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (project) filter.project = project;
    if (assignedTo) filter.assignedTo = assignedTo;

    // Get tasks created by or assigned to the user
    const tasks = await Task.find({
      $or: [
        { createdBy: req.userId },
        { assignedTo: req.userId }
      ],
      ...filter
    })
      .populate('assignedTo', 'name email avatar')
      .populate('createdBy', 'name email')
      .populate('project', 'name color')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: { tasks, count: tasks.length }
    });
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch tasks' });
  }
};

// Get single task
export const getTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignedTo', 'name email avatar')
      .populate('createdBy', 'name email')
      .populate('project', 'name color');

    if (!task) {
      res.status(404).json({ success: false, error: 'Task not found' });
      return;
    }

    // Check if user has access to this task
    if (
      task.createdBy._id.toString() !== req.userId &&
      task.assignedTo?._id.toString() !== req.userId
    ) {
      res.status(403).json({ success: false, error: 'Access denied' });
      return;
    }

    res.json({ success: true, data: { task } });
  } catch (error) {
    console.error('Get task error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch task' });
  }
};

// Create new task
export const createTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorMessages = errors.array().map(err => err.msg).join(', ');
      console.log('Task validation errors:', errors.array());
      res.status(400).json({ 
        success: false, 
        error: errorMessages,
        errors: errors.array() 
      });
      return;
    }

    console.log('Creating task with data:', req.body);

    const task = new Task({
      ...req.body,
      createdBy: req.userId
    });

    await task.save();
    await task.populate('assignedTo', 'name email avatar');
    await task.populate('createdBy', 'name email');
    await task.populate('project', 'name color');

    res.status(201).json({
      success: true,
      data: { task }
    });
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ success: false, error: 'Failed to create task' });
  }
};

// Update task
export const updateTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Update task validation errors:', errors.array());
      res.status(400).json({ success: false, errors: errors.array() });
      return;
    }

    console.log('Updating task:', req.params.id, 'with data:', req.body);

    const task = await Task.findById(req.params.id);

    if (!task) {
      res.status(404).json({ success: false, error: 'Task not found' });
      return;
    }

    // Only creator or assignee can update
    if (
      task.createdBy.toString() !== req.userId &&
      task.assignedTo?.toString() !== req.userId
    ) {
      res.status(403).json({ success: false, error: 'Access denied' });
      return;
    }

    Object.assign(task, req.body);
    await task.save();
    await task.populate('assignedTo', 'name email avatar');
    await task.populate('createdBy', 'name email');
    await task.populate('project', 'name color');

    console.log('Task updated successfully:', task._id);
    res.json({ success: true, data: { task } });
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ success: false, error: 'Failed to update task' });
  }
};

// Delete task
export const deleteTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      res.status(404).json({ success: false, error: 'Task not found' });
      return;
    }

    // Only creator can delete
    if (task.createdBy.toString() !== req.userId) {
      res.status(403).json({ success: false, error: 'Only task creator can delete' });
      return;
    }

    await task.deleteOne();

    res.json({ success: true, message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ success: false, error: 'Failed to delete task' });
  }
};

// Get dashboard stats
export const getDashboardStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const tasks = await Task.find({
      $or: [
        { createdBy: req.userId },
        { assignedTo: req.userId }
      ]
    });

    const stats = {
      total: tasks.length,
      todo: tasks.filter(t => t.status === 'todo').length,
      inProgress: tasks.filter(t => t.status === 'in-progress').length,
      completed: tasks.filter(t => t.status === 'completed').length,
      highPriority: tasks.filter(t => t.priority === 'high').length,
      overdue: tasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'completed').length
    };

    res.json({ success: true, data: { stats } });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch stats' });
  }
};
