import { MongoClient, ServerApiVersion } from 'mongodb';
import dotenv from 'dotenv';

/**
 * Fallback MongoDB Client
 * 
 * This is an alternative MongoDB client implementation that uses
 * environment variables to configure SSL/TLS settings. This can be
 * used as a fallback when the default client has SSL issues.
 */

// Load environment variables
dotenv.config();

// Set Node.js environment variables to help with SSL/TLS issues
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '1'; // Set to '0' only for testing if needed

// MongoDB URI from environment variables
const uri = process.env.MONGODB_URI || "mongodb+srv://nfredmond:Yuba530@planningtool.htavw.mongodb.net/?retryWrites=true&w=majority&appName=PlanningTool";

// Create a MongoClient with minimal options
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

// Function to connect to MongoDB
export async function connectMongoFallback() {
  try {
    console.log("Attempting fallback MongoDB connection...");
    // Connect the client to the server
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Fallback connection successful!");
    return client;
  } catch (error) {
    console.error("Error with fallback MongoDB connection:", error);
    throw error;
  }
}

// Function to get the MongoDB client
export function getMongoClientFallback() {
  return client;
}

// Function to close the MongoDB connection
export async function closeMongoFallback() {
  try {
    await client.close();
    console.log("MongoDB fallback connection closed");
  } catch (error) {
    console.error("Error closing MongoDB fallback connection:", error);
    throw error;
  }
}

export default {
  connectMongoFallback,
  getMongoClientFallback,
  closeMongoFallback,
}; 