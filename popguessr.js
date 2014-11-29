var app;

require(["esri/Color",
  "dojo/string",
  "dijit/registry",

  "esri/config",
  "esri/map",
  "esri/layers/ArcGISDynamicMapServiceLayer",
  "esri/graphic",
  "esri/tasks/Geoprocessor",
  "esri/tasks/FeatureSet",
  "esri/toolbars/draw",
  "esri/symbols/SimpleLineSymbol",
  "esri/symbols/SimpleFillSymbol",
  "esri/urlUtils",
  "esri/geometry/Polygon",
  "esri/geometry/Point",
  "esri/layers/FeatureLayer",
  "esri/tasks/query"
  ],
function(Color, string, registry, esriConfig, Map, ArcGISDynamicMapServiceLayer, Graphic, Geoprocessor, FeatureSet, Draw, SimpleLineSymbol, SimpleFillSymbol, urlUtils, Polygon, Point, FeatureLayer, Query){

  //Proxy Boilerplate
  urlUtils.addProxyRule({
    urlPrefix: "http://sampleserver1.arcgisonline.com",
    proxyUrl: "http://localhost/PHP/proxy.php"
  });

  esriConfig.defaults.io.proxyUrl = "/proxy";
  esriConfig.defaults.io.alwaysUseProxy = false;

  var map, gp, cities;

  // Create Map
  map = new Map("mapDiv", { 
    basemap: "streets", 
    center: [5, 50],
    zoom: 4
  });

  map.on("load", initApp);

  // Create GeoProcessor
  gp = new Geoprocessor("http://sampleserver1.arcgisonline.com/ArcGIS/rest/services/Demographics/ESRI_Population_World/GPServer/PopulationSummary");
  gp.setOutputSpatialReference({wkid:102100});

  function initApp(evtObj) {
    var citiesLayer = new FeatureLayer("http://services.arcgis.com/P3ePLMYs2RVChkJx/arcgis/rest/services/World_Cities/FeatureServer/0");

    citiesLayer.on("load", function(e) {
      getCities(citiesLayer, startGame);
    });
  }

  function startGame() {
    var index;

    index = 0;
    loop();

    function loop() {
      if (index < 10) {
        pickCity();
        setTimeout(loop, 2000);
      }
    }
  }

  function getCities(citiesLayer, callback) {
    // Dirty hack - gets all cities, will do once at start of code
    var query = new Query();
    query.where = "CITY_NAME LIKE '%'";
    citiesLayer.selectFeatures(query, FeatureLayer.SELECTION_NEW, function(features, method) {
      cities = features;
      callback();
    });
  }

  function pickCity() {
    var numOfCities = cities.length;
    var rand = Math.floor((Math.random() * numOfCities) + 1);
    var city = cities[rand];
    var p = new Point(city.geometry.x, city.geometry.y, {wkid:102100});
    console.log(p);
    map.centerAt(p);
  }

  function computeZonalStats(geometry) {
    map.showZoomSlider();
    map.graphics.clear();
    
    var symbol = new SimpleFillSymbol("none", new SimpleLineSymbol("dashdot", new Color([255,0,0]), 2), new Color([255,255,0,0.25]));
    var graphic = new Graphic(geometry,symbol);

    map.graphics.add(graphic);

    var features= [];
    features.push(graphic);

    var featureSet = new FeatureSet();
    featureSet.features = features;
    
    var params = { "inputPoly":featureSet };
    gp.execute(params);
  }

  function displayResults(evtObj) {
    var results = evtObj.results;
    var content = string.substitute("<h4>The population in the user defined polygon is ${number:dojo.number.format}.</h4>",{number:results[0].value.features[0].attributes.SUM});

    registry.byId("dialog1").setContent(content);
    registry.byId("dialog1").show();
  }

});