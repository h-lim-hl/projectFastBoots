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

    }],
    ["5M", async function () {

    }],
    ["1H", async function () {

    }],
    ["12H", async function () {

    }]
  ]),

  "updateApiDataAll": async function () {
    for (let updatefn of API.updateApiDataFns.values()) { await updatefn(); }
  },
};

Object.freeze(OPEN_DATA_API);

const RAIN_VIEWER_API = {
  "apiJson": `https://api.rainviewer.com/public/weather-maps.json`,
  "json": undefined,
  /*
  data{
    generated: 1725246031,
    host: "https://tilecache.rainviewer.com"
    radar: {
      nowcast: [
        { time: 1725246600, path: "/v2/radar/nowcast_59697c02526b" },,,
      ],
      
      past: [{ time: 1725238800, path: "/v2/radar/1725238800" },,, 
      ],

      satellite: {
        infrared: [time: 1725238800, path: "/v2/satellite/c466bd25759e",,,,]
      }
    }
  }
  */
};

async function getRainViewerApiConfig() {
  axios.get(RAIN_VIEWER_API.apiJson)
    .then((response) => {
      console.log(`getRainViewerApiConfig(): Success`);
      console.log(response.data);
      RAIN_VIEWER_API.json = response.data;
    })
    .catch((err) => {
      console.error(`getRainViewerApiConfig(): ${err}`);
    });
}



const apiData = {
  "rainfall": {
    "readings": [],
    "stations": []
  },
  "uvi": [],
  "psi": []
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