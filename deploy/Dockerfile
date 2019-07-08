FROM node:lts

LABEL "com.github.actions.name"="Deploy"
LABEL "com.github.actions.description"="Deploy"
LABEL "com.github.actions.icon"="upload-cloud"
LABEL "com.github.actions.color"="black"

RUN yarn global add now@11.0.6 @cloudflare/wrangler@1.0.2

COPY ./deploy.sh /

WORKDIR /

ENTRYPOINT ["/deploy.sh"]
