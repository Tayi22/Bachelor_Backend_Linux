# Webapp SecurityApp - Backend

### Prerequisites

The following programs needs to be installed before you can run the application:

1. [Git](https://git-scm.com/)
2. [Node.js](https://nodejs.org/en/) (With NPM installed)
3. [MongoDb](https://www.mongodb.com/de)

### Installation

1. `git clone <repository-url>` this repository
2. Change into cloned folder
3. `npm install`

### Start Database

To start the mongo database, navigate to the cloned folder and use:
`mongod -dbpath data/db` (If data/db doesnt exist, create the folders)

The database should now be waiting for connections. 
If the database throw an error, enter `killall mongod` in the terminal and retry


### Import JSON to the database

There is already some Data for testing on this repository. To import those datafiles follow these steps:
1. Make sure the database is running
2. Navigate to /DataForImport
3. Type: `mongoimport -d test -c users < users.json` This will import the users.json to the users collection in the Database named test. 
4. Repeat with -c mappings < mappings.json, -c patterns < patterns.json and -c tactics < tactics.json

If you are working on a VM, make sure the local variables are set. To do this, enter `export LC_ALL=C` and retry.

To check if the data was correctly imported, follow these steps
1. Open a new terminal
2. Type: `mongo`. The mongo shell terminal should be open now.
3. Type: `show collections`. All imported collections (patterns, users, tactics, mappings) should now be listed
3. Type: `db.tactics.find()`. Now all records should be visible in the tactics collection. Repeat with mappings, patterns and users

### Start the Backend Server

1. Make sure the mongo database is running
2. Make sure Node.js is installed 
3. Open a seperate terminal and navigate to /src/bin
4. Start the server with `node server.js`

To test if the server is running, navigate to https://yourserverip:8443/patterns
Accept the SSL certificate and you should be able to see all patterns which where imported to the database.

### Frontend

For the Frontend, please visit the git repository from [Lukas Walisch](https://github.com/LukasWalisch/webapp_securitymappings)
