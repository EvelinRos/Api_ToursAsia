# Use Node.js 20 Alpine image
FROM node:20-alpine AS dev

# Set working directory
WORKDIR /app

# Copy package management files first to leverage Docker layer caching
COPY package*.json /app/

# Install development dependencies
RUN npm install

# Copy the rest of the application code
COPY . /app/

# Expose default Angular port
EXPOSE 4200

# Start Angular development server bound to all interfaces
# Using --poll guarantees file watching works properly when hosted on Windows (WSL/Docker Desktop)
CMD ["npm", "run", "start", "--", "--host", "0.0.0.0", "--poll", "2000"]

