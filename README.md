# API
First of possibly several API services that will communicate with the Gateway and rest of the infrastructure.

# Table of Contents
* Installation
* Usage
* TODO

# Installation & Requirements
1. Install Node.js from here: https://nodejs.org/en/ (**At least version 10.15.1 is required**) 
2. After installation, execute `npm install` inside the API directory. This will install/update all the Node dependencies for the API.

## Updating Dependencies
After pulling from master, simply execute `npm install` from the API directory.

## nodemon for Development
Development can be a pain with Node.js when you have to constantly restart the server after making changes just to be able to see new changes. This is easily mitigated by using `nodemon`, which runs similar to `npm start` except it automatically restarts the server when changes are detected.
* To install nodemon: Execute `npm install -g nodemon`
* If a permissions/privileges error occurs, run with sudo: `sudo npm install -g nodemon`
* To start server with nodemon: `nodemon start`

# Usage
* Execute `npm start` to start the API service. \
_or_
* If you are using nodemon, execute `nodemon start` to start the service.

The service will be deployed locally at http://localhost:3002

# TODO
