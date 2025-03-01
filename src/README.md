# Implementation Tools

This directory contains the implementation tools for the transportation planning application. These tools help community members track the implementation of transportation projects, find funding sources, ensure regulatory compliance, and measure outcomes.

## Features

1. **Implementation Timeline Visualizer**: Show community members the phases of project development with real-time progress tracking.
2. **Funding Source Matching**: Suggest potential funding sources or grants based on project characteristics and community priorities.
3. **Regulatory Compliance Tracker**: Help track necessary permits, environmental reviews, and other regulatory requirements.
4. **Outcome Measurement**: Add post-implementation surveys and data collection to measure project success against stated goals.
5. **Collaborative Design Tools**: Enables real-time collaboration on design alternatives with commenting, version history, and template libraries.

## Getting Started

### Prerequisites

- Python 3.8 or higher
- Flask (for the API)
- Node.js and npm (for the frontend)

### Installation

1. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

2. Start the Flask API:
   ```bash
   python src/api.py
   ```

3. The API will be available at `http://localhost:5001`

## Connecting Frontend to Backend

The frontend timeline visualizer component (`transportvoice/client/src/components/visualization/timeline-visualizer.js`) has been updated to connect to the backend API. The component:

1. Attempts to fetch data from the API first
2. Falls back to mock data if the API request fails or returns no data
3. Provides functionality to save timeline updates back to the API

To use the API in your frontend application:

1. Set the `REACT_APP_API_URL` environment variable to your API URL, or it will default to `http://localhost:5001/api`
2. Pass a `projectId` prop to the `ImplementationTimelineVisualizer` component to load data for that project

## API Endpoints

### Implementation Timeline

- `GET /api/implementation-timeline/{project_id}` - Get timeline data for a project
- `POST /api/implementation-timeline/{project_id}` - Update timeline data for a project

### Funding Sources

- `POST /api/funding-sources` - Find matching funding sources based on project characteristics and community priorities

### Regulatory Compliance

- `GET /api/regulatory-compliance/{project_id}` - Get regulatory compliance requirements for a project
- `POST /api/regulatory-compliance` - Generate regulatory compliance requirements based on project type and location

### Outcome Measurement

- `GET /api/outcome-measurement/{project_id}` - Get outcome measurement data for a project
- `GET /api/outcome-measurement/templates` - Get outcome measurement templates

## Data Storage

The implementation tools store data in JSON files in the following directories:

- `data/implementation/` - Implementation timeline data
- `data/regulatory/` - Regulatory compliance data
- `data/outcomes/` - Outcome measurement data
- `data/designs/` - Collaborative design data

## Example Usage

### Frontend Example

```javascript
import React from 'react';
import ImplementationTimelineVisualizer from './components/visualization/timeline-visualizer';

const ProjectPage = ({ projectId }) => {
  return (
    <div>
      <h1>Project Implementation Timeline</h1>
      <ImplementationTimelineVisualizer projectId={projectId} />
    </div>
  );
};

export default ProjectPage;
```

### API Example (Python)

```python
import requests

# Get timeline data for a project
response = requests.get('http://localhost:5001/api/implementation-timeline/proj-001')
timeline_data = response.json()

# Find matching funding sources
project_characteristics = {
    "type": "bicycle",
    "budget": 500000,
    "location": {"city": "Portland", "state": "Oregon"},
    "focus_areas": ["safety", "connectivity"]
}
community_priorities = ["equity", "sustainability", "accessibility"]

response = requests.post(
    'http://localhost:5001/api/funding-sources',
    json={
        "project_characteristics": project_characteristics,
        "community_priorities": community_priorities
    }
)
funding_matches = response.json()

# Get regulatory compliance requirements
response = requests.post(
    'http://localhost:5001/api/regulatory-compliance',
    json={
        "project_id": "proj-001",
        "project_type": "bicycle",
        "location": {"city": "Portland", "state": "Oregon"}
    }
)
regulatory_requirements = response.json()
```

## Extending the Tools

To add more functionality:

1. Add new functions to `implementation_tools.py`
2. Add corresponding API endpoints to `api.py`
3. Update frontend components to use the new API endpoints 