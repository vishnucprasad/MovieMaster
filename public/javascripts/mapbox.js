const loadMap = () => {
    vex.dialog.open({
        input: [
            `<div id="map-wrapper">
             <div class="text-center text-uppercase" id="mapTitle">
             <h2 class="text-white wthree">Select Location</h2>
             </div>
             <div id="map"></div>
             <div class="text-center bg-white" id="instructions"></div>
             <div class="text-center bg-white py-3" id="mapConfirmWrapper" hidden>
             <button class="btn btn-white px-5 mt-4 text-center font-weight bold" onclick="vex.closeTop();" id="mapConfirmBtn">Confirm</button>
             </div>
            </div>`
        ].join(''),
        buttons: [],
        escapeButtonCloses: false,
        overlayClosesOnClick: false
    });

    if (document.getElementById('map')) {
        mapboxgl.accessToken = 'pk.eyJ1IjoidmlzaG51Y3ByYXNhZCIsImEiOiJja2V3NzAxYnIyNWtrMnhtcmN2dG43Ynd3In0.PjtuWzKhZ2IOs-2rjNCcXQ';

        const map = new mapboxgl.Map({
            container: 'map',
            style: 'mapbox://styles/mapbox/outdoors-v11', // stylesheet location
            center: [76.78, 9.54], // starting position [lng, lat]
            zoom: 7 // starting zoom
        });

        map.addControl(
            new MapboxGeocoder({
                accessToken: mapboxgl.accessToken,
                mapboxgl: mapboxgl
            })
        );

        map.addControl(
            new mapboxgl.GeolocateControl({
                positionOptions: {
                    enableHighAccuracy: true
                },
                trackUserLocation: true
            })
        );

        let theatreFeatures = [];

        $.ajax({
            url: '/theatre-locations',
            method: 'get',
            success: (features) => {
                theatreFeatures = features;
                features.forEach(function (marker) {
                    // create a HTML element for each feature
                    var el = document.createElement('div');
                    el.className = 'marker';

                    const coordinates = [marker.location.longitude, marker.location.latitude]

                    // make a marker for each feature and add to the map
                    new mapboxgl.Marker(el)
                        .setLngLat(coordinates)
                        .setPopup(new mapboxgl.Popup({ offset: 25 }) // add popups
                            .setHTML(`<h6 class="text-primary py-3 px-5">${marker.theatreName}</h6><p id="distance" class="text-dark"></p>`))
                        .addTo(map);
                });
            }
        });

        const canvas = map.getCanvasContainer();

        // create a function to make a directions request
        function getRoute(start) {
            const instructions = document.getElementById('instructions');
            instructions.innerHTML = `
            <p>Finding nearest theatre</p>
            <span id="loadingBtn">
                <span class="spinner-grow spinner-grow-sm text-twitter" role="status"
                    aria-hidden="true"></span>
                <span class="spinner-grow spinner-grow-sm text-twitter" role="status"
                    aria-hidden="true"></span>
                <span class="spinner-grow spinner-grow-sm text-twitter" role="status"
                    aria-hidden="true"></span>
                <span class="spinner-grow spinner-grow-sm text-twitter" role="status"
                    aria-hidden="true"></span>
                <span class="spinner-grow spinner-grow-sm text-twitter" role="status"
                    aria-hidden="true"></span>
            </span>`;

            $.ajax({
                url: '/get-routes',
                method: 'post',
                data: {
                    start
                },
                success: (response) => {
                    const features = response.routes;

                    let lowest = Number.POSITIVE_INFINITY;
                    let lowestIndex = 0;
                    let tmp;
                    for (let i = features.length - 1; i >= 0; i--) {
                        tmp = features[i].geolocationData.distance;
                        if (tmp < lowest) {
                            lowest = tmp;
                            lowestIndex = i;
                        }
                    }

                    const data = features[lowestIndex].geolocationData;
                    const route = data.geometry.coordinates;
                    const geojson = features[lowestIndex].geojson;
                    // if the route already exists on the map, reset it using setData
                    if (map.getSource('route')) {
                        map.getSource('route').setData(geojson);
                    } else { // otherwise, make a new request
                        map.addLayer({
                            id: 'route',
                            type: 'line',
                            source: {
                                type: 'geojson',
                                data: {
                                    type: 'Feature',
                                    properties: {},
                                    geometry: {
                                        type: 'LineString',
                                        coordinates: geojson.geometry.coordinates
                                    }
                                }
                            },
                            layout: {
                                'line-join': 'round',
                                'line-cap': 'round'
                            },
                            paint: {
                                'line-color': '#18d26e',
                                'line-width': 5,
                                'line-opacity': 0.75
                            }
                        });
                    }
                    // add turn instructions here at the end

                    instructions.innerHTML = `Nearest theatre is <span class="text-danger">${features[lowestIndex].theatreName}</span>, <span class="text-danger">${Math.floor(data.distance / 1000)} KM</span> from your location.`
                    document.getElementById('mapConfirmWrapper').removeAttribute('hidden');
                    document.getElementById('userLocation').innerHTML = response.userLocation.place_name;
                }
            });
        }

        map.on('click', function (e) {
            const coordsObj = e.lngLat;
            canvas.style.cursor = '';
            const coords = Object.keys(coordsObj).map(function (key) {
                return coordsObj[key];
            });
            const start = {
                type: 'FeatureCollection',
                features: [{
                    type: 'Feature',
                    properties: {},
                    geometry: {
                        type: 'Point',
                        coordinates: coords
                    }
                }
                ]
            };
            if (map.getLayer('start')) {
                map.getSource('start').setData(start);
            } else {
                map.addLayer({
                    id: 'start',
                    type: 'circle',
                    source: {
                        type: 'geojson',
                        data: {
                            type: 'FeatureCollection',
                            features: [{
                                type: 'Feature',
                                properties: {},
                                geometry: {
                                    type: 'Point',
                                    coordinates: coords
                                }
                            }]
                        }
                    },
                    paint: {
                        'circle-radius': 10,
                        'circle-color': '#f30'
                    }
                });
            }
            getRoute(coords);
        });

    }
}