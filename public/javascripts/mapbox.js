Swal.fire({
    title: "Select Location",
    html: '<div id="map"></div>',
    allowEscapeKey: false,
    allowOutsideClick: false,
    showConfirmButton: false
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

    $.ajax({
        url: '/theatre-locations',
        method: 'get',
        success: (features) => {
            features.forEach(function (marker) {
                // create a HTML element for each feature
                var el = document.createElement('div');
                el.className = 'marker';

                const coordinates = [marker.location.longitude, marker.location.latitude]
                console.log(coordinates);

                // make a marker for each feature and add to the map
                new mapboxgl.Marker(el)
                    .setLngLat(coordinates)
                    .setPopup(new mapboxgl.Popup({ offset: 25 }) // add popups
                        .setHTML(`<h6 class="text-primary py-3 px-5">${marker.theatreName}</h6><p class="text-dark">${marker.status}</p>`))
                    .addTo(map);
            });
        }
    });
}