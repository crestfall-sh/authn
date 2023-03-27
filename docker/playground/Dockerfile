# node lts
FROM node:18

# client dependencies
WORKDIR /client/
COPY ["./client/package.json", "./client/package-lock.json", "./"]
RUN npm install --omit=dev

# server dependencies
WORKDIR /server/
COPY ["./server/package.json", "./server/package-lock.json", "./"]
RUN npm install --omit=dev

# client data
WORKDIR /client/
COPY ./client/ ./
RUN npx vite build

# server data
WORKDIR /server/
COPY ./server/ ./

# server launch
CMD ["node", "./index.mjs"]
