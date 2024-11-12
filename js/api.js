const apiDataReady = new CustomEvent(`apiDataReady`);
const forecast24Updated = new CustomEvent(`forecast24DUpdated`);
const relativeHumidityUpdated = new CustomEvent(`relativeHumidityUpdated`);
const airTemperatureUpdated = new CustomEvent(`airTemperatureUpdated`);
const windSpeedUpdated = new CustomEvent(`windSpeedUpdated`);
const windDirectionUpdated = new CustomEvent(`windDirectionUpdated`);
const rainfallUpdated = new CustomEvent(`rainfallUpdated`);
const forecast2hUpdated = new CustomEvent(`forecast2hUpdated`);
const uviUpdated = new CustomEvent(`uviUpdated`);
const psiUpdated = new CustomEvent(`psiUpdated`);
//const pm25Updated = new CustomEvent(`pm25Updated`);
const forecast4dUpdated = new CustomEvent(`forecast4dUpdated`);

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

    "RT30_2H_Forecast":
      `https://api-open.data.gov.sg/v2/real-time/api/two-hr-forecast`,

    "RT60_UVI": `https://api-open.data.gov.sg/v2/real-time/api/uv`,
    "RT60_PSI": `https://api-open.data.gov.sg/v2/real-time/api/psi`,
    "RT60_PM25": `https://api-open.data.gov.sg/v2/real-time/api/pm25`,

    "RT12H_4D_Forecast":
      `https://api-open.data.gov.sg/v2/real-time/api/four-day-outlook`,
  },

  "updateStations": function (stations) {
    for (let station of stations) {
      apiData.stations.set(station.id,
        {
          "name": station.name,
          "location": [
            station.location.latitude,
            station.location.longitude
          ]
        }
      );
    }
  },

  "updateRegions": function (regions) {
    for (let region of regions) {
      apiData.regions.set(region.name,
        {
          "location": [
            region.labelLocation.latitude,
            region.labelLocation.longitude
          ]
        }
      );
    }
  },

  "updateNeighbourhoods": function (regions) {
    for (let region of regions) {
      apiData.neighbourhoods.set(region.name,
        {
          "location": [
            region.label_location.latitude,
            region.label_location.longitude
          ]
        }
      )
    }
  },

  "updateApiDataFns": new Map([
    ["1M", async function (updateRegions = false) {
      // console.log("1M: updating: ", new Date().toLocaleTimeString());
      const requests = [
        axios.get(OPEN_DATA_API.url.RT1_RH),
        axios.get(OPEN_DATA_API.url.RT1_AIR_TEMP),
        axios.get(OPEN_DATA_API.url.RT1_WIND_SPD),
        axios.get(OPEN_DATA_API.url.RT1_WIND_DIR)
      ];

      const responses = await Promise.allSettled(requests);

      responses.forEach((res, i) => {
        if (res.status === "fulfilled") {
          let data = res.value.data.data;
          switch (i) {
            case 0:
              if (updateRegions) OPEN_DATA_API.updateStations(data.stations);
              apiData.relativeHumidity.lastUpdate = new Date(
                data.readings[0].timestamp
              );
              apiData.relativeHumidity.data = data.readings[0].data;
              apiData.relativeHumidity.error = false;
              break;

            case 1:
              if (updateRegions) OPEN_DATA_API.updateStations(data.stations);
              apiData.airTemp.lastUpdate = new Date(
                data.readings[0].timestamp
              );
              apiData.airTemp.data = data.readings[0].data;
              apiData.airTemp.error = false;
              break;

            case 2:
              if (updateRegions) OPEN_DATA_API.updateStations(data.stations);
              apiData.windSpeed.lastUpdate = new Date(
                data.readings[0].timestamp
              );
              apiData.windSpeed.data = data.readings[0].data;
              apiData.windSpeed.error = false;
              break;

            case 3:
              if (updateRegions) OPEN_DATA_API.updateStations(data.stations);
              apiData.windDirection.lastUpdate = new Date(
                data.readings[0].timestamp
              );
              apiData.windDirection.data = data.readings[0].data;
              apiData.windDirection.error = false;
              break;

            default:
              console.error(`Unhandled response[${i}]:\n${res}`);
          }
        } else {
          switch (i) {
            case 0:
              apiData.relativeHumidity.error = true;
              break;
            case 1:
              apiData.airTemp.error = true;
              break;
            case 2:
              apiData.windSpeed.error = true;
              break;
            case 3:
              apiData.windDirection.error = true;
              break;

            default:
              console.error(`Unhandled response[${i}]:\n${res}`);
          }
        }
        document.dispatchEvent(relativeHumidityUpdated);
        document.dispatchEvent(airTemperatureUpdated);
        document.dispatchEvent(windSpeedUpdated);
        document.dispatchEvent(windDirectionUpdated);

      });
    }],

    ["5M", async function (updateRegions = false) {
      // console.log("5M: updating: ", new Date().toLocaleTimeString());
      const requests = [
        axios.get(OPEN_DATA_API.url.RT5_RAINFALL)
      ];

      const responses = await Promise.allSettled(requests);
      responses.forEach((res, i) => {
        if (res.status === "fulfilled") {
          let data = res.value.data.data;
          switch (i) {
            case 0:
              if (updateRegions) OPEN_DATA_API.updateStations(data.stations);
              apiData.rainfall.lastUpdate = new Date(
                data.readings[0].timestamp
              );
              apiData.rainfall.data = data.readings[0].data;
              apiData.rainfall.error = false;
              break;
            default:
              console.error(`Unhandled response[${i}]:\n${res}`);
          }
        } else {
          switch (i) {
            case 0:
              apiData.relativeHumidity.error = true;
              break;
            default:
              console.error(`Unhandled response[${i}]:\n${res}`);
          }
        }
        document.dispatchEvent(rainfallUpdated);
      });
    }],

    ["30M", async function (updateRegions = false) {
      // console.log("30M: updating: ", new Date().toLocaleTimeString());
      const requests = [
        axios.get(OPEN_DATA_API.url.RT30_2H_Forecast)
      ];
      const responses = await Promise.allSettled(requests);
      responses.forEach((res, i) => {
        if (res.status === "fulfilled") {
          let data = res.value.data.data;
          switch (i) {
            case 0:
              if (updateRegions) {
                OPEN_DATA_API.updateNeighbourhoods(data.area_metadata);
              }

              apiData.forecast2H.lastUpdate = new Date(
                data.items[0].update_timestamp
              );
              apiData.forecast2H.validUntil = new Date(
                data.items[0].valid_period.end
              );
              apiData.forecast2H.forecast = data.items[0].forecasts;

              apiData.forecast2H.error = false;
              break;
            default:
              console.error(`Unhandled response[${i}]:\n${res}`);
          }
        } else {
          switch (i) {
            case 0:
              apiData.forecast2H.error = true;
              break;
            default:
              console.error(`Unhandled response[${i}]:\n${res}`);
          }
        }
      });
      document.dispatchEvent(forecast2hUpdated);
    }],

    ["1H", async function (updateRegions = false) {
      // console.log("1H: updating: ", new Date().toLocaleTimeString());
      const requests = [
        //axios.get(OPEN_DATA_API.url.RT60_PM25),
        axios.get(OPEN_DATA_API.url.RT60_PSI),
        axios.get(OPEN_DATA_API.url.RT60_UVI)
      ];

      const response = await Promise.allSettled(requests);
      response.forEach((res, i) => {
        if (res.status === "fulfilled") {
          let data = res.value.data.data;
          switch (i) {
            // case 0:
            //   if(updateRegions) {
            //     OPEN_DATA_API.updateRegions(data.regionMetadata);
            //   }
            //   apiData.pm25.lastUpdate = 
            //     new Date( data.items[0].updatedTimestamp);
            //   apiData.pm25.data = data.items[0].readings.pm25_one_hourly;
            //   apiData.pm25.error = false;
            //   break;
            case 0:
              if (updateRegions) {
                OPEN_DATA_API.updateRegions(data.regionMetadata);
              }
              apiData.psi.lastUpdate =
                new Date(data.items[0].updatedTimestamp);
              apiData.psi.data = data.items[0].readings;
              apiData.psi.error = false;
              break;
            case 1:
              apiData.uvi.lastUpdate =
                new Date(data.records[0].updatedTimestamp);
              apiData.uvi.data = data.records[0].index;
              apiData.uvi.error = false;
              break;
            default:
              console.error(`Unhandled response[${i}]:\n${res}`);
          }
        } else {
          switch (i) {
            // case 0:
            //   console.error("pm25Update Error: ", res.reason);
            //   apiData.pm25.error = true;
            //   break;
            case 0:
              console.error("psi5Update Error: ", res.reason);
              apiData.psi.error = true;
              break;
            case 1:
              console.error("uviUpdate Error: ", res.reason);
              apiData.uvi.error = true;
              break;
            default:
              console.error(`Unhandled response[${i}]:\n${res}`);
          }
        }
        //document.dispatchEvent(pm25Updated);
        document.dispatchEvent(psiUpdated);
        document.dispatchEvent(uviUpdated);
      });
    }],

    ["12H", async function (updateRegions = false) {
      // console.log("12H: updating: ", new Date().toLocaleTimeString());
      const requests = [
        axios.get(OPEN_DATA_API.url.RT12H_4D_Forecast)
      ];

      const responses = await Promise.allSettled(requests);
      responses.forEach((res, i) => {
        if (res.status === "fulfilled") {
          let data = res.value.data.data;
          switch (i) {
            case 0:
              apiData.outlook4D.forecast = data.records[0].forecasts;
              apiData.outlook4D.error = false;
              break;
            default:
              console.error(`Unhandled response[${i}]:\n${res}`);
          }
        } else {
          switch (i) {
            case 0:
              console.error("outlook4D Error: ", res.reason);
              apiData.outlook4D.error = true;
              break;
            default:
              console.error(`Unhandled response[${i}]:\n${res}`);
          }
        }
      });
    }]
  ]),

  "updateApiDataAll": async function (updateRegions = false) {
    for (let updatefn of OPEN_DATA_API.updateApiDataFns.values()) {
      await updatefn(updateRegions);
    }
    document.dispatchEvent(apiDataReady);
  },

  "startAllUpdateIntervals": async function () {
    await OPEN_DATA_API.updateApiDataAll(true)
      .then(() => {
        const updateFunc = function (fnKey, timeout) {
          let intervalNum =
            setInterval(OPEN_DATA_API.updateApiDataFns.get(fnKey), timeout);
          apiData.intervals.set(fnKey, intervalNum);
          return intervalNum;
        };

        const updateRainviewer = function (fnKey, timeout) {
          apiData.intervals.set(fnKey,
            setInterval(getRainViewerApiConfig, timeout))
        };
        const timeNow = new Date().getTime();
        setTimeout(updateFunc, 60000 - timeNow % 60000, "1M", 60000);
        setTimeout(updateFunc, 300000 - timeNow % 300000, "5M", 300000);
        setTimeout(updateRainviewer, 600000 - timeNow % 600000, "rainviewer", 600000);
        setTimeout(updateFunc, 1800000 - timeNow % 1800000, "30M", 1800000);
        setTimeout(updateFunc, 3600000 - timeNow % 3600000, "1H", 3600000);
        setTimeout(updateFunc, 43200000 - timeNow % 43200000, "12H", 43200000);
      });
  },

}; Object.freeze(OPEN_DATA_API);

