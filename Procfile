web: cd server && gunicorn core.wsgi:application --bind 0.0.0.0:$PORT --workers 2 --threads 2 --timeout 120
worker: cd server && celery -A core worker --loglevel=info
beat: cd server && celery -A core beat --loglevel=info

