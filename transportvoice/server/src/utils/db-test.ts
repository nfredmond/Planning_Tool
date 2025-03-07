import { connectMongo, closeMongo, getMongoClient } from './mongoClient';
import dotenv from 'dotenv';

/**
 * Test MongoDB Connection
 * 
 * This script tests the connection to MongoDB Atlas and verifies
 * that we can access the database.
 */

// Load environment variables
dotenv.config();

async function testConnection() {
  console.log('==== MongoDB Atlas Connection Test ====');
  console.log(`Connection string: ${process.env.MONGODB_URI?.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@')}`);
  
  try {
    console.log('\nAttempting to connect to MongoDB Atlas...');
    
    // Connect to MongoDB
    const client = await connectMongo();
    console.log('Connection established successfully!');
    
    try {
      // List available databases
      console.log('\nRetrieving database list...');
      const databasesList = await client.db().admin().listDatabases();
      
      console.log('Available databases:');
      databasesList.databases.forEach(db => {
        console.log(` - ${db.name}`);
      });
      
      // Try to access the PlanningTool database specifically
      console.log('\nAccessing PlanningTool database...');
      const planningToolDb = client.db('PlanningTool');
      
      // Check collections
      const collections = await planningToolDb.listCollections().toArray();
      
      if (collections.length > 0) {
        console.log('Collections in PlanningTool database:');
        collections.forEach(collection => {
          console.log(` - ${collection.name}`);
        });
      } else {
        console.log('No collections found in the PlanningTool database.');
        console.log('You may need to run the database setup script.');
      }
      
      console.log('\n✅ CONNECTION TEST SUCCESSFUL');
      console.log('Your MongoDB Atlas connection is working properly.');
    } catch (dbError) {
      console.error('\n❌ DATABASE ACCESS ERROR:', dbError);
      console.log('Connection was established, but there was an error accessing the database.');
    }
    
    // Close the connection
    await closeMongo();
    console.log('\nConnection closed.');
  } catch (error) {
    console.error('\n❌ CONNECTION ERROR');
    console.error('Failed to connect to MongoDB Atlas:', error);
    console.log('\nPlease check:');
    console.log(' 1. Your MongoDB Atlas connection string in the .env file');
    console.log(' 2. Your network connection');
    console.log(' 3. That your IP address is whitelisted in MongoDB Atlas');
    process.exit(1);
  }
}

// Run the test
testConnection(); 