// Load Feed Containing All Reviews

let loadFeed = () => {
  fetch('https://findmecoffee.link/feed')
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

        //reformatting the date in each card 
        // Convert the review date string to a Date object
        const reviewDate = new Date(review.date);

        // Get the components of the date
        const day = reviewDate.toLocaleString('en', { weekday: 'short' }); // Short day name (e.g., Tue)
        const month = reviewDate.toLocaleString('en', { month: 'short' }); // Short month name (e.g., Dec)
        const dayOfMonth = reviewDate.getDate(); // Day of the month (e.g., 12)
        const year = reviewDate.getFullYear(); // Year (e.g., 2023)

        // Construct the formatted date string (e.g., "Tue Dec 12 2023")
        const formattedDate = `${day} ${month} ${dayOfMonth} ${year}`;

        reviewCard.querySelector('#cardDate').textContent = formattedDate;
        reviewCard.querySelector('#cardShopName').textContent = review.shop;
        reviewCard.querySelector('#cardRating').textContent = `Rating: ${review.rating}`;

        // Create a star icon element
        const starIcon = document.createElement('i');
        starIcon.classList.add('fas', 'fa-star'); // You might need to adjust classes for your specific icon library

        starIcon.style.color = 'yellow'; // Change to any color value you desire
        starIcon.style.textShadow = '0 0 2px black'; // Add a black shadow to create the border effect


        // Append the star icon before the rating
        const ratingElement = reviewCard.querySelector('#cardRating');
        ratingElement.insertBefore(starIcon, ratingElement.firstChild);

        reviewCard.querySelector('#cardComments').textContent = review.comment;

        //Set thumbnail image source
        const thumbnailElement = reviewCard.getElementById("cardThumbnail");
        thumbnailElement.src = review.imagestring; 

        /*
        const thumbnailContainer = reviewCard.getElementById("thumbnailContainer");
        //check if an image was uploaded in the review
        console.log("review.imagestring:", review.imagestring)
        if (review.imagestring === null) {
          console.log("imagestring is empty");
          //thumbnailContainer.style.display = "none";
          thumbnailContainer.classList.add('hidden');
          thumbnailElement.style.display = 'none';

        } else {
          console.log("imagestring is not empty");
          console.log("review.imagestring in the not empty:", review.imagestring)
          //thumbnailContainer.style.display = "block";
          thumbnailContainer.classList.remove('hidden');
          thumbnailElement.style.display = 'block';
        }
        */

        sidebarBody.appendChild(reviewCard);
      });
    })
    .catch(error => console.error('Error fetching data:', error));
}

//let loadShopReviews = async (titleOfShop, locationOfShop, descriptionFromSearch, descriptionFromDefault) => {
const fetchShopDescription = async (titleOfShop, locationOfShop) => {
  try {
    // Make a fetch request to your backend API to get the description
    const response = await fetch('/shopdesc', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ titleOfShop, locationOfShop })
    });

    if (response.ok) {
      const data = await response.json();
      return data.description; // Assuming the description is returned in the 'description' field
      //console.log("tik",data.description);
    } else {
      console.error('Failed to fetch shop description');
      return null; // Return null if there's an error fetching the description
    }
  } catch (error) {
    console.error('Error fetching shop description:', error);
    return null; // Return null if there's an error fetching the description
  }
};

const displayDescription = (titleOfShop, descriptionToDisplay) => {
  let sidebarTitle = document.getElementById('sidebar_title');
  let shopDescription = document.getElementById('shop_description2');

  sidebarTitle.textContent = titleOfShop;

  if (sidebarTitle.textContent === titleOfShop) {
    shopDescription.textContent = `Description of Coffee Shop: ${descriptionToDisplay}` || "☕️"; // Set description text or default to an empty string
    shopDescription.style.display = descriptionToDisplay ? 'block' : 'none'; // Show or hide description
  } else {
    shopDescription.textContent = '';
    shopDescription.style.display = 'none'; // Hide description
  }
};


