// app/public/defaultShops.js
//https://docs.mapbox.com/api/search/search-box/#category-search

// Set an event listener that fires when a geolocate event occurs.
// function setupGeolocation() {
//     geolocate.on('geolocate', function(e) {
//     lon = e.coords.longitude;
//     lat = e.coords.latitude
//     position.length = 0;
//     position.push(lon);
//     position.push(lat);
//     longitude = position[0];
//     latitude = position[1];
// })};
//setupGeolocation();

let geojsonCoffeeShops;
const defaultGeojson = {
    type: 'FeatureCollection',
    features: []
};

waitForGeolocation().then(function(coordinates) {
    // Now you can do something with the coordinates
    console.log('Coordinates:', coordinates);
    let currentLong = coordinates.longitude;
    let currentLat = coordinates.latitude;
    console.log("here in default shops!");

    getGeoJsonCoffeeShops(currentLong, currentLat);

    //placeMarkers(geojson.features);
    
});


// let currentLong = document.currentScript.getAttribute("currentLong"); 
// let currentLat = document.currentScript.getAttribute("currentLat"); 
// console.log(currentLong)
// console.log(currentLat)

//https://docs.mapbox.com/api/search/search-box/#category-search
//The number of results to return, up to 10.
//origin- The location from which to calculate distance, provided as two comma-separated coordinates in longitude,latitude order.


function addMarkersToMap(){
//     return new Promise(function(resolve, reject) {
//         console.log("HERE in retrun geo json");
//         resolve(defaultGeojson);
// });
    map.loadImage('https://docs.mapbox.com/mapbox-gl-js/assets/custom_marker.png',
    (error, image) => {
    if (error) throw error;
    map.addImage('custom-marker', image);
    // Add defaultGeojson as the GeoJSON source with default coffee shop locations
    map.addSource('points', {
    'type': 'geojson',
    'data': defaultGeojson});

    // Add a symbol layer
    map.addLayer({
        'id': 'points',
        'type': 'symbol',
        'source': 'points',
        'layout': {
            'icon-image': 'custom-marker',
            // get the title name from the source's "title" property
            'text-field': ['get', 'title'],
            'text-font': [
                'Open Sans Semibold',
                'Arial Unicode MS Bold'
            ],
            'text-offset': [0, 1.25],
            'text-anchor': 'top'
        },
        'minzoom': 0
    });
    }
    );
}

function createDefaultGeoJson(listOfCoffeeShops){
    console.log("listOfCoffeeShops: ", listOfCoffeeShops);

    listOfCoffeeShops.features.forEach(feature => {
        const geojsonFeature = {
            type: 'Feature',
            geometry: {
                type: 'Point',
                coordinates: feature.geometry.coordinates
            },
            properties: {
                //can add more properties from json here
                title: feature.properties.name,
                description: feature.properties.full_address
            }
        };
    
        defaultGeojson.features.push(geojsonFeature);
    });

    console.log("geojson:", defaultGeojson);
    addMarkersToMap();
}


function getGeoJsonCoffeeShops(longitude, latitude) {
    //console.log("in getGeoJsonCoffeeShops");
    console.log("getGeoJsonCoffeeShops long", longitude);
    console.log("getGeoJsonCoffeeShops lat", latitude);
    
    //location of philly art museum- example
    //longitude = -75.1810; //-74.19;
    //latitude = 39.9656; //39.9571;
    fetch(`/defaultCoffeeShops?limit=10&proximity=${longitude},${latitude}`).then(response => { //origin=-75.1917,39.9571`
        console.log("Received response headers");
        return response.json();
    }).then(body => {
        console.log("Received response body:");
        console.log("BODY:", body);
        console.log(latitude, longitude);
        geojsonCoffeeShops = body;
        createDefaultGeoJson(geojsonCoffeeShops);
    }).catch(error => {
        console.log(error);
    });

}


