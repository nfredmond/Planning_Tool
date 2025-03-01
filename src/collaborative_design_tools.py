"""
Module: collaborative_design_tools.py

This module implements collaborative design tools for transportation planning projects.
Features:
- Real-time Design Collaboration: Allows multiple stakeholders to work simultaneously on designs
- Version History Management: Tracks changes and allows restoring previous design versions
- Design Commenting System: Enables stakeholders to provide feedback on specific design elements
- Design Template Library: Provides reusable templates for common design patterns
- Measurement Tools: Helps accurately measure distances and areas in designs
- Export and Sharing: Enables exporting designs in various formats and sharing with stakeholders

This implementation is inspired by the React component described in docs/collaborative-design-tools.txt
but adapted for Python-based backend support.
"""

import os
import json
import math
import datetime
import uuid
from typing import Dict, List, Tuple, Optional, Any, Union

# Type definitions
class DesignElement:
    """Represents a single design element (point, line, polygon) on the map."""
    def __init__(
        self,
        element_id: str = None,
        element_type: str = "generic",
        geometry_type: str = "Point",
        coordinates: List = None,
        properties: Dict = None
    ):
        self.id = element_id or str(uuid.uuid4())
        self.element_type = element_type
        self.geometry_type = geometry_type
        self.coordinates = coordinates or []
        self.properties = properties or {
            "name": "New Element",
            "description": "",
            "fill": "#3bb2d0",
            "stroke": "#3bb2d0",
            "strokeWidth": 2,
            "fillOpacity": 0.5,
            "lineDashArray": [0],
            "pointSize": 6
        }
    
    def to_dict(self) -> Dict:
        """Convert the element to a dictionary for JSON serialization."""
        return {
            "id": self.id,
            "type": "Feature",
            "geometry": {
                "type": self.geometry_type,
                "coordinates": self.coordinates
            },
            "properties": {
                "elementType": self.element_type,
                **self.properties
            }
        }

class DesignComment:
    """Represents a comment on a design element or location."""
    def __init__(
        self,
        comment_id: str = None,
        user_id: str = None,
        username: str = "Anonymous",
        text: str = "",
        location: List[float] = None,
        element_id: str = None,
        created_at: datetime.datetime = None,
        resolved: bool = False
    ):
        self.id = comment_id or str(uuid.uuid4())
        self.user_id = user_id
        self.username = username
        self.text = text
        self.location = location  # [longitude, latitude]
        self.element_id = element_id
        self.created_at = created_at or datetime.datetime.now()
        self.resolved = resolved
    
    def to_dict(self) -> Dict:
        """Convert the comment to a dictionary for JSON serialization."""
        return {
            "id": self.id,
            "userId": self.user_id,
            "username": self.username,
            "text": self.text,
            "location": self.location,
            "elementId": self.element_id,
            "createdAt": self.created_at.isoformat(),
            "resolved": self.resolved
        }

class DesignVersion:
    """Represents a version of a design alternative."""
    def __init__(
        self,
        version_id: str = None,
        alternative_id: str = None,
        user_id: str = None,
        username: str = "Anonymous",
        features: List[Dict] = None,
        created_at: datetime.datetime = None,
        message: str = ""
    ):
        self.id = version_id or str(uuid.uuid4())
        self.alternative_id = alternative_id
        self.user_id = user_id
        self.username = username
        self.features = features or []
        self.created_at = created_at or datetime.datetime.now()
        self.message = message
    
    def to_dict(self) -> Dict:
        """Convert the version to a dictionary for JSON serialization."""
        return {
            "id": self.id,
            "alternativeId": self.alternative_id,
            "userId": self.user_id,
            "username": self.username,
            "features": self.features,
            "createdAt": self.created_at.isoformat(),
            "message": self.message
        }

class DesignAlternative:
    """Represents a design alternative for a project."""
    def __init__(
        self,
        alternative_id: str = None,
        project_id: str = None,
        name: str = "New Design Alternative",
        description: str = "",
        created_by: str = None,
        created_at: datetime.datetime = None,
        updated_at: datetime.datetime = None,
        features: List[Dict] = None,
        is_public: bool = False
    ):
        self.id = alternative_id or str(uuid.uuid4())
        self.project_id = project_id
        self.name = name
        self.description = description
        self.created_by = created_by
        self.created_at = created_at or datetime.datetime.now()
        self.updated_at = updated_at or datetime.datetime.now()
        self.features = features or []
        self.is_public = is_public
    
    def to_dict(self) -> Dict:
        """Convert the alternative to a dictionary for JSON serialization."""
        return {
            "id": self.id,
            "projectId": self.project_id,
            "name": self.name,
            "description": self.description,
            "createdBy": self.created_by,
            "createdAt": self.created_at.isoformat(),
            "updatedAt": self.updated_at.isoformat(),
            "features": self.features,
            "isPublic": self.is_public
        }

