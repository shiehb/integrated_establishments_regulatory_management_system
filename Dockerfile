# Use Railway's base image with Python and Node
FROM ghcr.io/railwayapp/nixpacks:ubuntu-1745885067

WORKDIR /app

# Install Python 3.11 with pip and Node.js 18
RUN nix-env -iA nixpkgs.python311Full nixpkgs.nodejs_18

# Copy requirements first for better caching
COPY server/requirements.txt /app/server/requirements.txt

# Install Python dependencies
RUN cd server && python3 -m ensurepip --upgrade --default-pip && \
    python3 -m pip install --upgrade pip setuptools wheel && \
    python3 -m pip install -r requirements.txt

# Copy package files
COPY package.json package-lock.json* ./

# Install Node dependencies
RUN npm install

# Copy the rest of the application
COPY . .

# Build frontend
RUN npm run build

# Collect static files
RUN cd server && python3 manage.py collectstatic --noinput || true

# Expose port
EXPOSE $PORT

# Start command
CMD cd server && gunicorn core.wsgi:application --bind 0.0.0.0:$PORT --workers 2 --threads 2 --timeout 120

