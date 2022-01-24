FROM node:lts
WORKDIR /app
COPY ./ /app
RUN npm install -g npm@8.1.3 && npm install --loglevel verbose --no-audit

CMD ["npm", "start"]