# Collaborative Design Tools Implementation

class CollaborativeDesignTools:
    """Main class implementing collaborative design tools."""
    
    def __init__(self, data_dir: str = "data/designs"):
        """Initialize the collaborative design tools.
        
        Args:
            data_dir: Directory for storing design data
        """
        self.data_dir = data_dir
        self._ensure_data_directory()
    
    def _ensure_data_directory(self):
        """Ensure the data directory exists."""
        os.makedirs(self.data_dir, exist_ok=True)
        os.makedirs(os.path.join(self.data_dir, "alternatives"), exist_ok=True)
        os.makedirs(os.path.join(self.data_dir, "versions"), exist_ok=True)
        os.makedirs(os.path.join(self.data_dir, "comments"), exist_ok=True)
        os.makedirs(os.path.join(self.data_dir, "templates"), exist_ok=True)
    
    # Design Alternative Management
    
    def create_design_alternative(
        self, 
        project_id: str, 
        name: str, 
        description: str = "", 
        created_by: str = None,
        features: List[Dict] = None,
        is_public: bool = False
    ) -> DesignAlternative:
        """Create a new design alternative.
        
        Args:
            project_id: ID of the project
            name: Name of the design alternative
            description: Description of the design alternative
            created_by: ID of the user creating the alternative
            features: Initial features for the alternative
            is_public: Whether the alternative is publicly viewable
            
        Returns:
            A new DesignAlternative instance
        """
        alternative = DesignAlternative(
            project_id=project_id,
            name=name,
            description=description,
            created_by=created_by,
            features=features or [],
            is_public=is_public
        )
        
        # Save the alternative
        self._save_alternative(alternative)
        
        # Create initial version
        self.save_version(
            alternative.id, 
            created_by, 
            "Initial version", 
            alternative.features
        )
        
        return alternative
    
    def get_design_alternatives(self, project_id: str) -> List[DesignAlternative]:
        """Get all design alternatives for a project.
        
        Args:
            project_id: ID of the project
            
        Returns:
            List of DesignAlternative instances
        """
        alternatives = []
        alternatives_dir = os.path.join(self.data_dir, "alternatives")
        
        if not os.path.exists(alternatives_dir):
            return alternatives
        
        for filename in os.listdir(alternatives_dir):
            if not filename.endswith(".json"):
                continue
            
            filepath = os.path.join(alternatives_dir, filename)
            with open(filepath, 'r') as f:
                data = json.load(f)
                
            if data.get("projectId") == project_id:
                alternative = DesignAlternative(
                    alternative_id=data.get("id"),
                    project_id=data.get("projectId"),
                    name=data.get("name"),
                    description=data.get("description"),
                    created_by=data.get("createdBy"),
                    created_at=datetime.datetime.fromisoformat(data.get("createdAt")),
                    updated_at=datetime.datetime.fromisoformat(data.get("updatedAt")),
                    features=data.get("features", []),
                    is_public=data.get("isPublic", False)
                )
                alternatives.append(alternative)
        
        return alternatives
    
    def get_design_alternative(self, alternative_id: str) -> Optional[DesignAlternative]:
        """Get a specific design alternative.
        
        Args:
            alternative_id: ID of the design alternative
            
        Returns:
            DesignAlternative instance or None if not found
        """
        filepath = os.path.join(self.data_dir, "alternatives", f"{alternative_id}.json")
        
        if not os.path.exists(filepath):
            return None
        
        with open(filepath, 'r') as f:
            data = json.load(f)
        
        return DesignAlternative(
            alternative_id=data.get("id"),
            project_id=data.get("projectId"),
            name=data.get("name"),
            description=data.get("description"),
            created_by=data.get("createdBy"),
            created_at=datetime.datetime.fromisoformat(data.get("createdAt")),
            updated_at=datetime.datetime.fromisoformat(data.get("updatedAt")),
            features=data.get("features", []),
            is_public=data.get("isPublic", False)
        )
    
    def update_design_alternative(
        self, 
        alternative_id: str, 
        features: List[Dict],
        name: Optional[str] = None,
        description: Optional[str] = None,
        user_id: Optional[str] = None,
        version_message: str = "Updated design"
    ) -> Optional[DesignAlternative]:
        """Update a design alternative.
        
        Args:
            alternative_id: ID of the design alternative to update
            features: New features for the alternative
            name: New name for the alternative (optional)
            description: New description for the alternative (optional)
            user_id: ID of the user making the update
            version_message: Message describing the update for version history
            
        Returns:
            Updated DesignAlternative instance or None if not found
        """
        alternative = self.get_design_alternative(alternative_id)
        
        if alternative is None:
            return None
        
        if name is not None:
            alternative.name = name
        
        if description is not None:
            alternative.description = description
        
        alternative.features = features
        alternative.updated_at = datetime.datetime.now()
        
        # Save the updated alternative
        self._save_alternative(alternative)
        
        # Create a new version
        self.save_version(alternative_id, user_id, version_message, features)
        
        return alternative
    
    def _save_alternative(self, alternative: DesignAlternative):
        """Save a design alternative to disk.
        
        Args:
            alternative: DesignAlternative instance to save
        """
        filepath = os.path.join(self.data_dir, "alternatives", f"{alternative.id}.json")
        
        with open(filepath, 'w') as f:
            json.dump(alternative.to_dict(), f, indent=2)
    
    # Version History Management
    
    def save_version(
        self, 
        alternative_id: str, 
        user_id: Optional[str], 
        message: str, 
        features: List[Dict]
    ) -> DesignVersion:
        """Save a new version of a design alternative.
        
        Args:
            alternative_id: ID of the design alternative
            user_id: ID of the user creating the version
            message: Description of the changes in this version
            features: Features in this version
            
        Returns:
            A new DesignVersion instance
        """
        version = DesignVersion(
            alternative_id=alternative_id,
            user_id=user_id,
            features=features,
            message=message
        )
        
        # Save the version
        filepath = os.path.join(
            self.data_dir, 
            "versions", 
            f"{alternative_id}_{version.id}.json"
        )
        
        with open(filepath, 'w') as f:
            json.dump(version.to_dict(), f, indent=2)
        
        return version
    
    def get_versions(self, alternative_id: str) -> List[DesignVersion]:
        """Get all versions of a design alternative.
        
        Args:
            alternative_id: ID of the design alternative
            
        Returns:
            List of DesignVersion instances sorted by creation date
        """
        versions = []
        versions_dir = os.path.join(self.data_dir, "versions")
        
        if not os.path.exists(versions_dir):
            return versions
        
        for filename in os.listdir(versions_dir):
            if not filename.endswith(".json") or not filename.startswith(f"{alternative_id}_"):
                continue
            
            filepath = os.path.join(versions_dir, filename)
            with open(filepath, 'r') as f:
                data = json.load(f)
            
            version = DesignVersion(
                version_id=data.get("id"),
                alternative_id=data.get("alternativeId"),
                user_id=data.get("userId"),
                username=data.get("username", "Anonymous"),
                features=data.get("features", []),
                created_at=datetime.datetime.fromisoformat(data.get("createdAt")),
                message=data.get("message", "")
            )
            versions.append(version)
        
        # Sort versions by creation date (newest first)
        versions.sort(key=lambda v: v.created_at, reverse=True)
        return versions
    
    def restore_version(self, version_id: str, alternative_id: str, user_id: Optional[str] = None) -> Optional[DesignAlternative]:
        """Restore a design alternative to a previous version.
        
        Args:
            version_id: ID of the version to restore
            alternative_id: ID of the design alternative
            user_id: ID of the user performing the restoration
            
        Returns:
            Updated DesignAlternative instance or None if version not found
        """
        versions = self.get_versions(alternative_id)
        version_to_restore = next((v for v in versions if v.id == version_id), None)
        
        if version_to_restore is None:
            return None
        
        # Update the alternative with features from the version
        return self.update_design_alternative(
            alternative_id=alternative_id,
            features=version_to_restore.features,
            user_id=user_id,
            version_message=f"Restored to version from {version_to_restore.created_at.strftime('%Y-%m-%d %H:%M')}"
        )
    
    # Comment System
    
    def add_comment(
        self, 
        alternative_id: str, 
        user_id: Optional[str], 
        username: str, 
        text: str, 
        location: Optional[List[float]] = None, 
        element_id: Optional[str] = None
    ) -> DesignComment:
        """Add a comment to a design alternative.
        
        Args:
            alternative_id: ID of the design alternative
            user_id: ID of the user creating the comment
            username: Username of the commenter
            text: Comment text
            location: [longitude, latitude] coordinates for the comment (optional)
            element_id: ID of the design element being commented on (optional)
            
        Returns:
            A new DesignComment instance
        """
        comment = DesignComment(
            user_id=user_id,
            username=username,
            text=text,
            location=location,
            element_id=element_id
        )
        
        # Save the comment
        filepath = os.path.join(
            self.data_dir, 
            "comments", 
            f"{alternative_id}_{comment.id}.json"
        )
        
        with open(filepath, 'w') as f:
            json.dump(comment.to_dict(), f, indent=2)
        
        return comment
    
    def get_comments(self, alternative_id: str) -> List[DesignComment]:
        """Get all comments for a design alternative.
        
        Args:
            alternative_id: ID of the design alternative
            
        Returns:
            List of DesignComment instances sorted by creation date
        """
        comments = []
        comments_dir = os.path.join(self.data_dir, "comments")
        
        if not os.path.exists(comments_dir):
            return comments
        
        for filename in os.listdir(comments_dir):
            if not filename.endswith(".json") or not filename.startswith(f"{alternative_id}_"):
                continue
            
            filepath = os.path.join(comments_dir, filename)
            with open(filepath, 'r') as f:
                data = json.load(f)
            
            comment = DesignComment(
                comment_id=data.get("id"),
                user_id=data.get("userId"),
                username=data.get("username", "Anonymous"),
                text=data.get("text", ""),
                location=data.get("location"),
                element_id=data.get("elementId"),
                created_at=datetime.datetime.fromisoformat(data.get("createdAt")),
                resolved=data.get("resolved", False)
            )
            comments.append(comment)
        
        # Sort comments by creation date (newest first)
        comments.sort(key=lambda c: c.created_at, reverse=True)
        return comments
    
    def resolve_comment(self, comment_id: str, alternative_id: str) -> Optional[DesignComment]:
        """Mark a comment as resolved.
        
        Args:
            comment_id: ID of the comment
            alternative_id: ID of the design alternative
            
        Returns:
            Updated DesignComment instance or None if not found
        """
        filepath = os.path.join(
            self.data_dir, 
            "comments", 
            f"{alternative_id}_{comment_id}.json"
        )
        
        if not os.path.exists(filepath):
            return None
        
        with open(filepath, 'r') as f:
            data = json.load(f)
        
        comment = DesignComment(
            comment_id=data.get("id"),
            user_id=data.get("userId"),
            username=data.get("username", "Anonymous"),
            text=data.get("text", ""),
            location=data.get("location"),
            element_id=data.get("elementId"),
            created_at=datetime.datetime.fromisoformat(data.get("createdAt")),
            resolved=True
        )
        
        # Save the updated comment
        with open(filepath, 'w') as f:
            json.dump(comment.to_dict(), f, indent=2)
        
        return comment
    
    # Template Library
    
    def save_template(
        self, 
        name: str, 
        description: str, 
        features: List[Dict], 
        category: str = "general",
        created_by: Optional[str] = None
    ) -> Dict:
        """Save a design template.
        
        Args:
            name: Name of the template
            description: Description of the template
            features: Features in the template
            category: Category for the template
            created_by: ID of the user creating the template
            
        Returns:
            Dictionary with template information
        """
        template_id = str(uuid.uuid4())
        template = {
            "id": template_id,
            "name": name,
            "description": description,
            "features": features,
            "category": category,
            "createdBy": created_by,
            "createdAt": datetime.datetime.now().isoformat()
        }
        
        # Save the template
        filepath = os.path.join(self.data_dir, "templates", f"{template_id}.json")
        
        with open(filepath, 'w') as f:
            json.dump(template, f, indent=2)
        
        return template
    
    def get_templates(self, category: Optional[str] = None) -> List[Dict]:
        """Get design templates.
        
        Args:
            category: Filter templates by category (optional)
            
        Returns:
            List of template dictionaries
        """
        templates = []
        templates_dir = os.path.join(self.data_dir, "templates")
        
        if not os.path.exists(templates_dir):
            return templates
        
        for filename in os.listdir(templates_dir):
            if not filename.endswith(".json"):
                continue
            
            filepath = os.path.join(templates_dir, filename)
            with open(filepath, 'r') as f:
                template = json.load(f)
            
            if category is None or template.get("category") == category:
                templates.append(template)
        
        return templates
    
    # Utility Methods
    
    def calculate_distance(self, coord1: Tuple[float, float], coord2: Tuple[float, float]) -> float:
        """Calculate the distance between two coordinates using the Haversine formula.
        
        Args:
            coord1: (latitude, longitude) tuple for first point
            coord2: (latitude, longitude) tuple for second point
            
        Returns:
            Distance in meters
        """
        lat1, lon1 = coord1
        lat2, lon2 = coord2
        
        # Convert to radians
        lat1_rad = lat1 * (3.14159 / 180)
        lon1_rad = lon1 * (3.14159 / 180)
        lat2_rad = lat2 * (3.14159 / 180)
        lon2_rad = lon2 * (3.14159 / 180)
        
        # Earth radius in meters
        radius = 6371000
        
        # Haversine formula
        dlat = lat2_rad - lat1_rad
        dlon = lon2_rad - lon1_rad
        a = (
            (math.sin(dlat / 2) ** 2) + 
            math.cos(lat1_rad) * math.cos(lat2_rad) * (math.sin(dlon / 2) ** 2)
        )
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
        distance = radius * c
        
        return distance
    
    def export_design(self, alternative_id: str, format: str = "geojson") -> Dict:
        """Export a design alternative in various formats.
        
        Args:
            alternative_id: ID of the design alternative
            format: Export format (geojson, json, etc.)
            
        Returns:
            Dictionary with export data
        """
        alternative = self.get_design_alternative(alternative_id)
        
        if alternative is None:
            return {"error": "Design alternative not found"}
        
        if format == "geojson":
            return {
                "type": "FeatureCollection",
                "features": alternative.features
            }
        else:
            return alternative.to_dict()


