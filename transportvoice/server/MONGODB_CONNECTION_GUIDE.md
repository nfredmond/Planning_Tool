# MongoDB Atlas Connection Guide

This guide will help you troubleshoot and resolve connection issues with MongoDB Atlas.

## Connection Error

You're experiencing an SSL/TLS error when trying to connect to MongoDB Atlas:

```
SSL routines:ssl3_read_bytes:tlsv1 alert internal error
```

This is a common issue that can be resolved by following these steps.

## Step 1: Install MongoDB Shell

First, you need to install the MongoDB Shell (mongosh) to test connections directly:

1. Download MongoDB Shell from: https://www.mongodb.com/try/download/shell
2. Choose the Windows 64-bit (MSI) package
3. Run the installer and follow the prompts
4. Add the MongoDB Shell to your PATH if the installer doesn't do it automatically

## Step 2: Whitelist Your IP Address in MongoDB Atlas

1. Log in to MongoDB Atlas at https://cloud.mongodb.com
2. Select your project
3. Go to "Network Access" in the left sidebar
4. Click "Add IP Address"
5. You can either:
   - Click "Add Current IP Address" to add your current IP
   - Or select "Allow Access from Anywhere" (less secure, but useful for testing)
6. Click "Confirm"

## Step 3: Test Connection with MongoDB Shell

Open a command prompt and run:

```
mongosh "mongodb+srv://nfredmond:Yuba530@planningtool.htavw.mongodb.net/?retryWrites=true&w=majority&appName=PlanningTool"
```

If this works, you'll see the MongoDB shell prompt. Type `show dbs` to list databases.

## Step 4: Update Your Application's Connection Settings

If the MongoDB shell connection works, update your application's connection settings:

1. Edit the `.env` file:
   ```
   MONGODB_URI=mongodb+srv://nfredmond:Yuba530@planningtool.htavw.mongodb.net/?retryWrites=true&w=majority&appName=PlanningTool
   ```

2. Edit `src/utils/mongoClient.ts` to use these connection options:
   ```javascript
   const client = new MongoClient(uri, {
     serverApi: {
       version: ServerApiVersion.v1,
       strict: true,
       deprecationErrors: true,
     },
     ssl: true,
     tls: true,
     connectTimeoutMS: 30000,
     socketTimeoutMS: 45000
   });
   ```

3. Remove any `NODE_TLS_REJECT_UNAUTHORIZED=0` settings from your `.env` file once the connection is working.

## Step 5: Run the Connection Test Again

Run the test script:

```
.\test-db-connection.bat
```

## Troubleshooting

### If You Still Can't Connect

1. **Check MongoDB Atlas Status**: Visit https://status.mongodb.com/ to see if there are any ongoing issues.

2. **Try a Different Network**: Sometimes corporate networks or VPNs block MongoDB connections. Try connecting from a different network.

3. **Check MongoDB Atlas User**: Ensure your MongoDB Atlas user has the correct permissions. You can create a new database user:
   - Go to "Database Access" in MongoDB Atlas
   - Click "Add New Database User"
   - Set Authentication Method to "Password"
   - Enter a username and password
   - Set "Database User Privileges" to "Atlas admin"
   - Click "Add User"

4. **Check MongoDB Atlas Version**: Make sure you're using a compatible version of the MongoDB driver.

5. **Try MongoDB Compass**: Download and install MongoDB Compass (a GUI tool) from https://www.mongodb.com/try/download/compass and try connecting with it.

### SSL/TLS Issues

If you're still having SSL/TLS issues, you can try:

1. **Update Node.js**: Make sure you're using the latest version of Node.js.

2. **Update OpenSSL**: Your system might have an outdated version of OpenSSL.

3. **Try a Different Driver Version**: Install a specific version of the MongoDB driver:
   ```
   npm uninstall mongodb
   npm install mongodb@4.17.1
   ```

## Need More Help?

If you're still having issues, please:

1. Take a screenshot of the MongoDB Atlas connection screen
2. Note any specific error messages
3. Check if you can connect using MongoDB Compass
4. Contact MongoDB Atlas support or post on the MongoDB Community Forums 