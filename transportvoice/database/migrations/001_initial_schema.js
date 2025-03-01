/**
 * Initial database schema migration
 */

// This is a placeholder for a real migration script
// In a real application, this would use a migration library like knex.js or mongoose-migrate

const initialSchema = {
  version: '001',
  description: 'Initial schema setup',
  up: async (db) => {
    console.log('Running migration: 001_initial_schema - UP');
    
    // Example of creating collections in MongoDB
    try {
      // Create users collection
      await db.createCollection('users', {
        validator: {
          $jsonSchema: {
            bsonType: 'object',
            required: ['email', 'password', 'role', 'createdAt'],
            properties: {
              email: {
                bsonType: 'string',
                description: 'Email address of the user'
              },
              password: {
                bsonType: 'string',
                description: 'Hashed password'
              },
              firstName: {
                bsonType: 'string',
                description: 'First name of the user'
              },
              lastName: {
                bsonType: 'string',
                description: 'Last name of the user'
              },
              role: {
                bsonType: 'string',
                enum: ['admin', 'planner', 'contributor', 'viewer'],
                description: 'Role of the user'
              },
              createdAt: {
                bsonType: 'date',
                description: 'Date the user was created'
              },
              updatedAt: {
                bsonType: 'date',
                description: 'Date the user was last updated'
              }
            }
          }
        }
      });
      
      // Create projects collection
      await db.createCollection('projects', {
        validator: {
          $jsonSchema: {
            bsonType: 'object',
            required: ['title', 'status', 'createdBy', 'createdAt'],
            properties: {
              title: {
                bsonType: 'string',
                description: 'Title of the project'
              },
              description: {
                bsonType: 'string',
                description: 'Description of the project'
              },
              status: {
                bsonType: 'string',
                enum: ['draft', 'active', 'review', 'completed', 'archived'],
                description: 'Status of the project'
              },
              location: {
                bsonType: 'object',
                description: 'Geographic location of the project'
              },
              startDate: {
                bsonType: 'date',
                description: 'Start date of the project'
              },
              endDate: {
                bsonType: 'date',
                description: 'End date of the project'
              },
              createdBy: {
                bsonType: 'objectId',
                description: 'User ID of the creator'
              },
              createdAt: {
                bsonType: 'date',
                description: 'Date the project was created'
              },
              updatedAt: {
                bsonType: 'date',
                description: 'Date the project was last updated'
              }
            }
          }
        }
      });
      
      // Create comments collection
      await db.createCollection('comments', {
        validator: {
          $jsonSchema: {
            bsonType: 'object',
            required: ['content', 'projectId', 'createdBy', 'createdAt'],
            properties: {
              content: {
                bsonType: 'string',
                description: 'Content of the comment'
              },
              projectId: {
                bsonType: 'objectId',
                description: 'ID of the project the comment belongs to'
              },
              parentId: {
                bsonType: 'objectId',
                description: 'ID of the parent comment (for replies)'
              },
              createdBy: {
                bsonType: 'objectId',
                description: 'User ID of the creator'
              },
              createdAt: {
                bsonType: 'date',
                description: 'Date the comment was created'
              },
              updatedAt: {
                bsonType: 'date',
                description: 'Date the comment was last updated'
              }
            }
          }
        }
      });
      
      // Create indexes
      await db.collection('users').createIndex({ email: 1 }, { unique: true });
      await db.collection('projects').createIndex({ title: 1 });
      await db.collection('projects').createIndex({ status: 1 });
      await db.collection('comments').createIndex({ projectId: 1 });
      await db.collection('comments').createIndex({ createdBy: 1 });
      
      console.log('Migration 001_initial_schema completed successfully');
    } catch (error) {
      console.error('Error in migration 001_initial_schema:', error);
      throw error;
    }
  },
  
  down: async (db) => {
    console.log('Running migration: 001_initial_schema - DOWN');
    
    try {
      // Drop collections in reverse order
      await db.collection('comments').drop();
      await db.collection('projects').drop();
      await db.collection('users').drop();
      
      console.log('Rollback of migration 001_initial_schema completed successfully');
    } catch (error) {
      console.error('Error in rollback of migration 001_initial_schema:', error);
      throw error;
    }
  }
};

module.exports = initialSchema; 