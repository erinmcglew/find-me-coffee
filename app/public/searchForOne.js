      function searchForOne() {
        //searchBox.marker.getElement().remove();
      //prob cannot add a popup to the customMarker because it is a img and not a div. maybe make it a div and perhaps a popup could be added
      //from that you can add text to that marker as well
      let customMarker = document.createElement("img");
      customMarker.className = "custom-marker"; // Apply any custom styling using CSS

      // For example, using a custom image as the marker
      customMarker.src =
        "https://docs.mapbox.com/mapbox-gl-js/assets/custom_marker.png";

      console.log("lol");
      //searchBox.marker = true;

      searchBox.marker = {
        element: customMarker,
        //popup: p,
      };
      // searchBox.marker = setPopup(
      //   new mapboxgl.Popup().setHTML("<h1>Hello World!!!!!</h1>")
      // );
      console.log("customMarker", customMarker);

      //map.on("load", function () {
      //work around solution to displaying a marker for the marker of searching for one place
      let address = "";
      map.on("click", async function () {
        console.log("Marker clicked!");
        const center = map.getCenter();
        console.log("center: ", map.getCenter());

        //reverse geocoding
        const response = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${center.lng},${center.lat}.json?access_token=pk.eyJ1Ijoiam00NjQ2IiwiYSI6ImNsbzRqdHkwYjAyankya251M3BxYTc0bTYifQ.DPfLWp7phIy4Yx2fAnUARg`
        );
        const data = await response.json();

        //Extract the place name if available
        console.log("data:", data);
        address = "";
        const features = data.features;
        console.log(features);
        if (features.length > 0) {
          for (const feature of features) {
            console.log("Features:", feature);
            console.log("Place Name:", feature.txt);
            if (
              feature.place_type.includes("address") ||
              feature.place_type.includes("poi") ||
              feature.place_type.includes("category")
            ) {
              address = feature.place_name;
              break;
            }
          }
        }
        console.log("Address!!: ", address);
        let placeName = "";
        //another geocoding api call
        async function getAddressPlaceName(address_) {
          const response = await fetch(
            `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
              address_
            )}.json?access_token=pk.eyJ1Ijoiam00NjQ2IiwiYSI6ImNsbzRqdHkwYjAyankya251M3BxYTc0bTYifQ.DPfLWp7phIy4Yx2fAnUARg`
          );
          const data = await response.json();
          console.log("data:!!!", data);

          if (data.features && data.features.length > 0) {
            // Loop through the features to find the most descriptive name
            placeName = "";
            for (const feature of data.features) {
              console.log("FEATURES!!!:", feature);
              if (feature.place_type && feature.place_type.includes("poi")) {
                placeName = feature.text; // Use the Point of Interest (POI) name if available
                break;
              } else if (feature.place_name) {
                placeName = feature.place_name; // Use the general place name if no POI available
              }
            }
            return placeName;
          } else {
            return "No place found";
          }
        }

        //calling the getAddressPlaceName function above from the second geocoding call
        getAddressPlaceName(address)
          .then((placeName) => {
            console.log("Actual Place Name:", placeName);
            // Use the placeName as needed
            let popup = new mapboxgl.Popup({
              offset: 25,
              maxWidth: "400px",
            }).setHTML(`${placeName}`);
            console.log(popup);
            console.log("here");
            popup.setLngLat(center).addTo(map);
          })
          .catch((error) => {
            console.error("Error:", error);
          });

        // console.log(
        //   popup.setLngLat([-75.02703500000001, 40.07802000000001]).addTo(map)
        // ); // Open the popup at the default location or marker's position
      //});
      });

      // map.on("click", function (e) {
      //   // Check if the click event is not on the marker
      //   if (!e.originalEvent.target.classList.contains("custom-marker")) {
      //     p.remove(); // Close the popup if the click is not on the marker
      //   }
      // });

      // map.on("click", function () {
      //   //if (marker.element === customMarker) {
      //   p.setLngLat(map.getCenter())
      //     .setHTML("<h1>Hello World!</h1>")
      //     .addTo(map); // Open the popup at the marker's location
      //   //}
      // });
      // customMarker.addEventListener("click", function () {
      //   console.log("Marker clicked!");
      //   console.log("map.getCenter()", map.getCenter());
      //   let popup = new mapboxgl.Popup().setHTML("<h1>Hello World!</h1>");
      //   console.log(popup);
      //   console.log("here");
      //   popup.setLngLat([-75.02703500000001, 40.07802000000001]).addTo(map);
      //   console.log(
      //     popup.setLngLat([-75.02703500000001, 40.07802000000001]).addTo(map)
      //   ); // Open the popup at the default location or marker's position
      // });

      console.log("test", searchBox.marker);

      searchBox.mapboxgl = mapboxgl;
      map.addControl(searchBox, "top-left");

      //remove first marker from the map
      function removeCustomMarkerFromOneSearch() {
        if (customMarker) {
          searchBox.marker = false; // Remove the marker from the map
          //customMarker = null; // Clear the stored reference
        }
      }

      }
      