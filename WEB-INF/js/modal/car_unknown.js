addEvent(window, 'load', function() {
    ensure('modals', {});

    var m = new Modal('Onbekende auto toevoegen', true, 'carform');
    m.addTitle(3, 'Auto informatie');
    m.addInput('text', 'Nummerplaat', 'licenseplate', null, function(e) {
        return e.value != 0;
    });
    m.addDivider();
    m.addTitle(3, 'Voertuig informatie');
    m.addInput('text', 'Merk', 'brand', null, function(e) {
        return e.value != 0;
    });
    m.addInput('date', 'Bouwdatum', 'buildDate', null, function(e) {
        return e.value != 0;
    });
    m.addInput('text', 'Model', 'model', null, function(e) {
        return e.value != 0;
    });
    m.addDivider();
    m.addTitle(3, 'Land van herkomst');
    m.addInput('text', 'Land', 'land', null, function(e) {
        return e.value != 0;
    });
    m.addDivider();
    m.addPost({
        'innerHTML': 'Voeg toe',
        'method': 'POST',
        'onsubmit': function (e) {
            if (m.verified()) {
                // send
                notify('Bezig met verwerken nieuw onbekend voertuig...', 'info', notif.defaultTime);
                call('POST', API_PATH + 'vehicle/new', new FormData(m.getForm()), function(e,succ) {
                    if (succ) {
                        if (modals.car_unknown_callback) {
                            modals.car_unknown_callback(e);
                        }
                        notify('Auto succesvol toegevoegd', 'success', notif.defaultTime); 
                    } else {
                        notify('Auto kon niet worden toegevoegd', 'error', notif.longTime);
                    }
                })
            } else {
                notify('Vul de aangegeven waardes in', 'warning', notif.longTime);
            }
            e.preventDefault();
        }
    });
    m.addButton(function () { m.close() }, 'Terug');
    modals.car_unknown = m;
});