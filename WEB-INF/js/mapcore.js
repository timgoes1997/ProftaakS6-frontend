// mapped car objects
var cars = [];

// settings
var useRealtime = false;
var map;
var end, start;
var markers = [];

////////// TRACK FUNCTIONS
function addCar(f) {
    if (hasCar(f)) return;

    // todo:
    // regex for matching license plates

    if (f != '') {
        updateCar(f);
    } else {
        notify('Geen nummerplaat opgegeven', 'error', notif.defaultTime);
    }
}
function mapCar(c, f, rt) {
    if (c.length === 0) {
        notify('Auto had geen locaties op aangegeven tijd', 'error', notif.longTime);
        return;
    }

    var car = {};
    car.licenseplate = f;
    car.locations = c;
    car.lines = [];
    car.marker = null;
    car.realtime = {};
    car.realtime.use = rt;
    car.realtime.function = function () {
        function runTimeOut() {
            setTimeout(update, 3000); // every three seconds
        }

        function update() {
            // check if relevant
            if (car.realtime.use) {
                // call for update of the marker
                call('POST', API_PATH + 'location/' + car.licenseplate + '/realtime', null, function (e, success) {
                    if (success) {
                        e = JSON.parse(e);
                        // update
                        car.locations = e;
                        if (car.marker)
                            car.marker.onRemove();
                        car.marker = setMarker(f, e[0]);
                        console.log('Updating realtime location');
                    } else {
                        // show popup with error details
                        notify("Realtime locatie kon niet worden opgehaald", "error", notif.defaultTime);
                    }

                    // reset timeout
                    runTimeOut();
                }, 'application/x-www-form-urlencoded');
            } else {
                console.log('End of realtime query');
            }
        }

        // call update straight away
        update();
    };
    var e2 = null;

    if (rt) {
        car.realtime.function();
    }

    // draw route and place marker
    funcOnArr(car.locations, function (e) {
        if (e2) {
            car.lines.push(drawBetweenPoints(e, e2));
        }
        e2 = e;
        if (e.lastElement) {
            car.marker = setMarker(f, e);
        }
    });

    // Add to array
    cars.push(car);

    // Make visible and removable
    var d = document.createElement('div');
    d.id = f;
    addClass(d, 'entity input');
    var container = document.createElement('div');
    container.innerHTML = f;
    var remove = document.createElement('p');
    remove.innerHTML = 'x';
    d.appendChild(container);
    d.appendChild(remove);

    remove.onclick = function () { removeCar(d.id) };

    $('cars').appendChild(d);
}
function funcOnArr(arr, callback) {
    if (arr instanceof Array) {
        for (var i = 0; i < arr.length; i++) {
            var e = arr[i];
            e['lastElement'] = i === arr.length - 1;
            callback(e);
        }
    } else {
        arr['lastElement'] = true;
        callback(arr);
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
    return funcOnCar(id, function () { return true; });
}
function removeCar(id) {
    var car = funcOnCar(id, function (e) { return e; });
    if (car) {
        funcOnArr(car.lines, function (e) {
            // remove lines
            e.setMap(null);
        });
        removeFromArray(cars, car);
        removeElement($(id));

        // clear lines
        car.lines = [];

        // remove marker
        car.marker.onRemove();
    }
    car.realtime.use = false; // disable realtime
}
function updateCar(id) {
    // check if values are alright
    if (start && end || useRealtime) {

        var d1 = Date.parse(start);
        var d2 = Date.parse(end);

        if (start > end) {
            notify('Begindatum kan niet na einddatum komen', 'error', notif.longTime);
            return;
        }

        var path = useRealtime ? "/realtime" : "/precise";
        var data = new FormData();

        if (!useRealtime) {
            // Always add 1 day to end date (to include it)
            if (typeof setEndTime !== 'undefined') {
                setEndTime();
                end.setDate(end.getDate() + 1);
            }

            data = 'startdate=' + start.getTime() + '&enddate=' + end.getTime();
        }

        var rt = useRealtime;
        // call API
        call('POST', API_PATH + 'location/' + id + path, data, function (e, success) {
            if (success) {
                e = JSON.parse(e);
                mapCar(e, id, rt);
            } else {
                // show popup with error details
                notify("Kan locatie niet ophalen", "error", notif.longTime);
            }
        }, 'application/x-www-form-urlencoded');
    } else {
        if (!start || !end) {
            notify('Geen datums geselecteerd', 'error', notif.longTime);
        }
    }
    // do nothing
}

////////// LOCATION FUNCTIONS
// sets the marker to a location
function setMarker(id, pos) {
    var latLng = new google.maps.LatLng(pos.x, pos.y)
    var marker;
    for (var i = 0; i < markers.length; i++) {
        var m = markers[i];
        if (m.id === id) {
            marker = m.marker;
            marker.onUpdate(latLng);
            return;
        }
    }
    if (!marker) {
        marker = new Popup(latLng, id);
        if (id !== "") {
            // only update center if new marker
            setCenter(pos.x, pos.y);
        }
    }
    marker.setMap(map);

    if (id !== "") {
        markers.push({
            'marker': marker,
            'id': id
        });
        marker.onUpdate(latLng);
    }
    return marker;
}
function drawBetweenPoints(pos1, pos2) {
    var line = new google.maps.Polyline({
        path: [new google.maps.LatLng(pos1.x, pos1.y), new google.maps.LatLng(pos2.x, pos2.y)],
        strokeColor: "#FF0000",
        strokeOpacity: 1.0,
        strokeWeight: 2.5,
        geodesic: true,
        map: map
    });
    return line;
}

function setCenter(lat, long) {
    map.setCenter(new google.maps.LatLng(lat, long));
}

////////// INITIALISER FUNCTIONS
function initMap() {
    //The center location of our map.
    var centerOfMap = new google.maps.LatLng(50.872289, 10.380447);

    //Map options.
    var options = {
        center: centerOfMap, //Set center.
        zoom: 7 //The zoom value.
    };

    //Create the map object.
    map = new google.maps.Map(document.getElementById('map'), options);
    definePopupClass();

    try { setMarker("", { 'lat': 0, 'lng': 0 }); } catch (e) { }
    window.mapLoaded = true;
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
    Popup = function (position, text) {
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
    Popup.prototype.onAdd = function () {
        this.getPanes().floatPane.appendChild(this.anchor);
    };

    /** Called when the popup is removed from the map. */
    Popup.prototype.onRemove = function () {
        if (this.anchor.parentElement) {
            this.anchor.parentElement.removeChild(this.anchor);
        }
    };

    /** Called when the popup is removed from the map. */
    Popup.prototype.onUpdate = function (latLng) {
        this.onRemove();
        this.position = latLng;
        this.onAdd();
    };

    /** Called when the popup needs to draw itself. */
    Popup.prototype.draw = function () {
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
    Popup.prototype.stopEventPropagation = function () {
        var anchor = this.anchor;
        anchor.style.cursor = 'auto';

        ['click', 'dblclick', 'contextmenu', 'wheel', 'mousedown', 'touchstart',
            'pointerdown']
            .forEach(function (event) {
                anchor.addEventListener(event, function (e) {
                    e.stopPropagation();
                });
            });
    };
}