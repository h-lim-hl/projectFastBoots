let geolocationEnabled = false;

const state = {
  //region info
  psi: false,
  //town info
  temperature: false,
  wind : false,
  forecast2h: false,
  rainfall:false,
  //overlays
  rainviewer : false,
};

function updateMapDisplayLayers(){
  if(state.psi) addPsiLayer();
  else removePsiLayer();
  
  if(state.temperature) addTemperatureLayer();
  else removeTemperatureLayer();

  if(state.wind) addWindLayer();
  else removeWindLayer();

  if(state.forecast2h) {}
  else {}

  if(state.rainfall) addRainfallLayer();
  else removeRainfallLayer();

  if(state.rainviewer) {
    addRainviewerLayer();
    addRainviewerControl();
  } else {
    removeRainviewerControl();
    removeRainviewerLayer();
  }
};

const FORECAST_2D_BTN = document.querySelector("#forecast2h-btn");
FORECAST_2D_BTN.addEventListener("click", ()=>{});

const PSI_BTN = document.querySelector("#psi-btn");
PSI_BTN.addEventListener("click", ()=>{
  state.psi = true;
  state.rainfall = state.temperature = state.wind = state.forecast2h = false;
  updateMapDisplayLayers();
});

const RAINFALL_BTN = document.querySelector("#rainfall-btn");
RAINFALL_BTN.addEventListener("click", ()=>{
  state.rainfall = true;
  state.psi = state.temperature = state.wind = state.forecast2h = false;
  updateMapDisplayLayers();
});

const WIND_BTN = document.querySelector("#wind-btn");
WIND_BTN.addEventListener("click", ()=>{
  state.wind = true;
  state.psi = state.temperature = state.forecast2h = state.rainfall = false;
  updateMapDisplayLayers();
});

const TEMPERATURE_BTN = document.querySelector("#temperature-btn");
TEMPERATURE_BTN.addEventListener("click", ()=>{
  state.temperature = true;
  state.psi = state.wind = state.forecast2h = state.rainfall = false;
  updateMapDisplayLayers();
});

const RAINVIEWER_TOGGLE = document.querySelector("#rainviewer-toggle");
RAINVIEWER_TOGGLE.addEventListener("click", ()=>{
  if(RAINVIEWER_TOGGLE.checked) {
    state.rainviewer = true;
  }
  else {
    state.rainviewer = false;
  }
  updateMapDisplayLayers();
});

const RAINVIEWER_COLORS = {
"RAINVIEWER_COLOR_BW" : document.querySelector("#rainviewer-color-bw-radial"),
"RAINVIEWER_COLOR_ORI" : document.querySelector("#rainviewer-color-ori-radial"),
"RAINVIEWER_COLOR_UB" : document.querySelector("#rainviewer-color-ub-radial"),
"RAINVIEWER_COLOR_TT" : document.querySelector("#rainviewer-color-tt-radial"),
"RAINVIEWER_COLOR_WC" : document.querySelector("#rainviewer-color-wc-radial"),
"RAINVIEWER_COLOR_MR" : document.querySelector("#rainviewer-color-mr-radial"),
"RAINVIEWER_COLOR_NR" : document.querySelector("#rainviewer-color-nr-radial"),
"RAINVIEWER_COLOR_RS" : document.querySelector("#rainviewer-color-rs-radial"),
"RAINVIEWER_COLOR_DS" : document.querySelector("#rainviewer-color-ds-radial")
};
Object.freeze(RAINVIEWER_COLORS);

