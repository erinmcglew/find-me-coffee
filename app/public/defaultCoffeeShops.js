// app/public/defaultShops.js
//https://docs.mapbox.com/api/search/search-box/#category-search

let geojsonCoffeeShops;
const defaultGeojson = {
    type: 'FeatureCollection',
    features: []
};

waitForGeolocation().then(function(coordinates) {
    console.log('Coordinates:', coordinates);
    let currentLong = coordinates.longitude;
    let currentLat = coordinates.latitude;
    //console.log("here in default shops!");

    getGeoJsonCoffeeShops(currentLong, currentLat);
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

    //limit=10 means that 10 coffee shops are shown, the max is 25
    fetch(`/defaultCoffeeShops?limit=10&proximity=${longitude},${latitude}`).then(response => {
        return response.json();
    }).then(body => {
        //console.log("BODY:", body);
        console.log(latitude, longitude);
        geojsonCoffeeShops = body;
        createDefaultGeoJson(geojsonCoffeeShops);
    }).catch(error => {
        console.log(error);
    });

}
