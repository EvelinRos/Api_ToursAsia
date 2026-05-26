import os
import sys
import time
import socket

def wait_for_db():
    db_engine = os.environ.get('DB_ENGINE', '')
    if 'postgresql' in db_engine:
        host = os.environ.get('DB_HOST', 'db')
        port = int(os.environ.get('DB_PORT', 5432))
        print(f"Waiting for PostgreSQL database at {host}:{port}...", flush=True)
        
        retries = 30
        while retries > 0:
            s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            s.settimeout(2)
            try:
                s.connect((host, port))
                s.close()
                print("Database is up and ready!", flush=True)
                break
            except (socket.error, socket.timeout):
                retries -= 1
                print(f"Database not ready yet... waiting (retries left: {retries})", flush=True)
                time.sleep(1)
        else:
            print("Could not connect to PostgreSQL database. Exiting.", flush=True)
            sys.exit(1)

def run_migrations():
    print("Running Django database migrations...", flush=True)
    exit_code = os.system("python manage.py migrate --noinput")
    if exit_code != 0:
        print("Database migrations failed! Exiting.", flush=True)
        sys.exit(exit_code)

def seed_database():
    try:
        import django
        os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'tours_asia.settings')
        django.setup()
        
        from destinos.models import Destino
        if not Destino.objects.exists():
            print("No data found in database. Running database seed script (seed_data.py)...", flush=True)
            import seed_data
            seed_data.run()
            print("Database successfully seeded!", flush=True)
        else:
            print("Database already has data. Skipping database seed.", flush=True)
    except Exception as e:
        print(f"Warning: Could not check or seed the database: {e}", flush=True)

if __name__ == '__main__':
    wait_for_db()
    run_migrations()
    seed_database()
    
    # Run server or whatever CMD was specified in Docker Compose
    if len(sys.argv) > 1:
        print(f"Executing custom command: {' '.join(sys.argv[1:])}", flush=True)
        # Using execvp on non-Windows environments replaces process 1
        # On Windows it runs as subprocess but preserves arguments.
        # Since the Docker container runs on Linux, this works perfectly.
        try:
            os.execvp(sys.argv[1], sys.argv[1:])
        except OSError as e:
            print(f"Error executing command: {e}", flush=True)
            sys.exit(1)
    else:
        print("Starting Django development server...", flush=True)
        try:
            os.execvp("python", ["python", "manage.py", "runserver", "0.0.0.0:8000"])
        except OSError as e:
            print(f"Error starting development server: {e}", flush=True)
            sys.exit(1)
