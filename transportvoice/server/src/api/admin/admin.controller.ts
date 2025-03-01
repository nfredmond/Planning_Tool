import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Project from '../../models/Project';
import User from '../../models/User';
import Comment from '../../models/Comment';
import Map from '../../models/Map';
import Report from '../../models/Report';
import { generatePDF, generateExcel, generateKMZ } from '../../services/export.service';
import { moderateCommentWithAI as aiModeration } from '../../services/ai/moderation.service';

// Project controllers
export const createProject = async (req: Request, res: Response) => {
  try {
    const project = new Project(req.body);
    await project.save();
    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ message: 'Error creating project', error });
  }
};

export const getAllProjects = async (req: Request, res: Response) => {
  try {
    const projects = await Project.find();
    res.status(200).json(projects);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching projects', error });
  }
};

export const getProjectById = async (req: Request, res: Response) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    res.status(200).json(project);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching project', error });
  }
};

export const updateProject = async (req: Request, res: Response) => {
  try {
    const project = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    res.status(200).json(project);
  } catch (error) {
    res.status(500).json({ message: 'Error updating project', error });
  }
};

export const deleteProject = async (req: Request, res: Response) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    res.status(200).json({ message: 'Project deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting project', error });
  }
};

// User controllers
export const createUser = async (req: Request, res: Response) => {
  try {
    const { email, password, firstName, lastName, role, organization } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }
    
    // Create new user
    const user = new User({
      email,
      password,
      firstName,
      lastName,
      role: role || 'user',
      organization,
      verified: true // Admin-created users are auto-verified
    });
    
    await user.save();
    
    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;
    
    res.status(201).json(userResponse);
  } catch (error) {
    res.status(500).json({ message: 'Error creating user', error });
  }
};

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.find().select('-password');
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users', error });
  }
};

export const getUserById = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user', error });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    // Don't allow password updates through this endpoint
    if (req.body.password) {
      delete req.body.password;
    }
    
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true }).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error updating user', error });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting user', error });
  }
};

// Comment controllers
export const getAllComments = async (req: Request, res: Response) => {
  try {
    const { projectId, status, page = 1, limit = 20 } = req.query;
    
    const query: any = {};
    if (projectId) query.project = projectId;
    if (status) query.status = status;
    
    const skip = (Number(page) - 1) * Number(limit);
    
    const comments = await Comment.find(query)
      .populate('user', 'firstName lastName email')
      .populate('project', 'name')
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 });
      
    const total = await Comment.countDocuments(query);
    
    res.status(200).json({
      comments,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching comments', error });
  }
};

export const getCommentById = async (req: Request, res: Response) => {
  try {
    const comment = await Comment.findById(req.params.id)
      .populate('user', 'firstName lastName email')
      .populate('project', 'name');
      
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }
    
    res.status(200).json(comment);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching comment', error });
  }
};

export const updateComment = async (req: Request, res: Response) => {
  try {
    const comment = await Comment.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }
    res.status(200).json(comment);
  } catch (error) {
    res.status(500).json({ message: 'Error updating comment', error });
  }
};

export const deleteComment = async (req: Request, res: Response) => {
  try {
    const comment = await Comment.findByIdAndDelete(req.params.id);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }
    res.status(200).json({ message: 'Comment deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting comment', error });
  }
};

export const moderateCommentWithAI = async (req: Request, res: Response) => {
  try {
    const { commentId } = req.body;
    
    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }
    
    const result = await aiModeration(comment.content);
    
    // Update comment with AI moderation results
    comment.aiModerated = true;
    comment.aiModerationScore = result.score;
    comment.aiModerationNotes = result.notes;
    
    // Auto-approve/reject based on threshold if needed
    if (result.score <= 0.2) {
      comment.status = 'approved';
    } else if (result.score >= 0.8) {
      comment.status = 'rejected';
    }
    
    await comment.save();
    
    res.status(200).json({ 
      comment,
      aiModeration: result
    });
  } catch (error) {
    res.status(500).json({ message: 'Error moderating comment with AI', error });
  }
};

// Map controllers
export const getAllMaps = async (req: Request, res: Response) => {
  try {
    const maps = await Map.find();
    res.status(200).json(maps);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching maps', error });
  }
};

export const createMap = async (req: Request, res: Response) => {
  try {
    const map = new Map(req.body);
    await map.save();
    res.status(201).json(map);
  } catch (error) {
    res.status(500).json({ message: 'Error creating map', error });
  }
};

