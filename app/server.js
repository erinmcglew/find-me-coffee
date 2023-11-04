const express = require("express");
const pg = require("pg");
const app = express();

const port = 3000;
const hostname = "localhost";

const env = require("../env.json");
const Pool = pg.Pool;
const pool = new Pool(env);

//https://codedamn.com/news/javascript/fix-require-is-not-defined
let myKeys = require("../key.json");
let userKey = myKeys.key;

pool.connect().then(function () {
  console.log(`Connected to database ${env.database}`);
});

app.use(express.static("public"));

app.get('/', (req, res) => {
  //serving site dynamically so the api key can change per user
  //include mapbox libraries in html: https://docs.mapbox.com/mapbox.js/api/v3.3.1/ 
  //using the map class: https://docs.mapbox.com/mapbox-gl-js/guides/ 
  res.send(`
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset='utf-8' />
    <title>Map of Philadelphia</title>
    <meta name='viewport' content='initial-scale=1,maximum-scale=1,user-scalable=no' />
    <script src='https://api.mapbox.com/mapbox-gl-js/v2.7.0/mapbox-gl.js'></script>
    <link href='https://api.mapbox.com/mapbox-gl-js/v2.7.0/mapbox-gl.css' rel='stylesheet' />
    <style>
      body { margin: 0; padding: 0; }
      #map { position: absolute; top: 0; bottom: 0; width: 100%; }
    </style>
  </head>
  <body>
    <div id='map'></div>
    <script>
      mapboxgl.accessToken = "${userKey}";
      var map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/streets-v11',
        center: [-75.1639, 39.9526], // starting position [lng, lat] of Philadelphia
        zoom: 12
      });
    </script>
  </body>
  </html>`)
})

app.listen(port, hostname, () => {
  console.log(`Listening at: http://${hostname}:${port}`);
});
