# Use Python 3.11 slim image as base
FROM python:3.11-slim

# Install Node.js 18 and npm using official binary
RUN apt-get update && apt-get install -y \
    curl \
    ca-certificates \
    xz-utils \
    && curl -fsSL https://nodejs.org/dist/v18.20.4/node-v18.20.4-linux-x64.tar.xz -o node.tar.xz \
    && tar -xJf node.tar.xz -C /usr/local --strip-components=1 \
    && rm node.tar.xz \
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

