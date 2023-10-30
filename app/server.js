const pg = require("pg");
let axios = require("axios");
const express = require("express");
const app = express();

const port = 3000;
const hostname = "localhost";

const env = require("../env.json");
const Pool = pg.Pool;
const pool = new Pool(env);
pool.connect().then(function () {
  console.log(`Connected to database ${env.database}`);
});

app.use(express.static("public"));

/* YOUR CODE HERE */

app.listen(port, hostname, () => {
  console.log(`Listening at: http://${hostname}:${port}`);
});
