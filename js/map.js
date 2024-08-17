const HELPER = {
  "dmsToDeg": function (coords) {
    const regex = /(\d+)/g;
    let match = coords.match(regex);

    return Number(match[0]) + Number(match[1]) / 60 + Number(match[2]) / 3600;
  }
};

const SINGAPORE_LATLONG = [1.3521, 103.8198];
let map = L.map('map').setView(SINGAPORE_LATLONG, 13);

L.tileLayer('https://www.onemap.gov.sg/maps/tiles/Default_HD/{z}/{x}/{y}.png', {
  detectRetina: true,
  maxZoom: 19,
  minZoom: 11,
  /** DO NOT REMOVE the OneMap attribution below **/
  attribution: '<img src="https://www.onemap.gov.sg/web-assets/images/logo/om_logo.png" style="height:20px;width:20px;"/>&nbsp;<a href="https://www.onemap.gov.sg/" target="_blank" rel="noopener noreferrer">OneMap</a>&nbsp;&copy;&nbsp;contributors&nbsp;&#124;&nbsp;<a href="https://www.sla.gov.sg/" target="_blank" rel="noopener noreferrer">Singapore Land Authority</a>'
}).addTo(map);

/*
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);
*/