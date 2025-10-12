import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  addMember,
  removeMember,
  projectValidation,
  projectUpdateValidation
} from '../controllers/project.controller';

const router = Router();

// All routes require authentication
router.use(authenticate);

// GET /api/projects - Get all projects
router.get('/', getProjects);

// GET /api/projects/:id - Get single project
router.get('/:id', getProject);

// POST /api/projects - Create new project
router.post('/', projectValidation, createProject);

// PUT /api/projects/:id - Update project
router.put('/:id', projectUpdateValidation, updateProject);

// DELETE /api/projects/:id - Delete project
router.delete('/:id', deleteProject);

// POST /api/projects/:id/members - Add member to project
router.post('/:id/members', addMember);

// DELETE /api/projects/:id/members/:memberId - Remove member from project
router.delete('/:id/members/:memberId', removeMember);

export default router;
