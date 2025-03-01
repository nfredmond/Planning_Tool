"""
Module: global_knowledge_exchange.py

This module implements global knowledge exchange features including:
1. International Best Practices Database: Repository of successful transportation solutions.
2. Contextual Adaptation Tools: Adapting international examples to local conditions.
3. Sister City Project Matching: Connect similar projects in different regions.
4. Translation of Technical Standards: Help understand standards from other countries.
5. Global Benchmarking Dashboard: Compare transportation metrics with peer cities.
"""

import json
from typing import Dict, List, Optional
from datetime import datetime
import random  # For demo purposes only


class GlobalKnowledgeExchange:
    def __init__(self):
        # Dictionary to store international best practices by region and category
        self.best_practices = {}
        # Dictionary to store contextual adaptation assessments
        self.adaptation_assessments = {}
        # Dictionary to store sister city project matches
        self.sister_city_matches = {}
        # Dictionary to store translated technical standards
        self.translated_standards = {}
        # Dictionary to store global benchmarking metrics
        self.benchmarking_metrics = {}

    def add_best_practice(self, practice_id: str, title: str, location: Dict,
                         category: str, description: str, outcomes: Dict,
                         implementation_details: Dict, media_urls: List[str] = None) -> Dict:
        """
        Adds a best practice to the international database.
        
        Args:
            practice_id: Unique identifier for the practice
            title: Title of the best practice
            location: Dictionary with location details (city, country, region)
            category: Category of transportation solution
            description: Description of the practice
            outcomes: Dictionary of outcomes and metrics
            implementation_details: Dictionary with implementation details
            media_urls: List of URLs to related media
            
        Returns:
            The created best practice entry
        """
        if media_urls is None:
            media_urls = []
            
        practice = {
            "practice_id": practice_id,
            "title": title,
            "location": location,
            "category": category,
            "description": description,
            "outcomes": outcomes,
            "implementation_details": implementation_details,
            "media_urls": media_urls,
            "added_date": datetime.now().isoformat(),
            "last_updated": datetime.now().isoformat(),
            "rating": {"score": 0, "votes": 0}
        }
        
        # Organize by region and category for easier searching
        region = location.get("region", "Global")
        if region not in self.best_practices:
            self.best_practices[region] = {}
            
        if category not in self.best_practices[region]:
            self.best_practices[region][category] = []
            
        self.best_practices[region][category].append(practice)
        print(f"Added best practice: '{title}' from {location['city']}, {location['country']}")
        return practice

    def search_best_practices(self, query: str = None, region: str = None, 
                            category: str = None, min_rating: float = None) -> List[Dict]:
        """
        Searches the best practices database with various filters.
        
        Args:
            query: Search term to look for in title and description
            region: Filter by region
            category: Filter by category
            min_rating: Minimum rating threshold
            
        Returns:
            List of matching best practices
        """
        results = []
        
        # Helper function to check if an item matches the search criteria
        def matches_criteria(practice):
            if query and not (query.lower() in practice["title"].lower() or 
                             query.lower() in practice["description"].lower()):
                return False
                
            if min_rating is not None and practice["rating"]["score"] < min_rating:
                return False
                
            return True
        
        # If region and category are specified, we can directly access that section
        if region and category and region in self.best_practices and category in self.best_practices[region]:
            for practice in self.best_practices[region][category]:
                if matches_criteria(practice):
                    results.append(practice)
        # If only region is specified, search all categories in that region
        elif region and region in self.best_practices:
            for category_practices in self.best_practices[region].values():
                for practice in category_practices:
                    if matches_criteria(practice):
                        results.append(practice)
        # If only category is specified, search across all regions
        elif category:
            for region_data in self.best_practices.values():
                if category in region_data:
                    for practice in region_data[category]:
                        if matches_criteria(practice):
                            results.append(practice)
        # If nothing is specified, search everything
        else:
            for region_data in self.best_practices.values():
                for category_practices in region_data.values():
                    for practice in category_practices:
                        if matches_criteria(practice):
                            results.append(practice)
        
        print(f"Found {len(results)} best practices matching the search criteria")
        return results

    def assess_contextual_adaptation(self, practice_id: str, target_location: Dict,
                                   local_factors: Dict, adaptation_needs: List[Dict]) -> Dict:
        """
        Assesses how an international example can be adapted to local conditions.
        
        Args:
            practice_id: ID of the best practice to adapt
            target_location: Dictionary with details of the target location
            local_factors: Dictionary of local factors affecting adaptation
            adaptation_needs: List of specific adaptation needs
            
        Returns:
            The completed adaptation assessment
        """
        assessment_id = f"adapt-{practice_id}-{datetime.now().strftime('%Y%m%d')}"
        
        assessment = {
            "assessment_id": assessment_id,
            "practice_id": practice_id,
            "target_location": target_location,
            "local_factors": local_factors,
            "adaptation_needs": adaptation_needs,
            "adaptation_recommendations": [],
            "feasibility_score": 0,  # Will be calculated
            "estimated_timeline": "",
            "estimated_cost_factor": 0,
            "assessment_date": datetime.now().isoformat()
        }
        
        # Generate adaptation recommendations based on adaptation needs
        for need in adaptation_needs:
            assessment["adaptation_recommendations"].append({
                "need_id": need.get("id"),
                "recommendation": f"Adapt for {need.get('factor')} by {need.get('adaptation_approach', 'modifying the design')}",
                "priority": need.get("priority", "medium")
            })
        
        # Calculate feasibility score (simplified for demo)
        # In a real implementation, this would be a more complex calculation
        difficulty_scores = {
            "low": 3,
            "medium": 2,
            "high": 1
        }
        
        total_score = sum(difficulty_scores.get(need.get("adaptation_difficulty", "medium"), 2) 
                         for need in adaptation_needs)
        max_possible = len(adaptation_needs) * 3
        assessment["feasibility_score"] = round((total_score / max_possible) * 10, 1) if max_possible > 0 else 0
        
        # Estimate timeline based on number and complexity of adaptations
        if len(adaptation_needs) <= 2:
            assessment["estimated_timeline"] = "1-3 months"
        elif len(adaptation_needs) <= 5:
            assessment["estimated_timeline"] = "3-6 months"
        else:
            assessment["estimated_timeline"] = "6-12 months"
            
        # Estimate cost factor compared to original implementation
        avg_difficulty = sum({"low": 1, "medium": 2, "high": 3}.get(need.get("adaptation_difficulty", "medium"), 2) 
                           for need in adaptation_needs) / len(adaptation_needs) if adaptation_needs else 2
        assessment["estimated_cost_factor"] = round(1 + (avg_difficulty * 0.2), 1)  # Simple formula for demo
        
        self.adaptation_assessments[assessment_id] = assessment
        print(f"Completed contextual adaptation assessment for practice {practice_id}")
        return assessment

    def create_sister_city_match(self, city1: Dict, city2: Dict, 
                               similarity_factors: Dict, potential_projects: List[Dict]) -> Dict:
        """
        Creates a sister city project match for knowledge sharing.
        
        Args:
            city1: Dictionary with details of the first city
            city2: Dictionary with details of the second city
            similarity_factors: Dictionary of factors that make the cities good matches
            potential_projects: List of potential collaborative projects
            
        Returns:
            The created sister city match
        """
        match_id = f"{city1['name'].replace(' ', '-')}-{city2['name'].replace(' ', '-')}"
        
        match = {
            "match_id": match_id,
            "city1": city1,
            "city2": city2,
            "similarity_factors": similarity_factors,
            "similarity_score": sum(similarity_factors.values()) / len(similarity_factors) if similarity_factors else 0,
            "potential_projects": potential_projects,
            "created_at": datetime.now().isoformat(),
            "status": "proposed"
        }
        
        self.sister_city_matches[match_id] = match
        print(f"Created sister city match between {city1['name']} and {city2['name']}")
        return match

    def translate_technical_standard(self, standard_id: str, standard_name: str, 
                                   source_country: str, source_language: str,
                                   target_language: str, sections: List[Dict]) -> Dict:
        """
        Translates a technical standard from another country.
        
        Args:
            standard_id: Unique identifier for the standard
            standard_name: Name of the technical standard
            source_country: Country where the standard originated
            source_language: Original language of the standard
            target_language: Language to translate to
            sections: List of translated standard sections
            
        Returns:
            The translated technical standard
        """
        translation_id = f"{standard_id}-{source_language}-{target_language}"
        
        translation = {
            "translation_id": translation_id,
            "standard_id": standard_id,
            "standard_name": standard_name,
            "source_country": source_country,
            "source_language": source_language,
            "target_language": target_language,
            "sections": sections,
            "translation_date": datetime.now().isoformat(),
            "last_updated": datetime.now().isoformat()
        }
        
        self.translated_standards[translation_id] = translation
        print(f"Translated technical standard '{standard_name}' from {source_language} to {target_language}")
        return translation

    def create_benchmarking_dashboard(self, dashboard_id: str, city: Dict,
                                    peer_cities: List[Dict], metrics: Dict[str, Dict],
                                    time_period: str) -> Dict:
        """
        Creates a global benchmarking dashboard to compare transportation metrics.
        
        Args:
            dashboard_id: Unique identifier for the dashboard
            city: Dictionary with details of the main city
            peer_cities: List of cities to compare against
            metrics: Dictionary of transportation metrics to compare
            time_period: Time period for the data
            
        Returns:
            The created benchmarking dashboard
        """
        dashboard = {
            "dashboard_id": dashboard_id,
            "city": city,
            "peer_cities": peer_cities,
            "metrics": metrics,
            "time_period": time_period,
            "created_at": datetime.now().isoformat(),
            "last_updated": datetime.now().isoformat()
        }
        
        # Calculate rankings for each metric
        rankings = {}
        for metric_key, metric_data in metrics.items():
            all_values = [city["metrics"][metric_key]] + [pc["metrics"][metric_key] for pc in peer_cities]
            all_values.sort(reverse=metric_data.get("higher_is_better", True))
            
            # Find city's rank
            city_value = city["metrics"][metric_key]
            city_rank = all_values.index(city_value) + 1 if city_value in all_values else None
            
            rankings[metric_key] = {
                "city_rank": city_rank,
                "total_cities": len(all_values),
                "percentile": round(((len(all_values) - city_rank) / (len(all_values) - 1)) * 100) if city_rank and len(all_values) > 1 else None
            }
            
        dashboard["rankings"] = rankings
        
        self.benchmarking_metrics[dashboard_id] = dashboard
        print(f"Created benchmarking dashboard for {city['name']} comparing against {len(peer_cities)} peer cities")
        return dashboard


