import express from 'express';
import commentTypeController from '../../controllers/CommentTypeController';
import { authMiddleware } from '../../middleware/authMiddleware';
import { roleMiddleware } from '../../middleware/roleMiddleware';

const router = express.Router();

// Get all comment types (accessible by all authenticated users)
router.get(
  '/',
  authMiddleware,
  commentTypeController.getAllCommentTypes
);

// Get a single comment type by ID (accessible by all authenticated users)
router.get(
  '/:id',
  authMiddleware,
  commentTypeController.getCommentTypeById
);

// Create a new comment type (accessible by admins and moderators)
router.post(
  '/',
  authMiddleware,
  roleMiddleware(['admin', 'moderator']),
  commentTypeController.createCommentType
);

// Update a comment type (accessible by admins and moderators)
router.put(
  '/:id',
  authMiddleware,
  roleMiddleware(['admin', 'moderator']),
  commentTypeController.updateCommentType
);

// Delete a comment type (accessible by admins only)
router.delete(
  '/:id',
  authMiddleware,
  roleMiddleware(['admin']),
  commentTypeController.deleteCommentType
);

// Generate an icon for a comment type using AI (accessible by admins and moderators)
router.post(
  '/generate-icon',
  authMiddleware,
  roleMiddleware(['admin', 'moderator']),
  commentTypeController.generateIcon
);

// Apply a generated icon to a comment type (accessible by admins and moderators)
router.post(
  '/:id/apply-icon',
  authMiddleware,
  roleMiddleware(['admin', 'moderator']),
  commentTypeController.applyGeneratedIcon
);

export default router; 