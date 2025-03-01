"""
Module: emergency_resilience_planning.py

This module implements emergency and resilience planning features including:
1. Disaster Response Integration: Tools to adapt transportation plans during emergencies.
2. Critical Infrastructure Mapping: Identify key transportation routes for emergency services.
3. Climate Resilience Assessment: Evaluate infrastructure performance under future climate scenarios.
4. Temporary Infrastructure Simulation: Model quick-build transportation solutions.
5. Risk Mitigation Planning: Tools to identify and address vulnerabilities in transportation networks.
"""

import json
from typing import Dict, List, Optional
from datetime import datetime
import random  # Used for simulation purposes only


class EmergencyResiliencePlanning:
    def __init__(self):
        # Dictionary to store emergency response plans by region
        self.emergency_response_plans = {}
        # Dictionary to store critical infrastructure maps by region
        self.critical_infrastructure = {}
        # Dictionary to store climate resilience assessments by project
        self.climate_assessments = {}
        # Dictionary to store temporary infrastructure solutions
        self.temporary_solutions = {}
        # Dictionary to store risk assessments and mitigation plans
        self.risk_mitigation_plans = {}

    def create_emergency_response_plan(self, region_id: str, name: str, emergency_types: List[str],
                                      transportation_adjustments: Dict, contact_info: Dict) -> Dict:
        """
        Creates or updates an emergency response plan for transportation systems.
        
        Args:
            region_id: Identifier for the region
            name: Name of the emergency plan
            emergency_types: List of emergency types this plan addresses
            transportation_adjustments: Dict of adjustments for different transport modes
            contact_info: Dict of emergency contacts
            
        Returns:
            The created emergency response plan
        """
        plan = {
            "name": name,
            "region_id": region_id,
            "emergency_types": emergency_types,
            "transportation_adjustments": transportation_adjustments,
            "contact_info": contact_info,
            "created_at": datetime.now().isoformat(),
            "last_updated": datetime.now().isoformat()
        }
        
        if region_id not in self.emergency_response_plans:
            self.emergency_response_plans[region_id] = []
            
        # Check if plan already exists and update it
        for i, existing_plan in enumerate(self.emergency_response_plans[region_id]):
            if existing_plan.get("name") == name:
                self.emergency_response_plans[region_id][i] = plan
                print(f"Updated emergency response plan: '{name}' for region {region_id}")
                return plan
                
        # If not found, add new plan
        self.emergency_response_plans[region_id].append(plan)
        print(f"Created emergency response plan: '{name}' for region {region_id}")
        return plan

    def map_critical_infrastructure(self, region_id: str, infrastructure_type: str, 
                                   locations: List[Dict], priority_level: str = "high",
                                   service_area_km: float = None) -> Dict:
        """
        Maps critical transportation infrastructure needed for emergency services.
        
        Args:
            region_id: Identifier for the region
            infrastructure_type: Type of infrastructure (e.g., 'evacuation_route', 'emergency_access')
            locations: List of location dictionaries with coordinates and metadata
            priority_level: Priority level ('high', 'medium', 'low')
            service_area_km: Radius of service area in kilometers
            
        Returns:
            The created infrastructure map
        """
        infrastructure_map = {
            "region_id": region_id,
            "infrastructure_type": infrastructure_type,
            "priority_level": priority_level,
            "locations": locations,
            "service_area_km": service_area_km,
            "created_at": datetime.now().isoformat()
        }
        
        map_id = f"{region_id}-{infrastructure_type}"
        
        if region_id not in self.critical_infrastructure:
            self.critical_infrastructure[region_id] = {}
            
        self.critical_infrastructure[region_id][infrastructure_type] = infrastructure_map
        print(f"Mapped critical {infrastructure_type} infrastructure for region {region_id}")
        return infrastructure_map

    def assess_climate_resilience(self, project_id: str, project_data: Dict, 
                                climate_scenarios: List[Dict], time_horizons: List[int]) -> Dict:
        """
        Evaluates how transportation infrastructure will perform under future climate scenarios.
        
        Args:
            project_id: Identifier for the project
            project_data: Dictionary with project details (location, materials, design specs)
            climate_scenarios: List of climate scenarios to test against
            time_horizons: List of years to evaluate (e.g., [2030, 2050, 2100])
            
        Returns:
            Climate resilience assessment results
        """
        assessment_results = {
            "project_id": project_id,
            "submission_date": datetime.now().isoformat(),
            "climate_scenarios": climate_scenarios,
            "time_horizons": time_horizons,
            "vulnerability_scores": {},
            "adaptation_recommendations": []
        }
        
        # Simulate vulnerability assessments for each scenario and time horizon
        for scenario in climate_scenarios:
            scenario_name = scenario.get("name", "Unnamed scenario")
            assessment_results["vulnerability_scores"][scenario_name] = {}
            
            for year in time_horizons:
                # This would normally be a complex calculation
                # Here we're just simulating with random values for demonstration
                vulnerability_score = random.uniform(0, 10)  # 0-10 scale where 10 is most vulnerable
                assessment_results["vulnerability_scores"][scenario_name][str(year)] = round(vulnerability_score, 1)
                
                # Generate recommendations based on vulnerability score
                if vulnerability_score > 7:
                    assessment_results["adaptation_recommendations"].append(
                        f"High vulnerability in {scenario_name} by {year}: Consider fundamental redesign with flood-resistant materials"
                    )
                elif vulnerability_score > 4:
                    assessment_results["adaptation_recommendations"].append(
                        f"Medium vulnerability in {scenario_name} by {year}: Incorporate elevated design elements"
                    )
                
        self.climate_assessments[project_id] = assessment_results
        print(f"Completed climate resilience assessment for project {project_id}")
        return assessment_results

    def create_temporary_infrastructure_solution(self, solution_name: str, emergency_type: str,
                                               implementation_time_hours: int, materials_needed: List[str],
                                               design_specs: Dict, use_cases: List[str]) -> Dict:
        """
        Models quick-build or emergency transportation solutions that can be rapidly deployed.
        
        Args:
            solution_name: Name of the temporary solution
            emergency_type: Type of emergency this solution addresses
            implementation_time_hours: Estimated deployment time in hours
            materials_needed: List of required materials
            design_specs: Dictionary of design specifications
            use_cases: List of appropriate use cases
            
        Returns:
            The created temporary infrastructure solution
        """
        solution = {
            "solution_name": solution_name,
            "emergency_type": emergency_type,
            "implementation_time_hours": implementation_time_hours,
            "materials_needed": materials_needed,
            "design_specs": design_specs,
            "use_cases": use_cases,
            "created_at": datetime.now().isoformat()
        }
        
        solution_id = solution_name.lower().replace(" ", "_")
        self.temporary_solutions[solution_id] = solution
        print(f"Created temporary infrastructure solution: '{solution_name}'")
        return solution

    def develop_risk_mitigation_plan(self, network_id: str, network_type: str, 
                                   identified_risks: List[Dict], mitigation_strategies: List[Dict],
                                   priority_scoring: Dict = None) -> Dict:
        """
        Identifies and addresses potential vulnerabilities in transportation networks.
        
        Args:
            network_id: Identifier for the transportation network
            network_type: Type of network (e.g., 'road', 'transit', 'bike')
            identified_risks: List of identified risks and their characteristics
            mitigation_strategies: List of strategies to address risks
            priority_scoring: Dictionary to score and prioritize risks
            
        Returns:
            The created risk mitigation plan
        """
        if priority_scoring is None:
            # Default priority scoring methodology
            priority_scoring = {
                "impact_weight": 0.7,
                "likelihood_weight": 0.3,
                "threshold_high": 7,
                "threshold_medium": 4
            }
            
        # Calculate priority scores for each risk
        for risk in identified_risks:
            impact = risk.get("impact_score", 5)
            likelihood = risk.get("likelihood_score", 5)
            risk["priority_score"] = round((impact * priority_scoring["impact_weight"] + 
                                          likelihood * priority_scoring["likelihood_weight"]), 1)
        
        # Sort risks by priority score
        sorted_risks = sorted(identified_risks, key=lambda x: x.get("priority_score", 0), reverse=True)
        
        mitigation_plan = {
            "network_id": network_id,
            "network_type": network_type,
            "identified_risks": sorted_risks,
            "mitigation_strategies": mitigation_strategies,
            "priority_scoring": priority_scoring,
            "created_at": datetime.now().isoformat()
        }
        
        self.risk_mitigation_plans[network_id] = mitigation_plan
        print(f"Developed risk mitigation plan for {network_type} network {network_id}")
        return mitigation_plan


