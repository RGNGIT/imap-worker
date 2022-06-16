FROM node:16

WORKDIR /usr/src/app
# RUN apt update

COPY . ./
# RUN mkdir ~/.aws && mv credentials ~/.aws/ && mv config ~/.aws/
# RUN aws eks update-kubeconfig --region us-east-1 --name lh --kubeconfig ./lh_conf
# COPY ["package*.json", "index.ts", "tsconfig.json", "config.ts", "./s3", "./lib", "./db", "./"]
# We don't need the standalone Chromium
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD true

# Install Google Chrome Stable and fonts
# Note: this installs the necessary libs to make the browser work with Puppeteer.
RUN apt-get update && apt-get install curl gnupg -y \
  && curl --location --silent https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
  && sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
  && apt-get update \
  && apt-get install google-chrome-stable -y --no-install-recommends \
  && rm -rf /var/lib/apt/lists/*
RUN apt update && apt install -y xvfb
RUN npm install
CMD [ "npm", "run", "start" ]
