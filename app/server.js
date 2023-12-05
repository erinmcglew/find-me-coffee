const express = require("express");
const session = require("express-session")
const pg = require("pg");
const app = express();
const dotenv = require('dotenv');
const path = require('path');

let axios = require("axios");

// load enviromental variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

app.use(express.static("public"));

app.use(express.json())


const port = process.env.PORT;
const hostname = process.env.HOSTNAME;
//const mapbox_access_token = process.env.MAPBOX_ACCESS_TOKEN;
//joes key: const mapbox_access_token = "pk.eyJ1Ijoiam00NjQ2IiwiYSI6ImNsbzRqdHkwYjAyankya251M3BxYTc0bTYifQ.DPfLWp7phIy4Yx2fAnUARg";
const mapbox_access_token = "pk.eyJ1IjoiZXJpbm1jZ2xldyIsImEiOiJjbG80a3E1NjEwMmg1MmpzMHRwcGtzNDZkIn0.d_LYyduEKt8jnwP4gCmByQ";

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

// Load authentication
const { passport } = require('./public/auth');
app.use(session({ 
  secret: process.env.SESSION_SECRET, 
  resave: true,
  saveUninitialized: true 
}));
app.use(passport.initialize());
app.use(passport.session());

// Middleware for authenticating protected routes
const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login');
};


