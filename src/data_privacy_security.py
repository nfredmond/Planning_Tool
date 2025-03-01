"""
Module: data_privacy_security.py

This module implements data privacy and security features including:
1. Anonymization Options: Control over how personal information is shared when providing feedback.
2. Transparent Data Usage Policy: Clear explanation of how community input will be used.
3. Verification Without Barriers: Balance preventing spam while ensuring legitimate participation.
4. Secure Storage Solutions: Enterprise-level security for sensitive data.
5. Ethical AI Guidelines: Framework for ensuring AI features operate with transparency and fairness.
"""

import json
import hashlib
import uuid
import re
from typing import Dict, List, Optional
from datetime import datetime


class DataPrivacySecurity:
    def __init__(self):
        # Dictionary to store anonymization settings and profiles
        self.anonymization_profiles = {
            "default": {
                "display_name_mode": "first_initial_last_name",
                "location_precision": "neighborhood",
                "contact_info_visible": False,
                "demographic_info_visible": False
            },
            "full_anonymity": {
                "display_name_mode": "anonymous",
                "location_precision": "city",
                "contact_info_visible": False,
                "demographic_info_visible": False
            },
            "verified_public": {
                "display_name_mode": "full_name",
                "location_precision": "street_level",
                "contact_info_visible": True,
                "demographic_info_visible": True
            }
        }
        
        # Dictionary to store data usage policies
        self.data_usage_policies = {}
        
        # Dictionary to store verification methods
        self.verification_methods = {}
        
        # Dictionary to store secure storage configurations
        self.secure_storage_config = {
            "encryption_enabled": True,
            "backup_frequency_hours": 24,
            "retention_period_days": 365,
            "access_logging": True
        }
        
        # Dictionary to store AI ethics guidelines
        self.ai_ethics_guidelines = {}

    def create_anonymized_profile(self, user_id: str, user_data: Dict, 
                                anonymization_level: str = "default") -> Dict:
        """
        Creates an anonymized profile based on the selected anonymization level.
        
        Args:
            user_id: Unique identifier for the user
            user_data: Dictionary containing user information
            anonymization_level: Level of anonymization to apply
            
        Returns:
            Dictionary with the anonymized profile
        """
        if anonymization_level not in self.anonymization_profiles:
            print(f"Unknown anonymization level: {anonymization_level}. Using 'default'.")
            anonymization_level = "default"
            
        profile_settings = self.anonymization_profiles[anonymization_level]
        
        # Create a unique identifier that doesn't reveal the original user ID
        anonymized_id = hashlib.sha256(f"{user_id}-{uuid.uuid4()}".encode()).hexdigest()[:12]
        
        anonymized_profile = {
            "anonymized_id": anonymized_id,
            "created_at": datetime.now().isoformat(),
            "anonymization_level": anonymization_level
        }
        
        # Apply name anonymization based on the profile settings
        if profile_settings["display_name_mode"] == "anonymous":
            anonymized_profile["display_name"] = f"Anonymous User {anonymized_id[:6]}"
        elif profile_settings["display_name_mode"] == "first_initial_last_name":
            first_name = user_data.get("first_name", "A")
            last_name = user_data.get("last_name", "User")
            anonymized_profile["display_name"] = f"{first_name[0]}. {last_name}"
        elif profile_settings["display_name_mode"] == "full_name":
            anonymized_profile["display_name"] = f"{user_data.get('first_name', '')} {user_data.get('last_name', '')}"
        
        # Apply location anonymization based on the profile settings
        if "location" in user_data:
            if profile_settings["location_precision"] == "city":
                anonymized_profile["location"] = user_data.get("location", {}).get("city", "Unknown City")
            elif profile_settings["location_precision"] == "neighborhood":
                anonymized_profile["location"] = f"{user_data.get('location', {}).get('neighborhood', 'Unknown Neighborhood')}, {user_data.get('location', {}).get('city', 'Unknown City')}"
            elif profile_settings["location_precision"] == "street_level":
                anonymized_profile["location"] = f"{user_data.get('location', {}).get('street', '')}, {user_data.get('location', {}).get('neighborhood', '')}, {user_data.get('location', {}).get('city', '')}"
        
        # Include contact information based on settings
        if profile_settings["contact_info_visible"] and "contact_info" in user_data:
            anonymized_profile["contact_info"] = user_data["contact_info"]
            
        # Include demographic information based on settings
        if profile_settings["demographic_info_visible"] and "demographics" in user_data:
            anonymized_profile["demographics"] = user_data["demographics"]
            
        print(f"Created anonymized profile with level '{anonymization_level}'")
        return anonymized_profile

    def create_data_usage_policy(self, policy_name: str, description: str, 
                               data_purposes: List[str], retention_period: str,
                               sharing_policies: List[Dict], user_rights: List[str]) -> Dict:
        """
        Creates a clear data usage policy that explains how community input will be used.
        
        Args:
            policy_name: Name of the policy document
            description: Brief description of the policy
            data_purposes: List of purposes for data collection
            retention_period: How long data will be retained
            sharing_policies: List of data sharing policies and recipients
            user_rights: List of user rights regarding their data
            
        Returns:
            The created data usage policy
        """
        policy = {
            "policy_name": policy_name,
            "description": description,
            "data_purposes": data_purposes,
            "retention_period": retention_period,
            "sharing_policies": sharing_policies,
            "user_rights": user_rights,
            "last_updated": datetime.now().isoformat(),
            "version": "1.0"
        }
        
        self.data_usage_policies[policy_name] = policy
        print(f"Created data usage policy: '{policy_name}'")
        return policy

    def configure_verification_method(self, method_name: str, description: str, 
                                    verification_steps: List[Dict], 
                                    accessibility_options: Dict) -> Dict:
        """
        Configures a verification method that balances preventing spam with accessibility.
        
        Args:
            method_name: Name of the verification method
            description: Description of the method
            verification_steps: List of steps in the verification process
            accessibility_options: Accessibility options for the verification method
            
        Returns:
            The configured verification method
        """
        method = {
            "method_name": method_name,
            "description": description,
            "verification_steps": verification_steps,
            "accessibility_options": accessibility_options,
            "created_at": datetime.now().isoformat()
        }
        
        self.verification_methods[method_name] = method
        print(f"Configured verification method: '{method_name}'")
        return method

    def configure_secure_storage(self, encryption_level: str, backup_frequency_hours: int,
                               retention_period_days: int, access_control_groups: List[Dict]) -> Dict:
        """
        Configures secure storage for sensitive planning documents and community data.
        
        Args:
            encryption_level: Level of encryption to apply
            backup_frequency_hours: How often to backup data in hours
            retention_period_days: How long to retain data in days
            access_control_groups: List of access control groups and permissions
            
        Returns:
            The updated secure storage configuration
        """
        self.secure_storage_config = {
            "encryption_level": encryption_level,
            "encryption_enabled": True,
            "backup_frequency_hours": backup_frequency_hours,
            "retention_period_days": retention_period_days,
            "access_control_groups": access_control_groups,
            "access_logging": True,
            "last_updated": datetime.now().isoformat()
        }
        
        print(f"Configured secure storage with {encryption_level} encryption")
        return self.secure_storage_config

    def define_ai_ethics_guidelines(self, guideline_name: str, principles: List[str],
                                  transparency_measures: List[str], fairness_criteria: List[Dict],
                                  oversight_process: Dict) -> Dict:
        """
        Defines ethical guidelines for AI and machine learning features.
        
        Args:
            guideline_name: Name of the ethics guideline
            principles: List of ethical principles
            transparency_measures: List of transparency measures
            fairness_criteria: List of fairness criteria and thresholds
            oversight_process: Dictionary describing the oversight process
            
        Returns:
            The created AI ethics guidelines
        """
        guidelines = {
            "guideline_name": guideline_name,
            "principles": principles,
            "transparency_measures": transparency_measures,
            "fairness_criteria": fairness_criteria,
            "oversight_process": oversight_process,
            "created_at": datetime.now().isoformat(),
            "version": "1.0"
        }
        
        self.ai_ethics_guidelines[guideline_name] = guidelines
        print(f"Defined AI ethics guidelines: '{guideline_name}'")
        return guidelines

    def sanitize_user_input(self, input_text: str, pii_types_to_redact: List[str] = None) -> str:
        """
        Sanitizes user input to redact potentially sensitive information.
        
        Args:
            input_text: The text to sanitize
            pii_types_to_redact: List of PII types to redact (e.g., ['email', 'phone', 'ssn'])
            
        Returns:
            Sanitized text with PII redacted
        """
        if pii_types_to_redact is None:
            pii_types_to_redact = ["email", "phone", "ssn"]
            
        sanitized_text = input_text
        
        # Redact email addresses
        if "email" in pii_types_to_redact:
            email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
            sanitized_text = re.sub(email_pattern, "[EMAIL REDACTED]", sanitized_text)
            
        # Redact phone numbers (simple pattern)
        if "phone" in pii_types_to_redact:
            phone_pattern = r'\b(\+\d{1,2}\s)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}\b'
            sanitized_text = re.sub(phone_pattern, "[PHONE REDACTED]", sanitized_text)
            
        # Redact SSNs
        if "ssn" in pii_types_to_redact:
            ssn_pattern = r'\b\d{3}[-]?\d{2}[-]?\d{4}\b'
            sanitized_text = re.sub(ssn_pattern, "[SSN REDACTED]", sanitized_text)
            
        return sanitized_text