if __name__ == "__main__":
    # Demo usage of the GlobalKnowledgeExchange module
    gke = GlobalKnowledgeExchange()
    
    # International Best Practices Database
    best_practice = gke.add_best_practice(
        "BP-2023-001",
        "Copenhagen Bicycle Superhighways",
        {"city": "Copenhagen", "country": "Denmark", "region": "Europe"},
        "cycling_infrastructure",
        "Network of high-quality cycling routes connecting suburban areas to the city center, prioritizing bicycle traffic.",
        {
            "mode_shift": "+28% bicycle commuting on routes",
            "travel_time_reduction": "Average 10% faster bicycle trips",
            "safety_improvement": "85% of users report feeling safer",
            "cost_benefit_ratio": "1:4.5 return on investment"
        },
        {
            "total_km": 167,
            "cost_per_km": "€1 million",
            "key_features": ["Widened paths", "Green wave signal timing", "Service stations", "Clear wayfinding"],
            "implementation_timeline": "Phased over 10 years"
        },
        ["https://example.com/copenhagen_bike_superhighway1.jpg", "https://example.com/copenhagen_bike_superhighway2.jpg"]
    )
    print(json.dumps(best_practice, indent=2))
    
    # Add another best practice for searching
    gke.add_best_practice(
        "BP-2023-002",
        "Curitiba Bus Rapid Transit System",
        {"city": "Curitiba", "country": "Brazil", "region": "South America"},
        "public_transit",
        "Pioneering BRT system integrating dedicated bus lanes, pre-boarding payment, and land use planning.",
        {
            "ridership": "2.3 million passengers daily",
            "operating_cost": "30% lower than traditional transit",
            "travel_time_reduction": "Average 15-20 minute reduction per trip"
        },
        {
            "dedicated_lanes_km": 84,
            "number_of_stations": 357,
            "implementation_timeline": "Developed over 30 years"
        }
    )
    
    # Search Best Practices
    search_results = gke.search_best_practices(category="cycling_infrastructure")
    print(f"Found {len(search_results)} cycling infrastructure best practices")
    
    # Contextual Adaptation Tools
    adaptation = gke.assess_contextual_adaptation(
        "BP-2023-001",
        {"city": "Portland", "state": "Oregon", "country": "United States", "region": "North America"},
        {
            "climate": {"conditions": "More rainfall than Copenhagen", "adaptation_factor": "high"},
            "infrastructure": {"conditions": "Less existing cycling infrastructure", "adaptation_factor": "medium"},
            "political_support": {"conditions": "Strong cycling advocacy but mixed political support", "adaptation_factor": "medium"},
            "funding_availability": {"conditions": "Limited compared to Copenhagen", "adaptation_factor": "high"},
            "land_use": {"conditions": "More sprawled development pattern", "adaptation_factor": "high"}
        },
        [
            {"id": "adapt1", "factor": "rainfall", "adaptation_approach": "Enhanced drainage and covered sections", "adaptation_difficulty": "medium", "priority": "high"},
            {"id": "adapt2", "factor": "existing infrastructure", "adaptation_approach": "Phased implementation focusing on key corridors first", "adaptation_difficulty": "medium", "priority": "high"},
            {"id": "adapt3", "factor": "funding constraints", "adaptation_approach": "Public-private partnerships and federal grants", "adaptation_difficulty": "high", "priority": "high"},
            {"id": "adapt4", "factor": "development patterns", "adaptation_approach": "Focus on connecting key activity centers", "adaptation_difficulty": "high", "priority": "medium"}
        ]
    )
    print(json.dumps(adaptation, indent=2))
    
    # Sister City Project Matching
    sister_match = gke.create_sister_city_match(
        {"name": "Austin", "state": "Texas", "country": "United States", "population": 950000, "area_km2": 772},
        {"name": "Adelaide", "state": "South Australia", "country": "Australia", "population": 1300000, "area_km2": 1826},
        {
            "population_similarity": 0.8,
            "climate_similarity": 0.9,
            "economic_profile_similarity": 0.7,
            "transportation_challenges_similarity": 0.85,
            "political_structure_similarity": 0.75
        },
        [
            {
                "title": "Drought-Resistant Green Transit Corridors",
                "description": "Sharing knowledge on creating transit corridors with drought-resistant landscaping",
                "potential_benefits": ["Water conservation", "Enhanced public transit", "Urban cooling"]
            },
            {
                "title": "Technology Innovation District Mobility",
                "description": "Connecting innovation districts with sustainable transportation options",
                "potential_benefits": ["Reduced congestion", "Support for tech sector", "Showcase for mobility innovations"]
            }
        ]
    )
    print(json.dumps(sister_match, indent=2))
    
    # Translation of Technical Standards
    translation = gke.translate_technical_standard(
        "NACTO-GUD-2016",
        "Global Urban Street Design Guide",
        "United States",
        "English",
        "Spanish",
        [
            {
                "section_id": "section-1",
                "section_title": "Street Design Principles",
                "original_text": "Streets are public spaces for people as well as thoroughfares for movement.",
                "translated_text": "Las calles son espacios públicos para las personas, así como vías para el movimiento."
            },
            {
                "section_id": "section-2",
                "section_title": "Sidewalks",
                "original_text": "Sidewalks play a vital role in city life. As conduits for pedestrian movement and access, they enhance connectivity and promote walking.",
                "translated_text": "Las aceras juegan un papel vital en la vida urbana. Como conductos para el movimiento y acceso peatonal, mejoran la conectividad y promueven caminar."
            }
        ]
    )
    print(json.dumps(translation, indent=2))
    
    # Global Benchmarking Dashboard
    dashboard = gke.create_benchmarking_dashboard(
        "BENCH-2023-001",
        {
            "name": "Portland", 
            "state": "Oregon", 
            "country": "United States",
            "metrics": {
                "cycling_mode_share": 6.3,
                "transit_mode_share": 12.1,
                "pedestrian_fatalities_per_100k": 1.7,
                "average_commute_time_minutes": 27.2,
                "transit_stop_access_percent": 72
            }
        },
        [
            {
                "name": "Minneapolis", 
                "state": "Minnesota", 
                "country": "United States",
                "metrics": {
                    "cycling_mode_share": 4.1,
                    "transit_mode_share": 13.4,
                    "pedestrian_fatalities_per_100k": 1.2,
                    "average_commute_time_minutes": 24.8,
                    "transit_stop_access_percent": 68
                }
            },
            {
                "name": "Vancouver", 
                "province": "British Columbia", 
                "country": "Canada",
                "metrics": {
                    "cycling_mode_share": 7.3,
                    "transit_mode_share": 20.5,
                    "pedestrian_fatalities_per_100k": 0.9,
                    "average_commute_time_minutes": 29.7,
                    "transit_stop_access_percent": 83
                }
            },
            {
                "name": "Utrecht", 
                "country": "Netherlands",
                "metrics": {
                    "cycling_mode_share": 33.2,
                    "transit_mode_share": 17.6,
                    "pedestrian_fatalities_per_100k": 0.3,
                    "average_commute_time_minutes": 25.1,
                    "transit_stop_access_percent": 89
                }
            }
        ],
        {
            "cycling_mode_share": {
                "display_name": "Cycling Mode Share (%)",
                "description": "Percentage of trips made by bicycle",
                "higher_is_better": True
            },
            "transit_mode_share": {
                "display_name": "Transit Mode Share (%)",
                "description": "Percentage of trips made by public transit",
                "higher_is_better": True
            },
            "pedestrian_fatalities_per_100k": {
                "display_name": "Pedestrian Fatalities per 100k Population",
                "description": "Annual pedestrian deaths per 100,000 residents",
                "higher_is_better": False
            },
            "average_commute_time_minutes": {
                "display_name": "Average Commute Time (minutes)",
                "description": "Average one-way commute time in minutes",
                "higher_is_better": False
            },
            "transit_stop_access_percent": {
                "display_name": "Transit Stop Access (%)",
                "description": "Percentage of population within 400m of frequent transit",
                "higher_is_better": True
            }
        },
        "2022"
    )
    print(json.dumps(dashboard, indent=2)) 