if __name__ == "__main__":
    # Demo usage of the EmergencyResiliencePlanning module
    erp = EmergencyResiliencePlanning()
    
    # Disaster Response Integration
    emergency_plan = erp.create_emergency_response_plan(
        "downtown",
        "Downtown Flood Response Plan",
        ["flood", "heavy_rain"],
        {
            "roads": {"main_st": "close", "high_st": "emergency_vehicles_only"},
            "transit": {"bus_lines": ["reroute_1", "suspend_2"], "additional_services": ["evacuation_shuttle"]}
        },
        {
            "emergency_manager": {"name": "John Smith", "phone": "555-123-4567"},
            "transit_coordinator": {"name": "Jane Doe", "phone": "555-987-6543"}
        }
    )
    print(json.dumps(emergency_plan, indent=2))
    
    # Critical Infrastructure Mapping
    infrastructure_map = erp.map_critical_infrastructure(
        "downtown",
        "evacuation_route",
        [
            {"id": "route1", "name": "Main Street Corridor", "coordinates": [[40.7128, -74.0060], [40.7129, -74.0065]]},
            {"id": "route2", "name": "River Road", "coordinates": [[40.7135, -74.0070], [40.7140, -74.0075]]}
        ],
        "high",
        2.5
    )
    print(json.dumps(infrastructure_map, indent=2))
    
    # Climate Resilience Assessment
    climate_assessment = erp.assess_climate_resilience(
        "new_bridge_project",
        {"location": {"lat": 40.7128, "lng": -74.0060}, "materials": ["concrete", "steel"], "lifespan_years": 75},
        [
            {"name": "RCP4.5", "description": "Intermediate emissions scenario", "sea_level_rise_m": 0.5},
            {"name": "RCP8.5", "description": "High emissions scenario", "sea_level_rise_m": 1.0}
        ],
        [2030, 2050, 2100]
    )
    print(json.dumps(climate_assessment, indent=2))
    
    # Temporary Infrastructure Simulation
    temp_solution = erp.create_temporary_infrastructure_solution(
        "Modular Floating Bridge",
        "flood",
        8,
        ["pontoon modules", "connection joints", "ramp sections", "anchoring system"],
        {"length_m": 50, "width_m": 3, "load_capacity_kg": 2000, "assembly_steps": 12},
        ["emergency evacuation", "temporary supply route", "utility crew access"]
    )
    print(json.dumps(temp_solution, indent=2))
    
    # Risk Mitigation Planning
    risk_plan = erp.develop_risk_mitigation_plan(
        "central_transit_network",
        "bus",
        [
            {"id": "risk1", "description": "Flooding at downtown depot", "impact_score": 8, "likelihood_score": 6},
            {"id": "risk2", "description": "Landslide vulnerability on Route 5", "impact_score": 9, "likelihood_score": 3},
            {"id": "risk3", "description": "Power outages affecting traffic signals", "impact_score": 7, "likelihood_score": 7}
        ],
        [
            {"risk_id": "risk1", "strategy": "Relocate depot to higher ground", "cost_estimate": "$2.5M", "timeframe": "2-5 years"},
            {"risk_id": "risk2", "strategy": "Install slope monitoring system", "cost_estimate": "$350K", "timeframe": "1 year"},
            {"risk_id": "risk3", "strategy": "Add battery backup to critical intersections", "cost_estimate": "$750K", "timeframe": "18 months"}
        ]
    )
    print(json.dumps(risk_plan, indent=2)) 