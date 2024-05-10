# syntax=docker/dockerfile:1

# https://docs.docker.com/engine/reference/builder/

ARG NODE_VERSION=21.7.3

################################################################################
# Use node image for base image for all stages.
# Can remove --platform=linux/amd64 if desired to build for i.e. ARM architectures
FROM --platform=linux/amd64 node:${NODE_VERSION}-slim as base

# Set working directory for all build stages.
WORKDIR /usr/src/app

################################################################################
# Create a stage for installing production dependecies.
FROM base as prod-deps

# Download dependencies as a separate step to take advantage of Docker's caching.
# Leverage a cache mount to /root/.npm to speed up subsequent builds.
# Leverage bind mounts to package.json and package-lock.json to avoid having to copy them
# into this layer.
RUN --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,source=package-lock.json,target=package-lock.json \
    --mount=type=cache,target=/root/.npm \
    npm ci --omit=dev

################################################################################
# Create a stage for installing rest of dependencies and copying src. Allows dev 
# environment to target this stage for hot building.
FROM prod-deps as full-deps

# Download additional development dependencies before building.
RUN --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,source=package-lock.json,target=package-lock.json \
    --mount=type=cache,target=/root/.npm \
    npm ci

################################################################################
# Create a stage for building.
FROM full-deps as build

# Copy the rest of the source files into the image.
COPY . .

# Run the build script.
RUN npm run build

################################################################################
# Create a new stage to run the application with minimal runtime dependencies
# where the necessary files are copied from the build stage.
FROM base as final

# Create LevelDB directory
RUN mkdir -p /usr/src/app/secretsdb

# Ensure node user has sufficient perms to LevelDB
RUN chown -R node:node /usr/src/app/secretsdb

# Use production node environment by default.
ENV NODE_ENV production

# Run the application as a non-root user.
USER node

# Copy package.json so that package manager commands can be used.
COPY package.json .

# Copy the production dependencies from the deps stage and also
# the built application from the build stage into the image.
COPY --from=prod-deps /usr/src/app/node_modules ./node_modules
COPY --from=build /usr/src/app/dist ./dist

# Expose the port that the application listens on.
EXPOSE 25565

# Run the application.
CMD npm start
