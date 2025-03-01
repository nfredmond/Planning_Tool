# TransportVoice User Manual for Beginners

This guide provides step-by-step instructions for deploying the TransportVoice platform on a Windows PC, specifically designed for beginners with minimal coding experience.

## Table of Contents

1. [Setting Up Your Environment](#setting-up-your-environment)
2. [Installing the Application](#installing-the-application)
3. [Configuring the Application](#configuring-the-application)
4. [Running the Application](#running-the-application)
5. [Authentication System](#authentication-system)
6. [Using Additional Modules](#using-additional-modules)
7. [Deploying to Production](#deploying-to-production)
8. [Troubleshooting](#troubleshooting)

## Setting Up Your Environment

Before you can run TransportVoice, you need to set up your development environment. This involves installing several tools and software components.

### 1. Install Node.js

Node.js is the JavaScript runtime that powers the TransportVoice server.

1. Visit the [Node.js download page](https://nodejs.org/en/download/)
2. Download the Windows Installer (.msi) for the LTS (Long Term Support) version
3. Run the installer and follow the installation wizard:
   - Accept the license agreement
   - Choose the default installation location
   - Click "Next" through the remaining steps
   - Click "Install"
4. Verify the installation by opening Command Prompt and typing:
   ```
   node --version
   npm --version
   ```
   You should see version numbers displayed for both commands.

### 2. Install Git

Git is a version control system used to download and manage the application code.

1. Visit the [Git download page](https://git-scm.com/download/win)
2. Download the Windows installer
3. Run the installer and follow these steps:
   - Accept the license agreement
   - Choose the default installation location
   - Select components (default options are fine)
   - Choose the default editor (Notepad is fine for beginners)
   - Choose "Use Git from the Windows Command Prompt" 
   - Choose "Use the OpenSSL library"
   - Choose "Checkout Windows-style, commit Unix-style line endings"
   - Choose "Use Windows' default console window"
   - Accept the remaining default options
4. Verify the installation by opening Command Prompt and typing:
   ```
   git --version
   ```
   You should see a version number displayed.

### 3. Install PostgreSQL with PostGIS

PostgreSQL is the database system used by TransportVoice, and PostGIS adds geographic data capabilities.

1. Visit the [PostgreSQL download page](https://www.postgresql.org/download/windows/)
2. Click on the download link for the Windows installer
3. Run the installer and follow these steps:
   - Accept the license agreement
   - Choose the default installation directory
   - Choose the default data directory
   - Set a password for the database superuser (postgres) - **IMPORTANT: Remember this password!**
   - Use the default port (5432)
   - Select the default locale
   - Click "Next" to start the installation
4. When the installation completes, the Stack Builder utility might launch automatically
   - Make sure your PostgreSQL server is selected in the dropdown
   - Check "Spatial Extensions" > "PostGIS X.X for PostgreSQL X.X"
   - Click Next and follow the instructions to install PostGIS
5. Verify the installation by opening the pgAdmin application (installed with PostgreSQL)
   - Log in using the password you created
   - You should see your PostgreSQL server in the browser panel

## Installing the Application

Now that you have set up your environment, you can install the TransportVoice application.

### 1. Download the Application Code

1. Open Command Prompt
2. Navigate to the directory where you want to store the application, for example:
   ```
   cd C:\Projects
   ```
   (If the directory doesn't exist, create it first using `mkdir C:\Projects`)
3. Clone the repository:
   ```
   git clone https://github.com/yourusername/transportvoice.git
   ```
4. Navigate to the project directory:
   ```
   cd transportvoice
   ```

### 2. Install Dependencies

The application has two main parts: the client (frontend) and the server (backend). You need to install dependencies for both.

1. Install client dependencies:
   ```
   cd client
   npm install
   ```
   This may take several minutes to complete.

2. Install server dependencies:
   ```
   cd ..\server
   npm install
   ```
   This may also take several minutes.

## Configuring the Application

Before running the application, you need to configure it with the correct settings.

### 1. Set Up Environment Variables

Environment variables are settings that the application needs to run correctly.

1. Create client environment file:
   ```
   cd ..\client
   copy .env.example .env
   ```

2. Create server environment file:
   ```
   cd ..\server
   copy .env.example .env
   ```

3. Edit the server environment file:
   - Open the `.env` file in Notepad:
     ```
     notepad .env
     ```
   - Update the database connection settings with your PostgreSQL information:
     ```
     DB_HOST=localhost
     DB_PORT=5432
     DB_NAME=transportvoice
     DB_USER=postgres
     DB_PASSWORD=your_password_here  # Use the password you set during PostgreSQL installation
     ```
   - Save and close the file

### 2. Create the Database

1. Open pgAdmin (search for it in the Windows Start menu)
2. Enter your password when prompted
3. In the browser panel, expand "Servers" > "PostgreSQL x.x" 
4. Right-click on "Databases" and select "Create" > "Database"
5. Enter "transportvoice" as the name and click "Save"

### 3. Run Database Migrations

Database migrations set up the necessary tables and data structures.

1. In Command Prompt, navigate to the server directory (if you're not already there):
   ```
   cd C:\Projects\transportvoice\server
   ```
2. Run the migrations:
   ```
   npm run migrate
   ```

## Authentication System

TransportVoice includes a complete authentication system with several important features:

### User Registration

1. Navigate to `/register` in your browser
2. Fill in the registration form with your email, password, and other required information
3. Submit the form
4. Check your email for a verification link
5. Click the verification link to activate your account

### User Login

1. Navigate to `/login` in your browser
2. Enter your email and password
3. Click "Login"

### Password Recovery

If you forget your password:
1. Navigate to `/forgot-password`
2. Enter your email address
3. Check your email for a password reset link
4. Click the link which will take you to `/reset-password/{token}`
5. Enter your new password and confirm it
6. Your password will be updated and you can now log in with the new credentials

### Admin Access

Admin functionality is restricted to users with admin or moderator roles:
1. Login with an admin account
2. Navigate to `/admin` to access the admin dashboard
3. Manage projects, users, and settings from the dashboard

## Running the Application

After installation and configuration, you can run the application locally:

### Starting the Development Servers

1. Open Command Prompt and navigate to your project directory
2. To start the client:
   ```
   cd client
   npm run dev
   ```
3. Open another Command Prompt window and navigate to your project directory
4. To start the server:
   ```
   cd server
   npm run dev
   ```
5. The application should now be running at `http://localhost:3000`

### Navigating the Application

The application includes the following pages:

- **Home Page** (`/`): Overview of available transportation projects
- **Projects List** (`/projects`): Browse all available projects
- **Project Details** (`/projects/{slug}`): View details of a specific project and add comments
- **Login** (`/login`): User login page
- **Register** (`/register`): New user registration
- **Forgot Password** (`/forgot-password`): Password recovery
- **Admin Dashboard** (`/admin`): Administration interface (requires admin/moderator role)

## Using Additional Modules

TransportVoice includes several Python modules that enhance its functionality. These modules are located in the root `src` directory of the project.

### Available Modules

- **Implementation Tools**: Utilities for implementing transportation projects
- **Collaborative Design Tools**: Interactive design features for transportation planning
- **Long-term Maintenance Planning**: Tools for planning maintenance schedules
- **Global Knowledge Exchange**: Utilities for sharing transportation knowledge globally
- **Cross-departmental Collaboration**: Features for team collaboration across departments
- **Data Privacy & Security**: Utilities for ensuring data protection and security
- **Emergency Resilience Planning**: Tools for planning transportation emergency responses
- **Educational Components**: Features for public education about transportation projects
- **Accessibility & Inclusive Design**: Tools for ensuring accessibility in transportation planning
- **Engagement Enhancements**: Features to improve public engagement with transportation projects

### Running Python Modules

To use these additional modules, you'll need Python installed on your system.

1. Install Python (if not already installed):
   - Visit the [Python download page](https://www.python.org/downloads/windows/)
   - Download the latest Windows installer (choose "Add Python to PATH" during installation)
   - Verify the installation by opening Command Prompt and typing:
     ```
     python --version
     ```

2. Navigate to the project root directory:
   ```
   cd C:\Projects\transportvoice
   ```

3. Run a module (example with the collaborative design tools):
   ```
   python src/collaborative_design_tools.py
   ```

### Integrating with the Main Application

The Python modules can be used both independently and in conjunction with the main TransportVoice application. To integrate them:

1. Make sure both the client and server applications are running
2. Access the relevant feature in the web interface
3. The application will automatically invoke the necessary Python scripts when needed

For more detailed documentation on each module, refer to the comments within each Python file.

## Deploying to Production

For beginners, we recommend using your hosting provider's documentation for production deployment. However, here's a simplified guide for basic deployment options.

### Option 1: Using a Hosting Service

Services like [Vercel](https://vercel.com/) (for frontend) and [Render](https://render.com/) (for backend) offer free tiers for small projects.

1. Create accounts on these platforms
2. Follow their documentation to connect to your GitHub repository
3. Set the environment variables on these platforms according to your setup

### Option 2: Using Docker

If you installed Docker Desktop as mentioned in the prerequisites:

1. Navigate to the project root:
   ```
   cd path\to\transportvoice
   ```
2. Build and start the Docker containers:
   ```
   docker-compose -f docker/docker-compose.yml up -d
   ```
3. The application will be available at:
   - Frontend: `http://localhost:3000`
   - API: `http://localhost:5000`

For production deployment with HTTPS:

1. Update the domain name in `docker/nginx/production.conf` to your actual domain
2. Start the containers with the production profile:
   ```
   docker-compose -f docker/docker-compose.yml --profile production up -d
   ```
3. Set up SSL certificates with Let's Encrypt:
   ```
   docker-compose -f docker/docker-compose.yml exec certbot certbot --nginx -d yourdomain.com -d www.yourdomain.com
   ```

For more advanced deployment options, please consult with someone experienced in web deployment or check our advanced documentation.

## Troubleshooting

### Common Issues and Solutions

1. **Node.js Version Error**
   - Error: "The engine "node" is incompatible with this module"
   - Solution: Make sure you have Node.js v16 or later installed
   
2. **Database Connection Error**
   - Error: "Error connecting to database"
   - Solution: Check that:
     - PostgreSQL is running
     - Your database name, username, and password are correct in the `.env` file
     - The database "transportvoice" exists

3. **Port Already in Use**
   - Error: "Error: listen EADDRINUSE: address already in use"
   - Solution: Either:
     - Close the application using that port
     - Change the port in the `.env` file

4. **Missing Dependencies**
   - Error: "Cannot find module 'some-module'"
   - Solution:
     ```
     cd client    # or cd server, depending on where the error is
     npm install
     ```

5. **PostGIS Extension Not Available**
   - Error related to PostGIS functions
   - Solution: Make sure you installed the PostGIS extension during PostgreSQL setup

### Getting Help

If you encounter issues not covered in this guide:

1. Check the project's GitHub Issues page
2. Search for your error message online 
3. Reach out to the project maintainers

Remember, everyone starts somewhere—don't be afraid to ask for help! 