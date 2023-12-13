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

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ limit: '200mb', extended: true }));

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
  let storeAddress;
  let userID;
  let imageString;

  try{
    ratings = req.body.ratings;
    comments = req.body.comments; //not required
    storeName = req.body.store.name;
    storeLocation=req.body.store.location;
    storeAddress = req.body.store.description;
    storeAddress = decodeURIComponent(storeAddress);

    //limiting coordinates to 5 decimals
    // let latLong = storeLocation.split(',');
    // let lat = latLong[0];
    // let long = latLong[1];
    // let decimalLocationLat = parseFloat(lat);
    // let decimalLocationLong = parseFloat(long);
    // let limitedDecimalLocationLat = decimalLocationLat.toFixed(5);
    // let limitedDecimalLocationLong = decimalLocationLong.toFixed(5);
    // let storeLocationLat = limitedDecimalLocationLat.toString();
    // let storeLocationLong = limitedDecimalLocationLong.toString();

    // storeLocation = storeLocationLat + "," + storeLocationLong

    userID = req.user.id;
    imageString = req.body.imagestring; //not required
    //imageString = "temporaryFix"; //TEMPORARY FIX- using this string and did not select file to upload
  }
  catch (error){
    console.log("ERROR")
    console.log(error);
    res.status(400).send();
    return;
  }

  //TODO - let the user know they should fill out entire review form?
  //only things required when completing review are: ratings, storeName, storeLocation
  //if (ratings === undefined || comments === undefined || storeName === undefined|| storeLocation ===undefined || imageString === undefined){
  if (ratings === undefined || storeName === undefined || storeLocation === undefined){
    res.status(400).send();
    return;
  }

  //Grab shop id
  let shopid;
  const result = await pool.query(`SELECT * FROM shops WHERE name = $1 AND location = $2`, [storeName, storeLocation]);

  // If the shop does not exist, add it
  if (result.rows.length === 0) {
    //const insertResult = await pool.query(`INSERT INTO shops (name, location) VALUES ($1, $2) RETURNING id`, [storeName, storeLocation]);
    const insertResult = await pool.query(`INSERT INTO shops (name, location, address) VALUES ($1, $2, $3) RETURNING id`, [storeName, storeLocation, storeAddress]);
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
      reviews.created_at,
      reviews.imagestring
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
        "comment": `${reviewJsonObject.comments}`,
        "imagestring": `${reviewJsonObject.imagestring}`
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
      reviews.created_at,
      reviews.imagestring
    FROM 
      reviews
    JOIN 
      shops ON reviews.shop_id = shops.id
    JOIN 
      users ON reviews.user_id = users.id
    WHERE
      shops.id = ${shopId}
    ORDER BY 
      reviews.created_at DESC;`);

    let reviewTemplate = {}
    let listOfJsonReviewObjects = []
    //if shop id exists this must mean there is at least 1 existing review for the shop..
    result2.rows.forEach(function(reviewJsonObject) {
      console.log("HELLO!!");
      reviewTemplate = {
        "username": `${reviewJsonObject.username}`,
        "shop": `${reviewJsonObject.name}`,
        "date": `${reviewJsonObject.created_at}`,
        "rating": `${reviewJsonObject.rating}`,
        "comment": `${reviewJsonObject.comments}`,
        "imagestring": `${reviewJsonObject.imagestring}`
      }

      listOfJsonReviewObjects.push(reviewTemplate);
    });
    res.json({"reviews":listOfJsonReviewObjects});
  }
})

app.get('/coffeeShopDescription', async (req, res) => {
  const currentUserID = req.user.id;
  let storeName = req.query.name;
  console.log("STORENAME",storeName);
  let storeLocation=req.query.location; // Assuming you're using a user authentication middleware and the user ID is available in req.user.id
  //get owner_id
  try {
  const ownerIdResult = await pool.query(
    'SELECT owner_id FROM shops WHERE name = $1 AND location = $2',
    [storeName, storeLocation]
  );
  //const ownerId = ownerIdResult.rows[0].owner_id;

  //console.log("ownerIdRESULT!",ownerIdResult);
  //console.log("ownerId!",ownerId);

  //console.log("currentUserId!",currentUserID);

  //const coffeeShopOwnerID = ownerId; // Replace getOwnerID() with your method to retrieve the coffee shop's owner ID from your database or storage

  if (ownerIdResult.rowCount > 0) {
    const ownerId = ownerIdResult.rows[0].owner_id;

    if (currentUserID === ownerId) {
      // User is the owner, grant access to edit description
      res.json({ canEdit: true, description: "Coffee shop description here" });
    } else {
      // User is not the owner, restrict access
      //res.status(403).json({ canEdit: false, message: "You do not have permission to edit the description." });
      res.json({ canEdit: false, message: "You do not have permission to edit the description." });
    }
  } else {
    // If shop not found based on name and location
    res.json({ canEdit: false, message: "You do not have permission2 to edit the description." });
  }
} catch (error) {
  console.error("Error:", error);
  res.status(500).json({ message: "Internal server error." });
}
});

// Endpoint to check owner ID
app.post('/checkOwnerId', async (req, res) => {
  const { store } = req.body; // Assuming the store object contains name and location

  try {
    const ownerIdResult = await pool.query(
      'SELECT owner_id FROM shops WHERE name = $1 AND location = $2',
      [store.name, store.location]
    );

    if (ownerIdResult.rowCount > 0) {
      const ownerId = ownerIdResult.rows[0].owner_id;
      res.json({ owner_id: ownerId });
    } else {
      res.json({ owner_id: false });
    }
  } catch (error) {
    console.error("Error occurred while checking owner ID:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});


// Sample route handler using Express
app.post('/claimOwner', async (req, res) => {
  //console.log("req!!", req);
  try {
    //await client.query('BEGIN');

      //initialize the user id, store name, and store location
      const userId = req.user.id;
      let storeName = req.body.store.name;
      console.log("storeName!!",storeName);
      let storeLocation=req.body.store.location;
      console.log("storeLocation!!",storeLocation);
      let storeAddress = req.body.store.address;

      // Check if the shop exists in the shops table
    const shopExists = await pool.query(
      'SELECT * FROM shops WHERE name = $1 AND location = $2',
      [storeName, storeLocation]
    );

    if (shopExists.rows.length === 0) {
      // If shop doesn't exist, insert it into the shops table
      const insertShopQuery = 'INSERT INTO shops (name, location, owner_id,address) VALUES ($1, $2, $3, $4) RETURNING id';
      const newShop = await pool.query(insertShopQuery, [storeName, storeLocation,userId,storeAddress]);
      const shopId = newShop.rows[0].id;

      //since shop is inserted into the shops table, the users table has to be updated as well to true
      const updateQuery = 'UPDATE users SET is_owner = true WHERE id = $1';
      await pool.query(updateQuery, [userId]);

      // Now you have the shopId of the newly inserted shop
      // Use this shopId to update the owner_id or perform other actions
    } else {
      const shopId = shopExists.rows[0].id;

      console.log("userID!!", userId); // Assuming the user ID is sent in the request body

      // Update the user's is_owner attribute to true in the database
      // This is a conceptual example and should be replaced with your database logic
      //await pool.query({ id: userId }, { is_owner: true });
      // Update the user's is_owner attribute to true in the database
      const updateQuery = 'UPDATE users SET is_owner = true WHERE id = $1';
      await pool.query(updateQuery, [userId]);

        // Update the shop's owner_id with the claiming user's ID
      const updateShopQuery = 'UPDATE shops SET owner_id = $1 WHERE id = $2';
      await pool.query(updateShopQuery, [userId, shopId]);
    }
    //await client.query('COMMIT');

      res.status(200).json({ message: 'User claimed ownership successfully.' });
  } catch (error) {
      
      //await client.query('ROLLBACK');
      console.error('Error occurred:', error);
      res.status(500).json({ error: 'Failed to claim ownership.' });
  }
});

//for inserting/updating shops table 
app.post('/save-description', async (req, res) => {
  const { storeName, storeLocation, description } = req.body;
  console.log("STORENAME",storeName);
  console.log("description!!!!!!",description);
  try {
    // Check if the shop exists in the database
    const shopExistsQuery = 'SELECT * FROM shops WHERE name = $1 AND location =$2';
    const shopExistsResult = await pool.query(shopExistsQuery, [storeName, storeLocation]);

    if (shopExistsResult.rowCount > 0) {
      // Shop exists, update the description
      const updateDescriptionQuery = 'UPDATE shops SET description = $1 WHERE name = $2 AND location = $3';
      await pool.query(updateDescriptionQuery, [description, storeName, storeLocation]);
      res.status(200).send('Description updated successfully');
    } else {
      // Shop doesn't exist, insert a new shop record
      //inspiration: INSERT INTO shops (name, location) VALUES ($1, $2) RETURNING id
      const insertShopQuery = 'INSERT INTO shops (name, location, description) VALUES ($1, $2, $3) RETURNING id';

      await pool.query(insertShopQuery, [storeName, storeLocation, description]);
      res.status(201).send('New shop and description created');
    }
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Server error');
  }
});

app.get('/getDescription', async (req, res) => {
  const { name, location } = req.query;
  console.log("NAME". name);
  console.log("location!!!!", location);

  try {
    // Query to fetch description based on shop name and location
    const queryText = 'SELECT description FROM shops WHERE name = $1 AND location = $2';
    const queryValues = [name, location];
    console.log("NAME". name);
  console.log("location!!!!", location);

    const result = await pool.query(queryText, queryValues);

    if (result.rows.length > 0) {
      res.json({ description: result.rows[0].description });
    } else {
      res.json({ error: 'Description not found' });
    }
  } catch (error) {
    console.error('Error fetching description:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

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
