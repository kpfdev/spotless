var settings = {
  'useMix0': 25,
  'useMix1': 50,
  'useMix2': 75,
  'layers_visible':['surface_full','surface_partial','garage_full','garage_partial'],
  'storyItem':0,
}

var cmaps = {
  'red2green': ['#d73027','#fc8d59','#fee08b','#d9ef8b','#91cf60','#1a9850'],
  'blue2yellow': ['#151224','#343D5E','#4F777E','#709E87','#99BE95','#D6DEBF'],
  'white2red': ['#ffffff','#ff8984','#de2d26','#a50f15','#771118','#560A10'],
  'red2white2green': ['#ca0020','#f4a582','#ffffff','#a6d96a','#1a9641'],
  'pinks': ['#feebe2','#fbb4b9','#f768a1','#c51b8a','#7a0177']
}

var popupColumns = {
  'Existing Stats' : {
    'Parking_Ty': 'Parking Type',
    'Parking_Sp': 'Parking Spots',
    'ZoneDist1': 'Zoning District',
    'Max_FAR': 'FAR',
    'BBL': 'BBL'
  },
  'Development Potential' : {
    'Num_Floors': 'Number of Floors',
    'Constructi': 'Potential GFA',
    'Buildable_': 'Park Area',
    'Num_Apts': 'Number of Apartments',
    'Num_Worker': 'Potential Workers'
  }
}

var json = (function() {
    var json = null;
    $.ajax({
        'async': false,
        'global': false,
        'url': "./data/NYC_Parking.geojson",
        'dataType': "json",
        'success': function (data) {
            json = data;
        }
    });
    return json;
})();

mapboxgl.accessToken = 'pk.eyJ1IjoiZGNoYXJ2ZXkiLCJhIjoiY2ltemVpNjY1MDRlanVya2szYzlnM2dxcyJ9.im9EDlP7YIYefEt_wz2fww';

var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/dcharvey/cjud1virg19oe1fqndotk3ksx',
    center: [-73.9826,40.7082],
    zoom: 10,
    pitch: 0,
    bearing: 0
});

map.on('load', function() {

    map.setLight({
      "anchor":"viewport",
      "color": "white",
      "intensity": 0.2,
      "position": [
        1.5,
        90,
        60
      ]
    })

    map.addLayer({
      'id': '3d-buildings',
      'source': 'composite',
      'source-layer': 'building',
      'filter': ['==', 'extrude', 'true'],
      'type': 'fill-extrusion',
      'minzoom': 15,
      'paint': {
        'fill-extrusion-color': '#fff',
        'fill-extrusion-height': ["get", "height"],
        'fill-extrusion-opacity': .8,
        'fill-extrusion-vertical-gradient': true
      }
    });

    var layers = map.getStyle().layers;
    var labelLayerId;
    for (var i = 0; i < layers.length; i++) {
        if (layers[i].type === 'symbol' && layers[i].layout['text-field']) {
            labelLayerId = layers[i].id;
            break;
        }
    }

    map.addLayer({
      'id': 'parking',
      'type': 'fill',
      'source': {
        'type': 'geojson',
        'data': json
      },
      'layout': {
        'visibility': 'visible'
      },
      'paint': {
        'fill-color': [
          'match',
          ['get', 'Parking_Ty'],
          'surface_full', '#ea3f64',
          'surface_partial', '#f78fa6',
          'garage_full', '#4eb9fc',
          'garage_partial', '#bee1f7',
          /* other */ '#ccc'
        ],
        'fill-opacity': 1
      }
    }, labelLayerId);

    map.addLayer({
      'id': 'parking-buildings',
      'type': 'fill-extrusion',
      'source': {
        'type': 'geojson',
        'data': json
      },
      'layout': {
        'visibility': 'none'
      },
      'paint': {
        'fill-extrusion-color': "white",
        'fill-extrusion-height':["get", "Height"],
        'fill-extrusion-opacity': 1,
        'fill-extrusion-vertical-gradient': true
      }
    }, labelLayerId);

    map.on('click', 'parking', function (e) {
      var coordinates = e.lngLat;
      var properties = e.features[0].properties;
      var tables = '';

      for (i in popupColumns) {
        var title = i
        var rows = ''
        for (j in popupColumns[i]) {

          if (j == 'BBL') {
            propertyValue = properties[j]
          } else if (typeof properties[j] == 'number') {
            propertyValue = nFormatter(properties[j], 2)
          } else {
            propertyValue = properties[j]
          }

          var row = '<tr class="border-bottom"><td>' + popupColumns[i][j] + '</td><td class="text-right">' + propertyValue + '</td></tr>'
          rows = rows + row
        }
        var table = '<div class="p-2"><h6 class="font-weight-bold border-bottom">' + title + '</h6><table width="200">' + rows + '</table></div>'
        var tables = tables + table
      }

      new mapboxgl.Popup()
      .setLngLat(e.lngLat)
      .setHTML(tables)
      .addTo(map);
    });
});

