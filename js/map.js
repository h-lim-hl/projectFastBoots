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
  return c[0] + c[1]*deg, +  c[2]*rh +
  c[3]*deg*rh + c[4]*deg*deg + c[5]*rh*rh +
  c[6]*deg*deg*rh + c[7]*deg*rh*rh + c[8]*deg*deg*rh*rh;
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
let rainviewerColorScheme = Object.values(colorSchemeToCssClass)[1];

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
    getRainlayer(), {"opacity" : rainviewerOptions.opacity});
  
  rainviewerControl = L.control({position : 'topleft'});
  rainviewerControl.onAdd = () => {
    let legend = L.DomUtil.create('div');
    legend.innerHTML += getRainviewerLegend(rainviewerColorScheme);
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

// ===============
function testGetDivIcon () {
  return L.divIcon({
    "className" : ``,
    "html": `
          <div class="container">
              <div class="align-content-center text-center" style="height: 50px; width: 50px; border-radius: 50%; background-color: lightseagreen;">&#8593;</div>
          </div>
          `,
    "iconSize": [30,30]
  });
}

function testAddDivIconMarkers () {
  let divIconTestGrp = L.layerGroup();
  const icon = testGetDivIcon();
  for(let o of apiData.neighbourhoods) {
    L.marker(o[1].location, {"icon": icon}).addTo(divIconTestGrp);
  }
  return divIconTestGrp;
}

function getTownMarker (name, pxWidth) {
  const cardBgColor = "ghostwhite";
  const iconBgColor = "white";
  return L.divIcon({
    "className" : "",
    "html" : `
      <div>
        <div class="d-flex flex-column align-items-center" style="width: ${pxWidth}px; border-radius: 5%; font-size: small; background-color: ${cardBgColor}; opacity: 0.8;">
          <div class="align-middle">
            <div style="background-color: ${iconBgColor}; border-radius: 50%; height: 24px; width: 24px; border-width: 1px; border-color: maroon; border-style: solid; margin-top: 5px;">
              <img src="images/skyscrapper-edifice.svg" style="height: 18px; width: 18px; margin-left: 2px; margin-top: -2.5px;">
            </div>
          </div>
          <div class="align-middle" style="margin-bottom: 3px; text-align: center">
            <b><u>${name}</u></b>
          </div>
        </div>
      </div>
    `,
  });
}

function getTownLayer() {
  let divTownGrp = new L.MarkerClusterGroup({
    "iconCreateFunction" : (cluster) => {
      return getTownMarker(cluster.getChildCount(), 30);
    }
  });
  for(let o of apiData.neighbourhoods.entries()) {
    const icon = getTownMarker(o[0], 80)
    L.marker(o[1].location, {"icon": icon}).addTo(divTownGrp);
  }
  return divTownGrp;
}

function getInfomationMaker(imgUrl, title, data, pxMarginLeft, pxMarginTop) {
  let dataHtml;
  for(let e of Object.entries(data)) {
    dataHtml += `<tr><td>${e[0]}:</td><td>${e[1]}</td></tr>`;
  }
  return L.divIcon({
    "className" : "",
    "html" : `
      <div>
        <div class="d-flex flex-column align-items-center" style="width: 80px; border-radius: 5%; font-size: small; background-color: ghostwhite;">
          <div class="align-middle">
            <div style="background-color: white; border-radius: 50%; height: 32px; width: 32px; border-width: 1px; border-color: maroon; border-style: solid; margin-top: 5px;">
              <img src="${imgUrl}" style="height: 26px; width: 26px; margin-left: ${pxMarginLeft}px; margin-top: ${pxMarginTop}px;">
            </div>
          </div>
          <div class="align-middle" style="text-align: center">
            <b><u>${title}</u></b>
          </div>
          <div style="margin-bottom: 8px;">
            <tb>
              ${dataHtml}
            </tb>
          </div>
        </div>
      </div>
    `,
  });
}

// function

document.addEventListener("apiDataReady", () => {
  getTownLayer().addTo(map);
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