const apiData = {
  "stations": new Map(),
  "regions": new Map(),
  "neighbourhoods": new Map(),

  "relativeHumidity": {
    "lastUpdate": new Date(0),
    "data": [],
    "error": true
  },

  "airTemp": {
    "lastUpdate": new Date(0),
    "data": [],
    "error": true
  },

  "windSpeed": {
    "lastUpdate": new Date(0),
    "data": [],
    "error": true
  },

  "windDirection": {
    "lastUpdate": new Date(0),
    "data": [],
    "error": true
  },

  "rainfall": {
    "lastUpdate": new Date(0),
    "data": [],
    "error": true
  },

  "pm25": {
    "lastUpdate": new Date(0),
    "data": {},
    "error": true
  },

  "psi": {
    "lastUpdate": new Date(0),
    "data": {},
    "error": true
  },

  "uvi": {
    "lastUpdate": new Date(0),
    "data": [],
    "error": true
  },

  "forecast2H": {
    "lastUpdate": new Date(0),
    "validUntil": new Date(0),
    "forecast": [],
    "error": true
  },

  "outlook4D": {
    "lastUpdated": new Date(),
    "forecast": [],
    "error": true
  },

  "intervals": new Map(),
  
  "init" : false,

  "last": 0
}; Object.seal(apiData);

// Rain Catergories
// https://en.wikipedia.org/wiki/Rain#Intensity
function getRainfallCatergory(MmPer5min) {
  if (MmPer5min === 0) return "No";

  const rainRate = MmPer5min * 12.0; // Get mm/hr
  if (rainRate < 2.5) return "Light";
  if (rainRate < 10.0) return "Moderate";
  if (rainRate < 50.0) return "Heavy";
  return "Torrential";
}

function getSubindexDangerLvl(value) {
  if (value <= 50) return 0;
  if (value <= 100) return 1;
  if (value <= 150) return 2;
  if (value <= 200) return 3;
  return 4;
}

document.addEventListener("apiDataReady", ()=>{
  apiData.init = true;
});

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