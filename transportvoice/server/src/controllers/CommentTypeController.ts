import { Request, Response } from 'express';
import mongoose from 'mongoose';
import CommentType, { ICommentType } from '../models/CommentType';
import Project from '../models/Project';
import IconGeneratorService from '../services/ai/IconGeneratorService';
import { getAiService } from '../services/ai/aiServiceFactory';

class CommentTypeController {
  private iconGeneratorService: IconGeneratorService;

  constructor() {
    const aiService = getAiService();
    this.iconGeneratorService = new IconGeneratorService(aiService);
  }

  /**
   * Get all comment types
   */
  getAllCommentTypes = async (req: Request, res: Response): Promise<void> => {
    try {
      const { projectId, projectType, global } = req.query;
      
      let query: any = {};
      
      // Filter by project ID if provided
      if (projectId) {
        query.projects = new mongoose.Types.ObjectId(projectId as string);
      }
      
      // Filter by project type if provided
      if (projectType) {
        query.projectTypes = projectType;
      }
      
      // Filter by global flag if provided
      if (global !== undefined) {
        query.isGlobal = global === 'true';
      }
      
      const commentTypes = await CommentType.find(query);
      res.status(200).json(commentTypes);
    } catch (error) {
      console.error('Error fetching comment types:', error);
      res.status(500).json({ message: 'Failed to fetch comment types' });
    }
  };

  /**
   * Get a single comment type by ID
   */
  getCommentTypeById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const commentType = await CommentType.findById(id);
      
      if (!commentType) {
        res.status(404).json({ message: 'Comment type not found' });
        return;
      }
      
      res.status(200).json(commentType);
    } catch (error) {
      console.error('Error fetching comment type:', error);
      res.status(500).json({ message: 'Failed to fetch comment type' });
    }
  };

  /**
   * Create a new comment type
   */
  createCommentType = async (req: Request, res: Response): Promise<void> => {
    try {
      const { name, description, icon, color, projectTypes, projects, isGlobal } = req.body;
      
      // Validate required fields
      if (!name || !description) {
        res.status(400).json({ message: 'Name and description are required' });
        return;
      }
      
      // Create the comment type
      const commentType = new CommentType({
        name,
        description,
        icon: icon || '<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24"><path d="M480-480q-66 0-113-47t-47-113q0-66 47-113t113-47q66 0 113 47t47 113q0 66-47 113t-113 47ZM160-160v-112q0-33 17-62t47-44q51-26 115-44t141-18q77 0 141 18t115 44q30 15 47 44t17 62v112H160Z"/></svg>',
        iconGeneratedByAI: false,
        color: color || '#1976d2',
        projectTypes: projectTypes || [],
        createdBy: req.user._id,
        organization: req.user.organization,
        projects: projects || [],
        isGlobal: isGlobal || false
      });
      
      // Save the comment type
      await commentType.save();
      
      // Add the comment type to any specified projects
      if (projects && projects.length > 0) {
        await Project.updateMany(
          { _id: { $in: projects } },
          { $addToSet: { commentTypes: commentType._id } }
        );
      }
      
      res.status(201).json(commentType);
    } catch (error) {
      console.error('Error creating comment type:', error);
      res.status(500).json({ message: 'Failed to create comment type' });
    }
  };

  /**
   * Update a comment type
   */
  updateCommentType = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { name, description, icon, color, projectTypes, projects, isGlobal } = req.body;
      
      const commentType = await CommentType.findById(id);
      
      if (!commentType) {
        res.status(404).json({ message: 'Comment type not found' });
        return;
      }
      
      // Update fields
      if (name) commentType.name = name;
      if (description) commentType.description = description;
      if (icon) {
        commentType.icon = icon;
        commentType.iconGeneratedByAI = false;
      }
      if (color) commentType.color = color;
      if (projectTypes) commentType.projectTypes = projectTypes;
      if (isGlobal !== undefined) commentType.isGlobal = isGlobal;
      
      // Handle project assignments
      if (projects) {
        // Remove this comment type from projects that are no longer in the list
        const oldProjects = commentType.projects.map(p => p.toString());
        const projectsToRemove = oldProjects.filter(p => !projects.includes(p));
        
        if (projectsToRemove.length > 0) {
          await Project.updateMany(
            { _id: { $in: projectsToRemove } },
            { $pull: { commentTypes: commentType._id } }
          );
        }
        
        // Add this comment type to new projects
        const projectsToAdd = projects.filter(p => !oldProjects.includes(p));
        
        if (projectsToAdd.length > 0) {
          await Project.updateMany(
            { _id: { $in: projectsToAdd } },
            { $addToSet: { commentTypes: commentType._id } }
          );
        }
        
        commentType.projects = projects.map(p => new mongoose.Types.ObjectId(p));
      }
      
      // Save the updated comment type
      await commentType.save();
      
      res.status(200).json(commentType);
    } catch (error) {
      console.error('Error updating comment type:', error);
      res.status(500).json({ message: 'Failed to update comment type' });
    }
  };

  /**
   * Delete a comment type
   */
  deleteCommentType = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      
      const commentType = await CommentType.findById(id);
      
      if (!commentType) {
        res.status(404).json({ message: 'Comment type not found' });
        return;
      }
      
      // Remove this comment type from all projects
      await Project.updateMany(
        { commentTypes: commentType._id },
        { $pull: { commentTypes: commentType._id } }
      );
      
      // Delete the comment type
      await CommentType.deleteOne({ _id: id });
      
      res.status(200).json({ message: 'Comment type deleted successfully' });
    } catch (error) {
      console.error('Error deleting comment type:', error);
      res.status(500).json({ message: 'Failed to delete comment type' });
    }
  };

  /**
   * Generate an icon for a comment type using AI
   */
  generateIcon = async (req: Request, res: Response): Promise<void> => {
    try {
      const { prompt, style, color, size } = req.body;
      
      if (!prompt) {
        res.status(400).json({ message: 'Prompt is required' });
        return;
      }
      
      const icon = await this.iconGeneratorService.generateSvgIcon({
        prompt,
        style,
        color,
        size
      });
      
      // Validate the generated SVG
      if (!this.iconGeneratorService.validateSvg(icon)) {
        res.status(500).json({ message: 'Failed to generate a valid icon' });
        return;
      }
      
      res.status(200).json({ icon });
    } catch (error) {
      console.error('Error generating icon:', error);
      res.status(500).json({ message: 'Failed to generate icon' });
    }
  };

  /**
   * Apply a generated icon to a comment type
   */
  applyGeneratedIcon = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { icon, prompt } = req.body;
      
      if (!icon) {
        res.status(400).json({ message: 'Icon is required' });
        return;
      }
      
      const commentType = await CommentType.findById(id);
      
      if (!commentType) {
        res.status(404).json({ message: 'Comment type not found' });
        return;
      }
      
      // Update the comment type with the generated icon
      commentType.icon = icon;
      commentType.iconGeneratedByAI = true;
      if (prompt) commentType.iconPrompt = prompt;
      
      await commentType.save();
      
      res.status(200).json(commentType);
    } catch (error) {
      console.error('Error applying generated icon:', error);
      res.status(500).json({ message: 'Failed to apply generated icon' });
    }
  };
}

export default new CommentTypeController(); 