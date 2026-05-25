FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json /app/
RUN npm ci

COPY . /app

ENV NEXT_PUBLIC_API_BASE_URL=http://backend:8000

EXPOSE 3000
CMD ["npm", "run", "dev", "--", "--hostname", "0.0.0.0", "--port", "3000"]
