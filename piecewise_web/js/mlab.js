/*
 * Check query string for debug param.
 * Ideally only used to toggle logging.
 */
function is_debug() {
  return (window.location.href.indexOf('?debug=') != -1);
}


/*
 * Safely log to console, maybe.
 * Some browsers don't support console.log() and
 * calling it will lead them to crash.
 */
function console_log() {
  // Bail if not debug
  if (! is_debug()) return;

  // Check for and pass (expand) our args to console.log
  'console' in window && console.log.apply(null, arguments);
}


// Objec to handle the faux checkboxes
var formWatcher = function() {
    this.classMap = [
      '.cb-usage',
      '.cb-ba'
    ];

    this.activate();
}

formWatcher.prototype = {
  activate() {
    // Build for each class
    this.classMap.forEach(function(selector) {
      // Get the dom nodes and setup vars
      var collection = document.querySelectorAll(selector),
          groupLabel = collection[0].title,
          newNode    = this.createBoxes(groupLabel, collection);

      // Iterate the collection and hide them
      collection.forEach(function(node) {
        node.parentElement.parentElement.classList.add('hidden');
      });

      var targetPosition = collection[0].parentElement.parentElement;

      // Insert the checkboxes
      targetPosition.parentNode.insertBefore(newNode, targetPosition);
    }.bind(this));
  },

  // Create the checkbox list
  createBoxes(label, nodeList) {
    var fragment  = document.createDocumentFragment(),
        container = document.createElement('div'),
        labelCont = document.createElement('div');

    container.classList.add('form-field');
    labelCont.classList.add('field-container');
    labelCont.innerText = label;
    container.append(labelCont);

    nodeList.forEach(function(node) {
      container.append(this.buildCheckbox(node));
    }.bind(this));

    fragment.append(container);
    return fragment;
  },

  // Build an individual checkbox
  buildCheckbox(element) {
    var fragment  = document.createDocumentFragment(),
        container = document.createElement('label'),
        checkbox  = document.createElement('input');

      checkbox.type = "checkbox";

    container.innerText = element.parentElement.parentElement.querySelector('.field-container').innerText;
    container.classList.add('checkbox-label');

    // Attach the event listener for state change
    checkbox.addEventListener('change', function(e) {
      if (this.checked) {
        element.querySelector('option[value="b_yes"]').selected = 'selected';
        checkbox.parentElement.classList.add('pseudo-checked'); // Update the main element
        return;
      }
      element.querySelector('option[value="c_no"]').selected = 'selected';
      checkbox.parentElement.classList.remove('pseudo-checked');
    });

    container.prepend(checkbox);
    fragment.append(container);
    checkbox.dispatchEvent(new Event('change')); // Fire an initial change event to set everything to 'no'

    return fragment;
  }
}

// purely launch workaround for #114
function getCurrentValues() {
  var currentMetricOption = $('#selectMetric option:selected').text();
  var currentYearOption = $('#selectYear option:selected').text();
  // get index
  var currentMonthOption = $('#sliderMonth').slider("value");
  // apply index to month array
  currentMonthOption = monthNames[currentMonthOption -1];
  console_log(currentMetricOption, currentYearOption, currentMonthOption);
  $('#mobile-only-text').remove();
  $('.metricControls').before('<p id="mobile-only-text">Showing <span class="metric">' + currentMetricOption + '</span> from <span class="mobiledate">' + currentMonthOption + ". " + currentYearOption + '</span></p>');
};


/**
 * Creates the map legend that will appear in the lower right corner of the map.
 *
 * @returns {object} DOM object for map legend
 */
