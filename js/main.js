var settings = {
  'percent_reused': 100,
  'useMix1': 33,
  'useMix2': 66,
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

var columnTitles = {
  'options': {
    'kpf':'Competition Proposal',
    '100acre':'100 Acre',
    '100acrePDA':'100 Acre per PDA',
    'ch91':'Chapter 91',
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
    style: 'mapbox://styles/dcharvey/cjbpm8opy70gz2rskhcwuwz4r',
    center: [-73.970764,40.768106],
    zoom: 12,
    pitch: 60,
    bearing: -30
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
          'fill-extrusion-opacity': 1
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
      'type': 'fill-extrusion',
      'source': {
        'type': 'geojson',
        'data': json
      },
      'layout': {
        'visibility': 'visible'
      },
      'paint': {
        'fill-extrusion-color': [
          'match',
          ['get', 'Parking_Ty'],
          'surface_full', '#ea3f64',
          'surface_partial', '#f78fa6',
          'garage_full', '#4eb9fc',
          'garage_partial', '#bee1f7',
          /* other */ '#ccc'
        ],
        'fill-extrusion-height': ["get", "Height"],
        'fill-extrusion-opacity': 1
      }
    }, labelLayerId);

});

// When a click event occurs on a feature in the trees layer, open a popup at the
// location of the feature, with description HTML from its properties.
map.on('click', 'trees', function (e) {
  var coordinates = e.features[0].geometry.coordinates.slice();
  var name = e.features[0].properties.name;
  var address = e.features[0].properties.address;
  var type = e.features[0].properties.type_;

  // Ensure that if the map is zoomed out such that multiple
  // copies of the feature are visible, the popup appears
  // over the copy being pointed to.
  while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
    coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
  }

  new mapboxgl.Popup()
  .setLngLat(coordinates)
  .setHTML('<strong>' + name + '</strong></br>' + address + '</br>' + type)
  .addTo(map);
});

// Change the cursor to a pointer when the mouse is over the trees layer.
map.on('mouseenter', 'trees', function () {
  map.getCanvas().style.cursor = 'pointer';
});

// Change it back to a pointer when it leaves.
map.on('mouseleave', 'trees', function () {
  map.getCanvas().style.cursor = '';
});

var storyList = [
  {
    'title':'Chapter 91 Shadows Impacts',
    'text':"Click start to see the impacts from shadows for each of 4 schemes.",
    'option':'kpf',
    'mapOptions': {
      'center':[-73.970764,40.768106],
      'zoom':12,
      'pitch':60,
      'bearing':-30,
      'speed':.3
    },
    'mapbox':{
      'visible':[],
      'hidden':['trees','comfort','parcels','existing_shadows']
    }
  },
  {
    'title':'Urban Shadows',
    'text':"We calculated all of the shadows in the neighorhood surrounding the Fort Point Channel.",
    'option':'none',
    'mapOptions': {
      'center':[-73.970764,40.768106],
      'zoom':11.5,
      'pitch':0,
      'bearing':-61,
      'speed':.3
    },
    'mapbox':{
      'visible':['existing_shadows'],
      'hidden':['trees','ch91_shadows','ch91_one_hour','kpf_parks','kpf_shadows','kpf_one_hour','kpf_new_one_hour_land','kpf_new_one_hour_water','100acre_shadows','100acre_one_hour','100acre_new_one_hour_land','100acre_new_one_hour_water','100acrePDA_shadows','100acrePDA_one_hour','100acrePDA_new_one_hour_land','100acrePDA_new_one_hour_water','kpf_reduced_one_hour','100acre_reduced_one_hour','100acrePDA_reduced_one_hour','comfort','parcels']
    }
  },
  {
    'title':'Chapter 91 Massing',
    'text':"Then we added the impact of new shadows from buildings that meet the Chapter 91 requirements.",
    'option':'ch91',
    'mapOptions': {
      'center':[-73.970764,40.768106],
      'zoom':16,
      'pitch':0,
      'bearing':119,
      'speed':.3
    },
    'mapbox':{
      'visible':['existing_shadows'],
      'hidden':['trees','comfort','parcels']
    }
  },
  {
    'title':'Chapter 91 Massing',
    'text':"Chapter 91 defines a massing in which does not cast any shadows on the water for more than a continuous hour between 9am and 5pm. The shaded blue shadows are for each hour of the day. The blue line shows the where shadows are cast that are of 1 hour in duration or longer.",
    'option':'ch91',
    'mapOptions': {
      'center':[-73.970764,40.768106],
      'zoom':17,
      'pitch':60,
      'bearing':150,
      'speed':.3
    },
    'mapbox':{
      'visible':[],
      'hidden':['trees','comfort','parcels','existing_shadows']
    }
  },
  {
    'title':'MHP Approved Massing',
    'text':"This alternative massing shows the full extent of shadow that is permitted per the PDA, assuming Parcel G4 was fully extruded to the height permitted by the PDA. The are some shadows being cast on the water. The color red shows that additional shadows created that exceed the Chapter 91 Massing. The massing creates 81,710 SF of new shadow requiring 40,855 SF of offset (28,895 Provided).",
    'option':'100acrePDA',
    'mapOptions': {
      'center':[-73.970764,40.768106],
      'zoom':17,
      'pitch':60,
      'bearing':150,
      'speed':.3
    },
    'mapbox':{
      'visible':[],
      'hidden':['trees','comfort','parcels']
    }
  },
  {
    'title':'Competition Proposal',
    'text':"This alternative massing shows the competition scheme presented to Gillette. The are some shadows being cast on the water. The color red shows that additional shadows created that exceed the Chapter 91 Massing. The massing creates 92,093 SF of new shadow requiring 46,046.5 SF of offset (38,642 Provided).",
    'option':'kpf',
    'mapOptions': {
      'center':[-73.970764,40.768106],
      'zoom':17,
      'pitch':60,
      'bearing':150,
      'speed':.3
    },
    'mapbox':{
      'visible':[],
      'hidden':['trees','comfort','parcels']
    }
  }
]

