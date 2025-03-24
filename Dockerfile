FROM alpine:latest

ARG GH_REPO
ARG RELEASE_NOTES

LABEL org.opencontainers.image.source $GH_REPO

CMD ["echo", "Hello World!"]