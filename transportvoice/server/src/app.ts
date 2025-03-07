import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import csurf from 'csurf';
import { errorHandler } from './middleware/errorHandler';
import routes from './api/routes';
import aiRoutes from './api/ai/aiRoutes';
import { connectDB } from './config/database';

// Load environment variables
dotenv.config();

// Initialize Express app
const app: Application = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB Atlas
connectDB();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(helmet());
app.use(morgan('dev'));
app.use(cookieParser());
app.use(compression());

// CSRF protection - must be after cookie-parser
const csrfProtection = csurf({ 
  cookie: { 
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  } 
});

// Apply CSRF protection to all routes except those that need to be exempt
app.use((req: Request, res: Response, next: NextFunction) => {
  // Exclude CSRF for specific routes
  const excludedPaths = ['/api/auth/login', '/api/auth/register'];
  if (excludedPaths.includes(req.path)) {
    return next();
  }
  return csrfProtection(req, res, next);
});

// CSRF token endpoint
app.get('/api/csrf-token', csrfProtection, (req: Request, res: Response) => {
  res.json({ csrfToken: req.csrfToken() });
});

// Routes
app.use('/api', routes);
app.use('/api/ai', aiRoutes);
// Analytics routes - using the same AI routes for analytics endpoints
app.use('/api/analytics', aiRoutes);

// Default route
app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'Welcome to TransportVoice API' });
});

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ message: 'Route not found' });
});

// Start server
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

export default app; 