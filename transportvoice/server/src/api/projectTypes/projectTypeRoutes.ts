import express from 'express';
import projectTypeController from '../../controllers/ProjectTypeController';
import { authMiddleware } from '../../middleware/authMiddleware';
import { roleMiddleware } from '../../middleware/roleMiddleware';

const router = express.Router();

// Get all project types (accessible by all authenticated users)
router.get(
  '/',
  authMiddleware,
  projectTypeController.getAllProjectTypes
);

// Get a single project type by ID or slug (accessible by all authenticated users)
router.get(
  '/:idOrSlug',
  authMiddleware,
  projectTypeController.getProjectTypeByIdOrSlug
);

// Create a new project type (accessible by admins only)
router.post(
  '/',
  authMiddleware,
  roleMiddleware(['admin']),
  projectTypeController.createProjectType
);

// Update a project type (accessible by admins only)
router.put(
  '/:id',
  authMiddleware,
  roleMiddleware(['admin']),
  projectTypeController.updateProjectType
);

// Delete a project type (accessible by admins only)
router.delete(
  '/:id',
  authMiddleware,
  roleMiddleware(['admin']),
  projectTypeController.deleteProjectType
);

// Initialize default project types (accessible by admins only)
router.post(
  '/initialize',
  authMiddleware,
  roleMiddleware(['admin']),
  projectTypeController.initializeDefaultProjectTypes
);

// Get comment types for a specific project type (accessible by all authenticated users)
router.get(
  '/:idOrSlug/comment-types',
  authMiddleware,
  projectTypeController.getCommentTypesForProjectType
);

export default router; 