// Change the cursor to a pointer when the mouse is over the trees layer.
map.on('mouseenter', 'parking', function () {
  map.getCanvas().style.cursor = 'pointer';
});

// Change it back to a pointer when it leaves.
map.on('mouseleave', 'parking', function () {
  map.getCanvas().style.cursor = '';
});

map.once('style.load', function(e) {
  //Hide loading bar once tiles from geojson are loaded
  map.on('data', function(e) {
    if (e.sourceId == 'parking') {
      document.getElementById("loading").style.visibility = "hidden";
    }
  })
});

function modeToggle(id) {
  // this will contain a reference to the checkbox
  if (document.getElementById(id).checked) {
      useMixSlider.noUiSlider.set([100,100,100]);
      map.setPaintProperty('parking', 'fill-color', [
        'match',
        ['get', 'Parking_Ty'],
        'surface_full', '#ea3f64',
        'surface_partial', '#f78fa6',
        'garage_full', '#4eb9fc',
        'garage_partial', '#bee1f7',
        /* other */ '#ccc'
      ]);
      map.easeTo({pitch:0})
      map.setLayoutProperty('parking-buildings', 'visibility', 'none');
      map.setPaintProperty('3d-buildings', 'fill-extrusion-opacity', .8);
  } else {
      useMixSlider.noUiSlider.set([25,50,75]);
      map.easeTo({pitch:60})
      map.setLayoutProperty('parking-buildings', 'visibility', 'visible');
      map.setPaintProperty('3d-buildings', 'fill-extrusion-opacity', 1);
  }
}

getMetrics()

// update the metrics on the DOM
function getMetrics() {

  var parkingSpots = [0]
  var numApts = [0]
  var numWorkers = [0]
  var parkArea = [0]

  for (var i in json.features) {
    if (json.features[i].properties.RandomInt < settings.useMix0) {
      parkingSpots.push(json.features[i].properties.Buildable_)
    } else if (json.features[i].properties.RandomInt < settings.useMix1) {
      parkArea.push(json.features[i].properties.Num_Apts)
    } else if (json.features[i].properties.RandomInt < settings.useMix2) {
      numApts.push(json.features[i].properties.Num_Apts)
    } else {
      numWorkers.push(json.features[i].properties.Num_Worker)
    }
  }
  $("#parkingSpots").text(nFormatter(parkingSpots.reduce(add), 1))
  $("#numApts").text(nFormatter(numApts.reduce(add), 1))
  $("#numWorkers").text(nFormatter(numWorkers.reduce(add), 2))
  $("#parkArea").text(nFormatter(parkArea.reduce(add), ))
}

function updateColors (values) {
  values.unshift('0')
  var colors = ['#c3c3c3','#83c58f','#ffec8b','#6897bb']
  var params = [
    'step',
    ['get','RandomInt'],
    'white'
  ]

  for (i=0;i<values.length;i++) {
    nextValue = parseInt(values[i+1])
    value = parseInt(values[i])
    if (value == 100) {
    } else if (value == nextValue) {
    } else if (value == 0) {
      params.push(value, colors[i])
    } else {
      params.push(value, colors[i])
    }
  }

  map.setPaintProperty('parking', 'fill-color', params);
  map.setPaintProperty('parking-buildings', 'fill-extrusion-color', params);
}

function add(accumulator, a) {
    return accumulator + a;
}

// function for formatting numbers for display on the DOM
function nFormatter(num, digits) {
  var si = [
    { value: 1, symbol: "" },
    { value: 1E3, symbol: "k" },
    { value: 1E6, symbol: "M" },
    { value: 1E9, symbol: "G" },
    { value: 1E12, symbol: "T" },
    { value: 1E15, symbol: "P" },
    { value: 1E18, symbol: "E" }
  ];
  var rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
  var i;
  for (i = si.length - 1; i > 0; i--) {
    if (num >= si[i].value) {
      break;
    }
  }
  return (num / si[i].value).toFixed(digits).replace(rx, "$1") + si[i].symbol;
}