function addLegend() {
  var legend = L.control({position: 'bottomleft'});

  legend.onAdd = function(map) {
      var div = L.DomUtil.create('div', 'info legend'),
          grades = [0, 3, 5, 10, 25];
/*
      var i;
    div.innerHTML = '';
      for ( i = grades.length - 1; i >= 0; i-- ) {
          div.innerHTML +=
              '<i style="background:' + getPolygonColor(grades[i]) +
        '"></i> ' + (i == grades.length ? '0' : grades[i]) + (grades[i - 1] ?
        '&ndash;' + grades[i - 1] + ' Mbps<br/>' : '+ Mbps<br/>');
      }
    div.innerHTML += '<i style="background: black; opacity: .50">' +
    '</i>Insufficient Data';
*/
    div.innerHTML = '<i style="background:#bc0000;"></i> 0-3 Mbps<br/>' +
        '<i style="background:#b75e00;"></i> 3-5 Mbps ' +
        '(FCC Minimum for "Broadband" UPLOAD Speed) <br/>' +
        '<i style="background:#ff8200;"></i> 5-10 Mbps<br/>' +
        '<i style="background:#ffb05e;"></i> 10-25 Mbps<br/>' +
        '<i style="background:#36BC18;"></i> ' +
        '25+ Mbps (FCC Minimum for "Broadband" DOWNLOAD Speed)<br/>'
      return div;
  };

/*
      for ( var i = 0; i < grades.length; i++ ) {
          div.innerHTML +=
              '<i style="background:' + getPolygonColor(grades[i] + 1) +
        '"></i> ' + (i == 0 ? '0' : grades[i]) + (grades[i + 1] ?
        '&ndash;' + grades[i + 1] + ' Mbps<br/>' : '+ Mbps');
      }
      return div;
*/
  legend.addTo(map);
}

/**
 * Determines the color of a polygon based on a passed metric.
 *
 * @param {number} val Metric to evaluate
 * @returns {string} A string representing the color
 */
function getPolygonColor(val) {
    return val >= 25 ? '#36BC18' :
           val >= 10  ? '#ffb05e' :
           val >= 5  ? '#ff8200' :
           val >= 3  ? '#b75e00' :
           val >= 0   ? '#bc0000' : '#bc0000';
}

/**
 * Add various map controls to the lower left corner of the map.
 *
 * @returns {object} DOM object for the controls box
 */
function addControls() {
  var controls = L.control({position: 'bottomleft'});

  controls.onAdd = function(map) {
    var controls = L.DomUtil.create('div', 'info controls'),
    labelMetric = L.DomUtil.create('span', 'mapControls', controls),
    selectMetric = L.DomUtil.create('select', 'mapControls', controls),
    labelYear = L.DomUtil.create('span', 'mapControls', controls),
    selectYear = L.DomUtil.create('select', 'mapControls', controls);

    if ( polygonType == 'hex' ) {
      var labelRes = L.DomUtil.create('span', 'mapControls', controls),
        selectRes = L.DomUtil.create('select', 'mapControls', controls);
      labelRes.innerHTML = 'Res.';
      selectRes.innerHTML = '<option value="low">Low</option>' +
        '<option value="medium">Medium</option>' +
        '<option value="high">High</option>';
      selectRes.setAttribute('id', 'selectRes');
    }

    var checkAnimate = L.DomUtil.create('div', 'mapControls', controls),sliderMonth = L.DomUtil.create('div', 'mapControls', controls),dateOptions = '';

    // Creates the Year select list
    var yearSelected;
    for ( var year in dates ) {
      yearSelected = currentYear ? 'selected="selected"' : '';
      dateOptions += '<option value="' + year + '"' + yearSelected +
        '>' + year + '</option>';
    }
    // enable/disable the animation button?
    checkAnimate.innerHTML = '';//<span id="playAnimation" class="paused"></span>';

    sliderMonth.setAttribute('id', 'sliderMonth');
    // Prevent the entire map from dragging when the slider is dragged.
    L.DomEvent.disableClickPropagation(sliderMonth);


    labelMetric.innerHTML = 'Show me';
    selectMetric.innerHTML = '<option value="download_median">' +
      'Download speeds</option><option value="upload_median">' +
      'Upload speeds</option>';
    selectMetric.setAttribute('id', 'selectMetric');
    selectMetric.setAttribute('class', 'form-control');

    labelYear.innerHTML = 'from';
    selectYear.innerHTML = dateOptions;
    selectYear.setAttribute('id', 'selectYear');
    selectYear.setAttribute('class', 'form-control');

    return controls;
  };

  controls.addTo(map);


  var metricChoices = $(".leaflet-control > span, .leaflet-control > select").slice(0,4);
  $(".leaflet-control > div.mapControls").wrapAll("<div class='sliderElements'></div>");
  metricChoices.wrapAll("<div class='metricControls'></div>");

  var elems;
  if ( polygonType != 'hex' ) {
    elems = [selectYear, selectMetric];
  } else {
    elems = [selectYear, selectMetric, selectRes];
  }
  elems.forEach( function(elem) {
    elem.addEventListener('change',
      function (e) { updateLayers(e, 'update'); });
  });

  var clearId;
  $('#playAnimation').click( function() {
    $('#playAnimation').toggleClass('paused');
    if ( $('#playAnimation').hasClass('paused') ) {
      clearInterval(clearId);
      $('.leaflet-control-layers').addClass(
        "leaflet-control-layers-expanded");
    } else {
      $('.leaflet-control-layers').removeClass(
        "leaflet-control-layers-expanded");
      var i = $('#sliderMonth').slider('value');
      clearId = setInterval( function() {
        $('#sliderMonth').slider('value', i + 1);
        i = (i + 1) % dates[$('#selectYear').val()].length;
      }, animateInterval);
    }
  });

  // Can't instantiate the slider until after "controls" is actually added to
  // the map.
  $('#sliderMonth')
    .slider({
      min: Number(dates[currentYear][0]),
      max: Number(dates[currentYear][dates[currentYear].length - 1]),
      value: currentMonth,
      change: function (e, ui) {
        updateLayers(e, 'update');
      }
    })
    .slider('pips', {
      rest: 'label',
      labels: monthNames.slice(0, dates[currentYear].length)
    });;
}

