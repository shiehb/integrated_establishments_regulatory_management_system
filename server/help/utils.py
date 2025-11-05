"""
Utility functions for help content management.
"""
import json
import os
from datetime import datetime
from django.conf import settings
from pathlib import Path


# Help directory configuration
HELP_DATA_DIR = os.path.join(settings.MEDIA_ROOT, 'help')
HELP_BACKUPS_DIR = os.path.join(HELP_DATA_DIR, 'backups')
HELP_TOPICS_FILE = os.path.join(HELP_DATA_DIR, 'help_topics.json')
HELP_CATEGORIES_FILE = os.path.join(HELP_DATA_DIR, 'help_categories.json')

# Ensure directories exist
os.makedirs(HELP_DATA_DIR, exist_ok=True)
os.makedirs(HELP_BACKUPS_DIR, exist_ok=True)


def get_help_topics():
    """Read help topics from JSON file."""
    try:
        if os.path.exists(HELP_TOPICS_FILE):
            with open(HELP_TOPICS_FILE, 'r', encoding='utf-8') as f:
                return json.load(f)
        return []
    except (json.JSONDecodeError, IOError) as e:
        raise ValueError(f"Error reading help topics: {str(e)}")


def get_help_categories():
    """Read help categories from JSON file."""
    try:
        if os.path.exists(HELP_CATEGORIES_FILE):
            with open(HELP_CATEGORIES_FILE, 'r', encoding='utf-8') as f:
                return json.load(f)
        return []
    except (json.JSONDecodeError, IOError) as e:
        raise ValueError(f"Error reading help categories: {str(e)}")


def save_help_topics(topics):
    """Save help topics to JSON file with backup."""
    # Validate JSON structure
    if not isinstance(topics, list):
        raise ValueError("Topics must be a list")
    
    # Validate each topic has required fields
    required_fields = ['id', 'title', 'description', 'category']
    for topic in topics:
        if not isinstance(topic, dict):
            raise ValueError("Each topic must be a dictionary")
        for field in required_fields:
            if field not in topic:
                raise ValueError(f"Topic missing required field: {field}")
    
    # Create backup before saving
    if os.path.exists(HELP_TOPICS_FILE):
        backup_file = os.path.join(
            HELP_BACKUPS_DIR,
            f"help_topics_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        )
        try:
            with open(HELP_TOPICS_FILE, 'r', encoding='utf-8') as src:
                with open(backup_file, 'w', encoding='utf-8') as dst:
                    dst.write(src.read())
        except IOError as e:
            # Log error but continue with save
            print(f"Warning: Failed to create backup: {e}")
    
    # Clean up old backups (keep last 10)
    cleanup_old_backups(HELP_BACKUPS_DIR, 'help_topics_', 10)
    
    # Save new data
    try:
        with open(HELP_TOPICS_FILE, 'w', encoding='utf-8') as f:
            json.dump(topics, f, indent=2, ensure_ascii=False)
        return True
    except IOError as e:
        raise ValueError(f"Error saving help topics: {str(e)}")


def save_help_categories(categories):
    """Save help categories to JSON file with backup."""
    # Validate JSON structure
    if not isinstance(categories, list):
        raise ValueError("Categories must be a list")
    
    # Validate each category has required fields
    required_fields = ['key', 'name']
    for category in categories:
        if not isinstance(category, dict):
            raise ValueError("Each category must be a dictionary")
        for field in required_fields:
            if field not in category:
                raise ValueError(f"Category missing required field: {field}")
    
    # Create backup before saving
    if os.path.exists(HELP_CATEGORIES_FILE):
        backup_file = os.path.join(
            HELP_BACKUPS_DIR,
            f"help_categories_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        )
        try:
            with open(HELP_CATEGORIES_FILE, 'r', encoding='utf-8') as src:
                with open(backup_file, 'w', encoding='utf-8') as dst:
                    dst.write(src.read())
        except IOError as e:
            print(f"Warning: Failed to create backup: {e}")
    
    # Clean up old backups (keep last 10)
    cleanup_old_backups(HELP_BACKUPS_DIR, 'help_categories_', 10)
    
    # Save new data
    try:
        with open(HELP_CATEGORIES_FILE, 'w', encoding='utf-8') as f:
            json.dump(categories, f, indent=2, ensure_ascii=False)
        return True
    except IOError as e:
        raise ValueError(f"Error saving help categories: {str(e)}")


def cleanup_old_backups(backup_dir, prefix, keep_count=10):
    """Remove old backup files, keeping only the most recent ones."""
    try:
        backup_files = [
            f for f in os.listdir(backup_dir)
            if f.startswith(prefix) and f.endswith('.json')
        ]
        
        if len(backup_files) > keep_count:
            # Sort by modification time (newest first)
            backup_files.sort(
                key=lambda f: os.path.getmtime(os.path.join(backup_dir, f)),
                reverse=True
            )
            
            # Delete oldest backups
            for old_file in backup_files[keep_count:]:
                try:
                    os.remove(os.path.join(backup_dir, old_file))
                except IOError:
                    pass  # Ignore errors when deleting old backups
    except (IOError, OSError):
        pass  # Ignore errors in cleanup


def export_help_data():
    """Export all help data as a single JSON object."""
    return {
        'topics': get_help_topics(),
        'categories': get_help_categories(),
        'exported_at': datetime.now().isoformat()
    }


def import_help_data(data):
    """Import help data from JSON object."""
    if not isinstance(data, dict):
        raise ValueError("Import data must be a dictionary")
    
    if 'topics' in data:
        save_help_topics(data['topics'])
    
    if 'categories' in data:
        save_help_categories(data['categories'])
    
    return True

