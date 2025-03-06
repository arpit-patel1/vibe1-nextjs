# Use Node.js 18 as the base image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY kidskills/package.json kidskills/package-lock.json* ./

# Install dependencies
RUN npm ci

# Copy the rest of the application
COPY kidskills/ .

# Set environment variables to bypass ESLint checks and disable telemetry
ENV NEXT_TELEMETRY_DISABLED=1
ENV NEXT_IGNORE_ESLINT=1
ENV NODE_ENV=production

# Build the Next.js application
RUN npm run build

# Ensure all static assets are properly copied for standalone mode
RUN mkdir -p /app/.next/static
RUN mkdir -p /app/.next/standalone/.next/static
RUN mkdir -p /app/.next/standalone/public
RUN cp -R /app/public /app/.next/
RUN cp -R /app/public /app/.next/standalone/
# Copy static assets to the correct location for standalone mode
RUN cp -R /app/.next/static /app/.next/standalone/.next/

# Expose the port the app will run on
EXPOSE 3000

# Set the environment variable for the app to listen on all interfaces
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Create a script to inject environment variables at runtime
RUN echo '#!/bin/sh' > /app/entrypoint.sh && \
    echo 'mkdir -p /app/.next/static/chunks/' >> /app/entrypoint.sh && \
    echo 'mkdir -p /app/.next/standalone/.next/static/chunks/' >> /app/entrypoint.sh && \
    echo 'mkdir -p /app/.next/standalone/public/' >> /app/entrypoint.sh && \
    echo 'cat > /app/.next/static/chunks/env.js << EOL' >> /app/entrypoint.sh && \
    echo 'window.ENV = {' >> /app/entrypoint.sh && \
    echo '  NEXT_PUBLIC_OPENROUTER_API_KEY: "${NEXT_PUBLIC_OPENROUTER_API_KEY:-${OPENROUTER_API_KEY:-}}",' >> /app/entrypoint.sh && \
    echo '  NEXT_PUBLIC_DEFAULT_AI_MODEL: "${NEXT_PUBLIC_DEFAULT_AI_MODEL:-google/gemini-2.0-pro-exp-02-05:free}"' >> /app/entrypoint.sh && \
    echo '};' >> /app/entrypoint.sh && \
    echo 'EOL' >> /app/entrypoint.sh && \
    echo 'cat > /app/.next/standalone/.next/static/chunks/env.js << EOL' >> /app/entrypoint.sh && \
    echo 'window.ENV = {' >> /app/entrypoint.sh && \
    echo '  NEXT_PUBLIC_OPENROUTER_API_KEY: "${NEXT_PUBLIC_OPENROUTER_API_KEY:-${OPENROUTER_API_KEY:-}}",' >> /app/entrypoint.sh && \
    echo '  NEXT_PUBLIC_DEFAULT_AI_MODEL: "${NEXT_PUBLIC_DEFAULT_AI_MODEL:-google/gemini-2.0-pro-exp-02-05:free}"' >> /app/entrypoint.sh && \
    echo '};' >> /app/entrypoint.sh && \
    echo 'EOL' >> /app/entrypoint.sh && \
    echo 'echo "Environment variables set in env.js:"' >> /app/entrypoint.sh && \
    echo 'echo "- NEXT_PUBLIC_DEFAULT_AI_MODEL: ${NEXT_PUBLIC_DEFAULT_AI_MODEL:-google/gemini-2.0-pro-exp-02-05:free}"' >> /app/entrypoint.sh && \
    echo 'echo "- NEXT_PUBLIC_OPENROUTER_API_KEY: [Present but hidden for security]"' >> /app/entrypoint.sh && \
    echo 'echo "- OPENROUTER_API_KEY: [Present but hidden for security]"' >> /app/entrypoint.sh && \
    echo 'cp -R /app/.next/static/* /app/.next/standalone/.next/static/' >> /app/entrypoint.sh && \
    echo 'cp -R /app/public/* /app/.next/standalone/public/' >> /app/entrypoint.sh && \
    echo 'exec "$@"' >> /app/entrypoint.sh && \
    chmod +x /app/entrypoint.sh

# Use the entrypoint script
ENTRYPOINT ["/app/entrypoint.sh"]

# Start the application using the standalone server
CMD ["node", ".next/standalone/server.js"] 