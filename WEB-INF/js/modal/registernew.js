addEvent(window, 'load', function () {
    ensure('modals', {});

    var m = new Modal('Maak account aan', true, 'addaccount');

    m.addInput('text', 'Naam', 'name', null, function (e) {
        return e.value != 0;
    });
    m.addInput('text', 'Email', 'email', null, function (e) {
        return e.value != 0;
    });
    m.addDivider();
    m.addPost({
        'innerHTML': 'Registreer',
        'method': 'POST',
        'onsubmit': function (e) {
            if (m.verified()) {
                var data = m.getData(0);
                if (data instanceof FormData) {
                    data.append('residency', 'GERMANY');
                } else {
                    data += '&residency=GERMANY';
                }

                call('POST', API_PATH + 'users/create/simple', data, function (e, succ) {
                    if (succ) {
                        notify('Account aangemaakt!', 'info');
                    } else {
                        notify('Kon niet registreren!', 'error', notif.longTime);
                    }
                }, 'application/x-www-form-urlencoded');
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
    modals.registernew = m;
});