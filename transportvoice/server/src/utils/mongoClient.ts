import { MongoClient, ServerApiVersion } from 'mongodb';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// MongoDB URI (use environment variable or the provided URI)
const uri = process.env.MONGODB_URI || "mongodb+srv://nfredmond:Yuba530@planningtool.htavw.mongodb.net/?retryWrites=true&w=majority&appName=PlanningTool";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
  // Add SSL/TLS options to fix connection issues
  ssl: true,
  tls: true,
  tlsAllowInvalidCertificates: false, // Set to true only for development/testing if needed
  tlsAllowInvalidHostnames: false,    // Set to true only for development/testing if needed
  maxPoolSize: 50,                   // Adjust connection pool size as needed
  wtimeoutMS: 2500,                  // Write concern timeout
  connectTimeoutMS: 10000,           // How long to wait for a connection
  socketTimeoutMS: 45000,            // How long to wait for a response
});

// Function to connect to MongoDB
export async function connectMongo() {
  try {
    // Connect the client to the server
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB Atlas!");
    return client;
  } catch (error) {
    console.error("Error connecting to MongoDB Atlas:", error);
    throw error;
  }
}

// Function to get the MongoDB client
export function getMongoClient() {
  return client;
}

// Function to close the MongoDB connection
export async function closeMongo() {
  try {
    await client.close();
    console.log("MongoDB connection closed");
  } catch (error) {
    console.error("Error closing MongoDB connection:", error);
    throw error;
  }
}

export default {
  connectMongo,
  getMongoClient,
  closeMongo,
}; 