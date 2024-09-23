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
}; Object.freeze(OPEN_DATA_API);

const apiData = {
  "rainfall": {
    "readings": [],
    "stations": []
  },

  "pm25" : {
    "lastUpdate" : new Date(),
    "data" : {}
  },

  "psi": {
    "lastUpdate" : new Date(),
    "data" : {}
  },

  "uvi": {
    "lastUpdate"  : new Date(),
    "data" : []
  },

  "forecast2H" : {
    "lastUpdate" : new Date(),
    "validUntil" : new Date(),
    "forecast" : []
  },

  "outlook4D" : {
    "lastUpdated" : new Date(),
    "forecast" : []
  },

  "isRainviewerReady" : false,

  "last" : 0
}; Object.seal(apiData);

async function getApiData() {

  console.log(await axios.get(OPEN_DATA_API.url.RT12H_4D_Forecast));
}

const ENUM_RAINFALL_CATERGORY = {
  "none" : 0,
  "light" : 1,
  "moderate" : 2,
  "heavy" : 3,
  "violent" : 4
};
Object.freeze(ENUM_RAINFALL_CATERGORY);

// Rain Catergories
// https://en.wikipedia.org/wiki/Rain#Intensity
function getRainfallCatergory(MmPer5min) {
  const rainRate = MmPer5min * 12.0;
  let rainLevel = 0;
  if(rainRate < 2.5) rainLevel += 1;
  if(rainRate < 10.0) rainLevel += 1;
  if(rainRate < 50.0) rainLevel += 1;
  if(50.0 <= rainRate) rainLevel += 1;
  return rainLevel;
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

/*
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
*/