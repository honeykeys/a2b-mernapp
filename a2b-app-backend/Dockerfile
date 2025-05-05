# Dockerfile (Place in backend directory)

# Use an official Node runtime as a parent image
# Choose a specific LTS version (e.g., 20) and consider Alpine for smaller images
FROM node:20-alpine

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json (or yarn.lock)
# Copying these first leverages Docker cache if dependencies haven't changed
COPY package*.json ./

# Install dependencies (--only=production ensures only production deps are installed)
# Use 'npm ci' for faster, more reliable installs in CI/CD environments
RUN npm ci --only=production

# Bundle app source code inside the Docker image
COPY . .

# Make your app's port available to the outside world
# Replace 5001 with the port your backend server listens on
EXPOSE 5001

# Define the command to run your app
# Replace server.js with your actual entry point file
CMD [ "node", "server.js" ]