export const getMapById = async (req: Request, res: Response) => {
  try {
    const map = await Map.findById(req.params.id);
    if (!map) {
      return res.status(404).json({ message: 'Map not found' });
    }
    res.status(200).json(map);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching map', error });
  }
};

export const updateMap = async (req: Request, res: Response) => {
  try {
    const map = await Map.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!map) {
      return res.status(404).json({ message: 'Map not found' });
    }
    res.status(200).json(map);
  } catch (error) {
    res.status(500).json({ message: 'Error updating map', error });
  }
};

export const deleteMap = async (req: Request, res: Response) => {
  try {
    const map = await Map.findByIdAndDelete(req.params.id);
    if (!map) {
      return res.status(404).json({ message: 'Map not found' });
    }
    res.status(200).json({ message: 'Map deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting map', error });
  }
};

// Report controllers
export const getAllReports = async (req: Request, res: Response) => {
  try {
    const reports = await Report.find().populate('project', 'name');
    res.status(200).json(reports);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching reports', error });
  }
};

export const createReport = async (req: Request, res: Response) => {
  try {
    const report = new Report(req.body);
    await report.save();
    res.status(201).json(report);
  } catch (error) {
    res.status(500).json({ message: 'Error creating report', error });
  }
};

export const getReportById = async (req: Request, res: Response) => {
  try {
    const report = await Report.findById(req.params.id).populate('project', 'name');
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }
    res.status(200).json(report);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching report', error });
  }
};

export const updateReport = async (req: Request, res: Response) => {
  try {
    const report = await Report.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }
    res.status(200).json(report);
  } catch (error) {
    res.status(500).json({ message: 'Error updating report', error });
  }
};

export const deleteReport = async (req: Request, res: Response) => {
  try {
    const report = await Report.findByIdAndDelete(req.params.id);
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }
    res.status(200).json({ message: 'Report deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting report', error });
  }
};

export const exportReport = async (req: Request, res: Response) => {
  try {
    const { id, format } = req.params;
    
    const report = await Report.findById(id).populate('project');
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }
    
    let data;
    let contentType;
    let fileExtension;
    
    switch (format.toLowerCase()) {
      case 'pdf':
        data = await generatePDF(report);
        contentType = 'application/pdf';
        fileExtension = 'pdf';
        break;
      case 'xlsx':
        data = await generateExcel(report);
        contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        fileExtension = 'xlsx';
        break;
      case 'kmz':
        data = await generateKMZ(report);
        contentType = 'application/vnd.google-earth.kmz';
        fileExtension = 'kmz';
        break;
      default:
        return res.status(400).json({ message: 'Unsupported export format' });
    }
    
    // Update last run timestamp
    report.lastRun = new Date();
    await report.save();
    
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="report-${id}.${fileExtension}"`);
    res.send(data);
  } catch (error) {
    res.status(500).json({ message: 'Error exporting report', error });
  }
};

export const exportReportByPolygon = async (req: Request, res: Response) => {
  try {
    const { format } = req.params;
    const { polygon, projectId, reportType } = req.body;
    
    if (!polygon || !Array.isArray(polygon)) {
      return res.status(400).json({ message: 'Invalid polygon data' });
    }
    
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    // Create a temporary report with polygon filter
    const tempReport = {
      name: `Ad-hoc ${reportType} Report`,
      project: project,
      type: reportType,
      parameters: {
        polygon,
        // Additional parameters based on report type can be added here
      }
    };
    
    let data;
    let contentType;
    let fileExtension;
    
    switch (format.toLowerCase()) {
      case 'pdf':
        data = await generatePDF(tempReport);
        contentType = 'application/pdf';
        fileExtension = 'pdf';
        break;
      case 'xlsx':
        data = await generateExcel(tempReport);
        contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        fileExtension = 'xlsx';
        break;
      case 'kmz':
        data = await generateKMZ(tempReport);
        contentType = 'application/vnd.google-earth.kmz';
        fileExtension = 'kmz';
        break;
      default:
        return res.status(400).json({ message: 'Unsupported export format' });
    }
    
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="polygon-report-${Date.now()}.${fileExtension}"`);
    res.send(data);
  } catch (error) {
    res.status(500).json({ message: 'Error exporting report', error });
  }
}; 