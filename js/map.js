const SINGAPORE_LATLONG = [1.3521, 103.8198];

const ONE_MAP_SG = 0x01;
const OPEN_STREET_MAP = 0x02;

const MAP_MIN_ZOOM = 10;
const MAP_MAX_ZOON = 20;

let map = L.map('map',
   {
    "minZoom" : MAP_MIN_ZOOM + 1,
    "maxZoom": MAP_MAX_ZOON - 1,
    "zoomControl" : false
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
// https://en.wikipedia.org/wiki/Heat_index#Formula
// NEEDS CHECKING
function getHeatIndex(deg, rh, isFahrenheit = false) {
  let c;
  if(isFahrenheit) {
    c = [-42.379, 2.04901523, 10.14344127, 
      -0.22475541, -6.83783e-3, -5.481717e-2,
      1.22874e-3, 8.5282e-4,-1.99e-6
    ];
  } else {
    c = [-8.78469475556, 1.61139411, 2.33854883889, 
      -0.14611605, -0.012308094, -0.0164248277778,
      2.221732e-3, 7.2546e-4, -3.582e-6
    ];
  }
  let ret = c[0] + c[1]*deg + c[2]*rh +
  c[3]*deg*rh + c[4]*deg*deg + c[5]*rh*rh +
  c[6]*deg*deg*rh + c[7]*deg*rh*rh + c[8]*deg*deg*rh*rh;
  return ret;
}

// Add baselayer control
let layerControl = L.control.layers(BASE_MAPS).addTo(map);

// Set Default Baselayer
BASE_MAPS.OpenStreetMap.addTo(map);

// Map Scale
let mapScale = undefined;
function addScale(maxWidth, isMetric) {
  mapScale = L.control.scale({
    "maxWidth" : maxWidth, "metric" : isMetric, "imperial" : !isMetric,
    "position" : "bottomright"
  });
  mapScale.addTo(map);
}

function removeScale() {
  if(mapScale == undefined) return;
  map.removeControl(mapScale);
  mapScale = undefined;
}

addScale(100, true);

// Map Zoom Controls
L.control.zoom({
  position: 'bottomright' // Set desired position
}).addTo(map);

// =========== Rainviewer
let rainviewerLayer = undefined;
let rainviewerControl = undefined;
// let rainviewerColorScheme = Object.values(colorSchemeToCssClass)[1];

function removeRainviewerLayer() {
  if(rainviewerLayer === undefined) return;
  map.removeLayer(rainviewerLayer);
  map.removeControl(rainviewerControl);
  rainviewerControl = undefined;
  rainviewerLayer = undefined;
}

function addRainviewerLayer() {
  if(rainviewerApiObj === undefined) {
    console.error(`rainviewerApiObj is undefined!`);
    return;
  }

  rainviewerLayer = L.tileLayer(
    getRainlayerUrl(), {
      "opacity" : rainviewerOptions.opacity,
      "zIndex" : 2
    });
  
  rainviewerControl = L.control({position : 'topleft'});
  rainviewerControl.onAdd = () => {
    let legend = L.DomUtil.create('div');
    legend.innerHTML += getRainviewerLegend(Object.values(colorSchemeToCssClass)[rainviewerOptions.color]);
    return legend;
  };
  
  map.addLayer(rainviewerLayer);
  rainviewerControl.addTo(map);
}

document.addEventListener("rainviewerApiUpdated", () => {
  removeRainviewerLayer();
  addRainviewerLayer();
  console.log("displayRainviewer");
});

// =============== leaflet markers

function getDivIconSize(divIconHtml) {
  let tempDiv = document.createElement("div");
  tempDiv.style.position = "absolute";
  tempDiv.style.visibility = "hidden";
  tempDiv.style.pointerEvents = "none";
  tempDiv.innerHTML = divIconHtml;

  document.body.appendChild(tempDiv);
  let divWidth = tempDiv.offsetWidth;
  let divHeight = tempDiv.offsetHeight;
  document.body.removeChild(tempDiv);

  return [divWidth, divHeight];
}

// =============== leaflet Neighbourhood Markers
let townLayer = undefined;

function getTownMarker (name) {
  const html =
  `
    <div>
      <div class="d-flex flex-column align-items-center" style="width: 80px; border-radius: 5%; font-size: small; background-color: ghostwhite; opacity: 0.8;">
        <div class="align-middle">
          <div style="background-color: white; border-radius: 50%; height: 24px; width: 24px; border-width: 1px; border-color: maroon; border-style: solid; margin-top: 5px;">
            <img src="images/skyscrapper-edifice.svg" style="height: 18px; width: 18px; margin: 0 0 1pt 2pt">
          </div>
        </div>
        <div class="align-middle" style="margin-bottom: 3px; text-align: center">
          <b><u>${name?name:"Unnamed"}</u></b>
        </div>
      </div>
    </div>
  `;
  const iconSize = getDivIconSize(html);
  return L.divIcon({
    "className" : "",
    "html" : html,
    "iconSize" : iconSize,
    "iconAnchor" : [iconSize[0]*0.5, iconSize[1]*0.5]
  });
}

function getTownLayer() {
  let divTownGrp = new L.MarkerClusterGroup({
    "iconCreateFunction" : (cluster) => {
      console.log(cluster);
      return getTownMarker(cluster.getChildCount(), 30);
    }
  });
  for(let o of apiData.neighbourhoods.entries()) {
    const icon = getTownMarker(o[0])
    L.marker(o[1].location, {"icon": icon}).addTo(divTownGrp);
  }
  return divTownGrp;
}

function addTownLayer () {
  townLayer = getTownLayer();
  map.addLayer(townLayer);
}

function removeTownLayer() {
  map.removeLayer(townLayer);
  townLayer = undefined;
}

function refreshTownLayer() {
  removeTownLayer();
  addTownLayer();
}

// =============== leaflet Temperature Markers
let temperatureLayer = undefined;

function getTemperatureMarker(name, data) {
  const heatIndex = HELPER.sigFig(getHeatIndex(data.temp, data.rh), 1);
  const html =
  `
    <div class="d-flex flex-column align-items-center"
      style="width: 80px; border-radius: 5%; font-size: small; background-color: ghostwhite; opacity: 0.8">
      <div class="align-middle">
        <div
          style="background-color: white; border-radius: 50%; height: 24px; width: 24px; border-width: 1px; border-color: maroon; border-style: solid; margin-top: 5px;">
          <img class="mapTownIcon" src="images/global-warming.svg" style="height: 18px; width: 18px; margin: .5pt 0 0 1.5pt ">
        </div>
      </div>
      <div class="align-middle" style="text-align: center">
        <b><u>${name?name:"Unnamed"}</u></b>
      </div>
      <div class="align-middle" style="margin-bottom: 8px;">
        <table>
          <tr>
            <td style="text-align: right;">Temp:</td>
            <td>${data.temp?data.temp:"NaN "}&degc</td>
          </tr>
          <tr>
            <td style="text-align: right;">RH:</td>
            <td>${data.rh?data.rh:"NaN "}%</td>
          </tr>
          <tr>
            <td style="text-align: right;">Feels:</td>
            <td>${heatIndex}&degc</td>
          </tr>
        </table>
      </div>
    </div>
  `;

  const iconSize = getDivIconSize(html);
  return L.divIcon({
    "className" : "",
    "html" : `${html}`,
    "iconSize" : iconSize,
    "iconAnchor" : [iconSize[0]*0.5, iconSize[1]*0.5]
  });
}

function getTemperatureLayer() {
  let divTemperatureLayer = new L.layerGroup();
  let data = {};

  for( let o of apiData.airTemp.data) {
    data[o.stationId] ??= {};
    data[o.stationId]["temp"] = o.value;
  }
  for(let o of apiData.relativeHumidity.data) {
    data[o.stationId] ??= {};
    data[o.stationId]["rh"] = o.value;
  }
  for(let o of Object.keys(data)) {
    const station = apiData.stations.get(o);
    let name, location;
    if (!station) { name = ""; location = [0, 0]; }
    else { name = station.name; location = station.location; }
    data[o]["name"] = name;
    data[o]["location"] = location;
  }

  for(let o of Object.entries(data)) {
    const icon = getTemperatureMarker(o[1].name, {"temp" : o[1].temp, "rh" : o[1].rh})
    L.marker(o[1].location, {"icon": icon}).addTo(divTemperatureLayer);
  }

  return divTemperatureLayer;
}

function addTemperatureLayer() {
  temperatureLayer = getTemperatureLayer();
  map.addLayer(temperatureLayer);
}

function removeTemperatureLayer() {
  map.removeLayer(temperatureLayer);
  temperatureLayer = undefined;
}

function refreshTemperatureLayer() {
  removeTemperatureLayer();
  addTemperatureLayer();
}

// =============== leaflet Wind Markers
let windLayer = undefined;

function getWindIcon(name, data) {
  const html =`
    <div>
      <div class="d-flex flex-column align-items-center" style="width: 80px; border-radius: 5%; font-size: small; background-color: ghostwhite; opacity:0.8">
        <div class="align-middle">
          <div style="background-color: white; border-radius: 50%; height: 24px; width: 24px; border-width: 1px; border-color: black; border-style: solid; margin-top: 5px;">
            <img src="images/wind.svg" style="height: 18px; width: 18px; margin: 2.5px;">
          </div>
        </div>
        <div class="align-middle" style="text-align: center">
          <b><u>${name?name:"Unnamed"}</u></b>
        </div>
        <div style="transform: rotate(${data.windDir?data.windDir+180:0}deg); margin-bottom: -3px;">
          <i class="bi ${data.windDir?"bi-arrow-up-circle":"bi-exclamation-octagon-fill text-danger"}" style="font-size: 1.25rem;"></i>
        </div>
        <div style="margin-bottom: 8px;">
          <table style="font-size: .76rem;">
            <tr>
              <td style="text-align: right;">Bearing:</td>
              <td>${data.windDir?data.windDir:"NaN "}&deg</td>
            </tr>
            <tr>
              <td style="text-align: right;">Speed:</td>
              <td>${data.windSpd?data.windSpd:"NaN "}kn</td>
            </tr>
          </table>
        </div>
      </div>
    </div>
  `;
  const iconSize = getDivIconSize(html);
  return L.divIcon({
      "className":"",
      "html":html,
      "iconSize" : iconSize,
      "iconAnchor" : [iconSize[0]*0.5, iconSize[1]*0.5]
    });
}

function getWindLayer() {
  let divWindLayer = new L.layerGroup();
  let data = {};

  for(let o of apiData.windDirection.data) {
    data[o.stationId] ??= {};
    data[o.stationId]["windDir"] = o.value;
  }

  for(let o of apiData.windSpeed.data) {
    data[o.stationId] ??= {};
    data[o.stationId]["windSpd"] = o.value;
  }

  for(let o of Object.keys(data)) {
    const station = apiData.stations.get(o);
    let name, location;
    if (!station) { name = ""; location = [0, 0]; }
    else { name = station.name; location = station.location; }
    data[o]["name"] = name;
    data[o]["location"] = location;
  }

  for(let o of Object.entries(data)) {
    const icon = getWindIcon(o[1].name, {"windDir": o[1].windDir, "windSpd": o[1].windSpd});
    L.marker(o[1].location, {"icon": icon}).addTo(divWindLayer);
  }

  return divWindLayer;
}

function addWindLayer() {
  windLayer = getWindLayer();
  map.addLayer(windLayer);
}

function removeWindLayer() {
  map.removeLayer(windLayer);
  windLayer = undefined;
}

function refreshWindLayer() {
  removeWindLayer();
  addWindLayer();
}

// =============== leaflet Rainfall Markers
let rainfallLayer = undefined;

function getRainfallIcon(name, data) {
  const html = `
    <div>
      <div class="d-flex flex-column align-items-center" style="width: 80px; border-radius: 5%; font-size: small; background-color: ghostwhite; opacity:0.8">
        <div class="align-middle">
          <div style="background-color: white; border-radius: 50%; height: 24px; width: 24px; border-width: 1px; border-color: black; border-style: solid; margin-top: 5px;">
            <img class="mapTownIcon" src="images/raindrop-drop.svg" style="height: 18px; width: 18px; margin: 0 0 0.5pt 1.5pt;">
          </div>
        </div>
        <div class="align-middle text-center">
          <b><u>${name}</u></b>
        </div>
        <div class="align-middle text-center">
          ${getRainfallCatergory(data.mmPer5min)}
        </div>
        <div class="align-middle text-center">
          Rainfall:
        </div>
        <div style="margin-bottom: 8px;">
          <table style="font-size: .76rem;">
            <tr>
              <td>${HELPER.sigFig(data.mmPer5min, 1)}</td>
              <td style="font-size: smaller; text-align:left; vertical-align:bottom;">mm/min</td>
            </tr>
          </table>
        </div>
      </div>
    </div>
  `;
  const iconSize = getDivIconSize(html);
  return L.divIcon({
      "className":"",
      "html":html,
      "iconSize" : iconSize,
      "iconAnchor" : [iconSize[0]*0.5, iconSize[1]*0.5]
    });
}

function getRainfallLayer() {
  let divRainfallLayer = new L.layerGroup();
  let data = {};

  for(let o of apiData.rainfall.data) {
    data[o.stationId] ??= {};
    data[o.stationId]["mmPer5min"] = o.value;
  }

  for(let o of Object.keys(data)) {
    const station = apiData.stations.get(o);
    let name, location;
    if (!station) { name = ""; location = [0, 0]; }
    else { name = station.name; location = station.location; }
    data[o]["name"] = name;
    data[o]["location"] = location;
  }

  for(let o of Object.entries(data)) {
    const icon = getRainfallIcon(o[1].name, {"mmPer5min": o[1].mmPer5min});
    L.marker(o[1].location, {"icon": icon}).addTo(divRainfallLayer);
  }

  return divRainfallLayer;
}

function addRainfallLayer() {
  rainfallLayer = getRainfallLayer();
  map.addLayer(rainfallLayer);
}

function removeRainfallLayer() {
  map.removeLayer(rainfallLayer);
  rainfallLayer = undefined;
}

function refreshRainfallLayer() {
  removeRainfallLayer();
  addRainfallLayer();
}

// =============== leaflet TESTING markers
document.addEventListener("apiDataReady", () => {
  // addTownLayer();
  // addTemperatureLayer();
  // addWindLayer();
  addRainfallLayer();
});

// if(RAIN_VIEWER_API.isReady) {
//   addRainviewerLayer();
// }

// ====== Open Data
// OPEN_DATA_API.updateApiDataAll(true);
//OPEN_DATA_API.updateApiDataFns.get("12H")();

// setTimeout(() => {
//   console.log(apiData);
// }, 3000);


