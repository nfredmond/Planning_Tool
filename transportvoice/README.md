# TransportVoice - Community Engagement Platform for Transportation Planning

TransportVoice is an open-source transportation planning community outreach mapping tool that enables meaningful public participation in transportation planning processes.

## Features

- Interactive map interface for community feedback
- Comment system with image upload support
- Upvoting/downvoting on community comments
- AI-powered moderation and analysis
- Admin dashboard for project management with role-based access control
- Customizable basemaps and KMZ/KML layer support
- Extensive reporting and analytics
- Social media sharing integration
- Collaborative design tools for transportation planning
- Long-term maintenance planning capabilities
- Cross-departmental collaboration utilities
- Accessibility and inclusive design features
- Educational components for public understanding
- Emergency resilience planning tools
- Authentication system with email verification
- Modern UI built with Material UI components

## Project Structure

The project is organized as follows:
- `client/`: Frontend React application with React Router v6 and Material UI
- `server/`: Backend Node.js application
- `database/`: Database migration and seed files
- `docker/`: Docker configuration files

For a complete project structure overview, see the [project-structure.txt](../project-structure.txt) file.

## Getting Started

For a quick start, follow the basic instructions below. For a detailed, beginner-friendly guide, please refer to the [User Manual](./USER_MANUAL.md).

### Prerequisites
- Node.js (v16 or later) - [Download here](https://nodejs.org/en/download/)
- PostgreSQL with PostGIS extension - [Download here](https://www.postgresql.org/download/windows/)
- Docker (optional, for containerized deployment) - [Download here](https://www.docker.com/products/docker-desktop/)

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/transportvoice.git
cd transportvoice
```

2. Install dependencies
```bash
# Install client dependencies
cd client
npm install

# Install server dependencies
cd ../server
npm install
```

3. Set up environment variables
```bash
# Copy example environment files
cp client/.env.example client/.env
cp server/.env.example server/.env

# Edit the environment files with your configuration
```

4. Run database migrations
```bash
cd server
npm run migrate
```

5. Start the development servers
```bash
# Start the client
cd client
npm run dev

# In another terminal, start the server
cd server
npm run dev
```

## Application Routes

The application includes the following routes:

### Public Routes
- `/` - Home page
- `/login` - User login
- `/register` - User registration
- `/forgot-password` - Password recovery
- `/reset-password/:token` - Password reset
- `/verify-email/:token` - Email verification
- `/projects` - Projects list
- `/projects/:slug` - Individual project view

### Admin Routes
- `/admin/*` - Admin dashboard (requires admin or moderator role)

## Additional Modules

The project includes several additional Python modules that enhance its functionality:

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

## Deployment for Beginners

If you're new to coding or deployment, we've created a step-by-step guide specifically for beginners. Please check out our [User Manual](./USER_MANUAL.md) for detailed instructions with screenshots and explanations.

## Docker Deployment

For containerized deployment using Docker:

1. Make sure Docker and Docker Compose are installed on your system
2. Navigate to the project root directory
3. Create a `.env` file in the project root with your configuration:
   ```bash
   cp .env.example .env
   ```
4. If you encounter port conflicts, modify your `.env` file:
   ```
   CLIENT_PORT=3001  # If port 3000 is already in use
   SERVER_PORT=5001  # If port 5000 is already in use
   MONGO_PORT=27018  # If port 27017 is already in use
   ```
5. Run the following command to start all services:
   ```bash
   docker-compose -f docker/docker-compose.yml up -d
   ```
6. Access the application at:
   - Frontend: http://localhost:${CLIENT_PORT:-3000}
   - API: http://localhost:${SERVER_PORT:-5000}

For production deployment with HTTPS:
1. Update the domain name in `docker/nginx/production.conf`
2. Start the containers with the production profile:
   ```bash
   docker-compose -f docker/docker-compose.yml --profile production up -d
   ```

For more details, see the [User Manual](./USER_MANUAL.md).

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Built with React, TypeScript, Node.js, and PostgreSQL
- UI components from Material UI
- Date handling with date-fns
- Routing with React Router v6
- Mapping powered by Mapbox GL JS
- AI integration supports multiple LLM providers 