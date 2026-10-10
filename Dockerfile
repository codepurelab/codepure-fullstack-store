# FIX: Updated to current LTS base image
FROM node:20-slim

WORKDIR /app

# FIX: Use COPY instead of ADD
COPY backend/package.json ./

# FIX: Run npm install as non-root build step
RUN npm install --production

COPY . /app

# FIX: Create non-root user and switch to it
RUN groupadd -r appuser && useradd -r -g appuser appuser
USER appuser

EXPOSE 3000

CMD ["node", "backend/server.js"]
