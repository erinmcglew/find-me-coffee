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
        //console.log(review);
        const reviewCard = document.importNode(cardTemplate.content, true);

        // Populate Card
        reviewCard.querySelector('#cardUsername').textContent = review.username;
        reviewCard.querySelector('#cardDate').textContent = review.date;
        reviewCard.querySelector('#cardShopName').textContent = review.shop;
        reviewCard.querySelector('#cardRating').textContent = `Rating: ${review.rating}`;
        reviewCard.querySelector('#cardComments').textContent = review.comment;

        //Set thumbnail image source
        const thumbnailElement = reviewCard.getElementById("cardThumbnail");
        thumbnailElement.src = review.imagestring; 

        const thumbnailContainer = reviewCard.getElementById("thumbnailContainer");
        
        //check if an image was uploaded in the review
        console.log("review.imagestring:", review.imagestring)
        if (review.imagestring === "") {
          console.log("imagestring is empty");
          //thumbnailContainer.style.display = "none";
          thumbnailContainer.classList.add('hidden');
          thumbnailElement.style.display = 'none';

        } else {
          console.log("imagestring is not empty");
    
          //thumbnailContainer.style.display = "block";
          thumbnailContainer.classList.remove('hidden');
          thumbnailElement.style.display = 'block';
        }
        sidebarBody.appendChild(reviewCard);
      });
    })
    .catch(error => console.error('Error fetching data:', error));
}

let loadShopReviews = async (titleOfShop, locationOfShop) => {
  console.log("here in load shop reviews")

  let sidebarTitle = document.getElementById('sidebar_title');
  sidebarTitle.textContent = titleOfShop;

  //show the submit Shop Review Button
  let submitShopReviewButton = document.getElementById('submitShopReviewButton');
  submitShopReviewButton.style.display = "inline-block";

  submitShopReviewButton.addEventListener('click', function () {
    let urlReviewPg = `http://localhost:3000/map/addReview?name=${titleOfShop}&location=${locationOfShop}`;
    let encodedUrlReviewPg = encodeURI(urlReviewPg);
    window.location.href = encodedUrlReviewPg; 
  });

  // fetch request here to load all reviews for the selected shop
  const sidebarBody = document.getElementById('sidebar_body');

  await fetch(`http://localhost:3000/shopReviews?shopName=${titleOfShop}&shopLocation=${locationOfShop}`)
    .then((response) => { return response.json(); })
    .then(body => {
      const reviews = body.reviews;

      // Get the template from HTML
      let cardTemplate = document.getElementById('reviewCardTemplate');
      // Populate a template for each review and then append onto document
      reviews.forEach(review => {

        //if the review has an image, decode the image and put it in a thumbnail, 
        //this will need to be added to the reviewCard
        //let thumbnailUrl = //;
        console.log("REVIEW:", review)
        const reviewCard = document.importNode(cardTemplate.content, true);

        // Populate Card
        reviewCard.querySelector('#cardUsername').textContent = review.username;
        reviewCard.querySelector('#cardDate').textContent = review.date;
        reviewCard.querySelector('#cardShopName').textContent = review.shop;
        reviewCard.querySelector('#cardRating').textContent = `Rating: ${review.rating}`;
        reviewCard.querySelector('#cardComments').textContent = review.comment;
        //reviewCard.querySelector('#cardImage').textContent = review.image; //new - Erin

        //Set thumbnail image source
        const thumbnailElement = reviewCard.getElementById("cardThumbnail");
        thumbnailElement.src = review.imagestring; //reviewData.thumbnailUrl;

        sidebarBody.appendChild(reviewCard);
      });
    })
    .catch(error => console.error('Error fetching data:', error));

  // TODO If the map is clicked then the original loadfeed button should be called.
}