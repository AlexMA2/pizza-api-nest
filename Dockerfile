# Use a lightweight Node.js 20 Alpine image to reduce the final image size
FROM node:20-alpine AS builder

# Set the working directory inside the container for all subsequent commands
WORKDIR /usr/src/app

# Install pnpm globally to manage the project dependencies
RUN npm install -g pnpm

# Copy package management files first to leverage Docker's layer caching mechanism
COPY package.json pnpm-lock.yaml ./

# Install project dependencies securely based on the lockfile
RUN pnpm install --frozen-lockfile

# Copy all the remaining source code into the container
COPY . .

# Compile the NestJS application into the dist folder
RUN pnpm run build

# v20 is LTS. v22 contains beta features at this moment
FROM node:20-alpine AS runner
WORKDIR /usr/src/app

# Only copy important files to compile the app
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/package.json ./package.json
COPY --from=builder /usr/src/app/pnpm-lock.yaml ./pnpm-lock.yaml

# Expose port 3000 to indicate where the application listens
EXPOSE 3000

# Define the default command to start the compiled application
CMD ["node", "dist/main"]
