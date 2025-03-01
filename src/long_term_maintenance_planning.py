"""
Module: long_term_maintenance_planning.py

This module implements long-term maintenance planning features including:
1. Life-cycle Cost Calculators: Project infrastructure costs over entire lifespan.
2. Maintenance Schedule Generator: Create optimal maintenance schedules.
3. Asset Management Integration: Connect with municipal asset management systems.
4. Preventive Maintenance Optimization: Tools for cost-effective maintenance timing.
5. Community Maintenance Reporting: Enable residents to report maintenance needs.
"""

import json
from typing import Dict, List, Optional
from datetime import datetime, timedelta
import uuid
import random  # For demo purposes only


class LongTermMaintenancePlanning:
    def __init__(self):
        # Dictionary to store lifecycle cost analyses
        self.lifecycle_cost_analyses = {}
        # Dictionary to store maintenance schedules
        self.maintenance_schedules = {}
        # Dictionary to store asset management connections
        self.asset_management_connections = {}
        # Dictionary to store preventive maintenance optimizations
        self.preventive_maintenance_plans = {}
        # Dictionary to store community maintenance reports
        self.maintenance_reports = {}

    def calculate_lifecycle_costs(self, asset_id: str, asset_name: str, asset_type: str,
                                initial_cost: float, expected_lifespan_years: int,
                                annual_maintenance_costs: Dict[str, float],
                                replacement_schedule: List[Dict],
                                inflation_rate: float = 0.025) -> Dict:
        """
        Projects the full cost of infrastructure over its entire lifespan.
        
        Args:
            asset_id: Unique identifier for the asset
            asset_name: Name of the infrastructure asset
            asset_type: Type of infrastructure
            initial_cost: Initial construction/installation cost
            expected_lifespan_years: Expected lifespan in years
            annual_maintenance_costs: Dict mapping cost categories to annual amounts
            replacement_schedule: List of major replacements and their timing/costs
            inflation_rate: Annual inflation rate for future cost projections
            
        Returns:
            The completed lifecycle cost analysis
        """
        # Calculate total annual maintenance costs
        total_annual_maintenance = sum(annual_maintenance_costs.values())
        
        # Initialize cost projections
        yearly_costs = []
        cumulative_cost = initial_cost
        current_year = datetime.now().year
        
        # Calculate yearly costs including maintenance, inflation, and scheduled replacements
        for year in range(expected_lifespan_years):
            year_number = current_year + year
            # Apply inflation to maintenance costs
            adjusted_maintenance_cost = total_annual_maintenance * ((1 + inflation_rate) ** year)
            
            # Check if any replacements are scheduled for this year
            year_replacement_costs = 0
            for replacement in replacement_schedule:
                if replacement.get("year") == year:
                    # Apply inflation to replacement costs
                    year_replacement_costs += replacement.get("cost", 0) * ((1 + inflation_rate) ** year)
            
            yearly_cost = {
                "year": year_number,
                "maintenance_cost": round(adjusted_maintenance_cost, 2),
                "replacement_cost": round(year_replacement_costs, 2),
                "total_cost": round(adjusted_maintenance_cost + year_replacement_costs, 2)
            }
            
            yearly_costs.append(yearly_cost)
            cumulative_cost += yearly_cost["total_cost"]
        
        # Calculate key metrics
        total_maintenance_cost = sum(year["maintenance_cost"] for year in yearly_costs)
        total_replacement_cost = sum(year["replacement_cost"] for year in yearly_costs)
        annual_average_cost = cumulative_cost / expected_lifespan_years
        
        analysis = {
            "asset_id": asset_id,
            "asset_name": asset_name,
            "asset_type": asset_type,
            "initial_cost": initial_cost,
            "expected_lifespan_years": expected_lifespan_years,
            "annual_maintenance_costs": annual_maintenance_costs,
            "replacement_schedule": replacement_schedule,
            "inflation_rate": inflation_rate,
            "yearly_cost_projections": yearly_costs,
            "summary": {
                "initial_cost": initial_cost,
                "total_maintenance_cost": round(total_maintenance_cost, 2),
                "total_replacement_cost": round(total_replacement_cost, 2),
                "total_lifecycle_cost": round(cumulative_cost, 2),
                "annual_average_cost": round(annual_average_cost, 2)
            },
            "created_at": datetime.now().isoformat()
        }
        
        self.lifecycle_cost_analyses[asset_id] = analysis
        print(f"Calculated lifecycle costs for {asset_name} over {expected_lifespan_years} years")
        return analysis

    def generate_maintenance_schedule(self, schedule_id: str, asset_id: str, asset_name: str,
                                    start_date: str, asset_type: str, 
                                    maintenance_tasks: List[Dict],
                                    usage_patterns: Dict = None,
                                    climate_factors: Dict = None,
                                    available_resources: Dict = None) -> Dict:
        """
        Creates an optimal maintenance schedule based on various factors.
        
        Args:
            schedule_id: Unique identifier for the schedule
            asset_id: ID of the asset to be maintained
            asset_name: Name of the asset
            start_date: Start date for the maintenance schedule
            asset_type: Type of infrastructure asset
            maintenance_tasks: List of maintenance tasks and their frequencies
            usage_patterns: Dict of usage patterns affecting maintenance
            climate_factors: Dict of climate factors affecting maintenance
            available_resources: Dict of available maintenance resources
            
        Returns:
            The generated maintenance schedule
        """
        if usage_patterns is None:
            usage_patterns = {"weekday_intensity": 1.0, "weekend_intensity": 0.7}
            
        if climate_factors is None:
            climate_factors = {"winter_adjustment": 1.2, "summer_adjustment": 0.9}
            
        if available_resources is None:
            available_resources = {"maintenance_crew_capacity": 100, "equipment_availability": 0.8}
            
        # Parse start date
        try:
            start_datetime = datetime.fromisoformat(start_date)
        except ValueError:
            start_datetime = datetime.now()
            print(f"Invalid start date format. Using current date: {start_datetime.isoformat()}")
        
        # Generate scheduled maintenance events
        scheduled_events = []
        
        for task in maintenance_tasks:
            frequency_days = task.get("frequency_days", 90)
            priority = task.get("priority", "medium")
            duration_hours = task.get("duration_hours", 4)
            
            # Adjust frequency based on usage and climate
            if task.get("affected_by_usage", False) and "weekday_intensity" in usage_patterns:
                avg_intensity = (usage_patterns["weekday_intensity"] * 5 + usage_patterns["weekend_intensity"] * 2) / 7
                frequency_days = int(frequency_days / avg_intensity)
                
            if task.get("affected_by_climate", False):
                # Simplistic adjustment based on seasons
                # In a real implementation, this would be more sophisticated
                current_month = datetime.now().month
                if 12 <= current_month <= 2:  # Winter (Northern Hemisphere)
                    climate_adjustment = climate_factors.get("winter_adjustment", 1.0)
                elif 6 <= current_month <= 8:  # Summer (Northern Hemisphere)
                    climate_adjustment = climate_factors.get("summer_adjustment", 1.0)
                else:
                    climate_adjustment = 1.0
                    
                frequency_days = int(frequency_days * climate_adjustment)
            
            # Generate events for this task for the next 5 years
            current_date = start_datetime
            end_date = start_datetime + timedelta(days=365 * 5)  # 5 years ahead
            
            while current_date < end_date:
                event_id = str(uuid.uuid4())[:8]
                
                # Adjust exact date based on resource availability
                # In a real implementation, this would involve a more complex scheduling algorithm
                resource_adjustment_days = int(10 * (1 - available_resources.get("equipment_availability", 0.8)))
                adjusted_date = current_date + timedelta(days=random.randint(-resource_adjustment_days, resource_adjustment_days))
                
                event = {
                    "event_id": event_id,
                    "task_id": task.get("task_id"),
                    "task_name": task.get("task_name"),
                    "scheduled_date": adjusted_date.isoformat(),
                    "priority": priority,
                    "duration_hours": duration_hours,
                    "resources_needed": task.get("resources_needed", {})
                }
                
                scheduled_events.append(event)
                current_date += timedelta(days=frequency_days)
        
        # Sort events by date
        scheduled_events.sort(key=lambda x: x["scheduled_date"])
        
        schedule = {
            "schedule_id": schedule_id,
            "asset_id": asset_id,
            "asset_name": asset_name,
            "asset_type": asset_type,
            "start_date": start_datetime.isoformat(),
            "maintenance_tasks": maintenance_tasks,
            "usage_patterns": usage_patterns,
            "climate_factors": climate_factors,
            "available_resources": available_resources,
            "scheduled_events": scheduled_events,
            "created_at": datetime.now().isoformat(),
            "last_updated": datetime.now().isoformat()
        }
        
        self.maintenance_schedules[schedule_id] = schedule
        print(f"Generated maintenance schedule for {asset_name} with {len(scheduled_events)} events")
        return schedule

    def connect_asset_management_system(self, connection_id: str, system_name: str,
                                      connection_details: Dict, asset_types: List[str],
                                      sync_frequency_hours: int) -> Dict:
        """
        Connects with municipal asset management systems to track infrastructure condition.
        
        Args:
            connection_id: Unique identifier for the connection
            system_name: Name of the asset management system
            connection_details: Dictionary with connection details (API endpoints, credentials, etc.)
            asset_types: List of asset types to sync
            sync_frequency_hours: How often to sync data in hours
            
        Returns:
            The configured asset management connection
        """
        connection = {
            "connection_id": connection_id,
            "system_name": system_name,
            "connection_details": connection_details,
            "asset_types": asset_types,
            "sync_frequency_hours": sync_frequency_hours,
            "last_sync": None,
            "next_scheduled_sync": (datetime.now() + timedelta(hours=sync_frequency_hours)).isoformat(),
            "sync_history": [],
            "created_at": datetime.now().isoformat(),
            "status": "configured"
        }
        
        self.asset_management_connections[connection_id] = connection
        print(f"Configured connection to asset management system: {system_name}")
        return connection

    def optimize_preventive_maintenance(self, asset_id: str, asset_name: str, 
                                      condition_data: List[Dict], failure_models: Dict,
                                      maintenance_options: List[Dict], cost_factors: Dict) -> Dict:
        """
        Identifies the most cost-effective timing for maintenance interventions.
        
        Args:
            asset_id: Unique identifier for the asset
            asset_name: Name of the asset
            condition_data: List of condition assessments over time
            failure_models: Dictionary of failure models for different components
            maintenance_options: List of maintenance intervention options
            cost_factors: Dictionary of cost factors for decision making
            
        Returns:
            The optimized preventive maintenance plan
        """
        # Sort condition data by date
        sorted_condition_data = sorted(condition_data, key=lambda x: x["assessment_date"])
        
        # Predict condition deterioration based on historical data
        predicted_conditions = []
        
        if sorted_condition_data:
            # Simple linear deterioration model for demo purposes
            # In a real implementation, this would use more sophisticated statistical models
            latest_condition = sorted_condition_data[-1]["condition_score"]
            
            # Calculate average deterioration rate from historical data
            if len(sorted_condition_data) >= 2:
                first_date = datetime.fromisoformat(sorted_condition_data[0]["assessment_date"])
                last_date = datetime.fromisoformat(sorted_condition_data[-1]["assessment_date"])
                date_diff_years = (last_date - first_date).days / 365.0
                
                if date_diff_years > 0:
                    first_score = sorted_condition_data[0]["condition_score"]
                    last_score = sorted_condition_data[-1]["condition_score"]
                    deterioration_rate_per_year = (first_score - last_score) / date_diff_years
                else:
                    deterioration_rate_per_year = 0.1  # Default fallback
            else:
                deterioration_rate_per_year = 0.1  # Default fallback
            
            # Generate condition predictions for the next 5 years
            current_date = datetime.fromisoformat(sorted_condition_data[-1]["assessment_date"])
            current_condition = latest_condition
            
            for year in range(1, 6):  # 5 years prediction
                prediction_date = current_date + timedelta(days=365 * year)
                predicted_condition = max(0, current_condition - (deterioration_rate_per_year * year))
                
                predicted_conditions.append({
                    "prediction_date": prediction_date.isoformat(),
                    "predicted_condition": round(predicted_condition, 2)
                })
        
        # Determine optimal intervention points
        interventions = []
        maintenance_threshold = cost_factors.get("maintenance_threshold", 0.6)
        
        for prediction in predicted_conditions:
            if prediction["predicted_condition"] < maintenance_threshold:
                # Find the most cost-effective maintenance option
                best_option = None
                best_cost_benefit = 0
                
                for option in maintenance_options:
                    condition_improvement = option.get("condition_improvement", 0)
                    option_cost = option.get("cost", 0)
                    
                    if option_cost > 0:
                        cost_benefit = condition_improvement / option_cost
                        if cost_benefit > best_cost_benefit:
                            best_cost_benefit = cost_benefit
                            best_option = option
                
                if best_option:
                    intervention = {
                        "intervention_id": str(uuid.uuid4())[:8],
                        "recommended_date": prediction["prediction_date"],
                        "predicted_condition_before": prediction["predicted_condition"],
                        "predicted_condition_after": min(1.0, prediction["predicted_condition"] + best_option.get("condition_improvement", 0)),
                        "recommended_action": best_option.get("name"),
                        "estimated_cost": best_option.get("cost"),
                        "cost_benefit_ratio": best_cost_benefit
                    }
                    
                    interventions.append(intervention)
                    # Adjust future predictions based on this intervention
                    condition_improvement = best_option.get("condition_improvement", 0)
                    future_condition = min(1.0, prediction["predicted_condition"] + condition_improvement)
                    
                    # Update remaining predictions
                    intervention_index = predicted_conditions.index(prediction)
                    for i in range(intervention_index + 1, len(predicted_conditions)):
                        years_since_intervention = i - intervention_index
                        predicted_conditions[i]["predicted_condition"] = max(0, future_condition - (deterioration_rate_per_year * years_since_intervention))
        
        # Calculate optimization metrics
        total_maintenance_cost = sum(intervention["estimated_cost"] for intervention in interventions)
        condition_improvement = sum(intervention["predicted_condition_after"] - intervention["predicted_condition_before"] 
                                  for intervention in interventions)
        
        optimization_plan = {
            "asset_id": asset_id,
            "asset_name": asset_name,
            "historical_condition_data": condition_data,
            "predicted_conditions": predicted_conditions,
            "recommended_interventions": interventions,
            "optimization_metrics": {
                "total_maintenance_cost": total_maintenance_cost,
                "total_condition_improvement": round(condition_improvement, 2),
                "cost_per_condition_point": round(total_maintenance_cost / condition_improvement, 2) if condition_improvement > 0 else 0
            },
            "created_at": datetime.now().isoformat()
        }
        
        self.preventive_maintenance_plans[asset_id] = optimization_plan
        print(f"Optimized preventive maintenance for {asset_name} with {len(interventions)} interventions")
        return optimization_plan

    def submit_maintenance_report(self, report_id: str, asset_id: str, location: Dict,
                                reporter_id: str, issue_type: str, description: str,
                                severity: str, photos: List[str] = None) -> Dict:
        """
        Creates a maintenance report from community feedback.
        
        Args:
            report_id: Unique identifier for the report
            asset_id: ID of the asset needing maintenance
            location: Dictionary with location details
            reporter_id: ID of the person reporting the issue
            issue_type: Type of maintenance issue
            description: Description of the maintenance issue
            severity: Severity level of the issue
            photos: List of photo URLs documenting the issue
            
        Returns:
            The created maintenance report
        """
        if photos is None:
            photos = []
            
        report = {
            "report_id": report_id,
            "asset_id": asset_id,
            "location": location,
            "reporter_id": reporter_id,
            "issue_type": issue_type,
            "description": description,
            "severity": severity,
            "photos": photos,
            "status": "submitted",
            "submission_date": datetime.now().isoformat(),
            "last_updated": datetime.now().isoformat(),
            "votes": 1,  # Initial vote from the reporter
            "comments": []
        }
        
        self.maintenance_reports[report_id] = report
        print(f"Submitted maintenance report ID {report_id} for {issue_type} issue")
        return report

    def vote_on_maintenance_report(self, report_id: str, voter_id: str, vote_type: str = "upvote") -> Dict:
        """
        Allows community members to vote on an existing maintenance report.
        
        Args:
            report_id: ID of the maintenance report
            voter_id: ID of the voter
            vote_type: Type of vote ('upvote' or 'downvote')
            
        Returns:
            The updated report with vote count
        """
        if report_id not in self.maintenance_reports:
            print(f"Maintenance report {report_id} not found")
            return None
            
        report = self.maintenance_reports[report_id]
        
        # In a real implementation, we would track individual voters
        # For this demo, we'll just increment/decrement the vote count
        if vote_type == "upvote":
            report["votes"] += 1
        elif vote_type == "downvote":
            report["votes"] -= 1
            
        report["last_updated"] = datetime.now().isoformat()
        print(f"Recorded {vote_type} from {voter_id} on report {report_id}")
        return report


