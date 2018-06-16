addEvent(window, 'load', function () {
    ensure('modals', {});

    var m = new Modal('Voeg regiotarief toe', true, 'addregion');

    // region
    // price
    // energy label
    // start and end time (days, hours, minutes)

    // price per KM

    m.addTitle(3, 'Tarief')
    m.addInput('number', 'Centen per 10 Km', 'price', null, function (e) {
        return e.value != 0;
    });
    m.addDivider();

    var labels = [];
    m.addTitle(3, 'Energie labels')
    // input to add multiple energy labels. Checkbox?
    labels.push(m.addInput('checkbox', 'Klasse A', 'A', null, function (e) {
        return e.value != 0;
    }));
    labels.push(m.addInput('checkbox', 'Klasse B', 'B', null, function (e) {
        return e.value != 0;
    }));
    labels.push(m.addInput('checkbox', 'Klasse C', 'C', null, function (e) {
        return e.value != 0;
    }));
    labels.push(m.addInput('checkbox', 'Klasse D', 'D', null, function (e) {
        return e.value != 0;
    }));
    labels.push(m.addInput('checkbox', 'Klasse E', 'E', null, function (e) {
        return e.value != 0;
    }));

    var dates = [{
        text: 'Maandag', value: 2
    }, {
        text: 'Dinsdag', value: 3
    }, {
        text: 'Woensdag', value: 4
    }, {
        text: 'Donderdag', value: 5
    }, {
        text: 'Vrijdag', value: 6
    }, {
        text: 'Zaterdag', value: 7
    }, {
        text: 'Zondag', value: 1
    }];

    m.addDivider();
    // Draw regio
    var mapholder = document.createElement('div');
    var ele = document.createElement('div');
    ele.id = "map";
    var coordinatesArray = [];

    var centerOfMap = new google.maps.LatLng(50.872289, 10.380447);
    var map = new google.maps.Map(ele, {
        center: centerOfMap,
        zoom: 7
    });

    var drawingManager = new google.maps.drawing.DrawingManager({
        drawingMode: google.maps.drawing.OverlayType.POLYGON,
        drawingControl: true,
        drawingControlOptions: {
            position: google.maps.ControlPosition.TOP_CENTER,
            drawingModes: ['polygon']
        }
    });
    drawingManager.setMap(map);
    mapholder.appendChild(ele);

    google.maps.event.addListener(drawingManager, 'overlaycomplete', function (polygon) {
        coordinatesArray = coordinatesArray.concat(polygon.overlay.getPath().getArray());
    });

    m.addTitle(3, 'Regio(\'s)');
    m.addElement(mapholder);
    addClass(mapholder, 'map');
    m.addInput('text', 'Naam', 'name', null, function (e) {
        return e.value != 0;
    });
    m.addDivider();

    m.addTitle(3, 'Tijdscategorie');
    m.addTitle(4, 'Starttijd');
    m.addDivider();
    m.addSelect('Dag', dates, 'sday');
    m.addInput('number', 'Uur', 'shour', null, function (e) {
        return e.value >= 0 && e.value <= 24;
    });
    m.addInput('number', 'Minuut', 'sminute', null, function (e) {
        return e.value >= 0 && e.value <= 60;
    });

    m.addDivider();
    m.addTitle(4, 'Eindtijd');
    m.addDivider();
    m.addSelect('Dag', dates, 'eday');
    m.addInput('number', 'Uur', 'ehour', null, function (e) {
        return e.value >= 0 && e.value <= 24;
    });
    m.addInput('number', 'Minuut', 'eminute', null, function (e) {
        return e.value >= 0 && e.value <= 60;
    });
    m.addDivider();

    m.addPost({
        'innerHTML': 'Voeg toe',
        'method': 'POST',
        'onsubmit': function (e) {
            if (m.verified()) {
                var data = m.getValues();

                notify('Bezig met toevoegen nieuwe tarieven', 'info', notif.longTime);
                // get the region
                call('GET', API_PATH + 'region/name/' + data.name, null, function (e, succ) {
                    if (succ) {
                        // it exists, add rates
                        addRates();
                    } else {
                        // 500 = could not find. Please change this in the back-end
                        createRegion(data.name, addRates);
                    }
                });
            } else {
                notify('Vul de aangegeven waardes in!', 'warning', notif.longTime);
            }
            e.preventDefault();
        }
    });
    m.addButton(function () {
        m.close();
        m.clear();
    }, 'Sluit', 'uninterested');
    modals.region_add = m;

    function addRates() {
        var formdata = m.getValues();
        var adata = [];
        for (var i = 0; i < labels.length; i++) {
            var label = labels[i];
            if (label.checked) {
                adata.push(addRate(label.id));
            }
        }
        
        call('POST', API_PATH + 'region/create/rates/' + formdata.name, JSON.stringify(adata), function (e, succ) {
            if (succ) {
                notify('Tarief voor klasse ' + label.id + ' aangemaakt', 'info', notif.longTime);

            } else {
                notify('Tarief voor klasse ' + label.id + ' kon niet worden aangemaakt', 'error', notif.longTime);
            }
        }, 'application/json');
    }

    function addRate(label) {
        var formdata = m.getValues();
        var data = {};
        data.endTime = new Date();
        data.endTime.setDay(formdata.eday);
        data.endTime.setHours(formdata.ehours || 0);
        data.endTime.setMinutes(formdata.eminutes || 0);
        data.startTime = new Date();  
        data.startTime.setDay(formdata.sday);
        data.startTime.setHours(formdata.shours || 0);
        data.startTime.setMinutes(formdata.sminutes || 0);
        data.kilometerPrice = formdata.price / 10;

        data.energyLabel = label.id;
        return data;
    }

    function createRegion(name, callback) {
        // use coordinatesArray
        var data = {};
        var borderPoints = [];
        for (var i = 0; i < coordinatesArray.length; i++) {
            var c = coordinatesArray[i];
            borderPoints.push({
                lat: c.lat(),
                lon: c.lng(),
                verticeId: i
            });
        }

        data.borderPoints = borderPoints;
        data.name = name;
        data.rates = [];

        call('POST', API_PATH + 'region/create', JSON.stringify(data), function (e, succ) {
            if (succ) {
                notify('Regio aangemaakt', 'info', notif.longTime);
                if (callback) callback();
            } else {
                notify('Regio kon niet worden toegevoegd', 'error', notif.longTime);
            }
        }, 'application/json');
    }
});

Date.prototype.setDay = function(dayOfWeek) {
    this.setDate(this.getDate() - this.getDay() + dayOfWeek);
};