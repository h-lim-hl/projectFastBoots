### Rainviewer Legend
Yes, you can create a legend in Leaflet! You can do this by adding a control to your map. Here's a simple example of how to create a legend:

Step 1: Create the Legend HTML
First, define the HTML for your legend. You can use a <div> element to hold it.

Step 2: Add the Legend to the Map
Here's an example of how to add a legend to your Leaflet map:

``` javascript
// Create a legend control
var legend = L.control({ position: 'topright' });

legend.onAdd = function () {
    var div = L.DomUtil.create('div', 'info legend');
    // You can customize the content here
    div.innerHTML += '<i style="background: red"></i> Category 1<br>';
    div.innerHTML += '<i style="background: blue"></i> Category 2<br>';
    div.innerHTML += '<i style="background: green"></i> Category 3<br>';
    return div;
};

// Add the legend to the map
legend.addTo(map);
```
Step 3: Style the Legend with CSS
You can also add CSS to style your legend:
``` css
.info {
    padding: 10px;
    background: white;
    border-radius: 5px;
    box-shadow: 0 0 5px rgba(0,0,0,0.65);
}

.legend i {
    width: 18px;
    height: 18px;
    margin-right: 8px;
    float: left;
}
```