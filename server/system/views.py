import os
import subprocess
import json
from django.http import JsonResponse
from django.conf import settings
from django.views.decorators.csrf import csrf_exempt
from django.utils.timezone import localtime
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

# Directory where backups are stored
BACKUP_DIR = os.path.join(settings.BASE_DIR, "backups")
os.makedirs(BACKUP_DIR, exist_ok=True)

def get_db_config():
    """Get database configuration with fallbacks"""
    db = settings.DATABASES["default"]
    db_engine = db["ENGINE"]
    
    config = {
        'engine': db_engine,
        'name': db['NAME'],
        'user': db.get('USER', ''),
        'password': db.get('PASSWORD', ''),
        'host': db.get('HOST', 'localhost'),
        'port': db.get('PORT', '3306'),
    }
    
    return config

def is_mysql_available():
    """Check if MySQL utilities are available"""
    try:
        # Check if mysqldump is available
        result = subprocess.run(['which', 'mysqldump'], capture_output=True, text=True)
        if result.returncode == 0:
            return True
        
        # Check on Windows
        result = subprocess.run(['where', 'mysqldump'], capture_output=True, text=True)
        return result.returncode == 0
    except:
        return False

@csrf_exempt
def backup_database(request):
    """Create a database backup in SQL or JSON format"""
    if request.method != "POST":
        return JsonResponse({"error": "Method not allowed"}, status=405)
    
    try:
        # Parse request body
        if request.content_type == 'application/json':
            try:
                body = json.loads(request.body.decode("utf-8"))
            except json.JSONDecodeError:
                return JsonResponse({"error": "Invalid JSON"}, status=400)
        else:
            body = request.POST
        
        backup_format = body.get("format", "json")  # Default to JSON
        custom_path = body.get("path", "")
        
        # Use custom path or default backup directory
        save_path = custom_path if custom_path else BACKUP_DIR
        os.makedirs(save_path, exist_ok=True)
        
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        file_name = f"backup_{timestamp}.{backup_format}"
        file_path = os.path.join(save_path, file_name)

        db_config = get_db_config()
        db_engine = db_config['engine']

        if backup_format == "sql":
            if 'mysql' in db_engine:
                if not is_mysql_available():
                    return JsonResponse({
                        "error": "MySQL utilities (mysqldump) not found. Please install MySQL client tools."
                    }, status=400)
                
                # Build mysqldump command
                cmd = ["mysqldump"]
                
                # Add connection parameters
                if db_config['host'] and db_config['host'] != 'localhost':
                    cmd.extend(["-h", db_config['host']])
                
                if db_config['port'] and db_config['port'] != '3306':
                    cmd.extend(["-P", str(db_config['port'])])
                
                cmd.extend(["-u", db_config['user']])
                
                # Add password if provided
                if db_config['password']:
                    cmd.append(f"-p{db_config['password']}")
                else:
                    # Force password prompt if no password in config
                    cmd.append("-p")
                
                cmd.extend(["--result-file", file_path, db_config['name']])
                
                # Execute mysqldump
                try:
                    logger.info(f"Executing mysqldump: {' '.join(cmd[:5])}... [password hidden]")
                    result = subprocess.run(cmd, capture_output=True, text=True, timeout=300)
                    
                    if result.returncode != 0:
                        error_msg = result.stderr if result.stderr else "Unknown mysqldump error"
                        logger.error(f"MySQL dump failed: {error_msg}")
                        # Clean up failed backup file
                        if os.path.exists(file_path):
                            os.remove(file_path)
                        return JsonResponse({
                            "error": f"MySQL backup failed: {error_msg}"
                        }, status=500)
                        
                except subprocess.TimeoutExpired:
                    if os.path.exists(file_path):
                        os.remove(file_path)
                    return JsonResponse({"error": "Backup timed out after 5 minutes"}, status=500)
                    
            elif 'sqlite3' in db_engine:
                # SQLite backup - simply copy the file
                db_path = db_config['name']
                if not os.path.isabs(db_path):
                    db_path = os.path.join(settings.BASE_DIR, db_path)
                
                if not os.path.exists(db_path):
                    return JsonResponse({"error": f"SQLite database file not found: {db_path}"}, status=404)
                
                import shutil
                shutil.copy2(db_path, file_path)
            else:
                return JsonResponse({"error": f"Unsupported database for SQL backup: {db_engine}"}, status=400)

        elif backup_format == "json":
            # Use Django's dumpdata for JSON backup
            cmd = [
                "python", "manage.py", 
                "dumpdata", 
                "--indent", "2",
                "--natural-foreign",
                "--natural-primary",
                "--exclude", "contenttypes",
                "--exclude", "auth.permission"
            ]
            
            try:
                result = subprocess.run(
                    cmd, 
                    capture_output=True, 
                    text=True, 
                    timeout=120,
                    cwd=settings.BASE_DIR
                )
                
                if result.returncode == 0:
                    # Write successful output to file
                    with open(file_path, "w", encoding="utf-8") as f:
                        f.write(result.stdout)
                else:
                    error_msg = result.stderr if result.stderr else "Unknown dumpdata error"
                    logger.error(f"Dumpdata failed: {error_msg}")
                    return JsonResponse({
                        "error": f"JSON backup failed: {error_msg}"
                    }, status=500)
                    
            except subprocess.TimeoutExpired:
                return JsonResponse({"error": "JSON backup timed out"}, status=500)

        else:
            return JsonResponse({"error": "Unsupported format. Use 'sql' or 'json'"}, status=400)

        # Verify backup was created
        if not os.path.exists(file_path):
            return JsonResponse({"error": "Backup file was not created"}, status=500)
        
        # Get file size
        file_size = os.path.getsize(file_path)
        if file_size == 0:
            os.remove(file_path)
            return JsonResponse({"error": "Backup file is empty"}, status=500)
        
        return JsonResponse({
            "message": "Backup created successfully!",
            "fileName": file_name,
            "filePath": file_path,
            "size": f"{file_size / 1024:.2f} KB",
            "format": backup_format
        })

    except Exception as e:
        logger.error(f"Backup error: {str(e)}")
        return JsonResponse({"error": f"Backup failed: {str(e)}"}, status=500)

