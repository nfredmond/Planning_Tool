"""
Module: educational_components.py

This module implements educational components for transportation planning including:
1. Transportation Planning 101: Educational resources for planning concepts, terminology, and processes.
2. Visual Planning Glossary: Interactive definitions with visual examples.
3. Case Study Storytelling: Narrative-driven presentations of successful projects.
4. Planning Process Transparency: Step-by-step guides for transportation projects.
5. Youth Education Module: Age-appropriate materials for schools.
"""

import json
from typing import Dict, List, Optional
from datetime import datetime


class EducationalComponents:
    def __init__(self):
        # Dictionary to store educational resources by category and difficulty level
        self.educational_resources = {
            "basics": {},
            "advanced": {},
            "expert": {}
        }
        # Dictionary to store glossary terms with definitions and visual references
        self.glossary_terms = {}
        # Dictionary to store case studies by region, type, and outcome
        self.case_studies = {}
        # Dictionary to store planning process guides
        self.process_guides = {}
        # Dictionary to store youth education materials by age group
        self.youth_materials = {
            "elementary": {},
            "middle_school": {},
            "high_school": {}
        }

    def add_educational_resource(self, title: str, content: str, category: str, 
                                difficulty: str = "basics", media_urls: List[str] = None) -> Dict:
        """
        Adds an educational resource about transportation planning concepts.
        
        Args:
            title: Title of the educational resource
            content: Main content text
            category: Category (e.g., 'bike_infrastructure', 'public_transit')
            difficulty: Difficulty level ('basics', 'advanced', 'expert')
            media_urls: List of URLs to associated media (images, videos)
            
        Returns:
            The created educational resource
        """
        if difficulty not in self.educational_resources:
            print(f"Invalid difficulty level: {difficulty}. Using 'basics' instead.")
            difficulty = "basics"
            
        if media_urls is None:
            media_urls = []
            
        resource = {
            "title": title,
            "content": content,
            "category": category,
            "media_urls": media_urls,
            "created_at": datetime.now().isoformat()
        }
        
        # Create category if it doesn't exist
        if category not in self.educational_resources[difficulty]:
            self.educational_resources[difficulty][category] = []
            
        self.educational_resources[difficulty][category].append(resource)
        print(f"Added educational resource: '{title}' to {difficulty}/{category}")
        return resource

    def add_glossary_term(self, term: str, definition: str, visual_url: str = None, 
                         related_terms: List[str] = None, examples: List[str] = None) -> Dict:
        """
        Adds a term to the visual planning glossary.
        
        Args:
            term: The glossary term
            definition: Definition of the term
            visual_url: URL to a visual example
            related_terms: List of related glossary terms
            examples: List of real-world examples
            
        Returns:
            The created glossary entry
        """
        if related_terms is None:
            related_terms = []
            
        if examples is None:
            examples = []
            
        glossary_entry = {
            "term": term,
            "definition": definition,
            "visual_url": visual_url,
            "related_terms": related_terms,
            "examples": examples,
            "created_at": datetime.now().isoformat()
        }
        
        self.glossary_terms[term.lower()] = glossary_entry
        print(f"Added glossary term: '{term}'")
        return glossary_entry

    def add_case_study(self, title: str, location: str, project_type: str, 
                      narrative: str, outcomes: Dict, media_urls: List[str] = None,
                      challenges: List[str] = None, lessons_learned: List[str] = None) -> Dict:
        """
        Adds a narrative-driven case study of a successful project.
        
        Args:
            title: Title of the case study
            location: Geographic location of the project
            project_type: Type of project (e.g., 'bike_lane', 'transit_hub')
            narrative: Storytelling narrative about the project
            outcomes: Dictionary of project outcomes and metrics
            media_urls: List of URLs to associated media
            challenges: List of challenges faced during the project
            lessons_learned: List of lessons learned from the project
            
        Returns:
            The created case study
        """
        if media_urls is None:
            media_urls = []
            
        if challenges is None:
            challenges = []
            
        if lessons_learned is None:
            lessons_learned = []
            
        case_study = {
            "title": title,
            "location": location,
            "project_type": project_type,
            "narrative": narrative,
            "outcomes": outcomes,
            "media_urls": media_urls,
            "challenges": challenges,
            "lessons_learned": lessons_learned,
            "created_at": datetime.now().isoformat()
        }
        
        # Use a unique ID for the case study
        case_study_id = f"{location}-{project_type}-{len(self.case_studies) + 1}"
        self.case_studies[case_study_id] = case_study
        print(f"Added case study: '{title}' with ID {case_study_id}")
        return case_study

    def create_process_guide(self, process_name: str, description: str, 
                           steps: List[Dict], stakeholders: List[str] = None,
                           timeline_range: Dict = None, resources_needed: List[str] = None) -> Dict:
        """
        Creates a step-by-step guide for a transportation planning process.
        
        Args:
            process_name: Name of the planning process
            description: Description of the process
            steps: List of dictionaries, each containing a step's details
            stakeholders: List of stakeholders involved
            timeline_range: Dict with min and max time estimates
            resources_needed: List of resources needed
            
        Returns:
            The created process guide
        """
        if stakeholders is None:
            stakeholders = []
            
        if timeline_range is None:
            timeline_range = {"min_months": 3, "max_months": 12}
            
        if resources_needed is None:
            resources_needed = []
            
        process_guide = {
            "process_name": process_name,
            "description": description,
            "steps": steps,
            "stakeholders": stakeholders,
            "timeline_range": timeline_range,
            "resources_needed": resources_needed,
            "created_at": datetime.now().isoformat()
        }
        
        process_id = process_name.lower().replace(" ", "_")
        self.process_guides[process_id] = process_guide
        print(f"Created process guide: '{process_name}'")
        return process_guide

    def add_youth_education_material(self, title: str, age_group: str, 
                                    content: str, activity_type: str,
                                    duration_minutes: int, materials_needed: List[str] = None,
                                    learning_objectives: List[str] = None) -> Dict:
        """
        Adds educational material designed for youth of different age groups.
        
        Args:
            title: Title of the educational material
            age_group: Target age group ('elementary', 'middle_school', 'high_school')
            content: Content of the material
            activity_type: Type of activity (e.g., 'classroom', 'field_trip')
            duration_minutes: Estimated duration in minutes
            materials_needed: List of materials needed for the activity
            learning_objectives: List of learning objectives
            
        Returns:
            The created youth education material
        """
        if age_group not in self.youth_materials:
            print(f"Invalid age group: {age_group}. Using 'elementary' instead.")
            age_group = "elementary"
            
        if materials_needed is None:
            materials_needed = []
            
        if learning_objectives is None:
            learning_objectives = []
            
        material = {
            "title": title,
            "content": content,
            "activity_type": activity_type,
            "duration_minutes": duration_minutes,
            "materials_needed": materials_needed,
            "learning_objectives": learning_objectives,
            "created_at": datetime.now().isoformat()
        }
        
        # Create activity type category if it doesn't exist
        if activity_type not in self.youth_materials[age_group]:
            self.youth_materials[age_group][activity_type] = []
            
        self.youth_materials[age_group][activity_type].append(material)
        print(f"Added youth education material: '{title}' for {age_group}")
        return material


