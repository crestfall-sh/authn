FROM node:18
LABEL org.opencontainers.image.source https://github.com/crestfall-sh/authn
ENV NODE_ENV=production
EXPOSE 8080
WORKDIR /authn/
COPY ["./package.json", "./package-lock.json", "./"]
RUN npm install --omit=dev
COPY ./ ./
CMD ["node", "./index.mjs"]