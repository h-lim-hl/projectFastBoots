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

  // Levensthein distance
  "restrictedEditedDist" : (stringA, stringB) => {
    let matrix = new Array(stringA.length + 1).fill(0)
    .map(() => new Array(stringB.length+1).fill(0));

    for(let i = 0; i <= stringA.length; ++i) {
      matrix[i][0] = i;
    }
    for(let i = 0; i <= stringB.length; ++i) {
      matrix[0][i];
    }

    for(let i = 1; i <= stringA.length; ++i) {
      for(let j = 1; j <= stringB.length; ++j) {
        if(stringA[i-1] === stringB[j-1])
          matrix[i][j] = matrix[i-1][j-1];
        else
          matrix[i][j] = 1 + Math.min(
            matrix[i-1][j],
            matrix[i][j-1],
            matrix[i-1][j-1]);
      }
    }

    return matrix[stringA.length][stringB.length];
  },

  "sigFig" : (num, digits) => {
    digits = Math.round(10 ** digits + Number.EPSILON);
    digits = digits < 1 ? 1 : digits;
    return Math.round((num + Number.EPSILON) * digits) / digits;
  },

  "capFirstChar" : (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }
};