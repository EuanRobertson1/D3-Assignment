//Set the dimensions of the SVG container
const width = 900;
const height = 600;

//set default number of towns loaded
let townNum = 50;


//Create an SVG element
const svg = d3.select("svg")
  .attr("width", width)
  .attr("height", height);

//projection
const projection = d3.geoMercator()
  .center([-3.5, 55.9])
  .scale(1750) 
  .translate([width / 2, height / 2]);

//Create a path generator using the projection
const path = d3.geoPath().projection(projection);

//Zoom functionality - Adapted from https://stackoverflow.com/questions/69268997/d3-zoomable-choropleth-map and ChatGPT "how would i add a zoom feature to this D3 map?"
const zoom = d3.zoom()
  .scaleExtent([1, 8])
  .on("zoom", function(event) {
    svg.attr("transform", event.transform);
  });

  svg.call(zoom);
 
//group for map and towns (to assist zooming)
const g = svg.append("g");

//Load the map data
d3.json('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-50m.json').then(worldData => {
  //get countries 
  const countries = topojson.feature(worldData, worldData.objects.countries)

  //add blue rectangle to represent the sea
  g.append('rect')
    .attr("width", 20000)
    .attr("height", 20000)
    .attr("x", -10000)
    .attr ("y", -10000)
    .attr('fill', '#87CEEB');
    
  //add countries
  g.selectAll('path')
    .data(countries.features)
    .enter().append('path')
    .attr('d', path)
    .attr('fill', '#3f9b0b')
    .attr('stroke', '#000')
    .attr('stroke-width', 0.5);
  

 
}).catch(error => {
  console.error('Error loading or parsing the TopoJSON file:', error);
});

//function to load the towns onto the map
function loadTowns()
{
  //load towns data
  d3.json("http://34.147.162.172/Circles/Towns/" + townNum).then(function(data) {
    
    //extract coords. Asked ChatGPT with prompt "how would i convert the lat and long values to pixels for use with d3 in this json file?"
    data.forEach(function(d) {
      var coords = getPixelCoordinates(d);
      d.x = coords[0];
      d.y = coords[1];
    });
    
    //plot circles 
    g.selectAll("circle")
      .data(data)
      .enter()
      .append("circle")
      .attr("cx", function(d) { return d.x; })
      .attr("cy", function(d) { return d.y; })
      .attr("r", 3)
      .attr("fill", "blue");

    //applying zoom to group
    svg.call(zoom.on("zoom", function(event) {
      g.attr("transform", event.transform);
    }));

  })
}

//function to convert lat long to pixel coords. Asked ChatGPT with prompt "how would i convert the lat and long values to pixels for use with d3 in this json file?"
function getPixelCoordinates(d) {
  return projection([d.lng, d.lat]);
}

//load towns when window is loaded
window.onLoad = loadTowns();

