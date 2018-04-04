addEvent(window, 'load', function () {
    ensure('modals', {});

    var m = new Modal('Login', true, 'login');
    var m2 = new Modal('Registreer', true, 'register');

    m.addInput('text', 'Email', 'email', null, function (e) {
        return e.value != 0;
    });
    m.addInput('password', 'Wachtwoord', 'password', null, function (e) {
        return e.value != 0;
    });
    m.addDivider();
    m.addPost({
        'innerHTML': 'Log in',
        'method': 'POST',
        'onsubmit': function (e) {
            if (m.verified()) {
                // send
                var data = m.getData(0);

                call('POST', SERVER_URL + 'j_security_check', data, function (e, succ) {
                    if (succ) {
                        if (modals.logon_callback) {
                            modals.logon_callback(e);
                        }
                        window.location = "profiel.html";
                    } else {
                        //notify('Kon niet inloggen', 'error', notif.longTime);

                        // todo; don't fake
                        window.location = "profiel.html";
                    }
                })
            } else {
                notify('Vul de aangegeven waardes in', 'warning', notif.longTime);
            }
            e.preventDefault();
        }
    });
    m.addButton(function () {
        m.close();
        m2.open();
    }, 'Registeer', 'uninterested');

    m2.addInput('text', 'Naam', 'name', null, function (e) {
        return e.value != 0;
    });
    m2.addInput('text', 'Email', 'email', null, function (e) {
        return e.value != 0;
    });
    m2.addInput('text', 'Adres', 'address', null, function (e) {
        return e.value != 0;
    });
    m2.addInput('password', 'Wachtwoord', 'password', null, function (e) {
        return e.value != 0;
    });
    m2.addInput('password', 'Wachtwoord', 'password_repeat', null, function (e) {
        return e.value === m2.getValues().password;
    });
    m2.addDivider();
    m2.addPost({
        'innerHTML': 'Registreer',
        'method': 'POST',
        'onsubmit': function (e) {
            if (m2.verified()) {
                var data = m2.getData(0);
                if (data instanceof FormData) {
                    data.append('residency', 'GERMANY');
                } else {
                    data +='&residency=GERMANY';
                }

                call('POST', API_PATH + 'users/create', data, function (e, succ) {
                    if (succ) {
                        if (modals.logon_callback) {
                            modals.logon_callback(e);
                        }
                        console.log(e);
                        window.location = 'profiel.html';

                    } else {
                        notify('Kon niet registreren', 'error', notif.longTime);
                    }
                }, 'application/x-www-form-urlencoded');
            } else {
                if (m2.getValues().password != m2.getValues().password_repeat) {
                    notify('Wachtwoord komt niet overeen', 'warning', notif.longTime);
                } else
                    notify('Vul de aangegeven waardes in', 'warning', notif.longTime);
            }
            e.preventDefault();
        }
    });
    m2.addButton(function () {
        m2.close();
        m.open();
    }, 'Log in', 'uninterested');

    modals.logon = m;
    modals.register = m2;

    setTimeout(function () {
        m.open();
    }, 500);
});