/**
 * Update the map when some event gets triggered that requires the map to
 * displays something else.
 *
 * @param {object} e Event object
 * @param {string" mode What state are we in? New or update?
 */
function updateLayers(e, mode) {
  var year = $('#selectYear').val(),
    metric = $('#selectMetric').val();

  var resolution = polygonType == 'hex' ? $('#selectRes').val() : '';

  // If the year was changed then we need to update the slider and set its
  // value to the first configured month for that year.
  if ( e.target.id == 'selectYear' ) {
    $('#sliderMonth')
      .slider('option', 'min', Number(dates[year][0]))
      .slider('option', 'max', Number(
        dates[year][dates[year].length - 1]))
      .slider().slider('pips', {
        rest: 'label',
        labels: monthNames.slice(0, dates[year].length)
      });

    // This is a really ugly hack, but we don't want the onchange event to
    // fire when changing the slider value from within the updateLayers()
    // function, else changing the slider value actually triggers the
    // updateLayers() function to run a second time.  There must be a better
    // way to do this, but for now just remove the onchange event function,
    // change the value, then re-add it.
    $('#sliderMonth').slider('option', 'change', function(){return false;});
    $('#sliderMonth').slider('value', dates[year][0]);
    $('#sliderMonth').slider('option', 'change',
      function(e, ui){ updateLayers(e, 'update')});

    if ( seedCache ) {
      seedLayerCache(year);
    }

  }

  var month = $('#sliderMonth').slider('value');

  for (var geoLayer in geoLayers) {
    setPolygonLayer(geoLayer, year, month, metric, mode, resolution);
  }

}

/**
 * Fetches layer data from the server.
 *
 * @param {string} url URL where resource can be found
 * @param {function} callback Callback to pass server response to
 */
function getLayerData(url, callback) {
  if ( geoJsonCache[url] ) {
    console_log('Using cached version of ' + url);
    callback(geoJsonCache[url]);
  } else {
    console_log('Fetching and caching ' + url);
    $.get(url, function(resp) {
      // If we're dealing with a TopoJSON file, convert it to GeoJSON
      if ('topojson' == url.split('.').pop()) {
        var geojson = {
          'type': 'FeatureCollection',
          'features': null
        };
        geojson.features = omnivore.topojson.parse(resp);
        resp = geojson;
      }

      geoJsonCache[url] = resp;
      callback(resp);
    }, 'json');
  }
  getCurrentValues();
}

/**
 * Applies a layer to the map.
 *
 * @param {string} layer Name of layer to set
 * @param {string} year Year of layer to set
 * @param {string} month Month of layer to set
 * @param {string} metric Metric to be represented in layer
 * @param {string" mode What state are we in? New or update?
 * @param {string} [resolution] For hexbinned map, granularity of hex layer
 */
