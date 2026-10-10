# Production Dockerfile for Medical Social Media Compliance Monitoring App
FROM mcr.microsoft.com/playwright:v1.64.0-jammy

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install --omit=dev

# Copy source code and prebuilt frontend assets
COPY . .

EXPOSE 3001

ENV PORT=3001
ENV NODE_ENV=production
ENV GEMINI_API_KEY="AIzaSyA6L4tWEQsrQ_CUdvw96DpAhAchVq2iEUc"
ENV GEMINI_MODEL="gemini-2.5-flash"

CMD ["node", "server/index.js"]
