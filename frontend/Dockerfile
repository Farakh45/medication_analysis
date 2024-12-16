# Use Node.js LTS version
FROM node:16

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json for dependency installation
COPY package*.json ./

# Install project dependencies
RUN npm install

# Copy project files, including the public folder
COPY . .

# Build the React app for production
RUN npm run build

# Install a lightweight HTTP server to serve static files
RUN npm install -g serve

# Expose the port on which the app will run
EXPOSE 3000

# Command to serve the React app
CMD ["serve", "-s", "build", "-l", "3000"]