if __name__ == "__main__":
    # Demo usage of the LongTermMaintenancePlanning module
    ltmp = LongTermMaintenancePlanning()
    
    # Life-cycle Cost Calculators
    lifecycle_costs = ltmp.calculate_lifecycle_costs(
        "BL-2023-001",
        "Oak Street Bike Lane",
        "bike_lane",
        250000,  # $250,000 initial cost
        25,  # 25 year lifespan
        {
            "pavement_maintenance": 5000,  # $5,000 per year
            "signage_maintenance": 1500,   # $1,500 per year
            "striping_maintenance": 3500   # $3,500 per year
        },
        [
            {"year": 5, "component": "restriping", "cost": 45000},
            {"year": 10, "component": "surface_rehabilitation", "cost": 120000},
            {"year": 15, "component": "restriping", "cost": 45000},
            {"year": 20, "component": "signage_replacement", "cost": 35000}
        ]
    )
    print(json.dumps(lifecycle_costs["summary"], indent=2))
    
    # Maintenance Schedule Generator
    maintenance_schedule = ltmp.generate_maintenance_schedule(
        "SCH-2023-001",
        "BL-2023-001",
        "Oak Street Bike Lane",
        datetime.now().isoformat(),
        "bike_lane",
        [
            {
                "task_id": "task1",
                "task_name": "Pavement Inspection",
                "frequency_days": 90,
                "priority": "medium",
                "duration_hours": 2,
                "affected_by_usage": False,
                "affected_by_climate": True,
                "resources_needed": {"staff": 1, "equipment": "inspection_vehicle"}
            },
            {
                "task_id": "task2",
                "task_name": "Debris Clearing",
                "frequency_days": 14,
                "priority": "high",
                "duration_hours": 3,
                "affected_by_usage": True,
                "affected_by_climate": True,
                "resources_needed": {"staff": 2, "equipment": "sweeper_vehicle"}
            },
            {
                "task_id": "task3",
                "task_name": "Sign Inspection",
                "frequency_days": 180,
                "priority": "low",
                "duration_hours": 2,
                "affected_by_usage": False,
                "affected_by_climate": False,
                "resources_needed": {"staff": 1, "equipment": "none"}
            }
        ],
        {"weekday_intensity": 1.2, "weekend_intensity": 0.8},
        {"winter_adjustment": 1.3, "summer_adjustment": 0.9},
        {"maintenance_crew_capacity": 80, "equipment_availability": 0.7}
    )
    print(f"Generated {len(maintenance_schedule['scheduled_events'])} scheduled maintenance events")
    print(json.dumps(maintenance_schedule["scheduled_events"][0], indent=2))
    
    # Asset Management Integration
    connection = ltmp.connect_asset_management_system(
        "AMS-CONN-001",
        "CityWorks",
        {
            "api_endpoint": "https://cityworks.example.com/api/v2/",
            "authentication": {"type": "oauth2", "client_id": "transport_voice_app"},
            "sync_mode": "bidirectional"
        },
        ["bike_lane", "traffic_signal", "bus_stop", "road_segment"],
        24  # Sync every 24 hours
    )
    print(json.dumps(connection, indent=2))
    
    # Preventive Maintenance Optimization
    optimization = ltmp.optimize_preventive_maintenance(
        "BL-2023-001",
        "Oak Street Bike Lane",
        [
            {"assessment_date": "2021-01-15T00:00:00", "condition_score": 1.0, "assessor": "initial_construction"},
            {"assessment_date": "2021-07-15T00:00:00", "condition_score": 0.95, "assessor": "maintenance_team"},
            {"assessment_date": "2022-01-15T00:00:00", "condition_score": 0.9, "assessor": "maintenance_team"},
            {"assessment_date": "2022-07-15T00:00:00", "condition_score": 0.82, "assessor": "maintenance_team"},
            {"assessment_date": "2023-01-15T00:00:00", "condition_score": 0.75, "assessor": "maintenance_team"}
        ],
        {
            "pavement": {"rate": 0.1, "threshold": 0.6},
            "signage": {"rate": 0.05, "threshold": 0.7},
            "striping": {"rate": 0.15, "threshold": 0.5}
        },
        [
            {"name": "Minor Repair", "condition_improvement": 0.1, "cost": 5000, "components": ["pavement"]},
            {"name": "Restriping", "condition_improvement": 0.3, "cost": 15000, "components": ["striping"]},
            {"name": "Major Rehabilitation", "condition_improvement": 0.5, "cost": 50000, "components": ["pavement", "striping"]},
            {"name": "Complete Replacement", "condition_improvement": 0.95, "cost": 200000, "components": ["pavement", "striping", "signage"]}
        ],
        {
            "maintenance_threshold": 0.65,
            "budget_constraint_annual": 75000,
            "min_condition_acceptable": 0.5
        }
    )
    print(json.dumps(optimization["optimization_metrics"], indent=2))
    
    # Community Maintenance Reporting
    report = ltmp.submit_maintenance_report(
        "RPT-2023-001",
        "BL-2023-001",
        {"latitude": 45.5231, "longitude": -122.6765, "address": "123 Oak Street", "intersection": "Oak & 5th"},
        "user123",
        "pavement_damage",
        "Large crack across the bike lane making it difficult to ride safely",
        "high",
        ["https://example.com/report_photo1.jpg", "https://example.com/report_photo2.jpg"]
    )
    print(json.dumps(report, indent=2))
    
    # Vote on report
    updated_report = ltmp.vote_on_maintenance_report("RPT-2023-001", "user456")
    print(f"Report now has {updated_report['votes']} votes") 