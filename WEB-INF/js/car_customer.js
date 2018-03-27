addEvent(window, 'load', function() {
    ensure('modals', {});

    var m = new Modal('Auto toevoegen', true, 'carform');
    m.addTitle(3, 'Auto informatie');
    m.addInput('text', 'Merk', 'brand', null, function(e) {
        return e.value != 0;
    });
    m.addInput('text', 'Model', 'model', null, function(e) {
        return e.value != 0;
    });
    m.addInput('text', 'Nummerplaat', 'licenseplate', null, function(e) {
        return e.value != 0;
    });
    m.addInput('date', 'Bouwdatum', 'buildDate', null, function(e) {
        return e.value != 0;
    });
    m.addSpace(30);
    m.addDivider();
    m.addTitle(3, 'Persoonlijke informatie');
    m.addInput('file', 'Eigendomsbewijs', 'file', null, function(e) {
        return true;
    });
    m.addDivider();
    m.addPost({
        'innerHTML': 'Voeg toe',
        'method': 'POST',
        'onsubmit': function (e) {
            if (m.verified()) {
                // send
                notify('Uploading new car...', 'info', notif.defaultTime);
                call('POST', API_PATH + 'vehicle/new', new FormData(m.getForm()), function(e,succ) {
                    if (succ) {
                        notify('Car was succesfully added', 'success', notif.defaultTime); 
                    } else {
                        notify('Could not add car', 'error', notif.longTime);
                    }
                })
            } else {
                notify('Please fill in all fields', 'warning', notif.longTime);
            }
            e.preventDefault();
        }
    });
    m.addButton(function () { m.close() }, 'Terug');
    modals.car = m;
});