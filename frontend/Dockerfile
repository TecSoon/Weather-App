FROM node:20-alpine AS builder

WORKDIR /app

# Accept the API base URL as a build ARG
ARG NEXT_PUBLIC_WEATHER_BE_BASE_URL
ENV NEXT_PUBLIC_WEATHER_BE_BASE_URL=$NEXT_PUBLIC_WEATHER_BE_BASE_URL

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build

FROM node:20-alpine AS runner

WORKDIR /app

COPY --from=builder /app ./

EXPOSE 3000

ENV NODE_ENV=production

CMD ["npm", "start"]