@csrf_exempt
def restore_database(request):
    """Restore database from uploaded file or existing backup"""
    if request.method != "POST":
        return JsonResponse({"error": "Method not allowed"}, status=405)
        
    try:
        file = request.FILES.get("file")
        file_name = request.POST.get("fileName")
        file_path = None

        if file:
            # Handle uploaded file
            if not file.name.endswith(('.sql', '.json')):
                return JsonResponse({"error": "Only .sql and .json files are supported"}, status=400)
                
            file_path = os.path.join(BACKUP_DIR, file.name)
            with open(file_path, "wb+") as dest:
                for chunk in file.chunks():
                    dest.write(chunk)
                    
        elif file_name:
            # Handle existing backup file
            # Security check
            if '..' in file_name or file_name.startswith('/'):
                return JsonResponse({"error": "Invalid file name"}, status=400)
                
            file_path = os.path.join(BACKUP_DIR, file_name)
            if not os.path.exists(file_path):
                return JsonResponse({"error": "Backup file not found"}, status=404)
        else:
            return JsonResponse({"error": "No file provided"}, status=400)

        db_config = get_db_config()
        db_engine = db_config['engine']

        if file_path.endswith(".sql"):
            if 'mysql' in db_engine:
                if not is_mysql_available():
                    return JsonResponse({
                        "error": "MySQL utilities (mysql) not found. Please install MySQL client tools."
                    }, status=400)
                
                # MySQL restore
                cmd = ["mysql"]
                
                # Add connection parameters
                if db_config['host'] and db_config['host'] != 'localhost':
                    cmd.extend(["-h", db_config['host']])
                
                if db_config['port'] and db_config['port'] != '3306':
                    cmd.extend(["-P", str(db_config['port'])])
                
                cmd.extend(["-u", db_config['user']])
                
                # Add password if provided
                if db_config['password']:
                    cmd.append(f"-p{db_config['password']}")
                
                cmd.append(db_config['name'])
                
                try:
                    with open(file_path, "r", encoding="utf-8") as f:
                        result = subprocess.run(cmd, stdin=f, capture_output=True, text=True, timeout=300)
                        
                    if result.returncode != 0:
                        error_msg = result.stderr if result.stderr else "Unknown mysql error"
                        return JsonResponse({
                            "error": f"MySQL restore failed: {error_msg}"
                        }, status=500)
                        
                except subprocess.TimeoutExpired:
                    return JsonResponse({"error": "Restore timed out after 5 minutes"}, status=500)
                    
            elif 'sqlite3' in db_engine:
                return JsonResponse({"error": "SQLite restore from SQL not supported. Use JSON format."}, status=400)
            else:
                return JsonResponse({"error": f"Unsupported database for SQL restore: {db_engine}"}, status=400)

        elif file_path.endswith(".json"):
            # Use Django's loaddata for JSON restore
            cmd = ["python", "manage.py", "loaddata", file_path]
            
            try:
                result = subprocess.run(
                    cmd, 
                    capture_output=True, 
                    text=True, 
                    timeout=300,
                    cwd=settings.BASE_DIR
                )
                
                if result.returncode != 0:
                    error_msg = result.stderr if result.stderr else "Unknown loaddata error"
                    return JsonResponse({
                        "error": f"JSON restore failed: {error_msg}"
                    }, status=500)
                    
            except subprocess.TimeoutExpired:
                return JsonResponse({"error": "JSON restore timed out"}, status=500)

        else:
            return JsonResponse({"error": "Unsupported file format"}, status=400)

        return JsonResponse({"message": "Database restored successfully!"})

    except Exception as e:
        logger.error(f"Restore error: {str(e)}")
        return JsonResponse({"error": f"Restore failed: {str(e)}"}, status=500)