// Use mix slider
var useMixSlider = document.getElementById('useMixSlider');

noUiSlider.create(useMixSlider, {
    start: [100, 100, 100],
    connect: [true, true, true, true],
    step: 1,
    range: {
        'min': 0,
        'max': 100
    },
    pips: {
        mode: 'positions',
        values: [0, 25, 50, 75, 100],
        density: 5
    }
});

var connect = useMixSlider.querySelectorAll('.noUi-connect');
var classes = ['c-1-color', 'c-2-color', 'c-3-color', 'c-4-color'];
var uses = ['Parking','Park', 'Residential', 'Office']

for (var i = 0; i < connect.length; i++) {
    connect[i].classList.add(classes[i]);
    connect[i].classList.add('text-center');
    connect[i].innerHTML += '<p class="slider-text font-weight-bold">' + uses[i] + '</p>'
}

useMixSlider.noUiSlider.on('update', function (values, handle) {


  var handleList = $('#useMixSlider').find('.noUi-connect');
  var previousValue = 0;

  values.push("100.00")

  for (i=0; i<4; i++) {
    var transform = 1 / handleList[i].style.transform.split('scale(')[1].split(',')[0]
    var text = handleList[i].children[0].innerHTML.split(' ')[0]
    var newText = text + ' ' + String(parseInt(values[i] - previousValue)) + '%'
    handleList[i].children[0].innerHTML = newText
    previousValue = parseInt(values[i])
    handleList[i].children[0].setAttribute("style", "transform: scale(" + transform + ", 1);")
  }

  settings.useMix0 = values[0]
  settings.useMix1 = values[1]
  settings.useMix2 = values[2]

  getMetrics()
});

useMixSlider.noUiSlider.on('set', function (values, handle) {
  updateColors(values)
  filterBuildings('parking-buildings', 'RandomInt', parseInt(values[2]));
});

// update the gradient background of the slider
function updateSliderBackground (id, colormap) {
 cmap = ''

 for (i=0; i<cmaps[colormap].length; i++) {
   cmap = cmap + ',' + cmaps[colormap][i]
 }

 gradient = 'linear-gradient(to right' + cmap + ')'

 $(id).find('.irs-line').css({background: gradient})
}

// update the gradient background of the slider
function update3ColorSliderBackground (id, from, to) {

  from_new = (((from - 50) * .99) + 50).toString()
  to_new = (((to - 50) * .99) + 50).toString()

  gradient = 'linear-gradient(to right, #83c58f 0%, #83c58f ' + from_new + '%, #ffec8b ' + from_new + '%, #ffec8b ' + to_new + '%, #6897bb ' + to_new + '%, #6897bb 100%)'

  $(id).find('.irs-line').css({background: gradient})
}

function filterBuildings(layer, column, limit) {
  map.setFilter(layer, ['>=', column, limit])
  map.setFilter(layer, ['>=', column, limit])
}

function updateMesh(layer, option) {
  var property = map.getPaintProperty(layer,'fill-color')

  currentColumn = property[2][1][1]

  var columnType = currentColumn.substr(currentColumn.indexOf('_')+1)
  var column = option + '_' + columnType

  property[2][1][1] = column
  map.setPaintProperty(layer,'fill-color', property)
}

// select attribute to display from comfort mesh
function updateColorLinear(layer, id, column, colormap, colorrange) {

  var option = settings.option + column

  var linearSteps = []

  map.setFilter(layer);


  updateSliderBackground('#' + $(id).parent().attr("id"), colormap)

  // loop through the crange and cmap arrays to get colors and values
  colorArray = [
        'interpolate',
        ['linear'],
        ['number', ['get', option]]
      ]

  linearSteps = interpolate(colorrange, cmaps[colormap].length)

  for (i=0; i < cmaps[colormap].length; i++) {
    colorArray.push(linearSteps[i])
    colorArray.push(cmaps[colormap][i])
  }

  // update the map
  map.setPaintProperty(layer, 'fill-color', colorArray);
};

// interpolate the values to meet the color steps
function interpolate (range, steps) {
  var difference = (range[1] - range[0]) / (steps - 1)
  var interpolation = []
  for (i=0; i<steps; i++) {
    interpolation.push(range[0] + difference*i)
  }
  return interpolation
}

function storyNext() {
  $("#story-" + settings.storyItem).addClass('d-none')
  settings.storyItem += 1
  $("#story-" + settings.storyItem).removeClass('d-none')
}

function checkItem(element) {
  $(element).toggleClass('btn-outline-primary btn-primary')
}
