/**
 * Based on Place Autocomplete Address Form:
 * https://developers.google.com/maps/documentation/javascript/examples/places-autocomplete-addressform
 *
 * Fields (components) information:
 * https://developers.google.com/maps/documentation/javascript/geocoding#GeocodingAddressTypes
 */

var placeSearch, autocomplete;


// Form field IDs, with components to use/concat.
var autocompleteFields = {
  'survey_address_line_1_id': [
    {'street_number': 'short_name'},
    ' ',
    {'route': 'long_name'}
  ],
  'survey_address_line_2_id': [],
  'survey_city_id': [
    {'locality': 'long_name'}
  ],
  'survey_state_id': [
    {'administrative_area_level_1': 'short_name'}
  ],
  'survey_zip_id': [
    {'postal_code': 'short_name'}
  ]
};


function initAutocomplete() {
  // Create the autocomplete object, restricting the search predictions to
  // geographical location types. Use first form field as anchor.
  autocomplete = new google.maps.places.Autocomplete(
    document.getElementById(Object.keys(autocompleteFields)[0]),
    {types: ['geocode']}
  );

  // Avoid paying for data that you don't need by restricting the set of
  // place fields that are returned to just the address components.
  autocomplete.setFields(['address_component']);

  // When the user selects an address from the drop-down, populate the
  // address fields in the form.
  autocomplete.addListener('place_changed', fillInAddress);
}


function fillInAddress() {
  var components = {};

  // Get the place details from the autocomplete object.
  var place = autocomplete.getPlace();

  // Flip data around for easier use
  for (var i = 0; i < place.address_components.length; i++) {
    for (var j = 0; j < place.address_components[i].types.length; j++) {
      components[place.address_components[i].types[j]] = {
        'long_name': place.address_components[i]['long_name'],
        'short_name': place.address_components[i]['short_name']
      };
    }
  }

  for (var field_id in autocompleteFields) {
    var field = document.getElementById(field_id);

    // Empty/enable fields
    field.value = '';
    field.disabled = false;

    // Build value from components (allows empty/none)
    var field_value = '';

    for (var i = 0; i < autocompleteFields[field_id].length; i++) {
      var field_component = autocompleteFields[field_id][i];

      if (typeof(field_component) === 'string') {
        field_value += field_component;
      } else {
        var component_key = Object.keys(field_component)[0];
        var component_type = field_component[component_key];
        field_value += components[component_key][component_type];
      }
    }

    field.value = field_value;
  }
}


// Bias the autocomplete object to the user's geographical location,
// as supplied by the browser's 'navigator.geolocation' object.
function geolocate() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function (position) {
      var geolocation = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };
      var circle = new google.maps.Circle(
        { center: geolocation, radius: position.coords.accuracy });
      autocomplete.setBounds(circle.getBounds());
    });
  }
}