function setPolygonLayer(layer, year, month, metric, mode, resolution) {
  var polygonUrl;
  var dataUrl;

  // Create the layer from the cache if this is a newly loaded page
  if ( mode == 'new' ) {
    geoLayers[layer]['layer'] = L.geoJson(JSON.parse(
      JSON.stringify(geoLayers[layer]['cache'])));
  }

  // Don't display spinner if animation is happening
  if ( $('#playAnimation').hasClass('paused') === false ) {
    $('#spinner').css('display', 'block');
  }

  // This is where we set the values for start/end ranges
  month = month < 10 ? '0' + month : month;
  curYear = $('#selectYear').val();
  s = new Date(curYear);
  e = new Date(curYear);

  if ( polygonType != 'hex' ) {
    var start = Date.UTC(curYear) / 1000;
    var end = e.setFullYear(e.getFullYear() +1) / 1000;
    dataUrl = geoLayers[layer]['dataUrl'] + start + ',' + end;
  } else {
    dataUrl = 'json/' + year + '_' + month + '-' + resolution + '.' +
      jsonType;
  }

  getLayerData(dataUrl, function(response) {
    var lookup = {};

    /*
    if (response.features.length <= 0) {
      $('.map-warning').removeClass('hidden');
    }
    */

    response.features.forEach(function(row) {
      lookup[row.properties[geoLayers[layer]['dbKey']]] = row.properties;
    });
    geoLayers[layer]['layer'].eachLayer(function(l) {
      cell = l.feature;

      var stats = lookup[cell.properties[geoLayers[layer]['geoKey']]];
      for (var k in stats) {
        if (stats.hasOwnProperty(k)) {
          cell.properties[k] = stats[k];
        }
      }

      var value = cell.properties[metric],
        polygonStyle = cell.polygonStyle = {};

      polygonStyle.weight = 1;
      polygonStyle.fillOpacity = 0.5;
      polygonStyle.boundary = 15;

      if ( ! value ) {
        polygonStyle.weight = 0.2;
        polygonStyle.fillOpacity = 0.1;
        polygonStyle.color = 'black';
        l.bindPopup(makeBlankPopup());
      } else if ( metric == 'download_median' &&
          cell.properties['download_count'] < minDataPoints ) {
        polygonStyle.weight = 0.5;
        polygonStyle.fillOpacity = 0.50;
        polygonStyle.color = 'black';
      } else if ( metric == 'upload_median' &&
          cell.properties['upload_count'] < minDataPoints ) {
        polygonStyle.weight = 0.5;
        polygonStyle.fillOpacity = 0.50;
        polygonStyle.color = 'black';
      } else {
        polygonStyle.color = getPolygonColor(value);
      }

      if ( metric == "download_median" &&
          cell.properties.download_count > 0 ) {
        l.bindPopup(makePopup(cell.properties));
      }
      if ( metric == "upload_median" &&
          cell.properties.upload_count > 0 ) {
        l.bindPopup(makePopup(cell.properties));
      }
      l.setStyle(cell['polygonStyle']);
    });

    // Add the layer controls if this is on page load, and if this
        // is the default layer we are dealing with then go ahead and add it
    // to the map.
    if ( mode == 'new' ) {
      layerCtrl.addOverlay(geoLayers[layer]['layer'], geoLayers[layer]['name']);
      if ( layer == defaultLayer ) {
        map.addLayer(geoLayers[layer]['layer']);
      }
    }

  });

  $('#spinner').css('display', 'none');
}

/**
 * Applies a scatter plot layer to the map.
 *
 * @param {string} year Year of layer to set
 * @param {string} month Month of layer to set
 * @param {string" mode What state are we in? New or update?
 */
