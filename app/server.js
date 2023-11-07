const express = require("express");
const session = require("express-session")
const pg = require("pg");
const app = express();
const dotenv = require('dotenv');
const path = require('path');
const passport = require('passport');

// load enviromental variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

app.use(express.static("public"));

const port = process.env.PORT;
const hostname = process.env.HOSTNAME;
const mapbox_access_token = process.env.MAPBOX_ACCESS_TOKEN;

// Initialize database
const Pool = pg.Pool;
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.HOSTNAME,
  database: process.env.DATABASE,
  password: process.env.DATABASE_PASSWORD,
  port: process.env.DATABASE_PORT,
});

pool.connect().then(function () {
  console.log(`Connected to database `);
});

// Setup authentication strategies
const GoogleStrategy = require('passport-google-oauth20').Strategy;

// Passport Session
app.use(session({ 
  secret: process.env.SESSION_SECRET, 
  resave: true,
  saveUninitialized: true 
}));
app.use(passport.initialize());
app.use(passport.session());

// Load client secrets
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const CALLBACK_URL = 'http://localhost:3000/auth/google/callback';

passport.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: CALLBACK_URL,
    },
    (accessToken, refreshToken, profile, done) => {
      // Store user in database here later
      return done(null, profile);
    }
  )
);

// Serialize and deserialize the user after hearing back from google
passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

app.use('/map', (req, res, next) => {
  if (req.isAuthenticated()) {
    // Contains user info
    console.log(req.user);
    return next();
  }
  res.redirect('/login');
});

// Define the route for Google OAuth login
app.get('/auth/google',
  passport.authenticate('google', {
    scope: ['email'],
  })
);

// Define the callback route
app.get('/auth/google/callback',
  passport.authenticate('google', {
    successRedirect: '/map',
    failureRedirect: '/',
  })
);

// Route to Logout and end session
app.get('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      console.error(err);
    }
    res.redirect('/');
  });
});


app.get('/'), (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
}

//removed this so we can send the page dynamically
// app.get('/map', (req, res) => {
//   res.sendFile(path.join(__dirname, 'public', 'map.html'));
// });

//serving the map page dynamically, so users can use their personal map_access_token defined in their .env
app.get('/map', (req, res) => {
  res.send(`<html>
  <head>
    <title>Find Me Coffee</title>

    <link
      href="https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.css"
      rel="stylesheet"
    />
    <script src="https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.js"></script>
    <link
      href="https://api.mapbox.com/mapbox-assembly/v1.3.0/assembly.min.css"
      rel="stylesheet"
    />
    <script
      id="search-js"
      defer=""
      src="https://api.mapbox.com/search-js/v1.0.0-beta.17/web.js"
    ></script>
    <style>
      body {
        margin: 0;
        padding: 0;
      }
      #map {
        position: absolute;
        top: 0;
        bottom: 0;
        width: 100%;
      }
    </style>
  </head>
  <body>
    Find me coffee app. Render mapbox HTML map here.
  </body>
  <div id="map"></div>
  <mapbox-search-box
    access-token="${mapbox_access_token}"
    proximity="0,0"
  >
  </mapbox-search-box>
  <script>
    const ACCESS_TOKEN = "${mapbox_access_token}";
    console.log(ACCESS_TOKEN);
    mapboxgl.accessToken = ACCESS_TOKEN;

    //loads the map
    const map = new mapboxgl.Map({
      container: "map", // container ID
      style: "mapbox://styles/mapbox/streets-v12", // style URL
      center: [-74.5, 40], // starting position [lng, lat]
      zoom: 9, // starting zoom
    });
    // Create a new marker.
    //const marker = new mapboxgl.Marker().setLngLat([30.5, 50.5]).addTo(map);

    // Add zoom and rotation controls to the map.
    map.addControl(new mapboxgl.NavigationControl());
    //Set marker options.
    const marker = new mapboxgl.Marker({
      color: "#ffffff",
      draggable: true,
    })
      .setLngLat([30.5, 50.5])
      .addTo(map);

    const searchJS = document.getElementById("search-js");
    searchJS.onload = function () {
      const searchBox = new MapboxSearchBox();
      searchBox.accessToken = ACCESS_TOKEN;
      searchBox.options = {
        types: "address,poi",
        proximity: [-73.99209, 40.68933], //see if this is long/latitude
      };
      searchBox.marker = true;
      searchBox.mapboxgl = mapboxgl;
      map.addControl(searchBox);
    };

    // Initialize the GeolocateControl.
    const geolocate = new mapboxgl.GeolocateControl({
      positionOptions: {
        enableHighAccuracy: true,
      },
      trackUserLocation: true,
    });

    // After the map is loaded, trigger the geolocate control to automatically show the user's location
    map.on("load", function () {
      geolocate.trigger();
    });

    // Add geolocate control to the map
    map.addControl(geolocate);

  </script>
</html>
`);
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.listen(port, hostname, () => {
  console.log(`Listening at: http://${hostname}:${port}`);
});
