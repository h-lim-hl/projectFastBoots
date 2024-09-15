const HELPER = {
  "coords" : {
    "dmsToDeg": function (coords) {
      const regex = /(\d+)/g;
      let match = coords.match(regex);

      return Number(match[0]) + Number(match[1])
           / 60 + Number(match[2]) / 3600;
    }
  },
  
  "map" : {
    "subscript" : (mapObj, keyValue) => mapObj.get(keyValue),
    "printContent"  : function (mapObj) {
      let out = "/";
      for(const i of mapObj[Symbol.iterator]()) {
        out += ` ${i} `;
      }
      out += '/';
      console.log(out);
    }
  },

  "knotsToMetresPerSecond" : (knots) => knots * 0.5144444444,
};