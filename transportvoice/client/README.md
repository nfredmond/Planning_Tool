# TransportVoice Client

The frontend React application for TransportVoice, a collaborative transportation planning platform.

## Collaborative Design Tools

TransportVoice includes a comprehensive set of collaborative design tools for transportation planning and urban design. These tools allow stakeholders to:

- Create and compare multiple design alternatives for transportation projects
- Collaborate in real-time with commenting and feedback features
- Use pre-built templates for common transportation designs
- Visualize transportation plans on interactive maps
- Share designs with stakeholders and collect input

### Key Components

The collaborative design tools include:

1. **DesignWorkspace**: The main workspace for creating and editing designs, featuring:
   - Interactive Mapbox-based editor
   - Drawing tools for transportation elements
   - Properties panel for styling and configuring elements
   - Measurement tools
   - Version control
   - Collaborative commenting

2. **ElementPalette**: Library of transportation-specific elements that can be added to designs:
   - Bike lanes, pedestrian paths, and transit routes
   - Urban features like buildings, parks, and parking
   - Points of interest and transit stops

3. **DesignComments**: Commenting system that allows stakeholders to provide feedback:
   - Location-specific comments tied to map coordinates
   - Threading for discussions
   - Upvoting/downvoting comments
   - Comment management tools

4. **VersionHistory**: Version control system for tracking design iterations:
   - Compare different design alternatives
   - Restore previous versions
   - Track changes over time

5. **DesignTemplateLibrary**: Repository of reusable design templates:
   - Common transportation patterns
   - Best practice designs
   - Community-contributed templates

## Getting Started

### Prerequisites

- Node.js 14 or later
- npm or yarn

### Installation

1. Clone the repository
```
git clone https://github.com/your-organization/transportvoice.git
cd transportvoice/client
```

2. Install dependencies
```
npm install
```

3. Set up environment variables
Create a `.env` file in the client directory with the following:
```
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_MAPBOX_TOKEN=your_mapbox_token_here
```

4. Start the development server
```
npm start
```

## Usage

To access the design tools, navigate to:
- `/projects/:projectId/designs` - View all design alternatives for a project
- `/projects/:projectId/designs/:designId` - Open a specific design in the workspace

## Technology Stack

- **React**: Frontend library
- **TypeScript**: Type safety and developer experience
- **Material UI**: Component library for consistent design
- **Mapbox GL**: Interactive mapping library
- **Mapbox Draw**: Drawing tools for maps
- **React Router**: Client-side routing
- **Axios**: API client
- **styled-components**: Component styling

## Contributing

Please read our [Contributing Guide](../CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE](../LICENSE) file for details. 