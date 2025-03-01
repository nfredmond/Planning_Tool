// server/src/api/auth/auth.routes.ts
import express from 'express';
import * as authController from './auth.controller';
import { validateRequest } from '../../middleware/validation';
import { loginSchema, registerSchema, resetPasswordSchema } from './auth.validation';

const router = express.Router();

/**
 * @route POST /api/auth/register
 * @desc Register a new user
 * @access Public
 */
router.post('/register', validateRequest(registerSchema), authController.register);

/**
 * @route POST /api/auth/login
 * @desc Log in a user
 * @access Public
 */
router.post('/login', validateRequest(loginSchema), authController.login);

/**
 * @route POST /api/auth/logout
 * @desc Log out a user
 * @access Private
 */
router.post('/logout', authController.logout);

/**
 * @route GET /api/auth/verify/:token
 * @desc Verify user email
 * @access Public
 */
router.get('/verify/:token', authController.verifyEmail);

/**
 * @route POST /api/auth/forgot-password
 * @desc Request password reset
 * @access Public
 */
router.post('/forgot-password', authController.forgotPassword);

/**
 * @route POST /api/auth/reset-password/:token
 * @desc Reset password
 * @access Public
 */
router.post('/reset-password/:token', validateRequest(resetPasswordSchema), authController.resetPassword);

/**
 * @route GET /api/auth/me
 * @desc Get current user profile
 * @access Private
 */
router.get('/me', authController.getCurrentUser);

export default router;