function setPlotLayer(year, month, mode) {
    return;

  // Don't display spinner if animation is happening
  if ( $('#playAnimation').hasClass('paused') === false ) {
    $('#spinner').css('display', 'block');
  }

  month = month < 10 ? '0' + month : month;
  var plotUrl = 'json/' + year + '_' + month + '-plot.' + jsonType;

  if ( mode == 'update' ) {
    layerCtrl.removeLayer(plotLayer);
  }

  getLayerData(plotUrl, function(response) {
    if ( map.hasLayer(plotLayer) ) {
      map.removeLayer(plotLayer);
      var plotLayerVisible = true;
    }

    plotLayer = L.geoJson(response, {
      pointToLayer: function(feature, latlon) {
        return L.circleMarker(latlon, {
          radius: 1,
          fillColor: '#000000',
          fillOpacity: 1,
          stroke: false
        });
      }
    });

    layerCtrl.addOverlay(plotLayer, 'Plot layer');

    if ( plotLayerVisible ||
        (mode == 'new' && overlays['plot']['defaultOn']) ) {
      map.addLayer(plotLayer);
    }
  });

  $('#spinner').css('display', 'none');
}

/**
 * Takes a year and attempts to load the base layer date  into memory in the
 * background to speed switching between months for the current year.
 *
 * @param {string} year Year of layer to seed cache for
 */
function seedLayerCache(year) {
  var months = dates[year].slice(1),
    url;
  for ( i = 0; i < months.length; i++ ) {
    month = months[i] < 10 ? '0' + months[i] : months[i];
    if ( polygonType != 'hex' ) {
      url = 'json/' + year + '_' + month + '-' + polygonType +
        '.' + jsonType;
    } else {
      url = 'json/' + year + '_' + month + '-low.' + jsonType;
    }
    getLayerData(url, function(){ return false; });
  }
}

/**
 * Creates a popup with information about a polygon.
 *
 * @param {object} props Properties for a polygon
 * @returns {string} Textual information for the popup
 */
function makePopup(props) {
  var popup = '<p><strong>Download ('+ Math.round(props.download_count * 10) / 10 +' samples)</strong><br />'+
    ' Median: ' + Math.round(props.download_median * 10) / 10 + ' Mbps <br />' +
    ' Average: ' + Math.round(props.download_avg * 10) / 10 + ' Mbps <br />' +
    ' Maximum: ' + props.download_max + ' Mbps<br /><br />' +
    ' <strong>Upload ('+ Math.round(props.upload_count * 10) / 10 + ' samples)</strong><br />' +
    ' Median: ' + Math.round(props.upload_median * 10) / 10 + ' Mbps <br />' +
    ' Average: ' + Math.round(props.upload_avg * 10) / 10 + ' Mbps <br/>' +
    ' Maximum: ' + props.upload_max + ' Mbps<br /><br />' +
    '<strong>Average Round Trip Time:</strong> ' + Math.round(props.rtt_avg) + ' ms <br/></p>';
    console_log(props);
  return popup;
}
function makeBlankPopup() {
        var popup = "<h3 class='league-gothic'>This area doesn't have enough data yet!</h3><p>Help make our map more accurate by <a id='testSpeedEmptyPrompt' href='index.html'>running your test</a> from an address in this area!</p>";
  return popup;
}
/**
 * Run on page load to fetch and cache the geo file for a layer
 *
 * @param {string} layer The layer to fetch and cache
 */
function setupLayer(layer) {
  $.get(geoLayers[layer]['polygonFile'], function(resp) {
    var geojson = {
      'type': 'FeatureCollection',
      'features': omnivore.topojson.parse(resp)
    };

    geoLayers[layer]['cache'] = geojson;
    setPolygonLayer(layer, currentYear, currentMonth, 'download_median', 'new', 'low');

    if ( seedCache ) {
      seedLayerCache(currentYear);
    }
  }, 'json');
}

function closeAllTheThings() {
  $('#sidebar').removeClass('extended');
  $('#icons img').removeClass('selected');
  $('#ndt, #ndt-results, #about-ndt').hide();
  $('#ndt, #ndt-results, #extra-data, #about-ndt').hide();
}



function showHideControls() {
  $('.leaflet-bottom.leaflet-left, #sidebar, #approx-loc').toggle();
  if ($('#header').hasClass('initial')) {
    $('.leaflet-bottom.leaflet-right').hide();
  } else if ($(document).width() > 700) {
    $('#layers-box, .leaflet-bottom.leaflet-right').show();
    $('.leaflet-top.leaflet-left').show();
  }
}

