const HELPER = {
   "map" : {
      "subscript" : (mapObj, keyValue) => mapObj.get(keyValue),
      "printContent"  : function (mapObj) {
         let out = "/";
         for(const i of mapObj[Symbol.iterator]()) {
            out += ` ${i} `;
         }
         out += '/';
         console.log(out);
      },
   }
};