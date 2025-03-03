# Planning Tool

A comprehensive planning application with features for transportation planning, public engagement, and administrative tools.

## Features

- **Interactive Maps**: Create and edit maps for transportation planning
- **Community Engagement**: Collect feedback and engage with the community
- **Admin Dashboard**: Manage projects, users, comments, and settings
- **Reporting**: Generate reports on project data and engagement metrics
- **AI Integration**: Leverage multiple AI providers for enhanced functionality
- **Voice Comments**: Allow users to leave voice comments for improved accessibility

## Admin Settings

The Admin Settings page provides configuration options for integrating and controlling various backend Python modules:

### Accessibility & Inclusive Design

Settings for accessibility features implemented in `accessibility_inclusive_design.py`:
- Universal Design Integration
- Multi-language Support
- Low-bandwidth Mode
- Screen Reader Optimization
- Cultural Sensitivity Analysis

### Collaborative Design Tools

Settings for collaborative tools implemented in `collaborative_design_tools.py`:
- Real-time Design Collaboration
- Version History Management
- Design Commenting System
- Design Template Library
- Measurement Tools
- Export and Sharing

### Cross-Departmental Collaboration

Settings for cross-department collaboration implemented in `cross_departmental_collaboration.py`:
- Department Integration
- Approval Workflow
- Document Sharing
- Integrated Calendar
- Notification System

### Data Privacy & Security

Settings for data privacy features implemented in `data_privacy_security.py`:
- Data Retention Policy
- Anonymization Settings
- Encryption Level
- User Consent Management
- Data Export Options

### Engagement Enhancements

Settings for community engagement features implemented in `engagement_enhancements.py`:
- Scenario Testing: Create and compare multiple scenarios for project areas
- Gamification Elements: Award badges to users for quality contributions
- Virtual Community Meetings: Integrate video conferencing with interactive whiteboarding
- Follow-up Engagement Loops: Automatically notify commenters when their suggestions are addressed

### Educational Components

Settings for educational features implemented in `educational_components.py`:
- Tutorial Management
- Contextual Help System
- Glossary Management
- Publication Library
- Community Workshop Tools

### Emergency Resilience Planning

Settings for emergency planning features implemented in `emergency_resilience_planning.py`:
- Disaster Response Planning
- Evacuation Routing
- Emergency Services Integration
- Alert System
- Infrastructure Vulnerability Assessment

### Global Knowledge Exchange

Settings for knowledge exchange implemented in `global_knowledge_exchange.py`:
- International Case Studies
- Best Practices Library
- Peer City Network
- Translation Services
- International Standards Compliance

### Implementation Tools

Settings for implementation tools implemented in `implementation_tools.py`:
- Project Tracker
- Cost Estimation
- Timeline Visualization
- Resource Allocation
- Construction Phasing

### Long-term Maintenance Planning

Settings for maintenance planning implemented in `long_term_maintenance_planning.py`:
- Asset Lifecycle Management
- Scheduled Maintenance
- Condition Assessment
- Predictive Analytics
- Cost Projection

## Development

### Branching Strategy

This project uses a structured Git branching strategy to separate development work from production-ready code:

- **`main`** branch contains the stable, production-ready code
- **`development`** branch is where all development work is integrated before moving to production
- Feature branches and bugfix branches are created from `development`

For detailed information on the branching workflow, please see [BRANCHING.md](BRANCHING.md).

### Prerequisites

- Node.js 20+
- npm 10+
- Python 3.11+
- Docker and Docker Compose (for containerized deployment)

### Installation

1. Clone the repository
2. Install frontend dependencies:
   ```
   npm install
   ```
3. Install backend dependencies:
   ```
   pip install -r requirements.txt
   ```
4. Set up environment variables:
   - Copy `.env.example` to `.env.local`:
     ```
     cp .env.example .env.local
     ```
   - Edit `.env.local` and add your API keys:
     - `REACT_APP_OPENAI_API_KEY`: Your OpenAI API key
     - `REACT_APP_ANTHROPIC_API_KEY`: Your Anthropic API key
     - `REACT_APP_GEMINI_API_KEY`: Your Google Gemini API key
     - Adjust other settings as needed

### Running the Application

#### Local Development

1. Start the frontend:
   ```
   npm start
   ```
   
   If you see a message about port 3000 being in use:
   ```
   ? Something is already running on port 3000.
   Would you like to run the app on another port instead? » (Y/n)
   ```
   
   You can:
   - Press 'Y' to use an alternative port (recommended)
   - Press 'n' to cancel and manually stop the service using port 3000
   - Alternatively, specify a different port when starting: `PORT=3001 npm start`

2. Start the backend:
   ```
   python manage.py runserver
   ```

#### Using Docker (Recommended)

1. Make sure Docker and Docker Compose are installed
2. Build and start the containers:
   ```
   docker-compose -f transportvoice/docker/docker-compose.yml up -d
   ```
3. Access the application at http://localhost:3000

   The Docker setup includes the following services:
   - MongoDB 7.0 database with persistent storage
   - NodeJS 20 backend server with all Python modules
   - React frontend with Nginx
   - Nginx reverse proxy and SSL support (production only)
   - Certbot for SSL certificate management (production only)
   
   Note: If you encounter port conflicts with Docker, you can modify the port mappings in the docker-compose.yml file:
   ```
   ports:
     - "3001:80"  # Change 3000 to an available port
   ```

4. For production deployment:
   ```
   # First update your domain name
   export DOMAIN_NAME=yourdomain.com
   
   # Then start with production profile
   docker-compose -f transportvoice/docker/docker-compose.yml --profile production up -d
   ```

#### Using A2 Hosting with cPanel

The application is configured for automatic deployment using A2 Hosting's Git Version Control feature:

1. Setup A2 Hosting account with cPanel access
2. In cPanel, go to "Git Version Control" and create a new repository
3. Connect your GitHub repository by setting the remote URL
4. The `.cpanel.yml` file in the repository root handles the deployment configuration
5. Use the "Deploy HEAD Commit" button in cPanel to deploy changes
6. For automatic deployment, set up webhooks as described in the A2 Hosting documentation

For detailed deployment instructions, refer to the documentation in the `docs/` directory.

## API Integration

The application uses REST APIs to communicate between the frontend and backend Python modules. API endpoints are documented in `src/api/configurationAPI.ts`.

## Contributing

Please read CONTRIBUTING.md for details on our code of conduct and the process for submitting pull requests. 