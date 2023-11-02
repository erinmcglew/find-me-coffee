// mapboxgl.accessToken = 'pk.eyJ1Ijoiam00NjQ2IiwiYSI6ImNsbzRqdHkwYjAyankya251M3BxYTc0bTYifQ.DPfLWp7phIy4Yx2fAnUARg';
// const map = new mapboxgl.Map({
//     container: 'map', // container ID
//     center: [-122.420679, 37.772537], // starting position [lng, lat]
//     zoom: 13, // starting zoom
//     style: 'mapbox://styles/mapbox/streets-v11', // style URL or style object
//     hash: true, // sync `center`, `zoom`, `pitch`, and `bearing` with URL
//     // Use `transformRequest` to modify requests that begin with `http://myHost`.
//     transformRequest: (url, resourceType) => {
//         if (resourceType === 'Source' && url.startsWith('http://myHost')) {
//             return {
//                 url: url.replace('http', 'https'),
//                 headers: {'my-custom-header': true},
//                 credentials: 'include'  // Include cookies for cross-origin requests
//             };
//         }
//     }
// });