FROM node:16
WORKDIR /usr/src/app
RUN apt update

COPY . ./
# RUN mkdir ~/.aws && mv credentials ~/.aws/ && mv config ~/.aws/
# RUN aws eks update-kubeconfig --region us-east-1 --name lh --kubeconfig ./lh_conf
# COPY ["package*.json", "index.ts", "tsconfig.json", "config.ts", "./s3", "./lib", "./db", "./"]
RUN npm install
CMD [ "npm", "run", "start" ]
