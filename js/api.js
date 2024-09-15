const OPEN_DATA_API = {
  "url": {
    "RTD_24H_Forecast":
      `https://api-open.data.gov.sg/v2/real-time/api/twenty-four-hr-forecast`,

    "RT1_RH":
      `https://api-open.data.gov.sg/v2/real-time/api/relative-humidity`,
    "RT1_AIR_TEMP":
      `https://api-open.data.gov.sg/v2/real-time/api/air-temperature`,
    "RT1_WIND_SPD":
      `https://api-open.data.gov.sg/v2/real-time/api/wind-speed`,
    "RT1_WIND_DIR":
      `https://api-open.data.gov.sg/v2/real-time/api/wind-direction`,

    "RT5_RAINFALL": `https://api-open.data.gov.sg/v2/real-time/api/rainfall`,

    "RT60_UVI": `https://api-open.data.gov.sg/v2/real-time/api/uv`,
    "RT60_PSI": `https://api-open.data.gov.sg/v2/real-time/api/psi`,
    "RT60_PM25": `https://api-open.data.gov.sg/v2/real-time/api/pm25`,

    "RT12H_4D_Forecast":
      `https://api-open.data.gov.sg/v2/real-time/api/four-day-outlook`,
    "RT12H_2D_Forecast":
      `https://api-open.data.gov.sg/v2/real-time/api/two-hr-forecast`,
  },

  "updateApiDataFns": new Map([
    ["1M", async function () {
        const endpoints = [
          OPEN_DATA_API.url.RT1_RH,
          OPEN_DATA_API.url.RT1_AIR_TEMP,
          OPEN_DATA_API.url.RT1_WIND_SPD,
          OPEN_DATA_API.url.RT1_WIND_DIR
        ];

        await axios.all(endpoints.map((endpoint) => axios.get(endpoint)))
          .then(axios.spread((relHum, airTemp, windSpd, windDir) => {
            console.log(relHum);
            console.log(airTemp);
            console.log(windSpd);
            console.log(windDir);
          }))
          .catch((err) => {
            console.error(`updateApiDataFns.1M(): ${err}`);
          });
        
    }],
    ["5M", async function () {
        const endpoints = [
          OPEN_DATA_API.url.RT5_RAINFALL
        ];

        await axios.all(endpoints.map((endpoint) => axios.get(endpoint)))
          .then(axios.spread((rainfall) => {
            console.log(rainfall);
          }))
          .catch((err) => {
            console.error(`updateApitDataFn.5M(): ${err}`);
          });
    }],
    ["1H", async function () {
      const endpoints = [
        OPEN_DATA_API.url.RT60_PM25,
        OPEN_DATA_API.url.RT60_PSI,
        OPEN_DATA_API.url.RT60_UVI
      ];

      await axios.all(endpoints.map((endpoint) => axios.get(endpoint)))
        .then(axios.spread((pm25, psi, uvi) => {
          console.log(pm25);
          console.log(psi);
          console.log(uvi);
        }))
        .catch((err) => {
          console.error(`updateApitDataFnMap.5M(): ${err}`);
        });
    }],
    ["12H", async function () {
      const endpoints = [
        OPEN_DATA_API.url.RT12H_2D_Forecast,
        OPEN_DATA_API.url.RT12H_4D_Forecast
      ];
      await axios.all(endpoints.map((endpoint) => axios.get(endpoint)))
        .then(axios.spread((forecast2D, forecast4D) => {
          console.log(forecast2D);
          console.log(forecast4D);
        }))
        .catch((err) => {
          console.error(`updateApitDataFnMap.5M(): ${err}`);
        });
    }]
  ]),

  "updateApiDataAll": async function () {
    for (let updatefn of OPEN_DATA_API.updateApiDataFns.values()) {
      await updatefn(); 
    }
  },
};

Object.freeze(OPEN_DATA_API);

const RAIN_VIEWER_API = {
  "apiJson": `https://api.rainviewer.com/public/weather-maps.json`,
  "json": undefined,
  "highRes": 512,
  "lowRes": 256,
  "isReady" : false,
};
async function getRainViewerApiConfig() {
  axios.get(RAIN_VIEWER_API.apiJson)
    .then((response) => {
      console.log(`getRainViewerApiConfig(): Success`);
      console.log(response.data);
      RAIN_VIEWER_API.json = response.data;
      
      console.log("rainviewerReady");
      document.dispatchEvent(rainviewerApiEvent);
      RAIN_VIEWER_API.isReady = true;
    })
    .catch((err) => {
      console.error(`getRainViewerApiConfig(): ${err}`);
    });
}
const rainviewerApiEvent = new CustomEvent(`RainviewerApiReady`);
getRainViewerApiConfig();

const apiData = {
  "rainfall": {
    "readings": [],
    "stations": []
  },
  "uvi": [],
  "psi": [],


  "isRainviewerReady" : false,

  "last" : 0
};

Object.seal(apiData);

async function getApiData() {

  console.log(await axios.get(OPEN_DATA_API.url.RT12H_4D_Forecast));
}

/*
function assigningValues () {
  return;

  apiData.rainfall.reading = rainfallResponse.data.data.readings[0].data;
  apiData.rainfall.stations = rainfallResponse.data.data.stations;

  apiData.uvi = uviResponse.data.data.records[0].index[0].value;
}
*/

//getApiData();


//  =================== Local Database Logic ==========================
let db;
const dbRequest = indexedDB.open("MyTestDatabase");

dbRequest.onerror = (event) => {
  console.error("Why didnt't you allow my web app to use IndexedDB?");
}
dbRequest.onsuccess = (event) => {
  db = event.target.result;
  console.log(`DB request Success!`);
}