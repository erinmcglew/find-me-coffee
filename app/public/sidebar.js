// Load Feed Containing All Reviews

let loadFeed = () => {
  fetch('http://localhost:3000/feed')
    .then((response) => {
      let data = response.json();
      const reviews = data.reviews;
      const sidebarBody = document.getElementById('sidebar_body');
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
}
