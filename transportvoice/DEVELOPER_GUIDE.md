# TransportVoice Developer Guide

This guide will help you set up, run, and deploy the TransportVoice application. It's designed to be beginner-friendly while covering all the necessary steps.

## Table of Contents

1. [Getting Started](#getting-started)
2. [Development Environment](#development-environment)
3. [Project Structure](#project-structure)
4. [Working with the Application](#working-with-the-application)
5. [Preparing for Production](#preparing-for-production)
6. [Deployment Process](#deployment-process)
7. [Troubleshooting](#troubleshooting)

## Getting Started

### Prerequisites

Before you begin, make sure you have the following installed:

- **Node.js** (version 18.0.0 or higher) - [Download Node.js](https://nodejs.org/)
- **npm** (usually comes with Node.js)
- A code editor like **Visual Studio Code** - [Download VS Code](https://code.visualstudio.com/)

### Installing the Application

1. **Clone the repository** (or unzip the project if you received it as a file):

```bash
git clone <repository-url>
cd transportvoice
```

2. **Install all dependencies** at once using the provided script:

```bash
npm run install:all
```

This command installs dependencies for:
- The root project
- The client (React frontend)
- The server (Express backend)

## Development Environment

### Running the Application in Development Mode

To start both the client and server in development mode:

```bash
npm run dev
```

This will:
- Start the server on port 5000
- Start the client on port 3000
- Enable hot reloading (changes you make will update automatically)

### Running Client or Server Individually

If you want to run just one part of the application:

**Server only:**
```bash
npm run server:dev
```

**Client only:**
```bash
npm run client
```

### Accessing the Application

- Frontend: Open your browser and go to `http://localhost:3000`
- Backend API: Available at `http://localhost:5000/api`
- Test API status: `http://localhost:5000/api/status`

## Project Structure

The project is organized into two main parts:

```
transportvoice/
├── client/               # React frontend
│   ├── public/           # Static files
│   │   ├── img/          # Images folder
│   │   │   └── hero-bg.jpg # Background image for the home page hero section
│   │   └── manifest.json # Web app manifest
│   └── src/              # React source code
│       ├── components/   # Reusable UI components
│       ├── pages/        # Page components
│       ├── App.js        # Main React component
│       └── index.js      # Entry point
│
├── server/               # Express backend
│   ├── src/              # Server source code
│   │   ├── api/          # API routes
│   │   └── index.js      # Server entry point
│
├── package.json          # Root package.json with scripts
├── README.md             # Project README
└── DEVELOPER_GUIDE.md    # This guide
```

## Working with the Application

### Understanding Environment Variables

The application uses environment variables to manage configuration settings:

**Client Environment Variables** (in `client/.env`):
```
REACT_APP_API_URL=http://localhost:5000/api
```

**Server Environment Variables** (in `server/.env`):
```
PORT=5000
NODE_ENV=development
```

### Making Changes to the Code

1. **Frontend (React):**
   - Edit files in the `client/src` directory
   - Changes will automatically appear in your browser (in development mode)

2. **Backend (Express):**
   - Edit files in the `server/src` directory
   - The server will automatically restart when you save changes (in development mode)

## Preparing for Production

Before deploying to a live server, you need to make several changes to prepare the application for production:

### 1. Replace Placeholder Images

In the development environment, we use placeholder files for images. For production, you need real image files:

- **favicon.ico** - The icon shown in browser tabs (typically 16x16, 32x32, and 48x48 pixels)
- **logo192.png** - Small logo for PWA (192x192 pixels)
- **logo512.png** - Large logo for PWA (512x512 pixels)
- **img/hero-bg.jpg** - Background image for the home page hero section (ideally 1920x1080 pixels)

To replace these files:
1. Create or obtain these image files
2. Place them in the correct locations in the `client/public` directory
3. Make sure they have the exact names mentioned above

### 2. Update Environment Variables for Production

**Client Environment Variables:**

Edit `client/.env`:
```
REACT_APP_API_URL=https://yourdomain.com/api
```

**Server Environment Variables:**

Edit `server/.env`:
```
PORT=5000
NODE_ENV=production
```

### 3. Build the Client for Production

Create an optimized production build of the React application:

```bash
npm run build
```

This creates a `build` folder inside the `client` directory containing optimized static files.

## Deployment Process

### Deploying to a Web Server

Here's how to deploy your application to a typical web server using PuTTY (SSH client for Windows):

1. **Connect to your server with PuTTY**
   - Enter your server's hostname or IP address
   - Use your username and password or SSH key

2. **Navigate to your deployment directory**
   ```bash
   cd /path/to/deployment
   ```

3. **Transfer your files to the server**
   - You can use SFTP, Git, or any other method
   - Make sure to include the entire project structure

4. **Set up environment variables on the server**
   ```bash
   # Edit the server .env file
   nano server/.env
   
   # Add the following (with your values):
   PORT=5000
   NODE_ENV=production
   
   # Edit the client .env file before building
   nano client/.env
   
   # Add the following (with your domain):
   REACT_APP_API_URL=https://yourdomain.com/api
   ```

5. **Install dependencies**
   ```bash
   npm run install:all
   ```

6. **Build the client for production**
   ```bash
   npm run client:build
   ```

7. **Start the server in production mode**
   
   For testing:
   ```bash
   npm start
   ```

   For keeping the server running after closing PuTTY (using PM2):
   ```bash
   # Install PM2 if not already installed
   npm install -g pm2
   
   # Start the application with PM2
   pm2 start server/src/index.js --name transportvoice
   
   # Make sure PM2 starts on server reboot
   pm2 startup
   pm2 save
   ```

8. **Configure your domain and web server (Nginx or Apache)**
   
   This step varies depending on your hosting provider, but you'll typically need to:
   - Point your domain to your server
   - Configure a reverse proxy to direct traffic to your Node.js application
   - Set up SSL certificates for HTTPS

### Example Nginx Configuration

```nginx
server {
    listen 80;
    server_name yourdomain.com;
    
    # Redirect HTTP to HTTPS
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name yourdomain.com;
    
    # SSL certificate configuration
    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;
    
    # Proxy API requests to the Node.js server
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
    
    # Serve static React app files
    location / {
        root /path/to/transportvoice/client/build;
        index index.html;
        try_files $uri $uri/ /index.html;
    }
}
```

## Troubleshooting

### Common Issues and Solutions

**Problem: 'npm run dev' returns an error**
- Make sure all dependencies are installed with `npm run install:all`
- Check that you have Node.js version 18 or higher

**Problem: Changes not appearing in the browser**
- Make sure you're running in development mode with `npm run dev`
- Try clearing your browser cache
- Check the console for errors (F12 in most browsers)

**Problem: API endpoints not working**
- Ensure the server is running (check terminal for messages)
- Verify that the API URL in `client/.env` is correct
- Check if your browser is blocking requests (CORS issues)

**Problem: Images not appearing in production**
- Confirm you've replaced all placeholder files with actual images
- Check file permissions on the server
- Verify file paths and names match exactly what's expected

**Problem: Application crashes on the server**
- Check the server logs: `pm2 logs` if using PM2
- Make sure environment variables are set correctly
- Verify that your server has enough memory and resources

### Getting Help

If you encounter an issue not covered here:
1. Check the error message for clues
2. Search online for the specific error
3. Ask for help from a team member or developer community
4. Consider using tools like ChatGPT to understand error messages

## Additional Resources

- [React Documentation](https://reactjs.org/docs/getting-started.html)
- [Express.js Documentation](https://expressjs.com/)
- [Node.js Documentation](https://nodejs.org/en/docs/)
- [PM2 Documentation](https://pm2.keymetrics.io/docs/usage/quick-start/)
- [Nginx Documentation](https://nginx.org/en/docs/)

---

This guide is meant to help you get started. As you become more familiar with the project, you'll discover more advanced features and techniques. 