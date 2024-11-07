const apiDataReady = new CustomEvent(`apiDataReady`);


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
      const requests = [
        axios.get(OPEN_DATA_API.url.RT1_RH),
        axios.get(OPEN_DATA_API.url.RT1_AIR_TEMP),
        axios.get(OPEN_DATA_API.url.RT1_WIND_SPD),
        axios.get(OPEN_DATA_API.url.RT1_WIND_DIR)
      ];

      const responses = await Promise.allSettled(requests);

      responses.forEach((res, i) => {
        if(res.status = "fullfilled") {
          let data = responses[i].value.data.data;
          switch(i) {
            case 0:
              if(updateRegions) OPEN_DATA_API.updateStations(data.stations);
              apiData.relativeHumidity.lastUpdate = new Date(
                data.readings[0].timestamp
              );
              apiData.relativeHumidity.data = data.readings[0].data;
              apiData.relativeHumidity.error = false;
              break;

            case 1:
              if(updateRegions) OPEN_DATA_API.updateStations(data.stations);
              apiData.airTemp.lastUpdate = new Date(
                data.readings[0].timestamp
              );
              apiData.airTemp.data = data.readings[0].data;
              apiData.airTemp.error = false;
              break;

            case 2:
              if(updateRegions) OPEN_DATA_API.updateStations(data.stations);
              apiData.windSpeed.lastUpdate = new Date(
                data.readings[0].timestamp
              );
              apiData.windSpeed.data = data.readings[0].data;
              apiData.windSpeed.error = false;
              break;

            case 3:
              if(updateRegions) OPEN_DATA_API.updateStations(data.stations);
              apiData.windDirection.lastUpdate = new Date(
                data.readings[0].timestamp
              );
              apiData.windDirection.data = data.readings[0].data;
              apiData.windDirection.error = false;
              break;

            default:
              console.error("Unhandled response");
          }
        } else {
          switch(i) {
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
              console.error("Unhandled response");
          }
        } 
      });
    }],

    ["5M", async function (updateRegions = false) {
      const endpoints = [
        OPEN_DATA_API.url.RT5_RAINFALL
      ];

      await axios.all(endpoints.map((endpoint) => axios.get(endpoint)))
        .then(axios.spread((rainfall) => {
          if (updateRegions) {
            OPEN_DATA_API.updateStations(rainfall.data.data.stations);
          }
          apiData.rainfall.lastUpdate = new Date(
            rainfall.data.data.readings[0].timestamp
          );
          apiData.rainfall.data = rainfall.data.data.readings[0].data;

          apiData.rainfall.error = false;
        }))
        .catch((err) => {
          if (err.response) {
            console.error(`Error in request to ${err.config.url}:`, err.response.data);
            switch (err.config.url) {
              case OPEN_DATA_API.url.RT5_RAINFALL:
                apiData.rainfall.error = true;
                break;

              default:
                console.error("Uncaught Error Status: ", err.config.url);
            }
          } else {
            console.error('Request failed:', err.message);
          }
        });
    }],

    ["30M", async function (updateRegions = false) {
      const endpoints = [
        OPEN_DATA_API.url.RT30_2H_Forecast
      ];
      await axios.all(endpoints.map((endpoint) => axios.get(endpoint)))
        .then(axios.spread((forecast2H) => {
          if (updateRegions) {
            OPEN_DATA_API.updateNeighbourhoods(forecast2H.data.data.area_metadata);
          }
          apiData.forecast2H.lastUpdate = new Date(
            forecast2H.data.data.items[0].update_timestamp
          );
          apiData.forecast2H.validUntil = new Date(
            forecast2H.data.data.items[0].valid_period.end
          );
          apiData.forecast2H.forecast =
            forecast2H.data.data.items[0].forecasts;

          apiData.forecast2H.error = false;
        }))
        .catch((err) => {
          if (err.response) {
            console.error(`Error in request to ${err.config.url}:`, err.response.data);
            switch (err.config.url) {
              case OPEN_DATA_API.url.RT30_2H_Forecast:
                apiData.forecast2H.error = true;
                break;

              default:
                console.error("Uncaught Error Status: ", err.config.url);
            }
          } else {
            console.error('Request failed:', err.message);
          }
        });
    }],

    ["1H", async function (updateRegions = false) {
      const endpoints = [
        OPEN_DATA_API.url.RT60_PM25,
        OPEN_DATA_API.url.RT60_PSI,
        OPEN_DATA_API.url.RT60_UVI
      ];

      await axios.all(endpoints.map((endpoint) => axios.get(endpoint)))
        .then(axios.spread((pm25, psi, uvi) => {
          if(updateRegions) {
            OPEN_DATA_API.updateRegions(psi.data.data.regionMetadata);
            OPEN_DATA_API.updateRegions(pm25.data.data.regionMetadata);
          }

          apiData.pm25.lastUpdate = new Date(
            pm25.data.data.items[0].updatedTimestamp
          );
          apiData.pm25.data = pm25.data.data.items[0].readings.pm25_one_hourly;

          apiData.psi.lastUpdate = new Date(
            psi.data.data.items[0].updatedTimestamp)
            ;
          apiData.psi.data = psi.data.data.items[0].readings;
          
          apiData.uvi.lastUpdate = new Date(
            uvi.data.data.records[0].updatedTimestamp
          );

          apiData.uvi.data = uvi.data.data.records[0].index;

          apiData.pm25.error = false;
          apiData.psi.error = false;
          apiData.uvi.error = false;

        }))
        .catch((err) => {
          if (err.response) {
            console.error(`Error in request to ${err.config.url}:`, err.response.data);
            switch (err.config.url) {
              case OPEN_DATA_API.url.RT60_PM25:
                apiData.pm25.error = true;
                break;

              case OPEN_DATA_API.url.RT60_PSI:
                apiData.psi.error = true;
                break;

              case OPEN_DATA_API.url.RT60_UVI:
                apiData.uvi.error = true;
                break;

              default:
                console.error("Uncaught Error Status: ", err.config.url);
            }
          } else {
            console.error('Request failed:', err.message);
          }
        });
    }],

    ["12H", async function (updateRegions = false) {
      const endpoints = [
        OPEN_DATA_API.url.RT12H_4D_Forecast
      ];
      await axios.all(endpoints.map((endpoint) => axios.get(endpoint)))
        .then(axios.spread((forecast4D) => {
          apiData.outlook4D.lastUpdated = new Date(
            forecast4D.data.data.records[0].updatedTimestamp
          );
          apiData.outlook4D.forecast = forecast4D.data.data.records[0].forecasts;
          apiData.outlook4D.error = true;
        }))
        .catch((err) => {
          if (err.response) {
            console.error(`Error in request to ${err.config.url}:`, err.response.data);
            if (err.config.url === OPEN_DATA_API.url.RT12H_4D_Forecast) {
              apiData.outlook4D.error = true;
            }
          } else {
            console.error('Request failed:', err.message);
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
          apiData.internals.set(fnKey, intervalNum);
        };

        const updateRainviewer = function (fnKey, timeout) {
          apiData.internals.set(fnKey,
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
    "lastUpdate": new Date(),
    "data": [],
    "error": true
  },

  "airTemp": {
    "lastUpdate": new Date(),
    "data": [],
    "error": true
  },

  "windSpeed": {
    "lastUpdate": new Date(),
    "data": [],
    "error": true
  },

  "windDirection": {
    "lastUpdate": new Date(),
    "data": [],
    "error": true
  },

  "rainfall": {
    "lastUpdate": new Date(),
    "data": [],
    "error": true
  },

  "pm25": {
    "lastUpdate": new Date(),
    "data": {},
    "error": true
  },

  "psi": {
    "lastUpdate": new Date(),
    "data": {},
    "error": true
  },

  "uvi": {
    "lastUpdate": new Date(),
    "data": [],
    "error": true
  },

  "forecast2H": {
    "lastUpdate": new Date(),
    "validUntil": new Date(),
    "forecast": [],
    "error": true
  },

  "outlook4D": {
    "lastUpdated": new Date(),
    "forecast": [],
    "error": true
  },

  "internals": new Map(),

  "last": 0
}; Object.seal(apiData);
/*
function updateStations(stations) {
  for(let station of stations) {
    apiData.stations.set(station.id,
      {
        "name": station.name,
        "location" : [
          station.location.latitude,
          station.location.longitude
        ]
      }
    );
  }
}

function updateRegions(regions) {
  for(let region of regions) {
    apiData.regions.set(region.name,
      {
        "location" : [
          region.labelLocation.latitude,
          region.labelLocation.longitude
        ]
      }
    );
  }
}

function updateNeighbourhoods(regions) {
  for(let region of regions) {
    apiData.neighbourhoods.set(region.name,
      {
        "location" : [
          region.label_location.latitude,
          region.label_location.longitude
        ]
      }
    )
  }
}

function startAllUpdateIntervals() {
  
}
*/
const ENUM_RAINFALL_CATERGORY = {
  "none": 0,
  "light": 1,
  "moderate": 2,
  "heavy": 3,
  "violent": 4
};
Object.freeze(ENUM_RAINFALL_CATERGORY);

// Rain Catergories
// https://en.wikipedia.org/wiki/Rain#Intensity
function getRainfallCatergory(MmPer5min) {
  if (MmPer5min === 0) return ENUM_RAINFALL_CATERGORY.none;

  const rainRate = MmPer5min * 12.0; // Get mm/hr
  if (rainRate < 2.5) return ENUM_RAINFALL_CATERGORY.light;
  if (rainRate < 10.0) return ENUM_RAINFALL_CATERGORY.moderate;
  if (rainRate < 50.0) return ENUM_RAINFALL_CATERGORY.heavy;
  return ENUM_RAINFALL_CATERGORY.violent;
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