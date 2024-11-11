const SINGAPORE_LATLONG = [1.3521, 103.8198];

const ONE_MAP_SG = 0x01;
const OPEN_STREET_MAP = 0x02;

const MAP_MIN_ZOOM = 10;
const MAP_MAX_ZOOM = 20;

let map = L.map('map',
  {
    "minZoom": MAP_MIN_ZOOM + 1,
    "maxZoom": MAP_MAX_ZOOM - 1,
    "zoomControl": false
  }).setView(SINGAPORE_LATLONG, 13);

const BASE_MAPS = {
  "OpenStreetMap": L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    {
      detectRetina: true,
      maxZoom: MAP_MAX_ZOOM,
      minZoom: MAP_MIN_ZOOM,
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }),
  "OpenStreetMap.HOT": L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png',
    {
      detectRetina: true,
      maxZoom: MAP_MAX_ZOOM,
      minZoom: MAP_MIN_ZOOM,
      attribution: '© OpenStreetMap contributors, Tiles style by Humanitarian OpenStreetMap Team hosted by OpenStreetMap France'
    }),
  "OneMapSG": L.tileLayer('https://www.onemap.gov.sg/maps/tiles/Default_HD/{z}/{x}/{y}.png',
    {
      detectRetina: true,
      maxZoom: MAP_MAX_ZOOM,
      minZoom: MAP_MIN_ZOOM,
      /** DO NOT REMOVE the OneMap attribution below **/
      attribution: '<img src="https://www.onemap.gov.sg/web-assets/images/logo/om_logo.png" style="height:20px;width:20px;"/>&nbsp;<a href="https://www.onemap.gov.sg/" target="_blank" rel="noopener noreferrer">OneMap</a>&nbsp;&copy;&nbsp;contributors&nbsp;&#124;&nbsp;<a href="https://www.sla.gov.sg/" target="_blank" rel="noopener noreferrer">Singapore Land Authority</a>'
    })
};

// Set Default Baselayer
BASE_MAPS.OpenStreetMap.addTo(map);

// Add baselayer control
let layerControl = L.control.layers(BASE_MAPS, {}).addTo(map);
layerControl.getContainer().style.zIndex = 2000;

// Map Scale
let mapScale = undefined;
function addScale(maxWidth, isMetric) {
  mapScale = L.control.scale({
    "maxWidth": maxWidth, "metric": isMetric, "imperial": !isMetric,
    "position": "bottomright"
  });
  mapScale.addTo(map);
}

function removeScale() {
  if (mapScale == undefined) return;
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
  if (rainviewerLayer === undefined) return;
  map.removeLayer(rainviewerLayer);
  rainviewerLayer = undefined;
}

function addRainviewerLayer() {
  if (rainviewerApiObj === undefined) {
    console.error(`rainviewerApiObj is undefined!`);
    return;
  }

  rainviewerLayer = L.tileLayer(
    getRainlayerUrl(), {
    "opacity": rainviewerOptions.opacity,
    "zIndex": 20
  });

  map.addLayer(rainviewerLayer);
}

function addRainviewerControl() {
  if (rainviewerControl) return;
  rainviewerControl = L.control({ position: 'topleft' });
  rainviewerControl.onAdd = () => {
    let legend = L.DomUtil.create('div');
    legend.innerHTML += getRainviewerLegend(Object.values(colorSchemeToCssClass)[rainviewerOptions.color]);
    return legend;
  };
  rainviewerControl.addTo(map);
}

function removeRainviewerControl() {
  if (rainviewerControl) {
    map.removeControl(rainviewerControl);
    rainviewerControl = undefined;
  }
}

function refreshRainviewerLayer(refreshControl = false) {
  if (refreshControl) {
    removeRainviewerControl();
    addRainviewerControl();
  }
  removeRainviewerLayer();
  addRainviewerLayer();
}



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