function storySelect(storyNumber) {

  if (storyList[storyNumber].option != 'none') {
    // update option
    selectOption(storyList[storyNumber].option)
    // udpate option title
    $("#options-dropdown").text(columnTitles.options[storyList[storyNumber].option]);
  } else {
    $("#options-dropdown").text('Existing');
  }

  var mapbox = storyList[storyNumber].mapbox
  var fill = storyList[storyNumber].fillSettings

  // fly to here
  map.flyTo(storyList[storyNumber].mapOptions)

  // update text
  $("#story-title").text(storyList[storyNumber].title)
  $("#story-text").text(storyList[storyNumber].text)

  // show mapbox layers
  for (i=0; i < mapbox.visible.length; i++) {
    map.setLayoutProperty(mapbox.visible[i], 'visibility', 'visible');
  }

  // hide mapbox layers
  for (i=0; i < mapbox.hidden.length; i++) {
    map.setLayoutProperty(mapbox.hidden[i], 'visibility', 'none');
  }

  // udpate comfort title
  $("#" + fill.layer + "-dropdown").text(columnTitles[fill.layer][fill.column]);

  // update comfort map
  updateColorLinear(fill.layer, fill.id, fill.column, fill.cmap, fill.crange)
  map.setFilter(fill.layer, ['all',['<=', fill.column, fill.to],['>=', fill.column, fill.from]])
}

function getMetrics() {

  var parkingSpots = [0]
  var numApts = [0]
  var numWorkers = [0]
  var parkArea = [0]

  console.log(1 - (settings.percent_reused / 100))
  console.log(settings.useMix1)
  console.log(settings.useMix2)

  for (var i in json.features) {
    if (json.features[i].properties.Leftover_P <= (1 - (settings.percent_reused / 100))) {
      parkingSpots.push(json.features[i].properties.Parking_Sp)
    } else {
      if (json.features[i].properties.RandomInt < settings.useMix1) {
        parkArea.push(json.features[i].properties.Buildable_)
      } else if (json.features[i].properties.RandomInt < settings.useMix2) {
        numApts.push(json.features[i].properties.Num_Apts)
      } else {
        numWorkers.push(json.features[i].properties.Num_Worker)
      }
    }
  }
  $("#parkingSpots").text(nFormatter(parkingSpots.reduce(add), 1))
  $("#numApts").text(nFormatter(numApts.reduce(add), 1))
  $("#numWorkers").text(nFormatter(numWorkers.reduce(add), 2))
  $("#parkArea").text(nFormatter(parkArea.reduce(add), ) + ' sf')
}

function add(accumulator, a) {
    return accumulator + a;
}

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

// Start story
$(function(){
  $("#start-button").click(function(e){

    settings.storyItem = settings.storyItem + 1

    // button visibility
    $("#start-button").css({ display: "none" });
    $("#next-button").css({ display: "block" });
    $("#previous-button").css({ display: "block" });
    storySelect(settings.storyItem)
  });
});

