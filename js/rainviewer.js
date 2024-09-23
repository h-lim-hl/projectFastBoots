/*
  https://www.rainviewer.com/weather-radar-map-live.html
  https://www.rainviewer.com/api.html
*/

let rainviewerApiObj = undefined;
let rainviewerError = undefined;

const RAIN_VIEWER_API = {
  "apiJson": `https://api.rainviewer.com/public/weather-maps.json`,
  "highRes": 512,
  "lowRes": 256,
  "isReady" : () => { return rainviewerApiObj === undefined ? false : true; },
  "getDate" : (timestamp) => { return new Date(timestamp * 1000); }
}; Object.freeze(RAIN_VIEWER_API);

// updates every 10mins
async function getRainViewerApiConfig() {
  axios.get(RAIN_VIEWER_API.apiJson)
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

const rainviewerApiUpdated = new CustomEvent(`rainviewerApiUpdated`);
const rainviewerApiError = new CustomEvent(`RainviewerApiError`);

getRainViewerApiConfig();

