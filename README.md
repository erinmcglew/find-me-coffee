# find-me-coffee

1. Change the sample.env file to your postgres username and password and change the name of the sample.env to .env
2. Generate a OAuth Client ID and secret using a google developer account, and store it inside the .env file.
3. Take the Google Callback URL, and add it as an authorized redirect URL.
4. Use npm run setup to create database. This runs the setup (on wsl the command is sudo -u postgres psql -f setup.sql). Do not forget to start your server using sudo service postgresql start. This command may vary based on distribution.
5. Installation modules using npm i
6. Use npm run start to start server. No need to change directory to app/public and then run node server.js