RAINVIEWER_COLORS.RAINVIEWER_COLOR_BW.addEventListener("click", ()=>{
  rainviewerOptions.color = 0;
  if(state.rainviewer) refreshRainviewerLayer(true);
});
RAINVIEWER_COLORS.RAINVIEWER_COLOR_ORI.addEventListener("click", ()=>{
  rainviewerOptions.color = 1;
  if(state.rainviewer) refreshRainviewerLayer(true);
});
RAINVIEWER_COLORS.RAINVIEWER_COLOR_UB.addEventListener("click", ()=>{
  rainviewerOptions.color = 2;
  if(state.rainviewer) refreshRainviewerLayer(true);
});
RAINVIEWER_COLORS.RAINVIEWER_COLOR_TT.addEventListener("click", ()=>{
  rainviewerOptions.color = 3;
  if(state.rainviewer) refreshRainviewerLayer(true);
});
RAINVIEWER_COLORS.RAINVIEWER_COLOR_WC.addEventListener("click", ()=>{
  rainviewerOptions.color = 4;
  if(state.rainviewer) refreshRainviewerLayer(true);
});
RAINVIEWER_COLORS.RAINVIEWER_COLOR_MR.addEventListener("click", ()=>{
  rainviewerOptions.color = 5;
  if(state.rainviewer) refreshRainviewerLayer(true);
});
RAINVIEWER_COLORS.RAINVIEWER_COLOR_NR.addEventListener("click", ()=>{
  rainviewerOptions.color = 6;
  if(state.rainviewer) refreshRainviewerLayer(true);
});
RAINVIEWER_COLORS.RAINVIEWER_COLOR_RS.addEventListener("click", ()=>{
  rainviewerOptions.color = 7;
  if(state.rainviewer) refreshRainviewerLayer(true);
});
RAINVIEWER_COLORS.RAINVIEWER_COLOR_DS.addEventListener("click", ()=>{
  rainviewerOptions.color = 8;
  if(state.rainviewer) refreshRainviewerLayer(true);
});


document.addEventListener("DOMContentLoaded", () =>{
  OPEN_DATA_API.startAllUpdateIntervals();
});

document.addEventListener("rainviewerApiUpdated", () => {
  if(state.rainviewer) refreshRainviewerLayer();
});

document.addEventListener("relativeHumidityUpdated", ()=> {
  if(state.temperature) refreshTemperatureLayer();
});

document.addEventListener("airTemperatureUpdated", ()=> {
  if(state.temperature) refreshTemperatureLayer();
});

document.addEventListener("windSpeedUpdated", ()=>{
  if(state.wind) refreshWindLayer();
});

document.addEventListener("windDirectionUpdated", ()=>{
  if(state.wind) refreshWindLayer();
});

document.addEventListener("rainfallUpdated", ()=>{
  if(state.rainfall) refreshRainfallLayer();
});

document.addEventListener("psiUpdated", ()=>{
  if(state.psi) refreshPsiLayer();
});

const popoverTriggerList = document.querySelectorAll('[data-bs-toggle="popover"]');
const popoverList = [...popoverTriggerList].map(popoverTriggerEl => new bootstrap.Popover(popoverTriggerEl));

// https://developer.mozilla.org/en-US/docs/Web/API/Geolocation_API/Using_the_Geolocation_API
if("geolocation" in navigator) {
  geolocationEnabled = true;
  console.log(`"geolocation" in navigator`);
} else {
  console.log(`!"geolocation" in navigator`);
}
/*
function geolocationErrorCatcher(error) {
  switch(error.code) {
    case error.PERMISSION_DENIED:
      x.innerHTML = "User denied the request for Geolocation."
      break;
    case error.POSITION_UNAVAILABLE:
      x.innerHTML = "Location information is unavailable."
      break;
    case error.TIMEOUT:
      x.innerHTML = "The request to get user location timed out."
      break;
    case error.UNKNOWN_ERROR:
      x.innerHTML = "An unknown error occurred."
      break;
  }
} 

const x = document.getElementById("demo");

function getLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(showPosition);
  } else {
    x.innerHTML = "Geolocation is not supported by this browser.";
  }
}

function showPosition(position) {
  x.innerHTML = "Latitude: " + position.coords.latitude +
  "<br>Longitude: " + position.coords.longitude;
}

const x = document.getElementById("demo");

function getLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.watchPosition(showPosition);
  } else {
    x.innerHTML = "Geolocation is not supported by this browser.";
  }
}
function showPosition(position) {
  x.innerHTML = "Latitude: " + position.coords.latitude +
  "<br>Longitude: " + position.coords.longitude;
}
*/