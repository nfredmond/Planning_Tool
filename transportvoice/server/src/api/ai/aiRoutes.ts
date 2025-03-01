import express from 'express';
import { body, param } from 'express-validator';
import { validateRequest } from '../../middleware/validateRequest';
import { requireAuth } from '../../middleware/requireAuth';
import { isAdmin } from '../../middleware/isAdmin';
import AIService from '../../services/ai/aiService';

const router = express.Router();

/**
 * @route   GET /api/ai/providers
 * @desc    Get all AI providers
 * @access  Admin
 */
router.get(
  '/providers',
  requireAuth,
  isAdmin,
  async (req, res, next) => {
    try {
      const providers = await AIService.getAllProviders();
      res.json(providers);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route   GET /api/ai/providers/frontend
 * @desc    Get AI providers available to frontend
 * @access  Public
 */
router.get(
  '/providers/frontend',
  async (req, res, next) => {
    try {
      const providers = await AIService.getFrontendVisibleProviders();
      res.json(providers);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route   GET /api/ai/providers/active
 * @desc    Get active AI provider for frontend
 * @access  Public
 */
router.get(
  '/providers/active',
  async (req, res, next) => {
    try {
      const provider = await AIService.getActiveFrontendProvider();
      res.json(provider);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route   GET /api/ai/providers/:id
 * @desc    Get an AI provider by ID
 * @access  Admin
 */
router.get(
  '/providers/:id',
  requireAuth,
  isAdmin,
  param('id').isMongoId().withMessage('Invalid provider ID'),
  validateRequest,
  async (req, res, next) => {
    try {
      const provider = await AIService.getProviderConfig(req.params.id);
      res.json(provider);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route   POST /api/ai/providers
 * @desc    Create a new AI provider
 * @access  Admin
 */
router.post(
  '/providers',
  requireAuth,
  isAdmin,
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('provider').isIn(['openai', 'anthropic', 'huggingface', 'custom']).withMessage('Invalid provider type'),
    body('apiKey').notEmpty().withMessage('API key is required'),
    body('model').notEmpty().withMessage('Model name is required'),
    body('baseUrl').optional().isURL().withMessage('Base URL must be a valid URL'),
    body('isVisibleToFrontend').optional().isBoolean().withMessage('isVisibleToFrontend must be a boolean'),
    body('isDefault').optional().isBoolean().withMessage('isDefault must be a boolean'),
  ],
  validateRequest,
  async (req, res, next) => {
    try {
      const newProvider = await AIService.createProvider(req.body);
      res.status(201).json(newProvider);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route   PUT /api/ai/providers/:id
 * @desc    Update an AI provider
 * @access  Admin
 */
router.put(
  '/providers/:id',
  requireAuth,
  isAdmin,
  [
    param('id').isMongoId().withMessage('Invalid provider ID'),
    body('name').optional().notEmpty().withMessage('Name cannot be empty'),
    body('provider').optional().isIn(['openai', 'anthropic', 'huggingface', 'custom']).withMessage('Invalid provider type'),
    body('model').optional().notEmpty().withMessage('Model name cannot be empty'),
    body('baseUrl').optional().isURL().withMessage('Base URL must be a valid URL'),
    body('isVisibleToFrontend').optional().isBoolean().withMessage('isVisibleToFrontend must be a boolean'),
    body('isDefault').optional().isBoolean().withMessage('isDefault must be a boolean'),
  ],
  validateRequest,
  async (req, res, next) => {
    try {
      const updatedProvider = await AIService.updateProvider(req.params.id, req.body);
      res.json(updatedProvider);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route   PATCH /api/ai/providers/:id/visibility
 * @desc    Update AI provider frontend visibility
 * @access  Admin
 */
router.patch(
  '/providers/:id/visibility',
  requireAuth,
  isAdmin,
  [
    param('id').isMongoId().withMessage('Invalid provider ID'),
    body('isVisible').isBoolean().withMessage('isVisible must be a boolean'),
  ],
  validateRequest,
  async (req, res, next) => {
    try {
      const { isVisible } = req.body;
      const provider = await AIService.updateFrontendVisibility(req.params.id, isVisible);
      res.json(provider);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route   PATCH /api/ai/providers/:id/default
 * @desc    Set AI provider as default
 * @access  Admin
 */
router.patch(
  '/providers/:id/default',
  requireAuth,
  isAdmin,
  param('id').isMongoId().withMessage('Invalid provider ID'),
  validateRequest,
  async (req, res, next) => {
    try {
      const provider = await AIService.setDefaultProvider(req.params.id);
      res.json(provider);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route   DELETE /api/ai/providers/:id
 * @desc    Delete an AI provider
 * @access  Admin
 */
router.delete(
  '/providers/:id',
  requireAuth,
  isAdmin,
  param('id').isMongoId().withMessage('Invalid provider ID'),
  validateRequest,
  async (req, res, next) => {
    try {
      await AIService.deleteProvider(req.params.id);
      res.status(204).end();
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route   POST /api/ai/providers/:id/test
 * @desc    Test an AI provider connection
 * @access  Admin
 */
router.post(
  '/providers/:id/test',
  requireAuth,
  isAdmin,
  param('id').isMongoId().withMessage('Invalid provider ID'),
  validateRequest,
  async (req, res, next) => {
    try {
      const result = await AIService.testProvider(req.params.id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route   POST /api/analytics/demographic-insights
 * @desc    Generate AI insights from demographic data
 * @access  Private
 */
router.post(
  '/demographic-insights',
  requireAuth,
  [
    body('projectId').notEmpty().withMessage('Project ID is required'),
    body('demographicData').isArray().withMessage('Demographic data must be an array')
  ],
  validateRequest,
  async (req, res, next) => {
    try {
      const { projectId, demographicData } = req.body;
      
      // Analyze demographic data using the LLM service
      const insights = await AIService.analyzeDemographics(
        demographicData,
        projectId
      );
      
      res.json(insights);
    } catch (error) {
      console.error('Error generating demographic insights:', error);
      next(error);
    }
  }
);

/**
 * @route   POST /api/analytics/climate-impact
 * @desc    Predict climate impact of a transportation project
 * @access  Private
 */
router.post(
  '/climate-impact',
  requireAuth,
  [
    body('projectId').notEmpty().withMessage('Project ID is required'),
    body('projectDetails').isObject().withMessage('Project details must be an object')
  ],
  validateRequest,
  async (req, res, next) => {
    try {
      const { projectId, projectDetails } = req.body;
      
      // Predict climate impact using the LLM service
      const impact = await AIService.predictClimateImpact(
        projectDetails,
        projectId
      );
      
      res.json(impact);
    } catch (error) {
      console.error('Error predicting climate impact:', error);
      next(error);
    }
  }
);

export default router; 