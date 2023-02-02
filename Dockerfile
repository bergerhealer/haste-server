FROM node:lts
WORKDIR /app
COPY ./ /app
RUN npm install -g npm@8.1.3 && npm install --loglevel verbose --no-audit

HEALTHCHECK --interval=30s --timeout=30s --start-period=5s \
    --retries=3 CMD [ "sh", "-c", "echo -n 'curl localhost:7777... '; \
    (\
        curl -sf localhost:7777 > /dev/null\
    ) && echo OK || (\
        echo Fail && exit 2\
    )"]

EXPOSE 7777
CMD ["npm", "start"]