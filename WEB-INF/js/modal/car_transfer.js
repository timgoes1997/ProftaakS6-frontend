addEvent(window, 'load', function () {
    ensure('modals', {});
});

function transfer_form(license) {
    var el = $('carform_transfer');
    if (el) {
        el.parentNode.removeChild(el);
    }

    var m = new Modal('Auto overschrijven', true, 'carform_transfer');
    m.addText('U staat op het punt om auto met kentekenplaat <b>' + license + '</b> te overschrijven naar een andere gebruiker. Vul de onderstaande gegevens in om dit proces voort te zetten.');
    m.addDivider();
    m.addTitle(3, 'Email nieuwe eigenaar');
    m.addInput('text', 'E-mail', 'email', null, function(e) {
        return e.value != 0;
    });
    m.addDivider();
    m.addPost({
        'innerHTML': 'Schrijf over',
        'method': 'POST',
        'onsubmit': function (e) {
            if (m.verified()) {
            var data = "email=" + m.getValues().email + "&license=" + license;
                // send
                notify('Bezig met versturen overschrijvingsrequest', 'info', notif.defaultTime);
                call('POST', API_PATH + 'trade/create', data, function(e,succ,type,code) {
                    if (succ) {
                        notify('Gebruiker heeft notificatie van overschrijving ontvangen', 'success', notif.defaultTime); 
                    } else {
                        if (code === 404) {
                            notify('Email of auto was niet juist', 'error', notif.longTime);
                        } else if (code === 400) {
                            notify('Auto is al in overschrijvingsproces', 'error', notif.longTime);
                            notify('U heeft al een bestaande overschrijving met nummerplaat ' + license, 'warning');
                        } else 
                            notify('Er ging iets fout. Probeer het later opnieuw', 'error', notif.longTime);
                    }
                },'application/x-www-form-urlencoded');
            } else {
                notify('Vul de aangegeven waardes in', 'warning', notif.longTime);
            }
            e.preventDefault();
        }
    });
    var p = m.addButton(function () { m.close() }, 'Terug');
    addClass(p, 'ignore');
    modals.car_transfer = m;
    m.open();
    return m.basicElement;
}