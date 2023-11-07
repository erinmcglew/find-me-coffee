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

app.get('/map', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'map.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.listen(port, hostname, () => {
  console.log(`Listening at: http://${hostname}:${port}`);
});
