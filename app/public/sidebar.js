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

let loadShopReviews = () => {
    let sidebarTitle = document.getElementById('sidebar_title');
    sidebarTitle.textContent = "Starbucks";

    // fetch request here
    const sidebarBody = document.getElementById('sidebar_body');
    
    // Add a textarea and a button. Load the reviews next. 
    // If the map is clicked then the original loadfeed button should be called.
}