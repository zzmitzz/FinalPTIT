# Use a Node.js base image with Python
FROM node:20.18.3-alpine

# Install Python and other necessary tools
RUN apk update && \
    apk add --no-cache python3 py3-pip make gcc g++

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json (or yarn.lock)
COPY package*.json ./

# Install npm version 10.8.1
RUN npm install -g npm@10.8.1

# Install dependencies using npm ci
RUN npm ci

# Copy the rest of the application code
COPY . .

# Expose the port your Node.js app runs on (e.g., 3000)
EXPOSE 3000

# Define the command to run your application
CMD ["npm", "run", "start"]