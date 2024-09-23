const SINGAPORE_LATLONG = [1.3521, 103.8198];

const ONE_MAP_SG = 0x01;
const OPEN_STREET_MAP = 0x02;

const MAP_MIN_ZOOM = 11;
const MAP_MAX_ZOON = 19;

let map = L.map('map',
   {
    "minZoom" : MAP_MIN_ZOOM,
    "maxZoom": MAP_MAX_ZOON
   }).setView(SINGAPORE_LATLONG, 13);

const BASE_MAPS = {
  "OpenStreetMap" : L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    {
      detectRetina: true,
      maxZoom: MAP_MAX_ZOON,
      minZoom: MAP_MIN_ZOOM,
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }),
  "OpenStreetMap.HOT" : L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png',
    {
      detectRetina: true,
      maxZoom: MAP_MAX_ZOON,
      minZoom: MAP_MIN_ZOOM,
      attribution: '© OpenStreetMap contributors, Tiles style by Humanitarian OpenStreetMap Team hosted by OpenStreetMap France'
    }),
  "OneMapSG" : L.tileLayer('https://www.onemap.gov.sg/maps/tiles/Default_HD/{z}/{x}/{y}.png',
    {
      detectRetina: true,
      maxZoom: MAP_MAX_ZOON,
      minZoom: MAP_MIN_ZOOM,
      /** DO NOT REMOVE the OneMap attribution below **/
      attribution: '<img src="https://www.onemap.gov.sg/web-assets/images/logo/om_logo.png" style="height:20px;width:20px;"/>&nbsp;<a href="https://www.onemap.gov.sg/" target="_blank" rel="noopener noreferrer">OneMap</a>&nbsp;&copy;&nbsp;contributors&nbsp;&#124;&nbsp;<a href="https://www.sla.gov.sg/" target="_blank" rel="noopener noreferrer">Singapore Land Authority</a>'
    })
};
// Add baselayer control
let layerControl = L.control.layers(BASE_MAPS).addTo(map);

// Set Default Baselayer
BASE_MAPS.OpenStreetMap.addTo(map);

// Map scale
let mapScale = undefined;
function addScale(maxWidth, isMetric, isImperial) {
  mapScale = L.control.scale({
    "maxWidth" : maxWidth, "metric" : isMetric, "imperial" : isImperial
  });
  mapScale.addTo(map);
}

function removeScale() {
  if(mapScale == undefined) return;
  map.removeControl(mapScale);
  mapScale = undefined;
}

addScale(100, true, false);

// =========== Rainviewer
let rainviewerLayer = undefined;

function removeRainviewerLayer() {
  if(rainviewerLayer === undefined) return;
  map.removeLayer(rainviewerLayer);
  rainviewerLayer = undefined;
}

function addRainviewerLayer() {
  if(rainviewerApiObj === undefined) {
    console.error(`rainviewerApiObj is undefined!`);
    return;
  }

  rainviewerLayer = L.tileLayer(
    `${rainviewerApiObj.host}` + 
    `${rainviewerApiObj.radar.nowcast[0].path}` +
    `/${RAIN_VIEWER_API.highRes}/{z}/{x}/{y}/1/1_0.png`, {"opacity": 0.4});
  map.addLayer(rainviewerLayer);
}

document.addEventListener("rainviewerApiUpdated", () => {
  removeRainviewerLayer();
  addRainviewerLayer();
  console.log("displayRainviewer");
});

// if(RAIN_VIEWER_API.isReady) {
//   addRainviewerLayer();
// }

// ====== Open Data
OPEN_DATA_API.updateApiDataAll(true);
//OPEN_DATA_API.updateApiDataFns.get("12H")();

setTimeout(() => {
  console.log(apiData);
}, 3000);
