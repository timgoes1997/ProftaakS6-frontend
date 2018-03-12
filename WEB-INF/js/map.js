
//map.js
var map;        //Will contain map object.
var markers = [];

// mapped car objects
var cars = []; 

// settings
var useRealtime = false;
var start = new Date();
var end = new Date();

////////// TRACK FUNCTIONS
function addCar() {
    var f = $('owner').value;
    if (hasCar(f)) return;

    // todo:
    // regex for matching license plates

    if (f != '') {
        updateCar(f);
    }
}
function mapCar(car) {
    var f = car.licenseplate;

    // Add to array
    cars.push(car);

    car.lines = [];
    car.marker = null;
    var e2 = null;

    // draw route and place marker
    funcOnArr(car.locations, function(e) {
        if (e2) {
            car.lines.push(drawBetweenPoints(e, e2));
        }
        e2 = e;
        if (e.lastElement) {
            car.marker = setMarker(f, e);
        }
    });

    // Make visible and removable
    var d = document.createElement('div');
    d.id = f;
    addClass(d, 'entity input');
    var container = document.createElement('div');
    container.innerHTML = f;
    var remove = document.createElement('p');
    remove.innerHTML =  'x';
    d.appendChild(container);
    d.appendChild(remove);

    remove.onclick = function() {removeCar(d.id)};

    $('cars').appendChild(d);
}
function funcOnArr(arr, callback) {
    for (var i = 0; i < arr.length; i++) {
        var e = arr[i];
        e.lastElement = i === arr.length - 1;
        callback(e);
    }
    return false;
}
function funcOnCar(id, func) {
    for (var i = 0; i < cars.length; i++) {
        var car = cars[i];
        if (car.licenseplate === id)
            return func(car);
    }
    return false;
}
function hasCar(id) {
    return funcOnCar(id, function() {return true;});
}
function removeCar(id) {
    var car = funcOnCar(id, function(e) {return e;});
    if (car) {
        funcOnArr(car.lines, function(e) {
            // remove lines
            e.setMap(null);
        });
        // remove marker
        car.marker.setMap(null);

        removeFromArray(cars, car);
        removeElement($(id));
    }
}
function updateCar(id) {
    // check if values are alright
    if (start && end || useRealtime) {
        // call API
        call('get', API_PATH + 'location/' + id, null, function(e, success) {
            if (success) {
                mapCar(e);
            } else {
                // show popup with error details
                notify("Could not load location", "error", 2500);
            }
        });
    }
    // do nothing
}



////////// OPTION FUNCTIONS
function setRealtime() {
    useRealtime = $('realtime').checked;

    $('starttime').disabled = useRealtime;
    $('endtime').disabled = useRealtime;
}
function setStartTime() {
    start = $('starttime').value;
}
function setEndTime() {
    end = $('starttime').value;
}

////////// LOCATION FUNCTIONS
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
    return line;
}

////////// INITIALISER FUNCTIONS
function initMap() {
    definePopupClass();
    setRealtime();

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