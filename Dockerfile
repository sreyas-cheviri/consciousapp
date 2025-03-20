FROM ghcr.io/puppeteer/puppeteer:24.4.0

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm ci

# Copy the rest of the project
COPY . .

# Compile TypeScript before running
RUN npm run build

# Run the compiled app
CMD ["node", "dist/index.js"]
