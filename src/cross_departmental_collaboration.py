"""
Module: cross_departmental_collaboration.py

This module implements cross-departmental collaboration features including:
1. Inter-agency Communication Portal: Streamlined coordination between departments.
2. Shared Impact Assessment: Tools for understanding how projects affect multiple services.
3. Collaborative Budgeting: Help departments pool resources for projects with multiple benefits.
4. Unified Public Communications: Coordinate messaging across departments.
5. Service Integration Visualization: Show how transportation connects to other public services.
"""

import json
from typing import Dict, List, Optional
from datetime import datetime
import uuid


class CrossDepartmentalCollaboration:
    def __init__(self):
        # Dictionary to store communication channels between departments
        self.communication_channels = {}
        # Dictionary to store impact assessments for projects
        self.impact_assessments = {}
        # Dictionary to store collaborative budget allocations
        self.collaborative_budgets = {}
        # Dictionary to store unified communication strategies
        self.unified_communications = {}
        # Dictionary to store service integration visualizations
        self.service_integration_maps = {}

    def create_communication_channel(self, channel_name: str, description: str, 
                                   departments: List[str], access_levels: Dict[str, List[str]],
                                   notification_preferences: Dict[str, List[str]]) -> Dict:
        """
        Creates a communication channel for inter-agency coordination.
        
        Args:
            channel_name: Name of the communication channel
            description: Description of the channel's purpose
            departments: List of participating departments
            access_levels: Dictionary mapping departments to their access levels
            notification_preferences: Dictionary mapping notification types to departments
            
        Returns:
            The created communication channel
        """
        channel_id = str(uuid.uuid4())[:8]
        
        channel = {
            "channel_id": channel_id,
            "channel_name": channel_name,
            "description": description,
            "departments": departments,
            "access_levels": access_levels,
            "notification_preferences": notification_preferences,
            "created_at": datetime.now().isoformat(),
            "last_activity": datetime.now().isoformat()
        }
        
        self.communication_channels[channel_id] = channel
        print(f"Created communication channel: '{channel_name}' with ID {channel_id}")
        return channel

    def conduct_shared_impact_assessment(self, project_id: str, project_name: str,
                                       primary_department: str, related_departments: List[str],
                                       impacts: Dict[str, List[Dict]]) -> Dict:
        """
        Conducts a shared impact assessment for a transportation project.
        
        Args:
            project_id: Unique identifier for the project
            project_name: Name of the project
            primary_department: The department leading the project
            related_departments: Other departments affected by the project
            impacts: Dictionary mapping departments to lists of impacts
            
        Returns:
            The completed impact assessment
        """
        assessment = {
            "project_id": project_id,
            "project_name": project_name,
            "primary_department": primary_department,
            "related_departments": related_departments,
            "impacts": impacts,
            "cross_departmental_recommendations": [],
            "assessment_date": datetime.now().isoformat(),
            "status": "draft"
        }
        
        # Generate cross-departmental recommendations based on impacts
        for dept, dept_impacts in impacts.items():
            for impact in dept_impacts:
                if impact.get("severity", "low") in ["high", "medium"]:
                    assessment["cross_departmental_recommendations"].append({
                        "department": dept,
                        "impact_id": impact.get("id"),
                        "recommendation": f"Coordinate with {dept} regarding {impact.get('description', 'impact')}"
                    })
        
        self.impact_assessments[project_id] = assessment
        print(f"Conducted shared impact assessment for project: '{project_name}'")
        return assessment

    def create_collaborative_budget(self, budget_id: str, budget_name: str,
                                  participating_departments: Dict[str, Dict],
                                  total_amount: float, allocation_method: str,
                                  project_goals: List[str]) -> Dict:
        """
        Creates a collaborative budget for multi-benefit projects.
        
        Args:
            budget_id: Unique identifier for the budget
            budget_name: Name of the collaborative budget
            participating_departments: Dict mapping departments to their contributions
            total_amount: Total budget amount
            allocation_method: Method used to allocate resources
            project_goals: List of goals the budget aims to achieve
            
        Returns:
            The created collaborative budget
        """
        # Calculate contributions and percentages
        total_contributions = sum(dept["contribution"] for dept in participating_departments.values())
        
        # Update each department with its percentage of the total
        for dept in participating_departments.values():
            dept["percentage"] = round((dept["contribution"] / total_contributions) * 100, 2)
        
        budget = {
            "budget_id": budget_id,
            "budget_name": budget_name,
            "participating_departments": participating_departments,
            "total_amount": total_amount,
            "total_contributions": total_contributions,
            "funding_gap": max(0, total_amount - total_contributions),
            "allocation_method": allocation_method,
            "project_goals": project_goals,
            "created_at": datetime.now().isoformat(),
            "status": "planning"
        }
        
        self.collaborative_budgets[budget_id] = budget
        print(f"Created collaborative budget: '{budget_name}' with {len(participating_departments)} departments")
        return budget

    def create_unified_communication_plan(self, plan_id: str, project_id: str,
                                        lead_department: str, supporting_departments: List[str],
                                        key_messages: List[str], channels: List[Dict],
                                        timeline: List[Dict]) -> Dict:
        """
        Creates a unified public communications plan across departments.
        
        Args:
            plan_id: Unique identifier for the communication plan
            project_id: ID of the associated project
            lead_department: Department leading the communications
            supporting_departments: Other departments involved
            key_messages: List of key messages to communicate
            channels: List of communication channels and responsible departments
            timeline: List of communication events and dates
            
        Returns:
            The created communication plan
        """
        plan = {
            "plan_id": plan_id,
            "project_id": project_id,
            "lead_department": lead_department,
            "supporting_departments": supporting_departments,
            "key_messages": key_messages,
            "channels": channels,
            "timeline": timeline,
            "created_at": datetime.now().isoformat(),
            "last_updated": datetime.now().isoformat(),
            "status": "draft"
        }
        
        self.unified_communications[plan_id] = plan
        print(f"Created unified communication plan for project ID: {project_id}")
        return plan

    def create_service_integration_map(self, map_id: str, area_name: str,
                                     transportation_elements: List[Dict],
                                     connected_services: Dict[str, List[Dict]],
                                     accessibility_metrics: Dict) -> Dict:
        """
        Creates a visualization showing how transportation connects to other public services.
        
        Args:
            map_id: Unique identifier for the service map
            area_name: Name of the geographic area
            transportation_elements: List of transportation infrastructure elements
            connected_services: Dict mapping service types to lists of service locations
            accessibility_metrics: Dict of metrics about service accessibility
            
        Returns:
            The created service integration map
        """
        # Calculate total services connected
        total_services = sum(len(services) for services in connected_services.values())
        
        integration_map = {
            "map_id": map_id,
            "area_name": area_name,
            "transportation_elements": transportation_elements,
            "connected_services": connected_services,
            "total_services_connected": total_services,
            "accessibility_metrics": accessibility_metrics,
            "created_at": datetime.now().isoformat(),
            "last_updated": datetime.now().isoformat()
        }
        
        self.service_integration_maps[map_id] = integration_map
        print(f"Created service integration map for area: '{area_name}' with {total_services} connected services")
        return integration_map

    def add_department_comment(self, project_id: str, department: str, 
                             comment: str, category: str = "general") -> Dict:
        """
        Adds a comment from a department to a project discussion.
        
        Args:
            project_id: ID of the project being discussed
            department: Name of the department making the comment
            comment: The comment text
            category: Category of the comment
            
        Returns:
            The created comment
        """
        comment_id = str(uuid.uuid4())[:8]
        
        comment_obj = {
            "comment_id": comment_id,
            "project_id": project_id,
            "department": department,
            "comment": comment,
            "category": category,
            "timestamp": datetime.now().isoformat(),
            "replies": []
        }
        
        # In a real implementation, this would be added to a database
        # For this demo, we'll just print it
        print(f"Added comment from {department} on project {project_id}: {comment}")
        
        return comment_obj


