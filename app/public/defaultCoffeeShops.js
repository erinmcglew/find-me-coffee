// app/public/defaultShops.js
//https://docs.mapbox.com/api/search/search-box/#category-search

let currentLong;
let currentLat; 
window.geojsonCoffeeShops = undefined;
const defaultGeojson = {
    type: 'FeatureCollection',
    features: []
};


function setCurrentLongLat(){
    return new Promise(function(resolve, reject) {
        resolve({ currentLong, currentLat });
    });
}

waitForGeolocation().then(function(coordinates) {
    //console.log('Coordinates:', coordinates);
    currentLong = coordinates.longitude; 
    currentLat = coordinates.latitude;
    getGeoJsonCoffeeShops(currentLong, currentLat);
    setCurrentLongLat();
});

//https://docs.mapbox.com/api/search/search-box/#category-search
//The number of results to return, up to 25

function addMarkersToMap(){
    //image of marker
    map.loadImage('https://docs.mapbox.com/mapbox-gl-js/assets/custom_marker.png',
    (error, image) => {
    if (error) throw error;
    map.addImage('custom-marker', image);
    //Add defaultGeojson as the GeoJSON source with default coffee shop locations
    map.addSource('points', 
    {
        'type': 'geojson',
        'data': defaultGeojson
    });

    //Adding a symbol layer to the map
    //https://docs.mapbox.com/help/getting-started/add-markers/#use-mapbox-gl-js-with-a-symbol-layer
    //https://docs.mapbox.com/mapbox-gl-js/example/geojson-markers/ 
    map.addLayer({
        'id': 'points',
        'type': 'symbol',
        'source': 'points',
        'layout': {
            'icon-image': 'custom-marker',
            //get the title name from the source's "title" property
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

    // SELECT MARKER
    map.on('click', 'points', (e) => {
        //console.log("features:", e.features);
        //const coordinates = e.features[0].geometry.coordinates.slice();
        const coordinates = e.features[0].geometry.coordinates;
        //show this description on the sidebar
        let addressFromDefault = e.features[0].properties.description;
        
        //console.log("coords:", e.features[0].properties.title);
        let title = e.features[0].properties.title;
        let location = coordinates[0] + "," + coordinates[1];
        //console.log("coordinates:", coordinates[0] + "," + coordinates[1]);

        //limit to 5 decimals
        // console.log("typeof coordinates[0]: ", typeof coordinates[0])
        // console.log("typeof coordinates[1]: ", typeof coordinates[1])
        // let latLong = location.split(',');
        // let lat = latLong[0];
        // let long = latLong[1];
        // let decimalLocationLat = parseFloat(lat);
        // let decimalLocationLong = parseFloat(long);
        // let limitedDecimalLocationLat = decimalLocationLat.toFixed(5);
        // let limitedDecimalLocationLong = decimalLocationLong.toFixed(5);
        // let storeLocationLat = limitedDecimalLocationLat.toString();
        // let storeLocationLong = limitedDecimalLocationLong.toString();
        // location = storeLocationLat + "," + storeLocationLong
        // console.log("location in defaultCoffeeShops.js:", coordinates)

        //Clear the sidebar nodes 
        const sidebarBody = document.getElementById('sidebar_body');
        while (sidebarBody.hasChildNodes()) {
            sidebarBody.removeChild(sidebarBody.firstChild);
        }
        loadShopReviews(title, location, addressFromDefault);

      });
    });
}

function createDefaultGeoJson(listOfCoffeeShops){
    //console.log("listOfCoffeeShops: ", listOfCoffeeShops);

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

    //console.log("geojson:", defaultGeojson);
    addMarkersToMap();
}


function getGeoJsonCoffeeShops(longitude, latitude) {
    //console.log("in getGeoJsonCoffeeShops");
    //console.log("getGeoJsonCoffeeShops long", longitude);
    //console.log("getGeoJsonCoffeeShops lat", latitude);
    
    //location of philly art museum- example
    //longitude = -75.1810; //-74.19;
    //latitude = 39.9656; //39.9571;

    //limit=10 means that 10 coffee shops are shown, the max is 25
    fetch(`/defaultCoffeeShops?limit=20&proximity=${longitude},${latitude}`).then(response => {
        return response.json();
    }).then(body => {
        //console.log("BODY:", body);
        //console.log(latitude, longitude);
        window.geojsonCoffeeShops = body;
        createDefaultGeoJson(window.geojsonCoffeeShops);
    }).catch(error => {
        console.log(error);
    });

}
