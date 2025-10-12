import { Response } from 'express';
import { body, validationResult } from 'express-validator';
import Project from '../models/Project.model';
import Task from '../models/Task.model';
import User from '../models/User.model';
import { AuthRequest } from '../middleware/auth.middleware';

// Validation rules for creating projects
export const projectValidation = [
  body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 characters'),
  body('description').optional().isLength({ max: 500 }).withMessage('Description cannot exceed 500 characters'),
  body('color').optional().matches(/^#[0-9A-F]{6}$/i).withMessage('Invalid color format')
];

// Validation rules for updating projects (all fields optional)
export const projectUpdateValidation = [
  body('name').optional().trim().isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 characters'),
  body('description').optional().isLength({ max: 500 }).withMessage('Description cannot exceed 500 characters'),
  body('color').optional().matches(/^#[0-9A-F]{6}$/i).withMessage('Invalid color format')
];

// Get all projects
export const getProjects = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const projects = await Project.find({
      $or: [
        { owner: req.userId },
        { members: req.userId }
      ]
    })
      .populate('owner', 'name email')
      .populate('members', 'name email avatar')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: { projects, count: projects.length }
    });
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch projects' });
  }
};

// Get single project
export const getProject = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('owner', 'name email')
      .populate('members', 'name email avatar');

    if (!project) {
      res.status(404).json({ success: false, error: 'Project not found' });
      return;
    }

    // Check if user has access
    const hasAccess = 
      project.owner._id.toString() === req.userId ||
      project.members.some(m => m._id.toString() === req.userId);

    if (!hasAccess) {
      res.status(403).json({ success: false, error: 'Access denied' });
      return;
    }

    // Get project tasks
    const tasks = await Task.find({ project: project._id })
      .populate('assignedTo', 'name email avatar')
      .sort({ createdAt: -1 });

    res.json({ 
      success: true, 
      data: { project, tasks } 
    });
  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch project' });
  }
};

// Create new project
export const createProject = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorMessages = errors.array().map(err => err.msg).join(', ');
      console.log('Project validation errors:', errors.array());
      res.status(400).json({ 
        success: false, 
        error: errorMessages,
        errors: errors.array() 
      });
      return;
    }

    console.log('Creating project with data:', req.body);

    const project = new Project({
      ...req.body,
      owner: req.userId,
      members: [req.userId]
    });

    await project.save();
    await project.populate('owner', 'name email');
    await project.populate('members', 'name email avatar');

    res.status(201).json({
      success: true,
      data: { project }
    });
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({ success: false, error: 'Failed to create project' });
  }
};

// Update project
export const updateProject = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ success: false, errors: errors.array() });
      return;
    }

    const project = await Project.findById(req.params.id);

    if (!project) {
      res.status(404).json({ success: false, error: 'Project not found' });
      return;
    }

    // Only owner can update
    if (project.owner.toString() !== req.userId) {
      res.status(403).json({ success: false, error: 'Only project owner can update' });
      return;
    }

    Object.assign(project, req.body);
    await project.save();
    await project.populate('owner', 'name email');
    await project.populate('members', 'name email avatar');

    res.json({ success: true, data: { project } });
  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({ success: false, error: 'Failed to update project' });
  }
};

// Delete project
export const deleteProject = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      res.status(404).json({ success: false, error: 'Project not found' });
      return;
    }

    // Only owner can delete
    if (project.owner.toString() !== req.userId) {
      res.status(403).json({ success: false, error: 'Only project owner can delete' });
      return;
    }

    // Delete all associated tasks
    await Task.deleteMany({ project: project._id });
    await project.deleteOne();

    res.json({ success: true, message: 'Project and associated tasks deleted successfully' });
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({ success: false, error: 'Failed to delete project' });
  }
};

// Add member to project
export const addMember = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { memberId } = req.body;

    if (!memberId) {
      res.status(400).json({ success: false, error: 'Member email or ID is required' });
      return;
    }

    // Check if memberId is an email or an ObjectId
    let userId: string;
    
    // If it looks like an email, find the user by email
    if (memberId.includes('@')) {
      const user = await User.findOne({ email: memberId });
      if (!user) {
        res.status(404).json({ success: false, error: 'User not found with that email' });
        return;
      }
      userId = (user._id as any).toString();
    } else {
      // Verify the user exists
      const user = await User.findById(memberId);
      if (!user) {
        res.status(404).json({ success: false, error: 'User not found' });
        return;
      }
      userId = memberId;
    }

    const project = await Project.findById(req.params.id);

    if (!project) {
      res.status(404).json({ success: false, error: 'Project not found' });
      return;
    }

    // Only owner can add members
    if (project.owner.toString() !== req.userId) {
      res.status(403).json({ success: false, error: 'Only project owner can add members' });
      return;
    }

    // Check if already a member
    if (project.members.some(m => m.toString() === userId)) {
      res.status(400).json({ success: false, error: 'User is already a member' });
      return;
    }

    project.members.push(userId as any);
    await project.save();
    await project.populate('members', 'name email avatar');

    res.json({ success: true, data: { project } });
  } catch (error) {
    console.error('Add member error:', error);
    res.status(500).json({ success: false, error: 'Failed to add member' });
  }
};

// Remove member from project
export const removeMember = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { memberId } = req.params;

    const project = await Project.findById(req.params.id);

    if (!project) {
      res.status(404).json({ success: false, error: 'Project not found' });
      return;
    }

    // Only owner can remove members
    if (project.owner.toString() !== req.userId) {
      res.status(403).json({ success: false, error: 'Only project owner can remove members' });
      return;
    }

    // Cannot remove owner
    if (memberId === project.owner.toString()) {
      res.status(400).json({ success: false, error: 'Cannot remove project owner' });
      return;
    }

    project.members = project.members.filter(m => m.toString() !== memberId);
    await project.save();
    await project.populate('members', 'name email avatar');

    res.json({ success: true, data: { project } });
  } catch (error) {
    console.error('Remove member error:', error);
    res.status(500).json({ success: false, error: 'Failed to remove member' });
  }
};
