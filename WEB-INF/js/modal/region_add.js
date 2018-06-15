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

    m.addTitle(3, 'Energie labels')
    // input to add multiple energy labels. Checkbox?
    m.addInput('checkbox', 'Klasse A', 'label_A', null, function (e) {
        return e.value != 0;
    });
    m.addInput('checkbox', 'Klasse B', 'label_B', null, function (e) {
        return e.value != 0;
    });
    m.addInput('checkbox', 'Klasse C', 'label_C', null, function (e) {
        return e.value != 0;
    });
    m.addInput('checkbox', 'Klasse D', 'label_D', null, function (e) {
        return e.value != 0;
    });
    m.addInput('checkbox', 'Klasse E', 'label_E', null, function (e) {
        return e.value != 0;
    });

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

    google.maps.event.addListener(drawingManager, 'overlaycomplete', function(polygon) {
        coordinatesArray = coordinatesArray.concat(polygon.overlay.getPath().getArray());
    });

    m.addTitle(3, 'Regio(\'s)');
    m.addElement(mapholder);
    addClass(mapholder, 'map');
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
                var data = m.getData(0);
                // use coordinatesArray

                /*
                notify('Bezig met registreren', 'info', notif.longTime);
                call('POST', API_PATH + 'users/create/simple', data, function (e, succ) {
                    if (succ) {
                        notify('Account aangemaakt!', 'info');
                    } else {
                        notify('Kon niet registreren!', 'error', notif.longTime);
                    }
                }, 'application/x-www-form-urlencoded');
                */
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
});