function showTestingPanel() {
  // are there results yet?
  var results = document.getElementById('s2cRate');
  var resultsReceived = results.textContent;
  if ($('#test-icon').hasClass('selected')) {
    closeAllTheThings();
  }
  else {
    $('#icons img').removeClass('selected');
    $('#test-icon').addClass('selected');
    $('#sidebar').addClass('extended');
    $('#about-ndt').hide();
    if (resultsReceived !== "?") {
      $('#ndt-div').show();
      $('#ndt-results').show();
      $('#extra-data').show();
    }
    else {
      $('#ndt').show();
    }
  }

  $('#mobile-container').hide();
  if ($(document).width() < 700) {
    $('.metricControls, .sliderElements, .leaflet-control-layers').hide();
  }

}

/* New functions */
function runTest() {
  // Accessibility: DOM order is wonky, move focus above test
  // before we hide things and can't, and so tab order feels normal.
  $('#extra-data input').first().focus()

  $('#ndt-div').removeClass('hidden');
  $('.logos').addClass('hidden');
  $('.about').addClass('hidden');
  $('#ndt-div').addClass('visible');
  $('#extra-data').removeClass('visible');
  $('#extra-data').addClass('hidden');
  $('#approx-loc').removeClass('hidden');
  $('#approx-loc').addClass('visible');
  $('#ndt-results').removeClass('hidden');
  $('#ndt-results').addClass('visible');
  $('#intro').addClass('hidden');
  $('#icons').addClass('hidden');
  $('#header').removeClass('initial');
  $('#header').addClass('hidden');

  let test_container_offset = $('#test-container').offset();
  window.scrollTo(test_container_offset.left, test_container_offset.top);
}
function showMap() {
  $('#icons img').removeClass('selected');
  $('#header').removeClass('initial');
  $('#welcome-container, #header, #intro, #sidebar, #approx-loc, #ndt-div, #ndt-results, #extra-data, #about-ndt, #thankyou').addClass('hidden');
  $('#mapview-icons, #desktop-legend, .info.legend.leaflet-control, .info.controls.leaflet-control, .leaflet-top.leaflet-left, .leaflet-top.leaflet-right, .leaflet-bottom.leaflet-left').removeClass('hidden');
  $('#mapview-icons, #desktop-legend, .info.legend.leaflet-control,  .info.controls.leaflet-control, .leaflet-top.leaflet-left, .leaflet-top.leaflet-right, .leaflet-bottom.leaflet-left').addClass('visible');
  $('#mobile-container').addClass('hidden');
  if ($(document).width() < 700) {
    $('.leaflet-control-layers').addClass('hidden');
  }
  $('#layers-box').show();
  $('.leaflet-top.leaflet-left, .leaflet-top.leaflet-right').show();
  // for #114
  getCurrentValues();

}
function showSocialShare() {
  $('#socialshare').removeClass('hidden');
  $('#socialshare').addClass('visible');
}

$( window ).resize(function() {
  if ($('#header').hasClass('initial')) {
    return;
  }
  else if (($(document).width() > 501)) {
    $('.metricControls, .sliderElements, .leaflet-top.leaflet-left').show();
  }
  else if (($(document).width() < 500)) {
    $('.metricControls, .sliderElements, .leaflet-top.leaflet-left').hide();
  }

});

