import express from 'express';
import * as adminController from './admin.controller';
import { isAdmin } from '../../middleware/auth';

const router = express.Router();

// Project management
router.post('/projects', isAdmin, adminController.createProject);
router.get('/projects', isAdmin, adminController.getAllProjects);
router.get('/projects/:id', isAdmin, adminController.getProjectById);
router.put('/projects/:id', isAdmin, adminController.updateProject);
router.delete('/projects/:id', isAdmin, adminController.deleteProject);

// User management
router.post('/users', isAdmin, adminController.createUser);
router.get('/users', isAdmin, adminController.getAllUsers);
router.get('/users/:id', isAdmin, adminController.getUserById);
router.put('/users/:id', isAdmin, adminController.updateUser);
router.delete('/users/:id', isAdmin, adminController.deleteUser);

// Comment management
router.get('/comments', isAdmin, adminController.getAllComments);
router.get('/comments/:id', isAdmin, adminController.getCommentById);
router.put('/comments/:id', isAdmin, adminController.updateComment);
router.delete('/comments/:id', isAdmin, adminController.deleteComment);
router.post('/comments/moderate/ai', isAdmin, adminController.moderateCommentWithAI);

// Map management
router.get('/maps', isAdmin, adminController.getAllMaps);
router.post('/maps', isAdmin, adminController.createMap);
router.get('/maps/:id', isAdmin, adminController.getMapById);
router.put('/maps/:id', isAdmin, adminController.updateMap);
router.delete('/maps/:id', isAdmin, adminController.deleteMap);

// Reports
router.get('/reports', isAdmin, adminController.getAllReports);
router.post('/reports', isAdmin, adminController.createReport);
router.get('/reports/:id', isAdmin, adminController.getReportById);
router.put('/reports/:id', isAdmin, adminController.updateReport);
router.delete('/reports/:id', isAdmin, adminController.deleteReport);
router.post('/reports/:id/export/:format', isAdmin, adminController.exportReport);
router.post('/reports/export-polygon/:format', isAdmin, adminController.exportReportByPolygon);

export default router; 