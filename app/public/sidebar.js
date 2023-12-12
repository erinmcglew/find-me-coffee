// Load Feed Containing All Reviews

let loadFeed = () => {
  fetch('http://localhost:3000/feed')
    .then((response) => { return response.json(); })
    .then(body => {
      const reviews = body.reviews;
      const sidebarTitle = document.getElementById('sidebar_title');
      sidebarTitle.textContent = "Review Feed";
      const sidebarBody = document.getElementById('sidebar_body');
      // Get the template from HTML
      let cardTemplate = document.getElementById('reviewCardTemplate');
      // Populate a template for each review and then append onto document
      reviews.forEach(review => {
        console.log(review);
        const reviewCard = document.importNode(cardTemplate.content, true);

        // Populate Card
        reviewCard.querySelector('#cardUsername').textContent = review.username;
        reviewCard.querySelector('#cardDate').textContent = review.date;
        reviewCard.querySelector('#cardShopName').textContent = review.shop;
        reviewCard.querySelector('#cardRating').textContent = `Rating: ${review.rating}`;
        reviewCard.querySelector('#cardComments').textContent = review.comment;

        sidebarBody.appendChild(reviewCard);
      });
    })
    .catch(error => console.error('Error fetching data:', error));
}

let loadShopReviews = (titleOfShop, locationOfShop, descriptionFromSearch, descriptionFromDefault) => {
  let sidebarTitle = document.getElementById('sidebar_title');
  sidebarTitle.textContent = titleOfShop;
  console.log("WHATUP");

  // Show or hide the shop description based on title
  let shopDescription = document.getElementById('shop_description');
  let descriptionToDisplay = descriptionFromSearch || descriptionFromDefault ||''; //addressOfDefaultShops

  if (sidebarTitle.textContent === titleOfShop) {
    shopDescription.textContent = descriptionToDisplay;
    shopDescription.style.display = descriptionToDisplay ? "block" : "none"; // Show or hide description
  } else {
    shopDescription.textContent = '';
    shopDescription.style.display = "none"; // Hide description
  }

  //show the submit Shop Review Button
  let submitShopReviewButton = document.getElementById('submitShopReviewButton');
  submitShopReviewButton.style.display = "inline-block";

  submitShopReviewButton.addEventListener('click', function () {
    let descriptionToUse = descriptionFromSearch || descriptionFromDefault || '';
    let urlReviewPg = `http://localhost:3000/map/addReview?name=${titleOfShop}&location=${locationOfShop}&description=${encodeURIComponent(descriptionToUse)}`;
    console.log("HIII");
    let encodedUrlReviewPg = encodeURI(urlReviewPg);
    window.location.href = encodedUrlReviewPg; 
  });

  // fetch request here to load all reviews for the selected shop
  const sidebarBody = document.getElementById('sidebar_body');

  fetch(`http://localhost:3000/shopReviews?shopName=${titleOfShop}&shopLocation=${locationOfShop}`)
    .then((response) => { return response.json(); })
    .then(body => {
      const reviews = body.reviews;

      // Get the template from HTML
      let cardTemplate = document.getElementById('reviewCardTemplate');
      // Populate a template for each review and then append onto document
      reviews.forEach(review => {
        const reviewCard = document.importNode(cardTemplate.content, true);

        // Populate Card
        reviewCard.querySelector('#cardUsername').textContent = review.username;
        reviewCard.querySelector('#cardDate').textContent = review.date;
        reviewCard.querySelector('#cardShopName').textContent = review.shop;
        reviewCard.querySelector('#cardRating').textContent = `Rating: ${review.rating}`;
        reviewCard.querySelector('#cardComments').textContent = review.comment;

        sidebarBody.appendChild(reviewCard);
      });
    })
    .catch(error => console.error('Error fetching data:', error));

  // TODO If the map is clicked then the original loadfeed button should be called.
}