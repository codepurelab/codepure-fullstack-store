# VULN: Using EOL base image
FROM node:10

# VULN: Exposing secrets in ENV
ENV DB_PASSWORD=Pr0duction_DB_P@ssw0rd!2024
ENV JWT_SECRET=super-secret-jwt-key-2024-production
ENV PAYMENT_SECRET=sk_test_payment_secret_key_2024

WORKDIR /app

# VULN: Using ADD instead of COPY
ADD . /app

# VULN: Running npm install as root
RUN npm install --production

# VULN: No USER directive - runs as root
EXPOSE 3000 8080 9229

CMD ["node", "backend/server.js"]
