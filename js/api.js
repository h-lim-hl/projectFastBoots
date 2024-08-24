const API = {
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

   "updateApiDataFns" : new Map(
      ["1M", async function () {

      }],
      ["5M", async function ()  {

      }],
      ["1H", async function () {

      }],
      ["12H", async function () {

      }]
   ),

   "updateApiDataAll" : async function () {
      for(let updatefn of API.updateApiDataFns.values()) { await updatefn(); }
   },
};

const apiData = {
   "rainfall": {
      "readings": [],
      "stations": []
   },
   "uvi": [],
   "psi": []
};

Object.freeze(API);
Object.seal(apiData);

async function getApiData() {

   console.log(await axios.get(API.url.RT12H_4D_Forecast));
}

/*
function assigningValues () {
   return;

   apiData.rainfall.reading = rainfallResponse.data.data.readings[0].data;
   apiData.rainfall.stations = rainfallResponse.data.data.stations;

   apiData.uvi = uviResponse.data.data.records[0].index[0].value;
}
*/

getApiData();