function getTownMarker(name) {
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
          <b><u>${name ? name : "Unnamed"}</u></b>
        </div>
      </div>
    </div>
  `;
  const iconSize = getDivIconSize(html);
  return L.divIcon({
    "className": "",
    "html": html,
    "iconSize": iconSize,
    "iconAnchor": [iconSize[0] * 0.5, iconSize[1] * 0.5]
  });
}

function getTownLayer() {
  let divTownGrp = new L.MarkerClusterGroup({
    "iconCreateFunction": (cluster) => {
      console.log(cluster);
      return getTownMarker(cluster.getChildCount(), 30);
    }
  });

  for (let o of apiData.neighbourhoods.entries()) {
    const icon = getTownMarker(o[0])
    L.marker(o[1].location, { "icon": icon }).addTo(divTownGrp);
  }
  return divTownGrp;
}

function addTownLayer() {
  townLayer = getTownLayer();
  map.addLayer(townLayer);
}

function removeTownLayer() {
  if (townLayer) {
    map.removeLayer(townLayer);
    townLayer = undefined;
  }
}

function refreshTownLayer() {
  removeTownLayer();
  addTownLayer();
}

// =============== leaflet Temperature Markers
let temperatureLayer = undefined;

// https://en.wikipedia.org/wiki/Heat_index#Formula
function getHeatIndex(deg, rh, isFahrenheit = false) {
  let c;
  if (isFahrenheit) {
    c = [-42.379, 2.04901523, 10.14344127,
    -0.22475541, -6.83783e-3, -5.481717e-2,
      1.22874e-3, 8.5282e-4, -1.99e-6
    ];
  } else {
    c = [-8.78469475556, 1.61139411, 2.33854883889,
    -0.14611605, -0.012308094, -0.0164248277778,
      2.221732e-3, 7.2546e-4, -3.582e-6
    ];
  }
  let ret = c[0] + c[1] * deg + c[2] * rh +
    c[3] * deg * rh + c[4] * deg * deg + c[5] * rh * rh +
    c[6] * deg * deg * rh + c[7] * deg * rh * rh + c[8] * deg * deg * rh * rh;
  return ret;
}

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
        <b><u>${name ? name : "Unnamed"}</u></b>
      </div>
      <div class="align-middle" style="margin-bottom: 8px;">
        <table>
          <tr>
            <td style="text-align: right;">Temp:</td>
            <td>${data.temp ? data.temp : "NaN "}&degc</td>
          </tr>
          <tr>
            <td style="text-align: right;">RH:</td>
            <td>${data.rh ? data.rh : "NaN "}%</td>
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
    "className": "",
    "html": `${html}`,
    "iconSize": iconSize,
    "iconAnchor": [iconSize[0] * 0.5, iconSize[1] * 0.5]
  });
}

function getTemperatureLayer() {
  let divTemperatureLayer = new L.layerGroup();
  let data = {};

  for (let o of apiData.airTemp.data) {
    data[o.stationId] ??= {};
    data[o.stationId]["temp"] = o.value;
  }
  for (let o of apiData.relativeHumidity.data) {
    data[o.stationId] ??= {};
    data[o.stationId]["rh"] = o.value;
  }
  for (let o of Object.keys(data)) {
    const station = apiData.stations.get(o);
    let name, location;
    if (!station) { name = ""; location = [0, 0]; }
    else { name = station.name; location = station.location; }
    data[o]["name"] = name;
    data[o]["location"] = location;
  }

  for (let o of Object.entries(data)) {
    const icon = getTemperatureMarker(o[1].name, { "temp": o[1].temp, "rh": o[1].rh })
    L.marker(o[1].location, { "icon": icon }).addTo(divTemperatureLayer);
  }

  return divTemperatureLayer;
}

function addTemperatureLayer() {
  if (temperatureLayer) return;
  temperatureLayer = getTemperatureLayer();
  map.addLayer(temperatureLayer);
}

function removeTemperatureLayer() {
  if (temperatureLayer) {
    map.removeLayer(temperatureLayer);
    temperatureLayer = undefined;
  }
}

function refreshTemperatureLayer() {
  removeTemperatureLayer();
  addTemperatureLayer();
}

// =============== leaflet Wind Markers
let windLayer = undefined;

function getWindIcon(name, data) {
  const html = `
    <div>
      <div class="d-flex flex-column align-items-center" style="width: 80px; border-radius: 5%; font-size: small; background-color: ghostwhite; opacity:0.8">
        <div class="align-middle">
          <div style="background-color: white; border-radius: 50%; height: 24px; width: 24px; border-width: 1px; border-color: black; border-style: solid; margin-top: 5px;">
            <img src="images/wind.svg" style="height: 18px; width: 18px; margin: 2.5px;">
          </div>
        </div>
        <div class="align-middle" style="text-align: center">
          <b><u>${name ? name : "Unnamed"}</u></b>
        </div>
        <div style="transform: rotate(${data.windDir ? data.windDir + 180 : 0}deg); margin-bottom: -3px;">
          <i class="bi ${data.windDir ? "bi-arrow-up-circle" : "bi-exclamation-octagon-fill text-danger"}" style="font-size: 1.25rem;"></i>
        </div>
        <div style="margin-bottom: 8px;">
          <table style="font-size: .76rem;">
            <tr>
              <td style="text-align: right;">Bearing:</td>
              <td>${data.windDir ? data.windDir : "- "}&deg</td>
            </tr>
            <tr>
              <td style="text-align: right;">Speed:</td>
              <td>${data.windSpd ? data.windSpd : "- "}kn</td>
            </tr>
          </table>
        </div>
      </div>
    </div>
  `;
  const iconSize = getDivIconSize(html);
  return L.divIcon({
    "className": "",
    "html": html,
    "iconSize": iconSize,
    "iconAnchor": [iconSize[0] * 0.5, iconSize[1] * 0.5]
  });
}

function getWindLayer() {
  let divWindLayer = new L.layerGroup();
  let data = {};

  for (let o of apiData.windDirection.data) {
    data[o.stationId] ??= {};
    data[o.stationId]["windDir"] = o.value;
  }

  for (let o of apiData.windSpeed.data) {
    data[o.stationId] ??= {};
    data[o.stationId]["windSpd"] = o.value;
  }

  for (let o of Object.keys(data)) {
    const station = apiData.stations.get(o);
    let name, location;
    if (!station) { name = ""; location = [0, 0]; }
    else { name = station.name; location = station.location; }
    data[o]["name"] = name;
    data[o]["location"] = location;
  }

  for (let o of Object.entries(data)) {
    const icon = getWindIcon(o[1].name, { "windDir": o[1].windDir, "windSpd": o[1].windSpd });
    L.marker(o[1].location, { "icon": icon }).addTo(divWindLayer);
  }

  return divWindLayer;
}

function addWindLayer() {
  if (windLayer) return;
  windLayer = getWindLayer();
  map.addLayer(windLayer);
}

function removeWindLayer() {
  if (windLayer) {
    map.removeLayer(windLayer);
    windLayer = undefined;
  }
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
    "className": "",
    "html": html,
    "iconSize": iconSize,
    "iconAnchor": [iconSize[0] * 0.5, iconSize[1] * 0.5]
  });
}

function getRainfallLayer() {
  let divRainfallLayer = new L.markerClusterGroup({
    "iconCreateFunction": function (cluster) {
      let totalMmPer5min = 0;

      cluster.getAllChildMarkers().forEach((marker) => {
        totalMmPer5min += marker.value;
      });

      const html = `
          <div>
            <div class="d-flex flex-column align-items-center" style="width: 80px; border-radius: 5%; font-size: small; background-color: ghostwhite; opacity:0.8">
              <div class="align-middle">
                <div style="background-color: white; border-radius: 50%; height: 24px; width: 24px; border-width: 1px; border-color: black; border-style: solid; margin-top: 5px;">
                  <img class="mapTownIcon" src="images/raindrop-drop.svg" style="height: 18px; width: 18px; margin: 0 0 0.5pt 1.5pt;">
                </div>
              </div>
              <div class="align-middle text-center">
                <b><u>*${cluster.getChildCount()}*</u></b>
              </div>
              <div class="align-middle text-center">
                ${getRainfallCatergory(totalMmPer5min / cluster.getChildCount())}
              </div>
              <div class="align-middle text-center">
                Rainfall:
              </div>
              <div style="margin-bottom: 8px;">
                <table style="font-size: .76rem;">
                  <tr>
                    <td>${HELPER.sigFig(totalMmPer5min / cluster.getChildCount(), 1)}</td>
                    <td style="font-size: smaller; text-align:left; vertical-align:bottom;">mm/min</td>
                  </tr>
                </table>
              </div>
            </div>
          </div>
        `;

      const iconSize = getDivIconSize(html);
      return L.divIcon({
        "className": "",
        "html": html,
        "iconSize": iconSize,
        "iconAnchor": [iconSize[0] * 0.5, iconSize[1] * 0.5]
      });
    },

    maxClusterRadius: 90
  });

  let data = {};

  for (let o of apiData.rainfall.data) {
    data[o.stationId] ??= {};
    data[o.stationId]["mmPer5min"] = o.value;
  }

  for (let o of Object.keys(data)) {
    const station = apiData.stations.get(o);
    let name, location;
    if (!station) { name = ""; location = [0, 0]; }
    else { name = station.name; location = station.location; }
    data[o]["name"] = name;
    data[o]["location"] = location;
  }

  for (let o of Object.entries(data)) {
    const icon = getRainfallIcon(o[1].name, { "mmPer5min": o[1].mmPer5min });
    let marker = L.marker(o[1].location, { "icon": icon });
    marker.value = o[1].mmPer5min;
    marker.addTo(divRainfallLayer);
  }

  return divRainfallLayer;
}

function addRainfallLayer() {
  if (rainfallLayer) return;
  rainfallLayer = getRainfallLayer();
  map.addLayer(rainfallLayer);
}

function removeRainfallLayer() {
  if (rainfallLayer) {
    map.removeLayer(rainfallLayer);
    rainfallLayer = undefined;
  }
}

function refreshRainfallLayer() {
  removeRainfallLayer();
  addRainfallLayer();
}

// =============== leaflet PSI Markers
let psiLayer = undefined;

function getPsiDivIcon(name, data) {
  const html = `
    <div>
      <div class="d-flex flex-column align-items-center" style="width: 90px; border-radius: 6%; font-size: large; background-color: ghostwhite; opacity:0.8">
        <div class="align-middle">
          <div style="background-color: white; border-radius: 50%; height: 2.25rem; width: 2.25rem; border-width: 1px; border-color: maroon; border-style: solid; margin-top: 5px;">
            <div style="display: flex; justify-content: center; align-items: center;">
              <img src="images/pollution-chimney.svg" style="height: 1.5rem; width: 1.5rem; margin-top: .4rem;">
              <i class="bi bi-buildings-fill d-none" style="font-size: 1.5rem; color: #B3404A; margin-top: -1.9pt;"></i>
            </div>
          </div>
        </div>
        <div class="align-middle text-center">
          <b><u>${HELPER.capFirstChar(name)}</u></b>
        </div>
        <div style="margin-bottom: 8px;">
          <table style="font-size: .76rem;">
            <tr style="vertical-align: middle; font-size:0.85rem">
              <td style="text-align: right;"><b>PSI:</b></td>
              <td><span style="vertical-align: 5%;">${data.psi} </span><i class="bi bi-exclamation-circle-fill psi-warn-icon-setting psi-elevated-color ${data.psiLvl === 1 ? "" : "d-none"}" title="Elevated"></i><i class="bi bi-exclamation-octagon-fill psi-warn-icon-setting psi-unhealthy-color ${data.psiLvl === 2 ? "" : "d-none"}" title="Unhealthy for Sensitive Groups"></i><i class="bi bi-exclamation-diamond-fill psi-warn-icon-setting psi-unhealthy2-color  ${data.psiLvl === 3 ? "" : "d-none"}" title="Unhealthy"></i><i class="bi bi-exclamation-triangle-fill psi-warn-icon-setting psi-hazardous-color ${data.psiLvl === 4 ? "" : "d-none"}" title="Hazardous"></td>
              <td></td>
              </tr>
            <tr>
              <td style="text-align: right;">O<sub>3</sub>:</td>
              <td><span style="vertical-align: 0%;">${data.o3} </span><i class="bi bi-exclamation-circle-fill psi-warn-icon-setting psi-elevated-color ${data.o3Lvl === 1 ? "" : "d-none"}" title="Elevated"></i><i class="bi bi-exclamation-octagon-fill psi-warn-icon-setting psi-unhealthy-color ${data.o3Lvl === 2 ? "" : "d-none"}" title="Unhealthy for Sensitive Groups"></i><i class="bi bi-exclamation-diamond-fill psi-warn-icon-setting psi-unhealthy2-color  ${data.o3Lvl === 3 ? "" : "d-none"}" title="Unhealthy"></i><i class="bi bi-exclamation-triangle-fill psi-warn-icon-setting psi-hazardous-color ${data.o3Lvl === 4 ? "" : "d-none"}" title="Hazardous"></td>
            </tr>
            <tr>
              <td style="text-align: right;">PM10:</td>
              <td><span style="vertical-align: 5%;">${data.pm10} </span><i class="bi bi-exclamation-circle-fill psi-warn-icon-setting psi-elevated-color ${data.pm10Lvl === 1 ? "" : "d-none"}" title="Elevated"></i><i class="bi bi-exclamation-octagon-fill psi-warn-icon-setting psi-unhealthy-color ${data.pm10Lvl === 2 ? "" : "d-none"}" title="Unhealthy for Sensitive Groups"></i><i class="bi bi-exclamation-diamond-fill psi-warn-icon-setting psi-unhealthy2-color  ${data.pm10Lvl === 3 ? "" : "d-none"}" title="Unhealthy"></i><i class="bi bi-exclamation-triangle-fill psi-warn-icon-setting psi-hazardous-color ${data.pm10Lvl === 4 ? "" : "d-none"}" title="Hazardous"></td>
            </tr>
            <tr>
              <td style="text-align: right;">PM2.5:</td>
              <td><span style="vertical-align: 5%;">${data.pm25} </span><i class="bi bi-exclamation-circle-fill psi-warn-icon-setting psi-elevated-color ${data.psiLvl === 1 ? "" : "d-none"}" title="Elevated"></i><i class="bi bi-exclamation-octagon-fill psi-warn-icon-setting psi-unhealthy-color ${data.pm25Lvl === 2 ? "" : "d-none"}" title="Unhealthy for Sensitive Groups"></i><i class="bi bi-exclamation-diamond-fill psi-warn-icon-setting psi-unhealthy2-color ${data.pm25Lvl === 3 ? "" : "d-none"}" title="Unhealthy"></i><i class="bi bi-exclamation-triangle-fill psi-warn-icon-setting psi-hazardous-color ${data.pm25Lvl === 4 ? "" : "d-none"}" title="Hazardous"></td>
            </tr>
            <tr>
              <td style="text-align: right;">SO<sub>2</sub>:</td>
              <td><span style="vertical-align: 5%;">${data.so2} </span><i class="bi bi-exclamation-circle-fill psi-warn-icon-setting psi-elevated-color ${data.so2Lvl === 1 ? "" : "d-none"}" title="Elevated"></i><i class="bi bi-exclamation-octagon-fill psi-warn-icon-setting psi-unhealthy-color ${data.so2Lvl === 2 ? "" : "d-none"}" title="Unhealthy for Sensitive Groups"></i><i class="bi bi-exclamation-diamond-fill psi-warn-icon-setting psi-unhealthy2-color  ${data.so2Lvl === 3 ? "" : "d-none"}" title="Unhealthy"></i><i class="bi bi-exclamation-triangle-fill psi-warn-icon-setting psi-hazardous-color ${data.so2Lvl === 4 ? "" : "d-none"}" title="Hazardous"></td>
            </tr>
            <tr>
              <td style="text-align: right;">CO:</td>
              <td><span style="vertical-align: 5%;">${data.co} </span><i class="bi bi-exclamation-circle-fill psi-warn-icon-setting psi-elevated-color ${data.coLvl === 1 ? "" : "d-none"}" title="Elevated"></i><i class="bi bi-exclamation-octagon-fill psi-warn-icon-setting psi-unhealthy-color ${data.coLvl === 2 ? "" : "d-none"}" title="Unhealthy for Sensitive Groups"></i><i class="bi bi-exclamation-diamond-fill psi-warn-icon-setting psi-unhealthy2-color ${data.coLvl === 3 ? "" : "d-none"}" title="Unhealthy"></i><i class="bi bi-exclamation-triangle-fill psi-warn-icon-setting psi-hazardous-color ${data.coLvl === 4 ? "" : "d-none"}" title="Hazardous"></td>
            </tr>
          </table>
        </div>
      </div>
    </div>
  `;

  const iconSize = getDivIconSize(html);
  return L.divIcon({
    "className": "",
    "html": html,
    "iconSize": iconSize,
    "iconAnchor": [iconSize[0] * 0.5, iconSize[1] * 0.5]
  });
}

function getPsiLayer() {
  let divPsiLayer = new L.layerGroup();
  let data = {};

  for (let k of apiData.regions.keys()) {
    data[`${k}`] = {};
    data[`${k}`]["psi"] = apiData.psi.data.psi_twenty_four_hourly[`${k}`];
    data[`${k}`]["psiLvl"] = getSubindexDangerLvl(Number(data[`${k}`].psi));

    data[`${k}`]["co"] = apiData.psi.data.co_sub_index[`${k}`];
    data[`${k}`]["coLvl"] = getSubindexDangerLvl(Number(data[`${k}`].co));

    data[`${k}`]["o3"] = apiData.psi.data.o3_sub_index[`${k}`];
    data[`${k}`]["o3Lvl"] = getSubindexDangerLvl(Number(data[`${k}`].o3));

    data[`${k}`]["pm10"] = apiData.psi.data.pm10_sub_index[`${k}`];
    data[`${k}`]["pm10Lvl"] = getSubindexDangerLvl(Number(data[`${k}`].pm10));

    data[`${k}`]["pm25"] = apiData.psi.data.pm25_sub_index[`${k}`];
    data[`${k}`]["pm25Lvl"] = getSubindexDangerLvl(Number(data[`${k}`].pm25));

    data[`${k}`]["so2"] = apiData.psi.data.so2_sub_index[`${k}`];
    data[`${k}`]["so2Lvl"] = getSubindexDangerLvl(Number(data[`${k}`].so2));
  }

  for (let o of Object.entries(data)) {
    console.log(o[1]);
    const icon = getPsiDivIcon(o[0], o[1]);
    L.marker(apiData.regions.get(o[0]).location, { "icon": icon }).addTo(divPsiLayer);
  }

  return divPsiLayer;
}

function addPsiLayer() {
  if (psiLayer) return;
  psiLayer = getPsiLayer();
  psiLayer.addTo(map);
}

function removePsiLayer() {
  if (psiLayer) {
    map.removeLayer(psiLayer);
    psiLayer = undefined;
  }
}

function refreshPsiLayer() {
  removePsiLayer();
  addPsiLayer();
}
// leaflet UVI control
let uviControl = undefined;

function uviToDangerLvl(uvi) {
  if(uvi <=2) return 0;
  if(uvi <=5) return 1;
  if(uvi <=7) return 2;
  if(uvi <=10) return 3;
  return 4;
}

// =============== leaflet TESTING markers
document.addEventListener("apiDataReady", () => {
  // addTownLayer();
  // addTemperatureLayer();
  // addWindLayer();
    addRainfallLayer();
  // addPsiLayer();
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