// Next story
$(function(){
  $("#next-button").click(function(e){
    if (settings.storyItem < 5) {
      settings.storyItem = settings.storyItem + 1
    } else {
      settings.storyItem = 0
      $("#start-button").css({ display: "block" });
      $("#next-button").css({ display: "none" });
      $("#previous-button").css({ display: "none" });
    }

    storySelect(settings.storyItem)
  });
});

// Previous story
$(function(){
  $("#previous-button").click(function(e){
    settings.storyItem = settings.storyItem - 1

    if (settings.storyItem == 0) {
      $("#start-button").css({ display: "block" });
      $("#next-button").css({ display: "none" });
      $("#previous-button").css({ display: "none" });
    }

    storySelect(settings.storyItem)
  });
});

// range slider for comfort
var reuseSlider = $("#irs-reuse")
reuseSlider.ionRangeSlider({
   grid: true,
   min: 0,
   max: 100,
   from: 100,
   postfix: "%",
   onFinish: function (data) {
     settings.percent_reused = data.from
     map.setFilter('parking', ['>=', 'Leftover_P', 1 - (data.from / 100)]);
     getMetrics()
   }
});
updateSliderBackground('#reuseSlider','pinks')

// range slider for comfort
var parkSlider = $("#irs-park")
parkSlider.ionRangeSlider({
   type: 'double',
   grid: true,
   min: 0,
   max: 100,
   from: 33,
   to: 66,
   postfix: "%",
   onFinish: function (data) {
     settings.useMix1 = data.from
     settings.useMix2 = data.to
     'parking', ['all',['>=', 'RandomInt', data.from],['<=', 'RandomInt', data.to]]
     getMetrics()
     update3ColorSliderBackground ("#parkSlider", data.from, data.to)
   }
});
update3ColorSliderBackground("#parkSlider", 33, 66)

