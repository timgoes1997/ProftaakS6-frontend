addEvent(window, 'load', function() {
    ensure('modals', {});

    var m = new Modal('Auto toevoegen', true, 'carform_customer');
    m.addTitle(3, 'Auto informatie');
    m.addInput('text', 'Merk', 'brand', null, function(e) {
        return e.value != 0;
    });
    m.addInput('text', 'Model', 'modelName', null, function(e) {
        return e.value != 0;
    });
    m.addInput('text', 'Editie', 'edition', null, function(e) {
        return e.value != 0;
    });
    m.addInput('text', 'Nummerplaat', 'licenseplate', null, function(e) {
        return e.value != 0;
    });
    m.addInput('date', 'Bouwdatum', 'buildDate', null, function(e) {
        return e.value != 0;
    });
    m.addDivider();
    m.addTitle(3, 'Verbruiksinformatie');
    m.addInput('text', 'Energielabel', 'energyLabel', null, function(e) {
        return e.value != 0;
    });
    m.addInput('text', 'Brandstof', 'fuelType', null, function(e) {
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
            var data = new FormData(m.getForm());
            data.append('user', window.user.entity.user.id);

                // send
                notify('Bezig met verwerken nieuw voertuig...', 'info', notif.defaultTime);
                call('POST', API_PATH + 'vehicles/register/create', data, function(e,succ) {
                    if (succ) {
                        if (modals.car_callback) {
                            modals.car_callback(e);
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
    modals.car = m;
});