// server/src/api/auth/auth.controller.ts
import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../../models/User';
import { sendEmail } from '../../services/email.service';
import { AppError } from '../../utils/errors';
import config from '../../config';

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, firstName, lastName, organization } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');

    // Create new user
    const user = new User({
      email,
      password,
      firstName,
      lastName,
      organization,
      verificationToken
    });

    await user.save();

    // Send verification email
    const verificationUrl = `${config.clientUrl}/verify-email/${verificationToken}`;
    await sendEmail({
      to: email,
      subject: 'Verify Your Email',
      text: `Please verify your email by clicking this link: ${verificationUrl}`,
      html: `<p>Please verify your email by clicking this link: <a href="${verificationUrl}">${verificationUrl}</a></p>`
    });

    // Return user without sensitive information
    const userResponse = {
      id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      organization: user.organization,
      role: user.role,
      verified: user.verified
    };

    return res.status(201).json({
      message: 'User registered successfully. Please check your email to verify your account.',
      user: userResponse
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ message: 'Server error during registration' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check if email is verified
    if (!user.verified) {
      return res.status(401).json({ message: 'Please verify your email before logging in' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      config.jwtSecret,
      { expiresIn: config.jwtExpiration }
    );

    // Set token in HTTP-only cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000 // 1 day
    });

    // Return user info
    const userResponse = {
      id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      organization: user.organization,
      role: user.role
    };

    return res.status(200).json({
      message: 'Login successful',
      user: userResponse
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Server error during login' });
  }
};

export const logout = (req: Request, res: Response) => {
  res.clearCookie('token');
  return res.status(200).json({ message: 'Logged out successfully' });
};

export const verifyEmail = async (req: Request, res: Response) => {
  try {
    const { token } = req.params;

    const user = await User.findOne({ verificationToken: token });
    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired verification token' });
    }

    user.verified = true;
    user.verificationToken = undefined;
    await user.save();

    return res.status(200).json({ message: 'Email verified successfully. You can now log in.' });
  } catch (error) {
    console.error('Email verification error:', error);
    return res.status(500).json({ message: 'Server error during email verification' });
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      // For security reasons, don't reveal that email doesn't exist
      return res.status(200).json({ message: 'If an account with that email exists, a password reset link has been sent.' });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hour
    await user.save();

    // Send reset email
    const resetUrl = `${config.clientUrl}/reset-password/${resetToken}`;
    await sendEmail({
      to: email,
      subject: 'Reset Your Password',
      text: `You requested a password reset. Click this link to reset your password: ${resetUrl} (expires in 1 hour)`,
      html: `<p>You requested a password reset. Click this link to reset your password: <a href="${resetUrl}">${resetUrl}</a> (expires in 1 hour)</p>`
    });

    return res.status(200).json({ message: 'If an account with that email exists, a password reset link has been sent.' });
  } catch (error) {
    console.error('Forgot password error:', error);
    return res.status(500).json({ message: 'Server error during password reset request' });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    // Update password and clear reset token
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    return res.status(200).json({ message: 'Password has been reset successfully. You can now log in.' });
  } catch (error) {
    console.error('Reset password error:', error);
    return res.status(500).json({ message: 'Server error during password reset' });
  }
};

export const getCurrentUser = async (req: Request, res: Response) => {
  try {
    // @ts-ignore - added by auth middleware
    const userId = req.user.id;

    const user = await User.findById(userId).select('-password -verificationToken -resetPasswordToken -resetPasswordExpires');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json({ user });
  } catch (error) {
    console.error('Get current user error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// server/src/api/projects/projects.routes.ts
import express from 'express';
import * as projectsController from './projects.controller';
import { authenticate, authorize } from '../../middleware/auth';
import { validateRequest } from '../../middleware/validation';
import { createProjectSchema, updateProjectSchema } from './projects.validation';

const router = express.Router();

/**
 * @route GET /api/projects
 * @desc Get all projects (paginated)
 * @access Public/Private (filtered by visibility)
 */
router.get('/', projectsController.getProjects);

/**
 * @route GET /api/projects/:id
 * @desc Get a single project by ID
 * @access Public/Private (based on project visibility)
 */
router.get('/:id', projectsController.getProjectById);

/**
 * @route GET /api/projects/slug/:slug
 * @desc Get a single project by slug
 * @access Public/Private (based on project visibility)
 */
router.get('/slug/:slug', projectsController.getProjectBySlug);

/**
 * @route POST /api/projects
 * @desc Create a new project
 * @access Private (admin, moderator)
 */
router.post(
  '/',
  authenticate,
  authorize(['admin', 'moderator']),
  validateRequest(createProjectSchema),
  projectsController.createProject
);

/**
 * @route PUT /api/projects/:id
 * @desc Update a project
 * @access Private (admin, moderator, project owner)
 */
router.put(
  '/:id',
  authenticate,
  validateRequest(updateProjectSchema),
  projectsController.updateProject
);

/**
 * @route DELETE /api/projects/:id
 * @desc Delete a project
 * @access Private (admin, project owner)
 */
router.delete(
  '/:id',
  authenticate,
  projectsController.deleteProject
);

/**
 * @route POST /api/projects/:id/layers
 * @desc Add a layer to a project
 * @access Private (admin, moderator, project owner)
 */
router.post(
  '/:id/layers',
  authenticate,
  projectsController.addLayerToProject
);

/**
 * @route DELETE /api/projects/:id/layers/:layerId
 * @desc Remove a layer from a project
 * @access Private (admin, moderator, project owner)
 */
router.delete(
  '/:id/layers/:layerId',
  authenticate,
  projectsController.removeLayerFromProject
);

export default router;

// server/src/api/comments/comments.routes.ts
import express from 'express';
import * as commentsController from './comments.controller';
import { authenticate, authorize, optionalAuth } from '../../middleware/auth';
import { validateRequest } from '../../middleware/validation';
import { createCommentSchema, updateCommentSchema } from './comments.validation';
import multer from 'multer';

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/images/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + '.' + file.originalname.split('.').pop());
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Not an image! Please upload only images.') as any);
    }
  }
});

const router = express.Router();

/**
 * @route GET /api/comments
 * @desc Get all comments (paginated, with filters)
 * @access Public/Private (filtered by visibility)
 */