# Main execution block for testing
if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description="Collaborative Design Tools")
    parser.add_argument("--project", help="Project ID for testing", default="test-project")
    args = parser.parse_args()
    
    # Create an instance of the tools
    tools = CollaborativeDesignTools()
    
    print("Collaborative Design Tools Demo")
    print("1. Create a new design alternative")
    print("2. List design alternatives")
    print("3. View design alternative details")
    print("4. Create a comment")
    print("5. List comments")
    print("6. Create a template")
    print("7. List templates")
    print("8. Exit")
    
    choice = input("Select an option (1-8): ")
    
    if choice == "1":
        name = input("Design name: ")
        desc = input("Description: ")
        alternative = tools.create_design_alternative(args.project, name, desc)
        print(f"Created design alternative: {alternative.id}")
    
    elif choice == "2":
        alternatives = tools.get_design_alternatives(args.project)
        if alternatives:
            for alt in alternatives:
                print(f"- {alt.name} (ID: {alt.id})")
        else:
            print("No design alternatives found for this project")
    
    elif choice == "3":
        alt_id = input("Enter design alternative ID: ")
        alternative = tools.get_design_alternative(alt_id)
        if alternative:
            print(f"Name: {alternative.name}")
            print(f"Description: {alternative.description}")
            print(f"Features: {len(alternative.features)}")
        else:
            print("Design alternative not found")
    
    elif choice == "4":
        alt_id = input("Enter design alternative ID: ")
        text = input("Comment text: ")
        comment = tools.add_comment(alt_id, None, "Test User", text)
        print(f"Comment added with ID: {comment.id}")
    
    elif choice == "5":
        alt_id = input("Enter design alternative ID: ")
        comments = tools.get_comments(alt_id)
        if comments:
            for comment in comments:
                print(f"- {comment.username}: {comment.text}")
        else:
            print("No comments found for this design alternative")
    
    elif choice == "6":
        name = input("Template name: ")
        desc = input("Description: ")
        category = input("Category: ")
        template = tools.save_template(name, desc, [], category)
        print(f"Template created with ID: {template['id']}")
    
    elif choice == "7":
        templates = tools.get_templates()
        if templates:
            for template in templates:
                print(f"- {template['name']} ({template['category']})")
        else:
            print("No templates found")
    
    elif choice == "8":
        print("Exiting demo")
    
    else:
        print("Invalid choice") 