app.use('/map', isAuthenticated, async (req, res, next) => {
  // Contains user info
  console.log(req.user.id);
  let result = await pool.query(`SELECT * FROM users WHERE id = $1`, [req.user.id]);
  // User does not exist, add them
  console.log(result.rows.length);
  if (result.rows.length === 0) {
    try {
      result = pool.query(`INSERT INTO users (id, username) VALUES ($1, $2)`, [req.user.id, "dummy_username"]);
      console.log("CREATED NEW USER");
    } catch (error) {
      console.log(error);
    }
  } else {
    console.log("USER ALREADY EXISTS");
  }
  return next();
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


app.get(('/'), (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get("/map/addReview",(req,res)=>{
  console.log("adding a review")
  res.status(200).sendFile(path.join(__dirname, 'public', 'addReview.html'));
});

app.post("/map/submitReview",async (req,res)=>{
  console.log("submitting a review")
  if (req.body === undefined){
    console.log("req.body is undef")
    res.status(400).json({"Error":"no body in POST request"});
    return;
  }

  let ratings;
  let comments;
  let storeName;
  let storeLocation;
  let userID;
  let imageString;

  try{
    ratings = req.body.ratings;
    comments = req.body.comments;
    storeName = req.body.store.name;
    storeLocation=req.body.store.location;
    userID = req.user.id;
    //imageString = req.body.imageString;
    imageString = "temporaryFix"; //TEMPORARY FIX- using this string and did not select file to upload
  }
  catch (error){
    console.log("ERROR")
    console.log(error);
    res.status(400).send();
    return;
  }

  //TODO - let the user know they should fill out entire review form?
  if (ratings === undefined || comments === undefined || storeName === undefined|| storeLocation ===undefined || imageString === undefined){
    res.status(400).send();
    return;
  }

  //Grab shop id
  let shopid;
  const result = await pool.query(`SELECT * FROM shops WHERE name = $1 AND location = $2`, [storeName, storeLocation]);

  // If the shop does not exist, add it
  if (result.rows.length === 0) {
    const insertResult = await pool.query(`INSERT INTO shops (name, location) VALUES ($1, $2) RETURNING id`, [storeName, storeLocation]);
    shopid = insertResult.rows[0].id;
    console.log("shop id of new shop: ", shopid);
  } else { //Else, grab it
    console.log("shop id (already exiting): ", shopid);
    shopid = result.rows[0].id;
  }
  
  //Now insert to reviews table
  await pool.query(`INSERT INTO reviews (shop_id, user_id,rating,comments,imageString) VALUES ($1, $2, $3,$4, $5)`, [shopid, userID, ratings,comments, imageString]).then(()=>{
    console.log("Success");
    res.status(200).send();
  });
})

//putting this request handler back to serve the map statically
app.get('/map', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'map.html'));
});

// get all reviews
app.get('/feed', async (req, res) => {
  const result = await pool.query(`SELECT * FROM reviews;`);
  // If there are no reviews, show nothing in the general feed
  if (result.rows.length === 0) {
    res.json({});
  } else {
    let allReviews = await pool.query(`SELECT 
      reviews.id,
      shops.name,
      users.username,
      reviews.rating,
      reviews.comments,
      reviews.created_at
    FROM 
      reviews
    JOIN 
      shops ON reviews.shop_id = shops.id
    JOIN 
      users ON reviews.user_id = users.id
    ORDER BY 
      reviews.created_at DESC;`);

    let reviewTemplate = {}
    let listOfJsonReviewObjects = []
    //if shop id exists this must mean there is at least 1 existing review for the shop..
    allReviews.rows.forEach(function(reviewJsonObject) {
      reviewTemplate = {
        "username": `${reviewJsonObject.username}`,
        "shop": `${reviewJsonObject.name}`,
        "date": `${reviewJsonObject.created_at}`,
        "rating": `${reviewJsonObject.rating}`,
        "comment": `${reviewJsonObject.comments}`
      }

      listOfJsonReviewObjects.push(reviewTemplate);
    });
    res.json({"reviews":listOfJsonReviewObjects});
  }
})

// currently gets dummy reviews for a specific shop that is selected
// TODO get all reviews for a specific shop from the database
app.get('/shopReviews', async (req, res) => {
  let shopName = req.query.shopName;
  let shopLocation = req.query.shopLocation;

  //Grab shop id
  let shopId;
  const result = await pool.query(`SELECT * FROM shops WHERE name = $1 AND location = $2`, [shopName, shopLocation]);
  // If the shop does not exist in DB, this means a review for it has not been submitted yet so show no reviews
  if (result.rows.length === 0) {
    res.json({});
  } else { //else, grab the shop id
    shopId = result.rows[0].id;

    let result2 = await pool.query(`SELECT   
      reviews.id,
      shops.name,
      users.username,
      reviews.rating,
      reviews.comments,
      reviews.created_at
    FROM 
      reviews
    JOIN 
      shops ON reviews.shop_id = shops.id
    JOIN 
      users ON reviews.user_id = users.id
    WHERE
      shops.id = ${shopId}
    ORDER BY 
      reviews.created_at;`);

    let reviewTemplate = {}
    let listOfJsonReviewObjects = []
    //if shop id exists this must mean there is at least 1 existing review for the shop..
    result2.rows.forEach(function(reviewJsonObject) {
      reviewTemplate = {
        "username": `${reviewJsonObject.username}`,
        "shop": `${reviewJsonObject.name}`,
        "date": `${reviewJsonObject.created_at}`,
        "rating": `${reviewJsonObject.rating}`,
        "comment": `${reviewJsonObject.comments}`
      }

      listOfJsonReviewObjects.push(reviewTemplate);
    });
    res.json({"reviews":listOfJsonReviewObjects});
  }
})

app.get("/defaultCoffeeShops", (req, res) => {
  let proximity = req.query.proximity;

  //let origin = req.query.origin;
  let limit = req.query.limit;
  console.log("limit:", limit);
  //let baseUrl = "https://api.mapbox.com/search/searchbox/v1/category/coffee"
  let url = `https://api.mapbox.com/search/searchbox/v1/category/coffee?access_token=${mapbox_access_token}&limit=${limit}&proximity=${proximity}`;
  console.log(url);
  axios(url).then(response => {
      res.json(response.data);
  }).catch(error => {
      console.log(error);
      res.status(500).json({ message: "Something went wrong "});
  });
});


app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.listen(port, hostname, () => {
  console.log(`Listening at: http://${hostname}:${port}`);
});
