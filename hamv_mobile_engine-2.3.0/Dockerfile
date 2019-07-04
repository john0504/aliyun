FROM ubuntu:16.04

LABEL maintainer="jasonyang@exosite.com"

RUN useradd -m -s /bin/bash --uid 1001 -G root jenkins

ENV NODE_VERSION=9.8.0 \
    NPM_VERSION=5.6.0

RUN apt-get update -qq && \
    apt-get install -y curl zip git python build-essential keychain && \
#node.js
    curl --retry 3 -SLO "http://nodejs.org/dist/v$NODE_VERSION/node-v$NODE_VERSION-linux-x64.tar.gz" && \
    tar -xzf "node-v$NODE_VERSION-linux-x64.tar.gz" -C /usr/local --strip-components=1 && \
    rm "node-v$NODE_VERSION-linux-x64.tar.gz" && \
    npm install -g npm@"$NPM_VERSION" && \
#Chrome
    curl -fsSL https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - &&  \
    echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" > /etc/apt/sources.list.d/google-chrome.list && \
    apt-get update -qq && apt-get install -y google-chrome-stable && \
#Clear
    apt-get clean && \
    npm cache clear --force && \
    mkdir hamv_mobile_engine

USER jenkins