$(function() {
/* Sets initial status on load for various divs */
  $('#testSpeed, #approx-loc, #ndt-div, #ndt-results, #desktop-legend, .info.legend.leaflet-control, .leaflet-bottom.leaflet-left, .info.controls.leaflet-control, #mapview-icons, .leaflet-top.leaflet-left, .leaflet-top.leaflet-right, .leaflet-control-layers').addClass('hidden');
  $('#container-test_loc').addClass('displayed');
  $('#container-service_at_home, #container-no_serv_reason, #container-household_num, #container-household_type, #container-household_type_other, #container-isp_user, #container-service_type, #container-download_speed, #container-other_download, #container-upload_speed, #container-other_upload, #container-service_cost').addClass('hidden');
  //$('.leaflet-top.leaflet-right').attr('id','layers-box');
  $('#header').addClass('initial');

/* mobile bits */
  var mobileContainer = '<div id="mobile-container"></div>';
  $('#map').append(mobileContainer);
  var mobileMenuExtra = '<div id="mobile-menu">&equiv;</div>';
  $('.info.controls.leaflet-control').append(mobileMenuExtra);
/*mobile bits */

/* copying the mapbox legend into the mobile container to override placement for mobile devices */
  var attribution = $('div.leaflet-control-attribution.leaflet-control');
  $('div.info.legend.leaflet-control').append(attribution);
  $('div.info.legend.leaflet-control').clone().appendTo('#mobile-container');
  $('div.info.legend.leaflet-control').first().attr('id', 'desktop-legend');
/* copying the mapbox legend into the mobile container */

  /* reset the display to initial desired state
  closeAllTheThings();*/

  $('#mobile-menu').click(function() {
    closeAllTheThings();
    $('#mobile-container, .sliderElements, .metricControls, #desktop-legend, .leaflet-control-layers').toggle();
  });
/*
  $('#exploreMap').click(function() {
    showHideControls();
    $('#header').addClass('hidden');
    $('#layers-box').show();
    $('.leaflet-top.leaflet-left, .leaflet-top.leaflet-right').show();
    $('#testSpeed, #exploreMap').toggle();
  });
  $('#testSpeed').click(function() {
    showHideControls();
    showTestingPanel();
    $('#header').addClass('hidden');
    $('#layers-box').show();
    $('.leaflet-top.leaflet-left').show();
    $('#testSpeed, #exploreMap').toggle();
  });
    $('#testSpeedEmptyPrompt').click(function() {
      $('#header').removeClass('initial');
      showHideControls();
      showTestingPanel();
      $('#testSpeed, #exploreMap').toggle();
   });
*/
  // $('#isp_user, #connection_type, #cost_of_service, #data_acknowledgement').change(function() {
  //   var formState = validateExtraDataForm();
  //   $('#take-test').toggle(formState);
  // });
});

function uncheckAcknowledgement(){
  $('#data_acknowledgement').attr("checked", false);
}


function submitExtraData() {
  var formData = $('#collector').serialize();

  $.ajax({
    method: 'GET',
    url: $('#collector').attr('action'),
    data: formData,
    statusCode: {
      201: function() {
        console_log('Data submitted successfully.');
      }
    },
    error: function(jqXHR, status, msg) {
      console_log('Something went wrong: ' + status + ' ' + msg);
    }
  });
}

function validateExtraDataForm() {
  if ( $('#isp_user option:selected').val() == 'default' ) {
    return false;
  } else if ( $('#isp_user option:selected').val() == 'other' ) {
    $('#isp_user_text').toggle(true);
  } else {
    $('#isp_user_text').toggle(false);
  }
  if ( $('#connection_type option:selected').val() == 'default' ) {
    return false;
  }
  if ( $('#cost_of_service option:selected').val() == 'default' ) {
    return false;
  }
  if ( ! $('#data_acknowledgement').is(':checked') ) {
    return false;
  }
  return true;
}

$( document ).ready(function() {

  let consent = document.getElementById('data_acknowledgement');
  let takeTest = document.getElementById('take-test');

  takeTest.setAttribute('onclick', '');
  takeTest.disabled = true;

  consent.addEventListener('change', function() {
    if (consent.checked) {
      takeTest.setAttribute('onclick', 'runTest()');
      takeTest.disabled = false;
      return;
    }

    takeTest.disabled = true;
  });

  // Reload page link from map warning
  $('.map-warning__reload').click(function(evt) {
    window.location.reload();
    evt.preventDefault();
  });

  // Use geolocation to fence autocomplete (see google-places.js)
  $('#survey_address_line_1_id').on('focus', geolocate());

  let participant_id = window.location.pathname.split('/')[1];
  if (participant_id !== "") {
    $('#survey_participant_id').val(participant_id);
    $('#container-survey_participant_id').hide();

    var $survey_link = $('a#unserved-survey');
    var url = new URL($survey_link.attr('href'));;
    url.searchParams.append("pid", participant_id);
    $survey_link.attr('href', url.toString());
  }

  $('#container-survey_user_agent').hide();
  $('#survey_user_agent').val(navigator.userAgent);

  $('input[name="survey_autocomplete"]').parent().append(
    $('<span />', {
      class: 'help-block',
      text: 'Providing your exact street address will help improve the accuracy of the data. Per our privacy policy, any information will be treated confidentially.'
    })
  );
});