let loadShopReviews = async (titleOfShop, locationOfShop, addressFromSearch, addressFromDefault) => {
  let sidebarTitle = document.getElementById('sidebar_title');
  sidebarTitle.textContent = titleOfShop;
  console.log("WHATUP");

  // Show or hide the shop description based on title
  let shopDescription = document.getElementById('shop_description');
  let descriptionToDisplay = addressFromSearch || addressFromDefault ||''; //addressOfDefaultShops

  if (sidebarTitle.textContent === titleOfShop) {
    shopDescription.textContent = descriptionToDisplay;
    shopDescription.style.display = descriptionToDisplay ? "block" : "none"; // Show or hide description
  } else {
    shopDescription.textContent = '';
    shopDescription.style.display = "none"; // Hide description
  }

  //fetch description from db or just place a default message of the coffee shop
  fetchShopDescription(titleOfShop, locationOfShop).then((description) => {
    displayDescription(titleOfShop, description);
  });

  //show the submit Shop Review Button
  let submitShopReviewButton = document.getElementById('submitShopReviewButton');
  submitShopReviewButton.style.display = "inline-block";

  submitShopReviewButton.addEventListener('click', function () {
    let descriptionToUse = addressFromSearch || addressFromDefault || '';
    let urlReviewPg = `https://findmecoffee.link/map/addReview?name=${titleOfShop}&location=${locationOfShop}&description=${encodeURIComponent(descriptionToUse)}`;
    console.log("HIII");
    let encodedUrlReviewPg = encodeURI(urlReviewPg);
    window.location.href = encodedUrlReviewPg; 
  });

  // fetch request here to load all reviews for the selected shop
  const sidebarBody = document.getElementById('sidebar_body');

  await fetch(`https://findmecoffee.link/shopReviews?shopName=${titleOfShop}&shopLocation=${locationOfShop}`)
    .then((response) => { return response.json(); })
    .then(body => {
      const reviews = body.reviews;
      console.log("REVIEWS!!!",reviews);

      if (!body || !body.reviews || body.reviews.length === 0) {
        // If no reviews are found, display a message
        const noReviewsMessage = document.createElement('p');
        noReviewsMessage.textContent = 'No reviews submitted for this coffee shop yet. The owner of this coffee shop would appreciate if you submitted a review of their coffee shop! ☕';
        noReviewsMessage.style.fontFamily = 'Playfair Display, serif'; // Apply Playfair font
        noReviewsMessage.style.textAlign = 'center'; // Center align text
        noReviewsMessage.style.maxWidth = '80%'; // Set max-width for narrower text block
        noReviewsMessage.style.margin = '0 auto'; // Center the block horizontally
        noReviewsMessage.style.margin = '300px auto 0'; // Top margin increased to push it down
        noReviewsMessage.style.fontSize = '18px'; // Increase font size


        sidebarBody.appendChild(noReviewsMessage);
    } else {
      const reviews = body.reviews;
      // Get the template from HTML
      let cardTemplate = document.getElementById('reviewCardTemplate');
      // Populate a template for each review and then append onto document
      reviews.forEach(review => {
        const reviewCard = document.importNode(cardTemplate.content, true);

        // Populate Card
        reviewCard.querySelector('#cardUsername').textContent = review.username;

        //reformatting the date in each card 
        // Convert the review date string to a Date object
        const reviewDate = new Date(review.date);

        // Get the components of the date
        const day = reviewDate.toLocaleString('en', { weekday: 'short' }); // Short day name (e.g., Tue)
        const month = reviewDate.toLocaleString('en', { month: 'short' }); // Short month name (e.g., Dec)
        const dayOfMonth = reviewDate.getDate(); // Day of the month (e.g., 12)
        const year = reviewDate.getFullYear(); // Year (e.g., 2023)

        // Construct the formatted date string (e.g., "Tue Dec 12 2023")
        const formattedDate = `${day} ${month} ${dayOfMonth} ${year}`;

        reviewCard.querySelector('#cardDate').textContent = formattedDate;
        console.log("DATES",review.date)
        reviewCard.querySelector('#cardShopName').textContent = review.shop;
        reviewCard.querySelector('#cardRating').textContent = `Rating: ${review.rating}`;

        // Create a star icon element
        const starIcon = document.createElement('i');
        starIcon.classList.add('fas', 'fa-star'); // You might need to adjust classes for your specific icon library

        starIcon.style.color = 'yellow'; // Change to any color value you desire
        starIcon.style.textShadow = '0 0 2px black'; // Add a black shadow to create the border effect


        // Append the star icon before the rating
        const ratingElement = reviewCard.querySelector('#cardRating');
        ratingElement.insertBefore(starIcon, ratingElement.firstChild);

        reviewCard.querySelector('#cardComments').textContent = review.comment;

        //Set thumbnail image source
        const thumbnailElement = reviewCard.getElementById("cardThumbnail");
        thumbnailElement.src = review.imagestring; 

        /*
        const thumbnailContainer = reviewCard.getElementById("thumbnailContainer");
        //check if an image was uploaded in the review
        console.log("review.imagestring:", review.imagestring)
        if (review.imagestring === null) {
          console.log("imagestring is empty");
          //thumbnailContainer.style.display = "none";
          thumbnailContainer.classList.add('hidden');
          thumbnailElement.style.display = 'none';

        } else {
          console.log("imagestring is not empty");
          console.log("review.imagestring in the not empty:", review.imagestring)
          //thumbnailContainer.style.display = "block";
          thumbnailContainer.classList.remove('hidden');
          thumbnailElement.style.display = 'block';
        }
        */

        sidebarBody.appendChild(reviewCard);
      });

    }
      
    })
    .catch(error => console.error('Error fetching data:', error));

  // TODO If the map is clicked then the original loadfeed button should be called.
}