// range slider for height
var heightSlider = $("#irs-height")
heightSlider.ionRangeSlider({
   grid: false,
   min: 0,
   max: 100,
   from: 100,
   postfix: "%",
   onFinish: function (data) {
     updateHeight('parking', 'Height', data.from / 100)
   }
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

// update the radius of circle layers
function updateHeight(layer, column, multiplier) {
  map.setPaintProperty(layer, 'fill-extrusion-height', ['*', ["get", column], multiplier]);
}

function selectOption(option) {
  settings.option = option

  if (option == 'ch91') {

    if ($('#new-shadow-button').hasClass('visible')) {
      map.setLayoutProperty(option + '_shadows', 'visibility', 'visible');
    }

    if ($('#one-hour-button').hasClass('visible')) {
      map.setLayoutProperty(option + '_one_hour', 'visibility', 'visible');
    }

    $('#new-one-hour-button').addClass('disabled');

    for (var i=0; i<settings.options.length;i++) {
      map.setLayoutProperty(settings.options[i] + '_shadows', 'visibility', 'none');
    }
  } else {

    map.setLayoutProperty('ch91_shadows', 'visibility', 'none');
    map.setLayoutProperty('ch91_one_hour', 'visibility', 'none');

    if ($('#new-shadow-button').hasClass('visible')) {
      map.setLayoutProperty(option + '_shadows', 'visibility', 'visible');
    }

    if ($('#one-hour-button').hasClass('visible')) {
      map.setLayoutProperty(option + '_one_hour', 'visibility', 'visible');
    }

    if ($('#new-one-hour-button').hasClass('visible')) {
      map.setLayoutProperty(option + '_new_one_hour_land', 'visibility', 'visible');
      map.setLayoutProperty(option + '_new_one_hour_water', 'visibility', 'visible');
    }

    if ($('#reduced-one-hour-button').hasClass('visible')) {
      map.setLayoutProperty(option + '_reduced_one_hour', 'visibility', 'visible');
      // map.setLayoutProperty(option + '_reduced_one_hour_future', 'visibility', 'visible');
    }

    $('#new-one-hour-button').removeClass('disabled');
    $('#reduced-one-hour-button').removeClass('disabled');

    for (var i=0; i<settings.options.length;i++) {
      if (settings.options[i] != option) {
        map.setLayoutProperty(settings.options[i] + '_shadows', 'visibility', 'none');
      }
    }
  }
  $(".gfa1").text(settings.optionsData[option].gfa1);

  map.setLayoutProperty(option + '_parks', 'visibility', 'visible');

  updateMesh('comfort',option)
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

  // update the slider bounds
  $(id).data("ionRangeSlider").update({
    min: colorrange[0],
    max: colorrange[1],
    from: colorrange[0],
    to: colorrange[1]
  });

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

// toggle mapbox layer
$(function(){
  $("#reduced-one-hour-button").click(function(e){
      var clickedLayer1 = settings.option + '_reduced_one_hour';
      // var clickedLayer2 = settings.option + '_reduced_one_hour_future';
      e.preventDefault();
      e.stopPropagation();

      var visibility = map.getLayoutProperty(clickedLayer1, 'visibility');
      // var visibility = map.getLayoutProperty(clickedLayer2, 'visibility');

      if (visibility === 'visible') {
          map.setLayoutProperty(clickedLayer1, 'visibility', 'none');
          // map.setLayoutProperty(clickedLayer2, 'visibility', 'none');
          $(this).toggleClass('btn-info btn-outline-info');
          $(this).toggleClass('visible hidden');
      } else {
          map.setLayoutProperty(clickedLayer1, 'visibility', 'visible');
          // map.setLayoutProperty(clickedLayer2, 'visibility', 'visible');
          $(this).toggleClass('btn-outline-info btn-info');
          $(this).toggleClass('hidden visible');
      }
  });
});

// toggle building metrics button
$(function(){
  $("#surface-full-button").click(function(){
    if ($(this).hasClass('visible')) {
      $(this).toggleClass('btn-danger btn-outline-danger');
      $(this).removeClass('visible');

      for (var i=0; i<settings.layers_visible.length; i++) {
        if (settings.layers_visible[i] == 'surface_full') {
          settings.layers_visible.splice(i, 1)
        }
      }

      filter = ['match', ['get', 'Parking_Ty'], settings.layers_visible, true, false]
      map.setFilter('parking', filter);

    } else {
      $(this).toggleClass('btn-outline-danger btn-danger');
      $(this).addClass('visible');

      settings.layers_visible.push('surface_full')

      filter = ['match', ['get', 'Parking_Ty'], settings.layers_visible, true, false]
      map.setFilter('parking', filter);
    }
  });
});

// toggle building metrics button
$(function(){
  $("#surface-partial-button").click(function(){
    if ($(this).hasClass('visible')) {
      $(this).toggleClass('btn-secondary btn-outline-secondary');
      $(this).removeClass('visible');

      for (var i=0; i<settings.layers_visible.length; i++) {
        if (settings.layers_visible[i] == 'surface_partial') {
          settings.layers_visible.splice(i, 1)
        }
      }

      filter = ['match', ['get', 'Parking_Ty'], settings.layers_visible, true, false]
      map.setFilter('parking', filter);
    } else {
      $(this).toggleClass('btn-outline-secondary btn-secondary');
      $(this).addClass('visible');

      settings.layers_visible.push('surface_partial')

      filter = ['match', ['get', 'Parking_Ty'], settings.layers_visible, true, false]
      map.setFilter('parking', filter);
    }
  });
});

// toggle building metrics button
$(function(){
  $("#garage-full-button").click(function(){
    if ($(this).hasClass('visible')) {
      $(this).toggleClass('btn-primary btn-outline-primary');
      $(this).removeClass('visible');

      for (var i=0; i<settings.layers_visible.length; i++) {
        if (settings.layers_visible[i] == 'garage_full') {
          settings.layers_visible.splice(i, 1)
        }
      }

      filter = ['match', ['get', 'Parking_Ty'], settings.layers_visible, true, false]
      map.setFilter('parking', filter);
    } else {
      $(this).toggleClass('btn-outline-primary btn-primary');
      $(this).addClass('visible');

      settings.layers_visible.push('garage_full')

      filter = ['match', ['get', 'Parking_Ty'], settings.layers_visible, true, false]
      map.setFilter('parking', filter);
    }
  });
});

// toggle building metrics button
$(function(){
  $("#garage-partial-button").click(function(){
    if ($(this).hasClass('visible')) {
      $(this).toggleClass('btn-info btn-outline-info');
      $(this).removeClass('visible');

      for (var i=0; i<settings.layers_visible.length; i++) {
        if (settings.layers_visible[i] == 'garage_partial') {
          settings.layers_visible.splice(i, 1)
        }
      }

      filter = ['match', ['get', 'Parking_Ty'], settings.layers_visible, true, false]
      map.setFilter('parking', filter);
    } else {
      $(this).toggleClass('btn-outline-info btn-info');
      $(this).addClass('visible');

      settings.layers_visible.push('garage_partial')

      filter = ['match', ['get', 'Parking_Ty'], settings.layers_visible, true, false]
      map.setFilter('parking', filter);
    }
  });
});

function updateDropdown(button) {
  $(button).parent().siblings(".dropdown-toggle").text($(button).text());
}
