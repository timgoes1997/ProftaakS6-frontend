
//map.js

var map;        //Will contain map object.
var markers = [];

function initMap() {
    definePopupClass();

    //The center location of our map.
    var centerOfMap = new google.maps.LatLng(50.872289, 10.380447);

    //Map options.
    var options = {
        center: centerOfMap, //Set center.
        zoom: 7 //The zoom value.
    };

    //Create the map object.
    map = new google.maps.Map(document.getElementById('map'), options);
}

google.maps.event.addDomListener(window, 'load', initMap);

// sets the marker to a location
function setMarker(id, pos) {
    var latLng = new google.maps.LatLng(pos.lat, pos.lng)

    var marker;
    for (var i = 0; i < markers.length; i++)
    {
        var m = markers[i];
        if (m.id === id) {
            marker = m.marker;
            marker.onUpdate(latLng);
            return;
        }
    }
    marker = new Popup(latLng, id);
    marker.setMap(map);
    
    markers.push({
        'marker' : marker,
        'id' : id
    });
    marker.onUpdate(latLng);
}

// requres {long, lat} x2
function drawBetweenPoints(pos1, pos2) {
    var line = new google.maps.Polyline({
        path: [new google.maps.LatLng(pos1.lat, pos1.lng), new google.maps.LatLng(pos2.lat, pos2.lng)],
        strokeColor: "#FF0000",
        strokeOpacity: 1.0,
        strokeWeight: 2.5,
        geodesic: true,
        map: map
    });
}



function definePopupClass() {
    /**
     * A customized popup on the map.
     * @param {!google.maps.LatLng} position
     * @param {!Element} content
     * @constructor
     * @extends {google.maps.OverlayView}
     */
    Popup = function(position, text) {
      this.position = position;

      var content = document.createElement('div');
      content.innerHTML = text;

      content.classList.add('popup-bubble-content');
  
      var pixelOffset = document.createElement('div');
      pixelOffset.classList.add('popup-bubble-anchor');
      pixelOffset.appendChild(content);
  
      this.anchor = document.createElement('div');
      this.anchor.classList.add('popup-tip-anchor');
      this.anchor.appendChild(pixelOffset);
  
      // Optionally stop clicks, etc., from bubbling up to the map.
      this.stopEventPropagation();
    };
    // NOTE: google.maps.OverlayView is only defined once the Maps API has
    // loaded. That is why Popup is defined inside initMap().
    Popup.prototype = Object.create(google.maps.OverlayView.prototype);
  
    /** Called when the popup is added to the map. */
    Popup.prototype.onAdd = function() {
      this.getPanes().floatPane.appendChild(this.anchor);
    };
  
    /** Called when the popup is removed from the map. */
    Popup.prototype.onRemove = function() {
      if (this.anchor.parentElement) {
        this.anchor.parentElement.removeChild(this.anchor);
      }
    };
    
    /** Called when the popup is removed from the map. */
    Popup.prototype.onUpdate = function(latLng) {
        this.onRemove();
        this.position = latLng;
        this.onAdd();
      };
  
    /** Called when the popup needs to draw itself. */
    Popup.prototype.draw = function() {
      var divPosition = this.getProjection().fromLatLngToDivPixel(this.position);
      // Hide the popup when it is far out of view.
      var display =
          Math.abs(divPosition.x) < 4000 && Math.abs(divPosition.y) < 4000 ?
          'block' :
          'none';
  
      if (display === 'block') {
        this.anchor.style.left = divPosition.x + 'px';
        this.anchor.style.top = divPosition.y + 'px';
      }
      if (this.anchor.style.display !== display) {
        this.anchor.style.display = display;
      }
    };
  
    /** Stops clicks/drags from bubbling up to the map. */
    Popup.prototype.stopEventPropagation = function() {
      var anchor = this.anchor;
      anchor.style.cursor = 'auto';
  
      ['click', 'dblclick', 'contextmenu', 'wheel', 'mousedown', 'touchstart',
       'pointerdown']
          .forEach(function(event) {
            anchor.addEventListener(event, function(e) {
              e.stopPropagation();
            });
          });
    };
  }