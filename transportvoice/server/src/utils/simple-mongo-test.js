// Simple MongoDB Connection Test
// This uses plain JavaScript instead of TypeScript

const { MongoClient } = require('mongodb');
require('dotenv').config();

// Set this to disable SSL certificate verification (for testing only)
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

async function simpleMongoTest() {
  console.log('==== Simple MongoDB Connection Test ====');
  
  // Connection URI
  const uri = process.env.MONGODB_URI || 
    "mongodb+srv://nfredmond:Yuba530@planningtool.htavw.mongodb.net/?retryWrites=true&w=majority&appName=PlanningTool";
  
  // Create a new MongoClient with minimal options
  const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    connectTimeoutMS: 30000,
    socketTimeoutMS: 45000
  });
  
  try {
    console.log('Connecting to MongoDB Atlas...');
    await client.connect();
    console.log('Connected successfully to MongoDB Atlas!');
    
    // Get the database
    const db = client.db('PlanningTool');
    console.log('Accessed PlanningTool database');
    
    // List collections
    const collections = await db.listCollections().toArray();
    console.log(`Found ${collections.length} collections`);
    
    if (collections.length > 0) {
      console.log('Collections:');
      collections.forEach(coll => {
        console.log(` - ${coll.name}`);
      });
    } else {
      console.log('No collections found. This is normal for a new database.');
    }
    
    console.log('\nConnection test successful!');
  } catch (err) {
    console.error('Error connecting to MongoDB:', err);
  } finally {
    // Close the connection
    await client.close();
    console.log('Connection closed');
  }
}

// Run the test
simpleMongoTest(); 