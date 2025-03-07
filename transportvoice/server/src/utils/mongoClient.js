"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.closeMongo = exports.getMongoClient = exports.connectMongo = void 0;
const mongodb_1 = require("mongodb");
const dotenv_1 = __importDefault(require("dotenv"));
// Load environment variables
dotenv_1.default.config();
// MongoDB URI (use environment variable or the provided URI)
const uri = process.env.MONGODB_URI || "mongodb+srv://nfredmond:<db_password>@planningtool.htavw.mongodb.net/?retryWrites=true&w=majority&appName=PlanningTool";
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new mongodb_1.MongoClient(uri, {
    serverApi: {
        version: mongodb_1.ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});
// Function to connect to MongoDB
async function connectMongo() {
    try {
        // Connect the client to the server
        await client.connect();
        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB Atlas!");
        return client;
    }
    catch (error) {
        console.error("Error connecting to MongoDB Atlas:", error);
        throw error;
    }
}
exports.connectMongo = connectMongo;
// Function to get the MongoDB client
function getMongoClient() {
    return client;
}
exports.getMongoClient = getMongoClient;
// Function to close the MongoDB connection
async function closeMongo() {
    try {
        await client.close();
        console.log("MongoDB connection closed");
    }
    catch (error) {
        console.error("Error closing MongoDB connection:", error);
        throw error;
    }
}
exports.closeMongo = closeMongo;
exports.default = {
    connectMongo,
    getMongoClient,
    closeMongo,
};
