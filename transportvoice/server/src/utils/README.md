# MongoDB Atlas Integration

This application uses MongoDB Atlas as its database. The connection is configured in multiple places:

## Connection Methods

### 1. Mongoose Connection (Primary)

The primary database connection is through Mongoose, which is configured in:
- `/src/config/database.ts` - Contains the main database connection logic
- Used in `app.ts` when starting the application

### 2. Direct MongoDB Driver 

We also provide a direct MongoDB client connection in:
- `/src/utils/mongoClient.ts` - A utility that provides direct access to the MongoDB Node.js driver

## Environment Configuration

The MongoDB connection URI is configured in the `.env` file:

```
MONGODB_URI=mongodb+srv://username:<password>@planningtool.htavw.mongodb.net/?retryWrites=true&w=majority&appName=PlanningTool
```

Make sure to replace `<password>` with your actual database password.

## Usage

### Using Mongoose Models

Most of the database operations should use Mongoose models defined in the `/src/models` directory.

### Using Direct MongoDB Client

For operations not well-suited to Mongoose, you can use the direct MongoDB client:

```typescript
import { getMongoClient } from '../utils/mongoClient';

async function someFunction() {
  const client = getMongoClient();
  const db = client.db('your_database_name');
  
  // Perform MongoDB operations
  const result = await db.collection('your_collection').find({}).toArray();
  
  return result;
}
```

## Connection Management

The application handles MongoDB connection management automatically:

- Connection is established when the application starts
- Connection errors are logged
- Connection is closed gracefully when the application shuts down 