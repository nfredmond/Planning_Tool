# A2 Hosting Deployment Guide

This guide provides detailed instructions for deploying the TransportVoice application on A2 Hosting using cPanel and Git Version Control.

## Prerequisites

1. A2 Hosting account with cPanel access
2. GitHub repository with the TransportVoice application code
3. Git installed on your local machine
4. Basic understanding of Git commands
5. MongoDB database access (A2 Hosting provides MongoDB)

## Initial Setup

### 1. Setting Up Your Repository in cPanel

1. Log in to your A2 Hosting cPanel (usually at https://yourdomain.com/cpanel)
2. Find and click on "Git Version Control" under the "Files" section
3. Click "Create" to set up a new repository
4. Fill in the repository details:
   - **Repository Path**: `/home/yourusername/planning_tool` (replace `yourusername` with your A2 Hosting username)
   - **Repository Name**: Give it a descriptive name like "transportvoice"
   - **Clone URL**: Leave blank (we'll configure this later)
5. Click "Create" to create the repository

### 2. Connecting to Your GitHub Repository

1. In cPanel, go to "Git Version Control" and click "Manage" for your repository
2. Go to the "Settings" tab
3. Under "Remote Path", enter your GitHub repository URL:
   ```
   https://github.com/yourusername/transportvoice.git
   ```
4. Set "Remote Branch" to `main`
5. Click "Update Settings" to save changes

## Deployment Configuration

### 1. The .cpanel.yml File

The `.cpanel.yml` file in your repository root configures the deployment process. Make sure this file exists in your main branch:

```yaml
---
deployment:
  tasks:
    - export DEPLOYPATH=/home/yourusername/planning_tool
    - /bin/cp -R transportvoice $DEPLOYPATH
    - /bin/cp -R public $DEPLOYPATH
    - /bin/cp -R docs $DEPLOYPATH
    
    # Install dependencies and build the client
    - cd $DEPLOYPATH/transportvoice
    - npm install --production
    - cd $DEPLOYPATH/transportvoice/client
    - npm install
    - npm run build
    
    # Set proper file permissions
    - chmod -R 755 $DEPLOYPATH
    - find $DEPLOYPATH -type f -exec chmod 644 {} \;
```

Make sure to replace `yourusername` with your actual A2 Hosting username.

### 2. Environment Configuration

Create `.env` files in both server and client directories with appropriate production values:

#### Server .env File
```
NODE_ENV=production
PORT=5000
MONGO_URI=mongodb://username:password@localhost:27017/your_database
JWT_SECRET=your_secure_jwt_secret
JWT_EXPIRATION=1d
CLIENT_URL=https://yourdomain.com
EMAIL_HOST=mail.yourdomain.com
EMAIL_PORT=587
EMAIL_USER=your_email_user
EMAIL_PASS=your_email_password
EMAIL_FROM=noreply@yourdomain.com
ENCRYPTION_KEY=your_secure_encryption_key
MAPBOX_TOKEN=your_mapbox_token
```

#### Client .env File
```
REACT_APP_API_URL=https://yourdomain.com/api
REACT_APP_MAPBOX_TOKEN=your_mapbox_token
REACT_APP_ENABLE_AI_FEATURES=true
```

## Deployment Process

### 1. Manual Deployment

1. After pushing changes to GitHub, log in to your A2 Hosting cPanel
2. Go to "Git Version Control" and click "Manage" for your repository
3. Go to the "Pull or Deploy" tab
4. Check for any deployment requirements:
   - A valid `.cpanel.yml` file
   - No uncommitted changes on the checked-out branch
5. Click "Deploy HEAD Commit" to deploy your changes
6. Monitor the deployment log for any errors

### 2. Automated Deployment with Webhooks

To automatically deploy changes whenever you push to GitHub:

1. In cPanel, go to "Git Version Control" and click "Manage" for your repository
2. Go to the "Pull or Deploy" tab
3. Copy the webhook URL displayed on this page
4. Go to your GitHub repository's settings
5. Navigate to "Webhooks" and click "Add webhook"
6. Paste the webhook URL as the "Payload URL"
7. Set "Content type" to "application/json"
8. Choose which events should trigger the webhook (usually just "Push")
9. Click "Add webhook" to save

Now, whenever you push changes to your GitHub repository, A2 Hosting will automatically deploy them.

## Database Setup

1. In cPanel, go to the "Databases" section and click on "MongoDB Databases"
2. Create a new MongoDB database with a secure username and password
3. Note the connection string, which will be similar to:
   ```
   mongodb://username:password@localhost:27017/database_name
   ```
4. Update your server's `.env` file with this connection string

## SSL/TLS Configuration

1. In cPanel, go to "SSL/TLS" section
2. Click on "Install and Manage SSL for your site (HTTPS)"
3. Choose your domain
4. Click "Install Free SSL Certificate" (Let's Encrypt)
5. Follow the prompts to complete the installation

## Troubleshooting

### Deployment Failures

If deployment fails, check the following:

1. **Missing .cpanel.yml File**: Ensure the `.cpanel.yml` file exists in your main branch
2. **Uncommitted Changes**: Make sure there are no uncommitted changes in your repository
3. **Permission Issues**: Check file permissions in your A2 Hosting account
4. **Dependency Issues**: Look for errors during npm install or build
5. **Path Issues**: Verify all paths in your `.cpanel.yml` file are correct

### Error Logs

Check error logs in cPanel:
1. Go to "Metrics" > "Errors"
2. Review recent error logs for any application-related issues

### Application Not Starting

If your application deploys but doesn't start:
1. Check MongoDB connection string
2. Verify environment variables are set correctly
3. Check the Node.js version (A2 Hosting should support Node.js 16+)
4. Look for application logs in your application directory

## Maintenance

1. **Regular Backups**:
   - In cPanel, go to "Backup" and configure automated backups
   
2. **Updating Your Application**:
   - Make changes locally and push to GitHub
   - Deploy using the cPanel Git Version Control
   
3. **Monitoring**:
   - Check application logs regularly
   - Monitor disk space and resource usage in cPanel

## Support

If you encounter issues with A2 Hosting deployment:
1. Check the A2 Hosting knowledge base
2. Contact A2 Hosting support
3. Refer to our project documentation in the `docs/` directory 