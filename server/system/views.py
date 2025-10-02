import os
import subprocess
import json
from django.http import JsonResponse, HttpResponse
from django.conf import settings
from django.views.decorators.csrf import csrf_exempt
from django.utils.timezone import localtime
from datetime import datetime
import logging
import traceback

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
        # Check if mysqldump is available on Windows
        result = subprocess.run(['where', 'mysqldump'], capture_output=True, text=True, timeout=5, shell=True)
        if result.returncode == 0:
            return True
        
        # Check common MariaDB installation paths
        common_paths = [
            r"C:\Program Files\MariaDB 10.4\bin\mysqldump.exe",
            r"C:\Program Files\MariaDB 10.3\bin\mysqldump.exe",
            r"C:\Program Files\MariaDB 10.2\bin\mysqldump.exe",
            r"C:\Program Files\MySQL\MySQL Server 8.0\bin\mysqldump.exe",
            r"C:\Program Files\MySQL\MySQL Server 5.7\bin\mysqldump.exe",
        ]
        
        for path in common_paths:
            if os.path.exists(path):
                return True
                
        return False
    except subprocess.TimeoutExpired:
        logger.warning("MySQL utility check timed out")
        return False
    except Exception as e:
        logger.warning(f"MySQL utility check failed: {str(e)}")
        return False

def get_mysqldump_path():
    """Get the full path to mysqldump if available"""
    try:
        result = subprocess.run(['where', 'mysqldump'], capture_output=True, text=True, timeout=5, shell=True)
        if result.returncode == 0:
            return result.stdout.strip().split('\n')[0]
    except:
        pass
    
    # Check common installation paths
    common_paths = [
        r"C:\Program Files\MariaDB 10.4\bin\mysqldump.exe",
        r"C:\Program Files\MariaDB 10.3\bin\mysqldump.exe",
        r"C:\Program Files\MariaDB 10.2\bin\mysqldump.exe",
        r"C:\Program Files\MySQL\MySQL Server 8.0\bin\mysqldump.exe",
        r"C:\Program Files\MySQL\MySQL Server 5.7\bin\mysqldump.exe",
    ]
    
    for path in common_paths:
        if os.path.exists(path):
            return path
    
    return None

def get_mysql_path():
    """Get the full path to mysql client if available"""
    try:
        result = subprocess.run(['where', 'mysql'], capture_output=True, text=True, timeout=5, shell=True)
        if result.returncode == 0:
            return result.stdout.strip().split('\n')[0]
    except:
        pass
    
    # Check common installation paths
    common_paths = [
        r"C:\Program Files\MariaDB 10.4\bin\mysql.exe",
        r"C:\Program Files\MariaDB 10.3\bin\mysql.exe",
        r"C:\Program Files\MariaDB 10.2\bin\mysql.exe",
        r"C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe",
        r"C:\Program Files\MySQL\MySQL Server 5.7\bin\mysql.exe",
    ]
    
    for path in common_paths:
        if os.path.exists(path):
            return path
    
    return None

def run_django_dumpdata_safe():
    """Run Django dumpdata with safe parameters for older MySQL/MariaDB versions"""
    try:
        # Set environment variables to ensure UTF-8 encoding
        env = os.environ.copy()
        env['PYTHONIOENCODING'] = 'utf-8'
        env['LANG'] = 'en_US.UTF-8'
        env['LC_ALL'] = 'en_US.UTF-8'
        
        # First try without natural keys (which cause issues with older MySQL)
        cmd = [
            "python", "manage.py", 
            "dumpdata", 
            "--indent", "2",
            "--exclude", "contenttypes",
            "--exclude", "auth.permission"
        ]
        
        result = subprocess.run(
            cmd, 
            capture_output=True, 
            text=True, 
            encoding='utf-8',  # Explicitly set UTF-8 encoding
            timeout=120,
            cwd=settings.BASE_DIR,
            shell=True,
            env=env
        )
        
        if result.returncode == 0:
            return True, result.stdout
        else:
            # If that fails, try with even fewer options
            cmd = [
                "python", "manage.py", 
                "dumpdata", 
                "--indent", "2"
            ]
            
            result = subprocess.run(
                cmd, 
                capture_output=True, 
                text=True, 
                encoding='utf-8',  # Explicitly set UTF-8 encoding
                timeout=120,
                cwd=settings.BASE_DIR,
                shell=True,
                env=env
            )
            
            if result.returncode == 0:
                return True, result.stdout
            else:
                return False, result.stderr
                
    except subprocess.TimeoutExpired:
        return False, "Timeout expired"
    except Exception as e:
        return False, str(e)

