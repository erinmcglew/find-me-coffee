const apiKey = 'u_xMVXiZ-qwJ8UPUua_C2aalhTt0mHRX7ysMu5Cr-nAtGbJpDPoVaHe2Q5yjoN3ZmAH-b0G9beDHc1qP12G0sIXmnWnCvTFLwGLAQiCa_bd_FjAAvrBr58FxMgxNZXYx'; // Replace with your actual Yelp Fusion API key
const categoryAlias = 'Coffee & Tea'; // Replace with the desired category alias

const url = `https://api.yelp.com/v3/categories/${categoryAlias}`;

// Make the GET request
fetch(url, {
  headers: {
    Authorization: `Bearer ${apiKey}`,
  },
})
  .then(response => {
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return response.json();
  })
  .then(data => {
    // Process the data as needed
    console.log(data);
  })
  .catch(error => {
    console.error('Error:', error);
  });
