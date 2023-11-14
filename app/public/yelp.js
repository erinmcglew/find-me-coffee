'use strict';

const yelp = require('yelp-fusion');

// Place holder for Yelp Fusion's API Key. Grab them
// from https://www.yelp.com/developers/v3/manage_app
const apiKey = 'jCV2BaJNWzD6nkAJnfHiJkYwqp7zAWwUGYAQ3Wg0TlV6ls0g8yZ69NqgsomXyTATutcDuUfPuq6SYuXX9QO__Hc9K3WjSLJoqkBueENntVHKg5irtUDtPslEq-1MZXYx';

const searchRequest = {
  term:'Four Barrel Coffee',
  location: 'san francisco, ca'
};

const client = yelp.client(apiKey);

client.search(searchRequest).then(response => {
  const firstResult = response.jsonBody.businesses[0];
  const prettyJson = JSON.stringify(firstResult, null, 4);
  console.log(prettyJson);
}).catch(e => {
  console.log(e);
});