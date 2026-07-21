
maptilersdk.config.apiKey = window.mapToken;

const map = new maptilersdk.Map({
  container: "map",
  style: maptilersdk.MapStyle.STREETS,
  center: window.coordinates,
  zoom: 9,
});

const popup = new maptilersdk.Popup({ offset: 25 }).setHTML(`
  <h6>${window.listingTitle}</h6>
  <p>Exact location will be provided after booking.</p>
`);

new maptilersdk.Marker({
  color: "#FF385C",
})
  .setLngLat(window.coordinates)
  .setPopup(popup)
  .addTo(map);