def create_sql_backup_python(db_config, file_path):
    """Create SQL backup using pure Python without mysqldump"""
    try:
        import pymysql
        
        logger.info("Creating SQL backup using Python...")
        
        # Get database connection parameters
        host = db_config['host'] or 'localhost'
        port = int(db_config['port'] or 3306)
        user = db_config['user']
        password = db_config['password']
        database = db_config['name']
        
        # Connect to database
        conn = pymysql.connect(
            host=host,
            port=port,
            user=user,
            password=password,
            database=database,
            charset='utf8mb4'
        )
        
        with conn.cursor() as cursor, open(file_path, 'w', encoding='utf-8') as f:
            # Write header
            f.write("-- MySQL dump created by Python\n")
            f.write(f"-- Database: {database}\n")
            f.write(f"-- Server: {host}:{port}\n")
            f.write(f"-- Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
            f.write("SET FOREIGN_KEY_CHECKS=0;\n\n")
            
            # Get all tables
            cursor.execute("SHOW TABLES")
            tables = [row[0] for row in cursor.fetchall()]
            
            for table in tables:
                f.write(f"--\n-- Table structure for table `{table}`\n--\n")
                f.write(f"DROP TABLE IF EXISTS `{table}`;\n")
                
                # Get table creation script
                cursor.execute(f"SHOW CREATE TABLE `{table}`")
                create_table_sql = cursor.fetchone()[1]
                f.write(f"{create_table_sql};\n\n")
                
                # Get table data
                f.write(f"--\n-- Dumping data for table `{table}`\n--\n")
                cursor.execute(f"SELECT * FROM `{table}`")
                rows = cursor.fetchall()
                
                if rows:
                    # Get column names
                    cursor.execute(f"DESCRIBE `{table}`")
                    columns = [col[0] for col in cursor.fetchall()]
                    
                    for row in rows:
                        values = []
                        for value in row:
                            if value is None:
                                values.append("NULL")
                            elif isinstance(value, (int, float)):
                                values.append(str(value))
                            else:
                                # Escape special characters
                                escaped_value = str(value).replace("'", "''").replace("\\", "\\\\")
                                values.append(f"'{escaped_value}'")
                        
                        insert_sql = f"INSERT INTO `{table}` ({', '.join([f'`{col}`' for col in columns])}) VALUES ({', '.join(values)});\n"
                        f.write(insert_sql)
                
                f.write("\n")
            
            f.write("SET FOREIGN_KEY_CHECKS=1;\n")
            f.write("-- Dump completed\n")
        
        conn.close()
        return True, "SQL backup created successfully"
        
    except ImportError:
        return False, "PyMySQL not installed. Run: pip install pymysql"
    except Exception as e:
        return False, f"Python SQL backup failed: {str(e)}"

def restore_sql_backup_python(db_config, file_path):
    """Restore SQL backup using pure Python without mysql client"""
    try:
        import pymysql
        
        logger.info("Restoring SQL backup using Python...")
        
        # Get database connection parameters
        host = db_config['host'] or 'localhost'
        port = int(db_config['port'] or 3306)
        user = db_config['user']
        password = db_config['password']
        database = db_config['name']
        
        # Connect to database
        conn = pymysql.connect(
            host=host,
            port=port,
            user=user,
            password=password,
            database=database,
            charset='utf8mb4'
        )
        
        with conn.cursor() as cursor, open(file_path, 'r', encoding='utf-8') as f:
            sql_script = f.read()
            
            # Split by semicolons but be careful about semicolons in strings
            statements = []
            current_statement = ""
            in_string = False
            string_char = None
            escaped = False
            
            for char in sql_script:
                if escaped:
                    current_statement += char
                    escaped = False
                elif char == '\\':
                    current_statement += char
                    escaped = True
                elif char in ('"', "'") and not in_string:
                    in_string = True
                    string_char = char
                    current_statement += char
                elif char == string_char and in_string:
                    in_string = False
                    string_char = None
                    current_statement += char
                elif char == ';' and not in_string:
                    statements.append(current_statement.strip())
                    current_statement = ""
                else:
                    current_statement += char
            
            # Add the last statement if any
            if current_statement.strip():
                statements.append(current_statement.strip())
            
            # Execute each statement
            for statement in statements:
                if statement and not statement.startswith('--') and not statement.startswith('/*'):
                    try:
                        cursor.execute(statement)
                    except Exception as e:
                        logger.warning(f"Failed to execute statement: {statement[:100]}... Error: {str(e)}")
                        # Continue with next statement
        
        conn.commit()
        conn.close()
        return True, "SQL restore completed successfully"
        
    except ImportError:
        return False, "PyMySQL not installed. Run: pip install pymysql"
    except Exception as e:
        return False, f"Python SQL restore failed: {str(e)}"

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
        
        # Validate format
        if backup_format not in ["json", "sql"]:
            return JsonResponse({"error": "Unsupported format. Use 'sql' or 'json'"}, status=400)
        
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
                # Try using mysqldump first if available
                mysqldump_path = get_mysqldump_path()
                if mysqldump_path:
                    # Build mysqldump command for Windows
                    cmd = [mysqldump_path]
                    
                    # Add connection parameters
                    if db_config['host'] and db_config['host'] != 'localhost':
                        cmd.extend(["-h", db_config['host']])
                    
                    if db_config['port'] and db_config['port'] != '3306':
                        cmd.extend(["-P", str(db_config['port'])])
                    
                    cmd.extend(["-u", db_config['user']])
                    
                    # Add password if provided
                    if db_config['password']:
                        cmd.append(f"-p{db_config['password']}")
                    
                    cmd.extend([db_config['name']])
                    
                    # Execute mysqldump and redirect output to file
                    try:
                        logger.info(f"Executing mysqldump for database: {db_config['name']}")
                        with open(file_path, 'w', encoding='utf-8') as output_file:
                            result = subprocess.run(
                                cmd, 
                                stdout=output_file,
                                stderr=subprocess.PIPE, 
                                text=True, 
                                encoding='utf-8',  # Explicitly set UTF-8 encoding
                                timeout=300,
                                shell=True
                            )
                        
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
                    except Exception as e:
                        if os.path.exists(file_path):
                            os.remove(file_path)
                        return JsonResponse({"error": f"MySQL backup error: {str(e)}"}, status=500)
                else:
                    # Fallback to Python-based SQL backup
                    success, message = create_sql_backup_python(db_config, file_path)
                    if not success:
                        if os.path.exists(file_path):
                            os.remove(file_path)
                        return JsonResponse({"error": message}, status=500)
                    
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
            # Use safe Django dumpdata approach
            success, output = run_django_dumpdata_safe()
            
            if success:
                try:
                    with open(file_path, "w", encoding="utf-8") as f:
                        f.write(output)
                except UnicodeEncodeError as e:
                    logger.error(f"Unicode encoding error when writing backup: {e}")
                    return JsonResponse({
                        "error": f"Failed to write backup file due to encoding issues: {str(e)}"
                    }, status=500)
            else:
                logger.error(f"JSON backup failed: {output}")
                return JsonResponse({
                    "error": f"JSON backup failed: {output}"
                }, status=500)

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
        logger.error(traceback.format_exc())
        return JsonResponse({"error": f"Backup failed: {str(e)}"}, status=500)

@csrf_exempt
def restore_database(request):
    """Restore database from uploaded file or existing backup"""
    if request.method != "POST":
        return JsonResponse({"error": "Method not allowed"}, status=405)
        
    try:
        file = request.FILES.get("file")
        file_name = request.POST.get("fileName")
        
        # Also try to get fileName from JSON body
        if not file_name and request.content_type == 'application/json':
            try:
                body = json.loads(request.body.decode("utf-8"))
                file_name = body.get("fileName")
            except json.JSONDecodeError:
                pass
        
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
                # Try using mysql client first if available
                mysql_path = get_mysql_path()
                if mysql_path:
                    # MySQL restore for Windows
                    cmd = [mysql_path]
                    
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
                            result = subprocess.run(cmd, stdin=f, capture_output=True, text=True, encoding='utf-8', timeout=300, shell=True)
                            
                        if result.returncode != 0:
                            error_msg = result.stderr if result.stderr else "Unknown mysql error"
                            return JsonResponse({
                                "error": f"MySQL restore failed: {error_msg}"
                            }, status=500)
                            
                    except subprocess.TimeoutExpired:
                        return JsonResponse({"error": "Restore timed out after 5 minutes"}, status=500)
                else:
                    # Fallback to Python-based SQL restore
                    success, message = restore_sql_backup_python(db_config, file_path)
                    if not success:
                        return JsonResponse({"error": message}, status=500)
                    
            elif 'sqlite3' in db_engine:
                return JsonResponse({"error": "SQLite restore from SQL not supported. Use JSON format."}, status=400)
            else:
                return JsonResponse({"error": f"Unsupported database for SQL restore: {db_engine}"}, status=400)

        elif file_path.endswith(".json"):
            # Use Django's loaddata for JSON restore
            cmd = ["python", "manage.py", "loaddata", file_path]
            
            try:
                # Set environment variables to ensure UTF-8 encoding
                env = os.environ.copy()
                env['PYTHONIOENCODING'] = 'utf-8'
                env['LANG'] = 'en_US.UTF-8'
                env['LC_ALL'] = 'en_US.UTF-8'
                
                result = subprocess.run(
                    cmd, 
                    capture_output=True, 
                    text=True, 
                    encoding='utf-8',  # Explicitly set UTF-8 encoding
                    timeout=300,
                    cwd=settings.BASE_DIR,
                    shell=True,
                    env=env
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
        logger.error(traceback.format_exc())
        return JsonResponse({"error": f"Restore failed: {str(e)}"}, status=500)

@csrf_exempt
def download_backup(request, file_name):
    """Download a backup file"""
    if request.method != "GET":
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
            
        # Serve the file for download
        with open(file_path, 'rb') as f:
            response = HttpResponse(f.read(), content_type='application/octet-stream')
            response['Content-Disposition'] = f'attachment; filename="{file_name}"'
            return response
            
    except Exception as e:
        logger.error(f"Download backup error: {str(e)}")
        logger.error(traceback.format_exc())
        return JsonResponse({"error": f"Download failed: {str(e)}"}, status=500)

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
                # Get creation time
                created_timestamp = os.path.getctime(fpath)
                created = datetime.fromtimestamp(created_timestamp)
                
                size_bytes = os.path.getsize(fpath)
                
                # Convert to appropriate unit
                if size_bytes >= 1024 * 1024:  # MB
                    size_str = f"{size_bytes / (1024 * 1024):.2f} MB"
                else:  # KB
                    size_str = f"{size_bytes / 1024:.2f} KB"
                
                # Use naive datetime directly without localtime() conversion
                files.append({
                    "fileName": fname,
                    "size": size_str,
                    "sizeBytes": size_bytes,
                    "created": created.strftime("%Y-%m-%d %H:%M:%S"),
                    "format": "sql" if fname.endswith('.sql') else "json"
                })
        
        # Sort by creation time, newest first
        files.sort(key=lambda x: x["created"], reverse=True)
        return JsonResponse({"backups": files})
    
    except Exception as e:
        logger.error(f"List backups error: {str(e)}")
        logger.error(traceback.format_exc())
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
        logger.error(traceback.format_exc())
        return JsonResponse({"error": f"Delete failed: {str(e)}"}, status=500)