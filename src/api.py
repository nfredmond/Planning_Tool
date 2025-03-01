"""
API for Implementation Tools

This module provides a Flask API for the implementation tools in implementation_tools.py.
This allows the frontend timeline visualizer to connect to the backend.
"""

from flask import Flask, request, jsonify, abort
from flask_cors import CORS
import json
import os
import sys
from pathlib import Path

# Import implementation tools
from implementation_tools import (
    implementation_timeline_visualizer,
    save_timeline_data,
    funding_source_matching,
    regulatory_compliance_tracker,
    outcome_measurement
)

app = Flask(__name__)
CORS(app)  # Enable Cross-Origin Resource Sharing

# Ensure data directories exist
Path("data/implementation").mkdir(parents=True, exist_ok=True)
Path("data/regulatory").mkdir(parents=True, exist_ok=True)
Path("data/outcomes").mkdir(parents=True, exist_ok=True)
Path("data/designs").mkdir(parents=True, exist_ok=True)

@app.route('/api/implementation-timeline/<project_id>', methods=['GET'])
def get_implementation_timeline(project_id):
    """Get the implementation timeline for a project.
    
    Args:
        project_id: The ID of the project.
        
    Returns:
        JSON response with timeline data.
    """
    output_format = request.args.get('format', 'json')
    result = implementation_timeline_visualizer(project_id, output_format)
    return jsonify(result)

@app.route('/api/implementation-timeline/<project_id>', methods=['POST'])
def update_implementation_timeline(project_id):
    """Update the implementation timeline for a project.
    
    Args:
        project_id: The ID of the project.
        
    Returns:
        JSON response with status.
    """
    timeline_data = request.json
    if not timeline_data:
        return jsonify({"success": False, "message": "No data provided"}), 400
    
    result = save_timeline_data(project_id, timeline_data)
    return jsonify(result)

@app.route('/api/funding-sources', methods=['POST'])
def match_funding_sources():
    """Find matching funding sources based on project characteristics and community priorities.
    
    Returns:
        JSON response with matching funding sources.
    """
    data = request.json
    if not data:
        return jsonify({"success": False, "message": "No data provided"}), 400
    
    project_characteristics = data.get('project_characteristics', {})
    community_priorities = data.get('community_priorities', [])
    
    result = funding_source_matching(project_characteristics, community_priorities)
    return jsonify(result)

@app.route('/api/regulatory-compliance/<project_id>', methods=['GET'])
def get_regulatory_compliance(project_id):
    """Get regulatory compliance requirements for a project.
    
    Args:
        project_id: The ID of the project.
        
    Returns:
        JSON response with compliance requirements.
    """
    result = regulatory_compliance_tracker(project_id)
    return jsonify(result)

@app.route('/api/regulatory-compliance', methods=['POST'])
def generate_regulatory_compliance():
    """Generate regulatory compliance requirements based on project type and location.
    
    Returns:
        JSON response with generated compliance requirements.
    """
    data = request.json
    if not data:
        return jsonify({"success": False, "message": "No data provided"}), 400
    
    project_id = data.get('project_id')
    project_type = data.get('project_type')
    location = data.get('location', {})
    
    if not project_type:
        return jsonify({"success": False, "message": "Project type is required"}), 400
    
    result = regulatory_compliance_tracker(project_id, project_type, location)
    return jsonify(result)

@app.route('/api/outcome-measurement/<project_id>', methods=['GET'])
def get_outcome_measurement(project_id):
    """Get outcome measurement data for a project.
    
    Args:
        project_id: The ID of the project.
        
    Returns:
        JSON response with outcome measurement data.
    """
    measurement_type = request.args.get('type', 'survey')
    result = outcome_measurement(project_id, measurement_type)
    return jsonify(result)

@app.route('/api/outcome-measurement/templates', methods=['GET'])
def get_outcome_templates():
    """Get outcome measurement templates.
    
    Returns:
        JSON response with templates.
    """
    measurement_type = request.args.get('type', 'survey')
    result = outcome_measurement(None, measurement_type)
    return jsonify(result)

@app.route('/api/health', methods=['GET'])
def health_check():
    """API health check endpoint.
    
    Returns:
        JSON response with API status.
    """
    return jsonify({
        "status": "healthy",
        "message": "Implementation Tools API is running",
        "version": "1.0.0"
    })

if __name__ == '__main__':
    # Get port from environment variable or use default
    port = int(os.environ.get('SERVER_PORT', 5001))
    # Run the Flask app
    app.run(host='0.0.0.0', port=port, debug=True) 