/*
  https://www.rainviewer.com/weather-radar-map-live.html
  https://www.rainviewer.com/api.html
*/

let rainviewerApiObj = undefined;
let rainviewerError = undefined;

const rainviewerApiUpdated = new CustomEvent(`rainviewerApiUpdated`);
const rainviewerApiError = new CustomEvent(`RainviewerApiError`);

const RAIN_VIEWER_API = {
  "apiJson": `https://api.rainviewer.com/public/weather-maps.json`,
  "highRes": 512,
  "lowRes": 256,
  "isReady" : () => { return rainviewerApiObj === undefined ? false : true; },
  "getDate" : (timestamp) => { return new Date(timestamp * 1000); }
}; Object.freeze(RAIN_VIEWER_API);

const rainviewerOptions = {
  "color" : 1,
  "opacity" : 0.4
};

function getRainlayerUrl() { 
  return `${rainviewerApiObj.host}` + 
         `${rainviewerApiObj.radar.nowcast[0].path}/` +
         `${RAIN_VIEWER_API.highRes}/{z}/{x}/{y}/` + 
         `${rainviewerOptions.color}/1_0.png`;
}

// updates every 10mins
async function getRainViewerApiConfig() {
  await axios.get(RAIN_VIEWER_API.apiJson)
    .then((response) => {
      //console.log(`getRainViewerApiConfig(): Success`);
      //console.log(response.data);
      rainviewerApiObj = response.data;
      
      //console.log("rainviewerReady");
      document.dispatchEvent(rainviewerApiUpdated);
    })
    .catch((err) => {
      console.error(`getRainViewerApiConfig(): ${err}`);
      rainviewerError = err;
    });
}

const colorSchemeToCssClass = {
  "blackAndWhite"     : "rainviewerBw",
  "original"          : "rainviewerOr",
  "univeralBlue"      : "rainviewerUb",
  "titan"             : "rainviewerTt",
  "theWeatherChannel" : "rainviewerWc",
  "meteored"          : "rainviewerMt",
  "nexradL3"          : "rainviewerNr",
  "rainbowSelex"      : "rainviewerRs",
  "darkSky"           : "rainviewerDs"
}; Object.freeze(colorSchemeToCssClass);

function getRainviewerLegend(colorScheme) {
  return `
  <div>
    <div class="row" style="height: 100%;">
      <div class="align-content-center"
        style="margin-left: 10px; background-color: rgb(240, 240, 240); width: 32px; border-radius: 8px 0 0 8px; border-style: solid hidden solid solid; border-color: rgba(0, 0, 0, 0.2); border-width: 2px; background-clip: padding-box;">
        <div class="${colorScheme}"
          style="height: 90%; border-radius: 16px; border-color: grey; border-width: 1px; border-style:groove">
        </div>
      </div>
            <div style="background: rgb(255,255,255); width:100px; border-radius: 0px 8px 8px 0; border-style: solid solid solid hidden; border-color: rgba(0, 0, 0, 0.2); border-width: 2px; background-clip: padding-box;">
        <div class="pt-1 d-flex flex-column justify-content-between">
          <p class="rainviewer-legend-txt pt-1">Overcast</p>
          <p class="rainviewer-legend-txt">Dizzle</p>
          <p class="rainviewer-legend-txt">Light rain</p>
          <p class="rainviewer-legend-txt">Rain</p>
          <p class="rainviewer-legend-txt">Shower</p>
          <p class="rainviewer-legend-txt">Storm</p>
        </div>
      </div>
    </div>
  </div>
  `;
}



getRainViewerApiConfig();

