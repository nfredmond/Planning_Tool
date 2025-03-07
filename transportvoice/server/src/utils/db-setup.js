"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoClient_1 = require("./mongoClient");
/**
 * MongoDB Atlas Setup Script
 *
 * This script initializes the MongoDB database with required collections
 * and indexes for the PlanningTool application.
 */
async function setupDatabase() {
    try {
        console.log('Starting MongoDB Atlas setup...');
        // Connect to MongoDB
        await (0, mongoClient_1.connectMongo)();
        const client = (0, mongoClient_1.getMongoClient)();
        const db = client.db('PlanningTool');
        console.log('Creating necessary collections...');
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
        for (const collectionName of collections) {
            const collectionExists = await db.listCollections({ name: collectionName }).hasNext();
            if (!collectionExists) {
                await db.createCollection(collectionName);
                console.log(` - Created collection: ${collectionName}`);
            }
            else {
                console.log(` - Collection already exists: ${collectionName}`);
            }
        }
        // Create indexes for better query performance
        console.log('\nSetting up indexes...');
        // Users collection - index on email for fast lookups
        await db.collection('users').createIndex({ email: 1 }, { unique: true });
        console.log(' - Created index on users.email (unique)');
        // Projects collection - index on createdBy for fast user-specific queries
        await db.collection('projects').createIndex({ createdBy: 1 });
        console.log(' - Created index on projects.createdBy');
        // Comments collection - index on projectId for fast filtering
        await db.collection('comments').createIndex({ projectId: 1 });
        console.log(' - Created index on comments.projectId');
        console.log('\nMongoDB Atlas setup completed successfully!');
        // Close the connection
        await (0, mongoClient_1.closeMongo)();
    }
    catch (error) {
        console.error('Error setting up MongoDB database:', error);
    }
}
// Run the setup
setupDatabase();
