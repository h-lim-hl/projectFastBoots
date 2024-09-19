const SINGAPORE_LATLONG = [1.3521, 103.8198];

const ONE_MAP_SG = 0x01;
const OPEN_STREET_MAP = 0x02;

let map = L.map('map').setView(SINGAPORE_LATLONG, 13);

let mapBaseLayer = 2;

if (Boolean(mapBaseLayer & ONE_MAP_SG)) {
  L.tileLayer('https://www.onemap.gov.sg/maps/tiles/Default_HD/{z}/{x}/{y}.png', {
    detectRetina: true,
    maxZoom: 19,
    minZoom: 11,
    /** DO NOT REMOVE the OneMap attribution below **/
    attribution: '<img src="https://www.onemap.gov.sg/web-assets/images/logo/om_logo.png" style="height:20px;width:20px;"/>&nbsp;<a href="https://www.onemap.gov.sg/" target="_blank" rel="noopener noreferrer">OneMap</a>&nbsp;&copy;&nbsp;contributors&nbsp;&#124;&nbsp;<a href="https://www.sla.gov.sg/" target="_blank" rel="noopener noreferrer">Singapore Land Authority</a>'
  }).addTo(map);
}
if (Boolean(mapBaseLayer & OPEN_STREET_MAP)) {
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  }).addTo(map);
}


async function addTitleLayer () {
  await getRainViewerApiConfig();
  console.log(`${RAIN_VIEWER_API.json.host}${RAIN_VIEWER_API.json.radar.nowcast[0].path}/256/{z}/{x}/{y}/1/1_0.png`);
  L.tileLayer(
    `${RAIN_VIEWER_API.json.host}${RAIN_VIEWER_API.json.radar.nowcast[0].path}/256/{z}/{x}/{y}/1/1_0.png`
  ).addTo(map);
}

//setTimeout(addTitleLayer,1000);
addTitleLayer();