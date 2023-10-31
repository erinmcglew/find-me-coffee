const express = require("express");
const pg = require("pg");
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

app.get('/', (req, res) => {
  res.send('index.html');
})

app.listen(port, hostname, () => {
  console.log(`Listening at: http://${hostname}:${port}`);
});