if __name__ == "__main__":
    # Demo usage of the EducationalComponents module
    ec = EducationalComponents()
    
    # Transportation Planning 101
    resource = ec.add_educational_resource(
        "Understanding Complete Streets",
        "Complete Streets are designed to enable safe access for all users including pedestrians, bicyclists, motorists, and public transportation users of all ages and abilities.",
        "street_design",
        "basics",
        ["https://example.com/complete_streets_diagram.jpg"]
    )
    print(json.dumps(resource, indent=2))
    
    # Visual Planning Glossary
    glossary_entry = ec.add_glossary_term(
        "Road Diet",
        "A technique in transportation planning whereby the number of travel lanes is reduced to achieve systemic improvements.",
        "https://example.com/road_diet_before_after.jpg",
        ["lane reduction", "complete streets"],
        ["Fourth Plain Boulevard in Vancouver, WA", "Edgewater Drive in Orlando, FL"]
    )
    print(json.dumps(glossary_entry, indent=2))
    
    # Case Study Storytelling
    case_study = ec.add_case_study(
        "Transforming Market Street",
        "San Francisco, CA",
        "street_redesign",
        "The Better Market Street project transformed one of San Francisco's most important thoroughfares into a car-free corridor prioritizing pedestrians, cyclists, and public transit.",
        {"pedestrian_safety": "+15%", "transit_speed": "+20%", "business_activity": "+10%"},
        ["https://example.com/market_street_before.jpg", "https://example.com/market_street_after.jpg"],
        ["Coordinating with multiple stakeholders", "Addressing business concerns about access"],
        ["Early and continuous stakeholder engagement is essential", "Phased implementation helps adjust to feedback"]
    )
    print(json.dumps(case_study, indent=2))
    
    # Planning Process Transparency
    process_guide = ec.create_process_guide(
        "Bike Lane Implementation",
        "A guide to the process of planning and implementing new bike lanes",
        [
            {"step_number": 1, "title": "Needs Assessment", "description": "Identify corridors with bike infrastructure needs"},
            {"step_number": 2, "title": "Feasibility Study", "description": "Assess the technical feasibility of bike lanes"},
            {"step_number": 3, "title": "Community Engagement", "description": "Gather input from the community"},
            {"step_number": 4, "title": "Design Development", "description": "Create detailed designs"},
            {"step_number": 5, "title": "Implementation", "description": "Construct the bike lanes"}
        ],
        ["Transportation Department", "Community Groups", "Business Owners", "Cyclists"],
        {"min_months": 6, "max_months": 18},
        ["Traffic counts", "Design software", "Public engagement tools"]
    )
    print(json.dumps(process_guide, indent=2))
    
    # Youth Education Module
    youth_material = ec.add_youth_education_material(
        "Design Your Dream Street",
        "middle_school",
        "Students work in groups to redesign a street in their neighborhood to be safer and more accessible for all users.",
        "classroom_activity",
        60,
        ["Large paper sheets", "Markers", "Street templates", "Scale figures"],
        ["Understand the concept of complete streets", "Identify transportation needs of different users", "Practice collaborative problem-solving"]
    )
    print(json.dumps(youth_material, indent=2)) 