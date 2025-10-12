import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  getDashboardStats,
  taskValidation,
  taskUpdateValidation
} from '../controllers/task.controller';

const router = Router();

// All routes require authentication
router.use(authenticate);

// GET /api/tasks/stats - Get dashboard statistics
router.get('/stats', getDashboardStats);

// GET /api/tasks - Get all tasks (with optional filters)
router.get('/', getTasks);

// GET /api/tasks/:id - Get single task
router.get('/:id', getTask);

// POST /api/tasks - Create new task
router.post('/', taskValidation, createTask);

// PUT /api/tasks/:id - Update task
router.put('/:id', taskUpdateValidation, updateTask);

// DELETE /api/tasks/:id - Delete task
router.delete('/:id', deleteTask);

export default router;