if __name__ == "__main__":
    # Demo usage of the CrossDepartmentalCollaboration module
    cdc = CrossDepartmentalCollaboration()
    
    # Inter-agency Communication Portal
    channel = cdc.create_communication_channel(
        "Downtown Revitalization Team",
        "Coordination channel for the downtown revitalization project",
        ["Transportation", "Parks", "Economic Development", "Public Works", "Urban Planning"],
        {
            "Transportation": ["admin", "edit", "view"],
            "Parks": ["edit", "view"],
            "Economic Development": ["edit", "view"],
            "Public Works": ["edit", "view"],
            "Urban Planning": ["admin", "edit", "view"]
        },
        {
            "high_priority": ["Transportation", "Urban Planning"],
            "meetings": ["Transportation", "Parks", "Economic Development", "Public Works", "Urban Planning"],
            "document_updates": ["Transportation", "Parks", "Urban Planning"]
        }
    )
    print(json.dumps(channel, indent=2))
    
    # Shared Impact Assessment
    impact_assessment = cdc.conduct_shared_impact_assessment(
        "BRT-2023-001",
        "Main Street Bus Rapid Transit Corridor",
        "Transportation",
        ["Public Works", "Economic Development", "Urban Planning"],
        {
            "Public Works": [
                {"id": "PW-1", "description": "Utility relocation needed", "severity": "high", "timeline": "3-6 months"},
                {"id": "PW-2", "description": "Stormwater drainage modifications", "severity": "medium", "timeline": "2-4 months"}
            ],
            "Economic Development": [
                {"id": "ED-1", "description": "Business access during construction", "severity": "high", "timeline": "during construction"},
                {"id": "ED-2", "description": "Long-term business visibility changes", "severity": "medium", "timeline": "ongoing"}
            ],
            "Urban Planning": [
                {"id": "UP-1", "description": "Changes to streetscape design", "severity": "medium", "timeline": "planning phase"},
                {"id": "UP-2", "description": "Zoning implications for transit-oriented development", "severity": "low", "timeline": "1-2 years"}
            ]
        }
    )
    print(json.dumps(impact_assessment, indent=2))
    
    # Collaborative Budgeting
    budget = cdc.create_collaborative_budget(
        "CB-2023-002",
        "Greenway-Transit Connection Project",
        {
            "Transportation": {"contribution": 500000, "justification": "Improves transit accessibility"},
            "Parks": {"contribution": 350000, "justification": "Extends greenway network"},
            "Public Health": {"contribution": 150000, "justification": "Promotes active transportation"},
            "Stormwater Management": {"contribution": 200000, "justification": "Incorporates green infrastructure"}
        },
        1500000,
        "proportional_benefit",
        ["Improve transit access to parks", "Reduce stormwater runoff", "Increase active transportation options", "Create multi-use public space"]
    )
    print(json.dumps(budget, indent=2))
    
    # Unified Public Communications
    comm_plan = cdc.create_unified_communication_plan(
        "COMM-2023-003",
        "BRT-2023-001",
        "Transportation",
        ["Public Works", "Economic Development", "Mayor's Office"],
        [
            "The Main Street BRT will reduce commute times by up to 15 minutes",
            "Construction impacts will be minimized through coordinated work schedules",
            "Local businesses will remain open and accessible throughout construction"
        ],
        [
            {"channel": "Project Website", "responsible_dept": "Transportation", "audience": "General Public"},
            {"channel": "Business Outreach", "responsible_dept": "Economic Development", "audience": "Local Businesses"},
            {"channel": "Public Meetings", "responsible_dept": "Transportation", "audience": "Community Stakeholders"},
            {"channel": "Press Releases", "responsible_dept": "Mayor's Office", "audience": "Media"}
        ],
        [
            {"event": "Project Announcement", "date": "2023-06-01", "responsible_dept": "Mayor's Office"},
            {"event": "Business Impact Workshops", "date": "2023-07-15", "responsible_dept": "Economic Development"},
            {"event": "Construction Schedule Publication", "date": "2023-08-01", "responsible_dept": "Public Works"},
            {"event": "Regular Progress Updates", "date": "Monthly", "responsible_dept": "Transportation"}
        ]
    )
    print(json.dumps(comm_plan, indent=2))
    
    # Service Integration Visualization
    service_map = cdc.create_service_integration_map(
        "SIM-2023-004",
        "Eastside Neighborhood",
        [
            {"type": "bus_route", "id": "Route 15", "frequency_minutes": 15},
            {"type": "bike_lane", "id": "Oak Street Protected Lane", "length_km": 2.5},
            {"type": "transit_hub", "id": "Eastside Transit Center", "modes": ["bus", "light_rail", "bike_share"]}
        ],
        {
            "healthcare": [
                {"name": "Eastside Health Clinic", "address": "123 Maple Ave", "distance_to_transit_m": 150},
                {"name": "Community Hospital", "address": "500 Oak Street", "distance_to_transit_m": 300}
            ],
            "education": [
                {"name": "Eastside Elementary", "address": "234 Pine Street", "distance_to_transit_m": 400},
                {"name": "Community College Satellite Campus", "address": "345 Elm Street", "distance_to_transit_m": 200}
            ],
            "social_services": [
                {"name": "Workforce Development Center", "address": "456 Birch Ave", "distance_to_transit_m": 100},
                {"name": "Community Food Bank", "address": "567 Cedar Street", "distance_to_transit_m": 350}
            ]
        },
        {
            "average_distance_to_transit_m": 250,
            "percent_services_within_400m": 83,
            "transit_frequency_score": 4.2,
            "multimodal_access_score": 3.8
        }
    )
    print(json.dumps(service_map, indent=2))
    
    # Department Comment
    comment = cdc.add_department_comment(
        "BRT-2023-001",
        "Public Works",
        "We need to coordinate the utility work schedule with the BRT station construction to minimize street closures.",
        "coordination"
    )
    print(json.dumps(comment, indent=2)) 