import { Request, Response } from 'express';
import mongoose from 'mongoose';
import ProjectType, { IProjectType, PROJECT_TYPES } from '../models/ProjectType';
import CommentType from '../models/CommentType';

class ProjectTypeController {
  /**
   * Get all project types
   */
  getAllProjectTypes = async (req: Request, res: Response): Promise<void> => {
    try {
      const projectTypes = await ProjectType.find()
        .populate('defaultCommentTypes');
      
      res.status(200).json(projectTypes);
    } catch (error) {
      console.error('Error fetching project types:', error);
      res.status(500).json({ message: 'Failed to fetch project types' });
    }
  };

  /**
   * Get a single project type by ID or slug
   */
  getProjectTypeByIdOrSlug = async (req: Request, res: Response): Promise<void> => {
    try {
      const { idOrSlug } = req.params;
      
      let projectType;
      
      // Check if the parameter is a valid ObjectId
      if (mongoose.Types.ObjectId.isValid(idOrSlug)) {
        projectType = await ProjectType.findById(idOrSlug)
          .populate('defaultCommentTypes');
      } else {
        // Otherwise, treat it as a slug
        projectType = await ProjectType.findOne({ slug: idOrSlug })
          .populate('defaultCommentTypes');
      }
      
      if (!projectType) {
        res.status(404).json({ message: 'Project type not found' });
        return;
      }
      
      res.status(200).json(projectType);
    } catch (error) {
      console.error('Error fetching project type:', error);
      res.status(500).json({ message: 'Failed to fetch project type' });
    }
  };

  /**
   * Create a new project type
   */
  createProjectType = async (req: Request, res: Response): Promise<void> => {
    try {
      const { name, description, slug, defaultCommentTypes } = req.body;
      
      // Validate required fields
      if (!name || !description || !slug) {
        res.status(400).json({ message: 'Name, description, and slug are required' });
        return;
      }
      
      // Check if a project type with this slug already exists
      const existingProjectType = await ProjectType.findOne({ slug });
      if (existingProjectType) {
        res.status(400).json({ message: 'A project type with this slug already exists' });
        return;
      }
      
      // Create the project type
      const projectType = new ProjectType({
        name,
        description,
        slug,
        defaultCommentTypes: defaultCommentTypes || [],
        createdBy: req.user._id
      });
      
      // Save the project type
      await projectType.save();
      
      res.status(201).json(projectType);
    } catch (error) {
      console.error('Error creating project type:', error);
      res.status(500).json({ message: 'Failed to create project type' });
    }
  };

  /**
   * Update a project type
   */
  updateProjectType = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { name, description, defaultCommentTypes } = req.body;
      
      const projectType = await ProjectType.findById(id);
      
      if (!projectType) {
        res.status(404).json({ message: 'Project type not found' });
        return;
      }
      
      // Update fields
      if (name) projectType.name = name;
      if (description) projectType.description = description;
      if (defaultCommentTypes) projectType.defaultCommentTypes = defaultCommentTypes;
      
      // Save the updated project type
      await projectType.save();
      
      res.status(200).json(projectType);
    } catch (error) {
      console.error('Error updating project type:', error);
      res.status(500).json({ message: 'Failed to update project type' });
    }
  };

  /**
   * Delete a project type
   */
  deleteProjectType = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      
      const projectType = await ProjectType.findById(id);
      
      if (!projectType) {
        res.status(404).json({ message: 'Project type not found' });
        return;
      }
      
      // Delete the project type
      await ProjectType.deleteOne({ _id: id });
      
      res.status(200).json({ message: 'Project type deleted successfully' });
    } catch (error) {
      console.error('Error deleting project type:', error);
      res.status(500).json({ message: 'Failed to delete project type' });
    }
  };

  /**
   * Initialize default project types (used during system setup)
   */
  initializeDefaultProjectTypes = async (req: Request, res: Response): Promise<void> => {
    try {
      // Check if project types already exist
      const existingCount = await ProjectType.countDocuments();
      
      if (existingCount > 0) {
        res.status(400).json({ message: 'Project types are already initialized' });
        return;
      }
      
      // Create default project types
      const createdTypes = [];
      
      for (const typeData of PROJECT_TYPES) {
        const projectType = new ProjectType({
          ...typeData,
          createdBy: req.user._id
        });
        
        await projectType.save();
        createdTypes.push(projectType);
      }
      
      res.status(201).json(createdTypes);
    } catch (error) {
      console.error('Error initializing project types:', error);
      res.status(500).json({ message: 'Failed to initialize project types' });
    }
  };

  /**
   * Get comment types for a specific project type
   */
  getCommentTypesForProjectType = async (req: Request, res: Response): Promise<void> => {
    try {
      const { idOrSlug } = req.params;
      
      let projectType;
      
      // Check if the parameter is a valid ObjectId
      if (mongoose.Types.ObjectId.isValid(idOrSlug)) {
        projectType = await ProjectType.findById(idOrSlug);
      } else {
        // Otherwise, treat it as a slug
        projectType = await ProjectType.findOne({ slug: idOrSlug });
      }
      
      if (!projectType) {
        res.status(404).json({ message: 'Project type not found' });
        return;
      }
      
      // Get global comment types
      const globalCommentTypes = await CommentType.find({ isGlobal: true });
      
      // Get project type specific comment types
      const projectTypeCommentTypes = await CommentType.find({
        projectTypes: { $in: [projectType.slug] }
      });
      
      // Combine both types
      const commentTypes = [...globalCommentTypes, ...projectTypeCommentTypes];
      
      res.status(200).json(commentTypes);
    } catch (error) {
      console.error('Error fetching comment types for project type:', error);
      res.status(500).json({ message: 'Failed to fetch comment types for project type' });
    }
  };
}

export default new ProjectTypeController(); 