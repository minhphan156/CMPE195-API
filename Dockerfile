FROM node:10

# create node folder and set the permissions explicitly
RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app

# set the working directory of the application
WORKDIR /home/node/app

# copy the package.json and package-lock.json:
# adding this COPY instruction before running npm install or copying the application code allows us to take advantage of Docker's caching mechanism.
# At each stage in the build, Docker will check to see if it has a layer cached for that particular instruction. 
# If we change package.json, this layer will be rebuilt, but if we don't, 
# this instruction will allow Docker to use the existing image layer and skip reinstalling our node modules.
COPY package*.json ./

# install modules
RUN npm install

# Install nodemon
RUN npm install -g nodemon

# copy your application code to the working application directory on the container
COPY . .

# To ensure that the application files are owned by the non-root node user,
# copy the permissions from your application directory to the directory on the container:
COPY --chown=node:node . . 

# set the user to Node
USER node

# open the port
EXPOSE 3002

# run the app
CMD [ "npm", "start" ]

# Commands:
# If using docker for the first time, run:
# docker-machine create box

# Docker build:
# run this from the application folder
# docker build -t api .

# Docker run:
# docker run --name api -p 3002:3002 -d api

# Notes
# After building on Windows:
# SECURITY WARNING: You are building a Docker image from Windows against a non-Windows Docker host. 
# Explanation: 
# That warning was added, because the Windows filesystem does not have an option to mark a file as 'executable'. Building a linux image from a Windows machine would therefore break the image if a file has to be marked executable.
# For that reason, files are marked executable by default when building from a windows client; the warning is there so that you are notified of that, and (if needed), modify the Dockerfile to change/remove the executable bit afterwards.

