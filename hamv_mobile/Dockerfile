FROM node:10-alpine

ENV JAVA_HOME="/usr/lib/jvm/java-1.8-openjdk"

RUN adduser -u 1001 -S jenkins -G root && \
  chown -R jenkins /usr/local && \
  wget -q -O /etc/apk/keys/sgerrand.rsa.pub https://alpine-pkgs.sgerrand.com/sgerrand.rsa.pub && \
  wget -q -O /tmp/glibc.apk https://github.com/sgerrand/alpine-pkg-glibc/releases/download/2.28-r0/glibc-2.28-r0.apk && \
  wget -q -O /tmp/glibc-bin.apk https://github.com/sgerrand/alpine-pkg-glibc/releases/download/2.28-r0/glibc-bin-2.28-r0.apk && \
  apk add \
  /tmp/glibc-bin.apk \
  /tmp/glibc.apk \
  chromium \
  curl \
  git \
  openjdk8 \
  --no-cache

USER jenkins

ENV ANDROID_HOME="/home/jenkins/android-sdk" \
  GRADLE_HOME="/home/jenkins/gradle" \
  CHROME_BIN="/usr/bin/chromium-browser"
ENV PATH="$PATH:$ANDROID_HOME/tools:$ANDROID_HOME/tools/bin:$ANDROID_HOME/platform-tools:$GRADLE_HOME/gradle-4.8.1/bin"

RUN mkdir -p $ANDROID_HOME && \
  wget -q -O /tmp/sdk.zip https://dl.google.com/android/repository/sdk-tools-linux-3859397.zip && \
  unzip -d $ANDROID_HOME /tmp/sdk.zip && \
  chmod +x "$ANDROID_HOME/tools/bin/sdkmanager" && \
  yes | sdkmanager --licenses && \
  sdkmanager --verbose "platform-tools" "build-tools;27.0.3" "platforms;android-26" && \
  wget -q -O /tmp/gradle.zip https://downloads.gradle.org/distributions/gradle-4.8.1-bin.zip && \
  mkdir -p $GRADLE_HOME && \
  unzip -d $GRADLE_HOME /tmp/gradle.zip && \
  npm i -g cordova ionic@3 && \
  mkdir -p /home/jenkins/app/www

COPY --chown=1001:root resources home/jenkins/app/resources
COPY --chown=1001:root keystores home/jenkins/app/keystores
COPY --chown=1001:root ["package.json", "*.tgz", "build.json", "config.xml", "tsconfig.json", "tslint.json", "/home/jenkins/app/"]
RUN cd ~/app && \
  npm i && \
  cordova platform add android && \
  cordova build android

CMD ["npm", "start"]
