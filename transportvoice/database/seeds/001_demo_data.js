/**
 * Demo data seed file
 * Populates the database with initial demo data for development and testing
 */

const bcrypt = require('bcryptjs');
const { ObjectId } = require('mongodb');

// Helper to create a new ObjectId
const newId = () => new ObjectId();

// Create fixed IDs for reference
const userIds = {
  admin: newId(),
  planner1: newId(),
  planner2: newId(),
  contributor1: newId(),
  contributor2: newId(),
  viewer1: newId()
};

const projectIds = {
  downtown: newId(),
  bikeNetwork: newId(),
  transitExpansion: newId()
};

// Seed data
const seedData = {
  // Users seed data
  users: [
    {
      _id: userIds.admin,
      email: 'admin@transportvoice.com',
      password: bcrypt.hashSync('admin123', 10),
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      _id: userIds.planner1,
      email: 'planner1@transportvoice.com',
      password: bcrypt.hashSync('planner123', 10),
      firstName: 'Jane',
      lastName: 'Planner',
      role: 'planner',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      _id: userIds.planner2,
      email: 'planner2@transportvoice.com',
      password: bcrypt.hashSync('planner123', 10),
      firstName: 'John',
      lastName: 'Designer',
      role: 'planner',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      _id: userIds.contributor1,
      email: 'contributor1@transportvoice.com',
      password: bcrypt.hashSync('contributor123', 10),
      firstName: 'Sarah',
      lastName: 'Contributor',
      role: 'contributor',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      _id: userIds.contributor2,
      email: 'contributor2@transportvoice.com',
      password: bcrypt.hashSync('contributor123', 10),
      firstName: 'Michael',
      lastName: 'Feedback',
      role: 'contributor',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      _id: userIds.viewer1,
      email: 'viewer1@transportvoice.com',
      password: bcrypt.hashSync('viewer123', 10),
      firstName: 'Alex',
      lastName: 'Viewer',
      role: 'viewer',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ],
  
  // Projects seed data
  projects: [
    {
      _id: projectIds.downtown,
      title: 'Downtown Revitalization',
      description: 'A comprehensive plan to revitalize the downtown area with improved transportation options, pedestrian spaces, and transit connectivity.',
      status: 'active',
      location: {
        type: 'Point',
        coordinates: [-122.3321, 47.6062] // Example coordinates (Seattle)
      },
      startDate: new Date('2023-01-15'),
      endDate: new Date('2024-06-30'),
      createdBy: userIds.planner1,
      createdAt: new Date('2023-01-10'),
      updatedAt: new Date('2023-01-10')
    },
    {
      _id: projectIds.bikeNetwork,
      title: 'Bike Lane Network Expansion',
      description: 'Expanding the city\'s bike lane network to improve connectivity and safety for cyclists.',
      status: 'active',
      location: {
        type: 'Point',
        coordinates: [-122.3351, 47.6092] // Example coordinates (Seattle)
      },
      startDate: new Date('2023-02-01'),
      endDate: new Date('2023-12-31'),
      createdBy: userIds.planner2,
      createdAt: new Date('2023-01-20'),
      updatedAt: new Date('2023-01-20')
    },
    {
      _id: projectIds.transitExpansion,
      title: 'Public Transit Expansion',
      description: 'Expanding public transit routes and improving service frequency to better serve growing neighborhoods.',
      status: 'draft',
      location: {
        type: 'Point',
        coordinates: [-122.3381, 47.6152] // Example coordinates (Seattle)
      },
      startDate: new Date('2023-04-01'),
      endDate: new Date('2024-12-31'),
      createdBy: userIds.planner1,
      createdAt: new Date('2023-02-15'),
      updatedAt: new Date('2023-02-15')
    }
  ],
  
  // Comments seed data
  comments: [
    {
      _id: newId(),
      content: 'I think we should prioritize pedestrian spaces in the downtown core.',
      projectId: projectIds.downtown,
      createdBy: userIds.contributor1,
      createdAt: new Date('2023-01-20'),
      updatedAt: new Date('2023-01-20')
    },
    {
      _id: newId(),
      content: 'Have you considered adding more bike parking facilities?',
      projectId: projectIds.downtown,
      createdBy: userIds.contributor2,
      createdAt: new Date('2023-01-22'),
      updatedAt: new Date('2023-01-22')
    },
    {
      _id: newId(),
      content: 'The proposed bike lanes on Main Street seem too narrow. Can they be widened?',
      projectId: projectIds.bikeNetwork,
      createdBy: userIds.contributor1,
      createdAt: new Date('2023-02-05'),
      updatedAt: new Date('2023-02-05')
    },
    {
      _id: newId(),
      content: 'I support the expansion of bike lanes, but we need better connections to existing routes.',
      projectId: projectIds.bikeNetwork,
      createdBy: userIds.contributor2,
      createdAt: new Date('2023-02-10'),
      updatedAt: new Date('2023-02-10')
    }
  ]
};

// Seed function
const seed = async (db) => {
  try {
    console.log('Starting to seed demo data...');
    
    // Insert users
    await db.collection('users').insertMany(seedData.users);
    console.log(`Inserted ${seedData.users.length} users`);
    
    // Insert projects
    await db.collection('projects').insertMany(seedData.projects);
    console.log(`Inserted ${seedData.projects.length} projects`);
    
    // Insert comments
    await db.collection('comments').insertMany(seedData.comments);
    console.log(`Inserted ${seedData.comments.length} comments`);
    
    console.log('Demo data seeding completed successfully');
  } catch (error) {
    console.error('Error seeding demo data:', error);
    throw error;
  }
};

// Clean function to remove all demo data
const clean = async (db) => {
  try {
    console.log('Cleaning demo data...');
    
    // Remove all data from collections
    await db.collection('comments').deleteMany({});
    await db.collection('projects').deleteMany({});
    await db.collection('users').deleteMany({});
    
    console.log('Demo data cleaning completed successfully');
  } catch (error) {
    console.error('Error cleaning demo data:', error);
    throw error;
  }
};

module.exports = {
  seed,
  clean
}; 