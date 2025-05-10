# Dockerfile for fpl-mern-app/backend

# ---- Base Node.js Image ----
# Use an official Node.js LTS (Long Term Support) version.
# 'alpine' variants are smaller but might lack some tools or have libc compatibility issues.
# 'slim' or full debian-based images are generally safer bets for Node.js apps.
FROM node:18-slim AS base

# Set working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json (or yarn.lock)
COPY package*.json ./

# ---- Dependencies ----
# Install app dependencies using a clean install if package-lock.json is present
# This layer is cached if package files don't change.
FROM base AS dependencies
RUN npm ci --only=production

# ---- Production Build (if you have a build step, e.g., for TypeScript) ----
# If your backend is plain JavaScript and doesn't have a separate build step,
# you can skip this stage or combine it.
# FROM dependencies AS build
# COPY . .
# RUN npm run build # If you have a build script in package.json

# ---- Production Image ----
# Copy dependencies and application code into a clean Node.js image.
FROM base AS production

# Set NODE_ENV to production
ENV NODE_ENV=production
# Expose the port the app runs on (should match your server.js)
ENV PORT=5001
EXPOSE 5001

# Copy installed dependencies from the 'dependencies' stage
COPY --from=dependencies /usr/src/app/node_modules ./node_modules

# Copy the rest of your application code
COPY . .

# Define the command to run your app
# This should match the "start" script in your package.json
CMD ["node", "server.js"]
# Or if your package.json start script is just "node server.js":
# CMD ["npm", "start"]
