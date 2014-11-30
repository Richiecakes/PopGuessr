var app;

require(["esri/Color",
  "dojo/string",
  "dijit/registry",

  "esri/config",
  "esri/map",
  "esri/layers/ArcGISDynamicMapServiceLayer",
  "esri/graphic",
  "esri/tasks/FeatureSet",
  "esri/symbols/SimpleLineSymbol",
  "esri/symbols/SimpleFillSymbol",
  "esri/urlUtils",
  "esri/geometry/Polygon",
  "esri/geometry/Point",
  "esri/layers/FeatureLayer",
  "esri/tasks/query",
  "esri/tasks/QueryTask",
  "esri/layers/GraphicsLayer"
  ],
function(Color, string, registry, esriConfig, Map, ArcGISDynamicMapServiceLayer,
  Graphic, FeatureSet, SimpleLineSymbol, SimpleFillSymbol,
  urlUtils, Polygon, Point, FeatureLayer, Query, QueryTask, GraphicsLayer){

  //Proxy Boilerplate
  urlUtils.addProxyRule({
    urlPrefix: "http://sampleserver1.arcgisonline.com",
    proxyUrl: "http://localhost/PHP/proxy.php"
  });

  esriConfig.defaults.io.proxyUrl = "/proxy";
  esriConfig.defaults.io.alwaysUseProxy = false;

  var map, regions;

  var MAX_NUMBER_OF_GUESSES = 10;

  function Game(max) {
    this.maxNumberOfGuesses = max;
    this.score = 0;
    this.guesses = 0;
  }

  // Create Map
  map = new Map("mapDiv", { 
    basemap: "gray", 
    center: [5, 50],
    zoom: 9
  });

  map.on("load", init);

  function init() {
    getRegions(startGame);
  }

  function getRegions(callback) {
    // Dirty hack - gets all regions, will do once at start of code
    var query = new Query();
    var queryTask = new QueryTask("http://services.arcgis.com/P3ePLMYs2RVChkJx/arcgis/rest/services/usa_cbsa/FeatureServer/0");

    query.where = "NAME LIKE '%'";
    query.num = 20;
    query.outFields = ["NAME", "POP2012"];
    query.returnGeometry = true;

    queryTask.execute(query, function(args) {
      regions = args.features;
      callback();
    });
  }

  function startGame() {
    var g = new Game(MAX_NUMBER_OF_GUESSES);
    pickRegion(function(population) {
      console.log(population);
    });
  }

  function pickRegion(callback) {
    var numOfRegions = regions.length;
    var rand = Math.floor((Math.random() * numOfRegions));
    var region = regions[rand];
    var p = region.geometry.getCentroid();

    map.centerAt(p);

    map.graphics.clear();
        
    var symbol = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID, new SimpleLineSymbol("solid", new Color([255,0,0]), 4), new Color([255,255,0,0.25]));
    var graphic = new Graphic(region.geometry,symbol);

    map.graphics.add(graphic);

    callback(region.attributes.POP2012);
  }

});