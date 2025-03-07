import { connectMongoFallback, closeMongoFallback, getMongoClientFallback } from './fallback-mongo-client';
import dotenv from 'dotenv';

/**
 * Test MongoDB Connection using Fallback Method
 * 
 * This script tests the connection to MongoDB Atlas using the fallback connection
 * which might resolve SSL/TLS issues on some systems.
 */

// Load environment variables
dotenv.config();

async function testFallbackConnection() {
  console.log('==== MongoDB Atlas Fallback Connection Test ====');
  console.log(`Connection string: ${process.env.MONGODB_URI?.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@')}`);
  
  try {
    console.log('\nAttempting to connect to MongoDB Atlas using fallback method...');
    
    // Connect to MongoDB using fallback method
    const client = await connectMongoFallback();
    console.log('Fallback connection established successfully!');
    
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
      
      console.log('\n✅ FALLBACK CONNECTION TEST SUCCESSFUL');
      console.log('Your MongoDB Atlas connection is working properly with the fallback method.');
    } catch (dbError) {
      console.error('\n❌ DATABASE ACCESS ERROR:', dbError);
      console.log('Fallback connection was established, but there was an error accessing the database.');
    }
    
    // Close the connection
    await closeMongoFallback();
    console.log('\nConnection closed.');
  } catch (error) {
    console.error('\n❌ FALLBACK CONNECTION ERROR');
    console.error('Failed to connect to MongoDB Atlas using fallback method:', error);
    console.log('\nPlease check:');
    console.log(' 1. Your MongoDB Atlas connection string in the .env file');
    console.log(' 2. Your network connection');
    console.log(' 3. That your IP address is whitelisted in MongoDB Atlas');
    console.log(' 4. Try setting NODE_TLS_REJECT_UNAUTHORIZED=0 temporarily for testing');
    process.exit(1);
  }
}

// Run the test
testFallbackConnection(); 