const express = require("express");
const jwtDecode = require('jwt-decode');
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
app.use(express.json());
app.use(express.static("public"));


/* YOUR CODE HERE */

app.get('/', (req, res) => {
  res.send('index.html');
})

app.listen(port, hostname, () => {
  console.log(`Listening at: http://${hostname}:${port}`);
});

app.get('/googleSignIn',(req,res) =>{
  res.end('googleTest.html');
})

app.post("/signIn",(req,res)=>{
  
  console.log(req.body);

  if (req.body == null){
    res.status(400).send();
    return;
  }

  const token = req.body.data

  const decoded = jwtDecode.jwtDecode(token);
  console.log(decoded);

  //console.log(req);
  
  res.status(200).send();
})
