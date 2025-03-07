import { connectMongo, closeMongo, getMongoClient } from './mongoClient';
import dotenv from 'dotenv';

/**
 * MongoDB Atlas Setup Script
 * 
 * This script initializes the MongoDB database with required collections
 * and indexes for the PlanningTool application.
 */

// Load environment variables
dotenv.config();

async function setupDatabase() {
  console.log('==== MongoDB Atlas Database Setup ====');
  console.log(`Connection string: ${process.env.MONGODB_URI?.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@')}`);
  
  try {
    console.log('\nConnecting to MongoDB Atlas...');
    
    // Connect to MongoDB
    await connectMongo();
    console.log('Connection established successfully!');
    
    const client = getMongoClient();
    const db = client.db('PlanningTool');
    
    console.log('\nCreating necessary collections...');
    
    // Create collections if they don't exist
    const collections = [
      'users',
      'projects',
      'comments',
      'designs',
      'surveys',
      'transportationPlans',
      'communityInputs'
    ];
    
    let createdCount = 0;
    let existingCount = 0;
    
    for (const collectionName of collections) {
      try {
        const collectionExists = await db.listCollections({ name: collectionName }).hasNext();
        
        if (!collectionExists) {
          await db.createCollection(collectionName);
          console.log(` ✓ Created collection: ${collectionName}`);
          createdCount++;
        } else {
          console.log(` ℹ Collection already exists: ${collectionName}`);
          existingCount++;
        }
      } catch (collError) {
        console.error(` ✗ Error creating collection ${collectionName}:`, collError);
      }
    }
    
    console.log(`\nCollection setup complete: ${createdCount} created, ${existingCount} already existed`);
    
    // Create indexes for better query performance
    console.log('\nSetting up indexes...');
    
    try {
      // Users collection - index on email for fast lookups
      await db.collection('users').createIndex({ email: 1 }, { unique: true });
      console.log(' ✓ Created index on users.email (unique)');
      
      // Projects collection - index on createdBy for fast user-specific queries
      await db.collection('projects').createIndex({ createdBy: 1 });
      console.log(' ✓ Created index on projects.createdBy');
      
      // Comments collection - index on projectId for fast filtering
      await db.collection('comments').createIndex({ projectId: 1 });
      console.log(' ✓ Created index on comments.projectId');
      
      console.log('\n✅ SETUP COMPLETED SUCCESSFULLY');
    } catch (indexError) {
      console.error('\n✗ Error creating indexes:', indexError);
    }
    
    // Close the connection
    await closeMongo();
    console.log('\nConnection closed.');
  } catch (error) {
    console.error('\n❌ SETUP FAILED');
    console.error('Error setting up MongoDB database:', error);
    console.log('\nPlease check:');
    console.log(' 1. Your MongoDB Atlas connection string in the .env file');
    console.log(' 2. Your network connection');
    console.log(' 3. That your IP address is whitelisted in MongoDB Atlas');
    process.exit(1);
  }
}

// Run the setup
setupDatabase(); 