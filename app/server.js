const express = require("express");
const pg = require("pg");
const app = express();
const dotenv = require('dotenv');
const path = require('path');

// load enviromental variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const port = process.env.PORT;
const hostname = process.env.HOSTNAME;

// Initialize database
const Pool = pg.Pool;
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.HOSTNAME,
  database: process.env.DATABASE,
  password: process.env.DATABSE_PASSWORD,
  port: process.env.DATABASE_PORT,
});

pool.connect().then(function () {
  console.log(`Connected to database `);
});

app.use(express.static("public"));

app.get('/', (req, res) => {
  res.send('index.html');
})

app.listen(port, hostname, () => {
  console.log(`Listening at: http://${hostname}:${port}`);
});