def list_backups(request):
    """Return list of all backups with metadata"""
    if request.method != "GET":
        return JsonResponse({"error": "Method not allowed"}, status=405)
        
    try:
        files = []
        if not os.path.exists(BACKUP_DIR):
            os.makedirs(BACKUP_DIR, exist_ok=True)
            
        for fname in os.listdir(BACKUP_DIR):
            fpath = os.path.join(BACKUP_DIR, fname)
            if os.path.isfile(fpath) and (fname.endswith('.sql') or fname.endswith('.json')):
                created = datetime.fromtimestamp(os.path.getctime(fpath))
                size_bytes = os.path.getsize(fpath)
                
                # Convert to appropriate unit
                if size_bytes >= 1024 * 1024:  # MB
                    size_str = f"{size_bytes / (1024 * 1024):.2f} MB"
                else:  # KB
                    size_str = f"{size_bytes / 1024:.2f} KB"
                
                files.append({
                    "fileName": fname,
                    "size": size_str,
                    "sizeBytes": size_bytes,
                    "created": localtime(created).strftime("%Y-%m-%d %H:%M:%S"),
                    "format": "sql" if fname.endswith('.sql') else "json"
                })
        
        # Sort by creation time, newest first
        files.sort(key=lambda x: x["created"], reverse=True)
        return JsonResponse({"backups": files})
    
    except Exception as e:
        logger.error(f"List backups error: {str(e)}")
        return JsonResponse({"error": f"Failed to list backups: {str(e)}"}, status=500)

@csrf_exempt
def delete_backup(request, file_name):
    """Delete a backup file by name"""
    if request.method not in ["DELETE", "POST"]:
        return JsonResponse({"error": "Method not allowed"}, status=405)
        
    try:
        # Security check: prevent directory traversal
        if '..' in file_name or '/' in file_name or '\\' in file_name:
            return JsonResponse({"error": "Invalid file name"}, status=400)
            
        file_path = os.path.join(BACKUP_DIR, file_name)
        
        if not os.path.exists(file_path):
            return JsonResponse({"error": "File not found"}, status=404)
        
        # Ensure it's a backup file
        if not (file_name.endswith('.sql') or file_name.endswith('.json')):
            return JsonResponse({"error": "Not a backup file"}, status=400)
            
        os.remove(file_path)
        return JsonResponse({"message": "Backup deleted successfully"})
        
    except Exception as e:
        logger.error(f"Delete backup error: {str(e)}")
        return JsonResponse({"error": f"Delete failed: {str(e)}"}, status=500)