router.get('/', commentsController.getComments);

/**
 * @route GET /api/comments/project/:projectId
 * @desc Get all comments for a project
 * @access Public/Private (based on project visibility)
 */
router.get('/project/:projectId', commentsController.getCommentsByProject);

/**
 * @route GET /api/comments/:id
 * @desc Get a single comment by ID
 * @access Public/Private (based on comment visibility)
 */
router.get('/:id', commentsController.getCommentById);

/**
 * @route POST /api/comments
 * @desc Create a new comment
 * @access Private/Public (based on project settings)
 */
router.post(
  '/',
  optionalAuth,
  upload.array('images', 5),
  validateRequest(createCommentSchema),
  commentsController.createComment
);

/**
 * @route PUT /api/comments/:id
 * @desc Update a comment
 * @access Private (admin, moderator, comment owner)
 */
router.put(
  '/:id',
  authenticate,
  validateRequest(updateCommentSchema),
  commentsController.updateComment
);

/**
 * @route DELETE /api/comments/:id
 * @desc Delete a comment
 * @access Private (admin, moderator, comment owner)
 */
router.delete(
  '/:id',
  authenticate,
  commentsController.deleteComment
);

/**
 * @route POST /api/comments/:id/vote
 * @desc Vote on a comment
 * @access Private
 */
router.post(
  '/:id/vote',
  authenticate,
  commentsController.voteOnComment
);

/**
 * @route POST /api/comments/:id/moderate
 * @desc Moderate a comment
 * @access Private (admin, moderator)
 */
router.post(
  '/:id/moderate',
  authenticate,
  authorize(['admin', 'moderator']),
  commentsController.moderateComment
);

/**
 * @route POST /api/comments/:id/ai-moderate
 * @desc AI moderate a comment
 * @access Private (admin, moderator)
 */
router.post(
  '/:id/ai-moderate',
  authenticate,
  authorize(['admin', 'moderator']),
  commentsController.aiModerateComment
);

export default router;

// server/src/api/ai/ai.routes.ts
import express from 'express';
import * as aiController from './ai.controller';
import { authenticate, authorize } from '../../middleware/auth';
import { validateRequest } from '../../middleware/validation';
import { createAIProviderSchema, updateAIProviderSchema } from './ai.validation';

const router = express.Router();

/**
 * @route GET /api/ai/providers
 * @desc Get all AI providers for the current user
 * @access Private (admin)
 */
router.get(
  '/providers',
  authenticate,
  authorize(['admin']),
  aiController.getAIProviders
);

/**
 * @route GET /api/ai/providers/:id
 * @desc Get a single AI provider by ID
 * @access Private (admin)
 */
router.get(
  '/providers/:id',
  authenticate,
  authorize(['admin']),
  aiController.getAIProviderById
);

/**
 * @route POST /api/ai/providers
 * @desc Create a new AI provider
 * @access Private (admin)
 */
router.post(
  '/providers',
  authenticate,
  authorize(['admin']),
  validateRequest(createAIProviderSchema),
  aiController.createAIProvider
);

/**
 * @route PUT /api/ai/providers/:id
 * @desc Update an AI provider
 * @access Private (admin)
 */
router.put(
  '/providers/:id',
  authenticate,
  authorize(['admin']),
  validateRequest(updateAIProviderSchema),
  aiController.updateAIProvider
);

/**
 * @route DELETE /api/ai/providers/:id
 * @desc Delete an AI provider
 * @access Private (admin)
 */
router.delete(
  '/providers/:id',
  authenticate,
  authorize(['admin']),
  aiController.deleteAIProvider
);

/**
 * @route POST /api/ai/moderate
 * @desc Moderate text with AI
 * @access Private (admin, moderator)
 */
router.post(
  '/moderate',
  authenticate,
  authorize(['admin', 'moderator']),
  aiController.moderateText
);