if __name__ == "__main__":
    # Demo usage of the DataPrivacySecurity module
    dps = DataPrivacySecurity()
    
    # Anonymization Options
    user_data = {
        "first_name": "Jane",
        "last_name": "Smith",
        "email": "jane.smith@example.com",
        "location": {
            "street": "123 Main St",
            "neighborhood": "Downtown",
            "city": "Metropolis"
        },
        "contact_info": {
            "phone": "555-123-4567",
            "email": "jane.smith@example.com"
        },
        "demographics": {
            "age_range": "30-45",
            "income_range": "50k-75k"
        }
    }
    anonymized_profile = dps.create_anonymized_profile("user123", user_data, "default")
    print(json.dumps(anonymized_profile, indent=2))
    
    # Transparent Data Usage Policy
    data_policy = dps.create_data_usage_policy(
        "Community Feedback Data Policy",
        "This policy governs how community feedback is collected, stored, and used.",
        ["Improve transportation planning", "Identify community needs", "Measure project success"],
        "3 years after project completion",
        [
            {"recipient": "City Planning Department", "purpose": "Project implementation", "data_shared": ["Comments", "Location data"]},
            {"recipient": "Research partners", "purpose": "Transportation research", "data_shared": ["Anonymized comments", "Demographic summaries"]}
        ],
        ["Right to access your data", "Right to request deletion", "Right to download your contributions"]
    )
    print(json.dumps(data_policy, indent=2))
    
    # Verification Without Barriers
    verification_method = dps.configure_verification_method(
        "Smart Captcha Plus",
        "A verification system that adapts to user needs and abilities.",
        [
            {"step": "Device reputation check", "description": "Evaluate if the device has a history of legitimate use"},
            {"step": "Behavioral analysis", "description": "Check if user behavior matches human patterns"},
            {"step": "Adaptive challenge", "description": "Only present challenges when suspicious patterns detected"}
        ],
        {
            "screen_reader_compatible": True,
            "keyboard_navigation": True,
            "alternative_verification_options": ["Email link", "SMS code", "Voice call"]
        }
    )
    print(json.dumps(verification_method, indent=2))
    
    # Secure Storage Solutions
    storage_config = dps.configure_secure_storage(
        "AES-256",
        12,
        730,
        [
            {"group": "Administrators", "permissions": ["read", "write", "delete"], "members": ["admin1", "admin2"]},
            {"group": "Planners", "permissions": ["read", "write"], "members": ["planner1", "planner2", "planner3"]},
            {"group": "Analysts", "permissions": ["read"], "members": ["analyst1", "analyst2"]}
        ]
    )
    print(json.dumps(storage_config, indent=2))
    
    # Ethical AI Guidelines
    ai_guidelines = dps.define_ai_ethics_guidelines(
        "TransportVoice AI Ethics Framework",
        [
            "Fairness and non-discrimination in AI outcomes",
            "Transparency and explainability of AI decisions",
            "Privacy preservation in AI data processing",
            "Human oversight of automated decisions",
            "Accessibility and inclusivity of AI interfaces"
        ],
        [
            "Provide clear indicators when AI is being used",
            "Explain factors that influenced AI recommendations",
            "Disclose limitations of AI systems",
            "Provide options to opt out of AI features"
        ],
        [
            {"criterion": "Demographic parity", "threshold": 0.95, "description": "AI recommendations should be similar across demographic groups"},
            {"criterion": "Equal error rates", "threshold": 0.05, "description": "Error rates should be similar across demographic groups"},
            {"criterion": "Representation in training data", "threshold": 0.9, "description": "Training data should represent community demographics"}
        ],
        {
            "review_frequency": "quarterly",
            "review_committee": ["technical_expert", "ethics_expert", "community_representative"],
            "appeals_process": "Users can appeal AI decisions through the feedback system"
        }
    )
    print(json.dumps(ai_guidelines, indent=2))
    
    # Sanitize User Input
    sensitive_text = "My name is Jane and my email is jane.smith@example.com. Call me at 555-123-4567."
    sanitized_text = dps.sanitize_user_input(sensitive_text)
    print(f"Original: {sensitive_text}")
    print(f"Sanitized: {sanitized_text}") 