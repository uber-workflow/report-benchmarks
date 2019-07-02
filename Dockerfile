FROM node:lts

LABEL "com.github.actions.name"="Deploy"
LABEL "com.github.actions.description"="Deploy"
LABEL "com.github.actions.icon"="upload-cloud"
LABEL "com.github.actions.color"="black"

COPY ./deploy.sh /

WORKDIR /

ENTRYPOINT ["/deploy.sh"]