/**
 * @route POST /api/ai/analyze-sentiment
 * @desc Analyze sentiment of text with AI
 * @access Private (admin, moderator)
 */
router.post(
  '/analyze-sentiment',
  authenticate,
  authorize(['admin', 'moderator']),
  aiController.analyzeSentiment
);

/**
 * @route POST /api/ai/summarize
 * @desc Summarize comments with AI
 * @access Private (admin, moderator)
 */
router.post(
  '/summarize',
  authenticate,
  authorize(['admin', 'moderator']),
  aiController.summarizeComments
);

/**
 * @route POST /api/ai/translate
 * @desc Translate text with AI
 * @access Private (authenticated)
 */
router.post(
  '/translate',
  authenticate,
  aiController.translateText
);

export default router;

// server/src/api/reports/reports.routes.ts
import express from 'express';
import * as reportsController from './reports.controller';
import { authenticate, authorize } from '../../middleware/auth';
import { validateRequest } from '../../middleware/validation';
import { createReportSchema, updateReportSchema } from './reports.validation';

const router = express.Router();

/**
 * @route GET /api/reports
 * @desc Get all reports for the current user
 * @access Private (admin, moderator)
 */
router.get(
  '/',
  authenticate,
  authorize(['admin', 'moderator']),
  reportsController.getReports
);

/**
 * @route GET /api/reports/:id
 * @desc Get a single report by ID
 * @access Private (admin, moderator, report owner)
 */
router.get(
  '/:id',
  authenticate,
  reportsController.getReportById
);

/**
 * @route POST /api/reports
 * @desc Create a new report
 * @access Private (admin, moderator)
 */
router.post(
  '/',
  authenticate,
  authorize(['admin', 'moderator']),
  validateRequest(createReportSchema),
  reportsController.createReport
);

/**
 * @route PUT /api/reports/:id
 * @desc Update a report
 * @access Private (admin, moderator, report owner)
 */
router.put(
  '/:id',
  authenticate,
  validateRequest(updateReportSchema),
  reportsController.updateReport
);

/**
 * @route DELETE /api/reports/:id
 * @desc Delete a report
 * @access Private (admin, report owner)
 */
router.delete(
  '/:id',
  authenticate,
  reportsController.deleteReport
);

/**
 * @route POST /api/reports/:id/generate
 * @desc Generate a report
 * @access Private (admin, moderator, report owner)
 */
router.post(
  '/:id/generate',
  authenticate,
  reportsController.generateReport
);

/**
 * @route GET /api/reports/:id/download
 * @desc Download a generated report
 * @access Private (admin, moderator, report owner)
 */
router.get(
  '/:id/download',
  authenticate,
  reportsController.downloadReport
);

/**
 * @route POST /api/reports/:id/schedule
 * @desc Schedule a report
 * @access Private (admin, moderator, report owner)
 */
router.post(
  '/:id/schedule',
  authenticate,
  reportsController.scheduleReport
);

export default router;

// server/src/app.ts
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';
import helmet from 'helmet';
import compression from 'compression';
import path from 'path';
import config from './config';
import { errorHandler } from './middleware/errorHandler';

// Import routes
import authRoutes from './api/auth/auth.routes';
import projectsRoutes from './api/projects/projects.routes';
import commentsRoutes from './api/comments/comments.routes';
import aiRoutes from './api/ai/ai.routes';
import reportsRoutes from './api/reports/reports.routes';
import usersRoutes from './api/users/users.routes';
import layersRoutes from './api/layers/layers.routes';

// Create Express app
const app = express();

// Connect to MongoDB
mongoose.connect(config.mongoUri)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Middleware
app.use(helmet());
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors({
  origin: config.clientUrl,
  credentials: true
}));

// Static files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectsRoutes);
app.use('/api/comments', commentsRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/layers', layersRoutes);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Error handling middleware
app.use(errorHandler);

// Start server
const PORT = config.port || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
