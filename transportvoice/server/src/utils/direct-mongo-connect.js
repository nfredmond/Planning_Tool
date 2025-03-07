"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongodb_1 = require("mongodb");
const dotenv_1 = __importDefault(require("dotenv"));
/**
 * Direct MongoDB Connection Tester
 *
 * This is a simplified script to test MongoDB Atlas connection with
 * minimal configuration options.
 */
// Load environment variables
dotenv_1.default.config();
// Main function to test MongoDB connection directly
async function testDirectConnection() {
    console.log('==== Direct MongoDB Atlas Connection Test ====');
    const uri = process.env.MONGODB_URI ||
        "mongodb+srv://nfredmond:Yuba530@planningtool.htavw.mongodb.net/?retryWrites=true&w=majority&appName=PlanningTool";
    console.log(`Connection string: ${uri.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@')}`);
    console.log(`NODE_TLS_REJECT_UNAUTHORIZED = ${process.env.NODE_TLS_REJECT_UNAUTHORIZED || 'not set'}`);
    // Create the most basic MongoClient with minimal options
    const client = new mongodb_1.MongoClient(uri);
    try {
        console.log('\nAttempting to connect...');
        await client.connect();
        console.log('Connection established successfully!');
        // Try a basic database operation
        const dbList = await client.db().admin().listDatabases();
        console.log(`\nFound ${dbList.databases.length} databases:`);
        dbList.databases.forEach(db => {
            console.log(` - ${db.name}`);
        });
        // Specifically check for the Planning Tool database
        const planningToolDb = client.db('PlanningTool');
        console.log('\nTrying to access PlanningTool database...');
        const collections = await planningToolDb.listCollections().toArray();
        console.log(`Found ${collections.length} collections`);
        if (collections.length > 0) {
            collections.forEach(coll => {
                console.log(` - ${coll.name}`);
            });
        }
        console.log('\n✅ CONNECTION SUCCESSFUL');
    }
    catch (error) {
        console.error('\n❌ CONNECTION ERROR:', error);
    }
    finally {
        try {
            await client.close();
            console.log('Connection closed.');
        }
        catch (error) {
            console.error('Error closing connection:', error);
        }
    }
}
// Run the test
testDirectConnection();
// Export the function for use in other files
exports.default = testDirectConnection;
