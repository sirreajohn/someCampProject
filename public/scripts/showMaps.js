
mapboxgl.accessToken = mapToken;  // maptoken is available while rendering show page.
const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/light-v11', 
    center: [54,78], // some random location to initialize map.
    zoom: 5
});

const end = {
    center: thisCampground.geometry.coordinates,
    zoom: 12.5,
    bearing: 130,
    pitch: 75
};

map.flyTo({
    ...end, // Fly to the selected target
    duration: 10000, // Animate over 12 seconds
    essential: true // This animation is considered essential with
    //respect to prefers-reduced-motion
});

map.addControl(new mapboxgl.NavigationControl());
const marker1 = new mapboxgl.Marker()
    .setLngLat(end.center)
    .setPopup(
        new mapboxgl.Popup({offset: 25})
            .setHTML(`<h4>${thisCampground.title}</h4><hr><p>${thisCampground.location}</p>`)
    )
    .addTo(map)
