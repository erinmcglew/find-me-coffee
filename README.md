# find-me-coffee

1. Change the sample.env.json file to your postgres username and password and change the name of the sample.env.json to env.json
2. Use npm run setup to create database. This runs the setup (on wsl the command is sudo -u postgres psql -f setup.sql). This command may vary based on distribution.
3. Installation modules using npm i
4. Use npm run start to start server. No need to change directory to app/public and then run node server.js
