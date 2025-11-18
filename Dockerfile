# Use Python 3.11 slim image as base
FROM python:3.11-slim

# Install Node.js 18
RUN apt-get update && apt-get install -y \
    curl \
    && curl -fsSL https://deb.nodesource.com/setup_18.x | bash - \
    && apt-get install -y nodejs \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy requirements first for better caching
COPY server/requirements.txt /app/server/requirements.txt

# Install Python dependencies
RUN pip install --upgrade pip setuptools wheel && \
    pip install -r server/requirements.txt

# Copy package files
COPY package.json package-lock.json* ./

# Install Node dependencies
RUN npm install

# Copy the rest of the application
COPY . .

# Build frontend
RUN npm run build

# Collect static files
RUN cd server && python manage.py collectstatic --noinput || true

# Expose port
EXPOSE $PORT

# Start command
CMD cd server && gunicorn core.wsgi:application --bind 0.0.0.0:$PORT --workers 2 --threads 2 --timeout 120

