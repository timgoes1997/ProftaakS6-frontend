addEvent(window, 'load', function () {
    var params = getQueryParams();
    ensure('modals', {});
    t.fetch();
    t2.fetch();
    t3.fetch();

    var m = new Modal('Login', true, 'login', true);
    var m2 = new Modal('Registreer', true, 'register');

    m.addInput('text', 'Email', 'email', null, function (e) {
        return e.value != 0;
    });
    m.addInput('password', 'Wachtwoord', 'password', null, function (e) {
        return e.value != 0;
    });
    m.addDivider();

    var el = document.createElement('a');
    el.innerHTML = "Wachtwoord vergeten?";
    el.onclick = function () {
        var data = m.getValues();
        if (!data.email) {
            notify('Vul het email veld in.', 'error', notif.longTime);
            return;
        }
        notify('Bezig met email versturen', 'info', notif.longTime);
        call('POST', API_PATH + 'users/recovery/create', 'email=' + data.email, function (e, succ, n, code) {
            if (succ) {
                notify('Email verstuurd!', 'info');
            } else {
                if (code === 403) {
                    notify('Account bestaat niet!', 'error', notif.longTime);
                } else
                    notify('Fout bij het versturen van de email!', 'error', notif.longTime);
            }
        }, 'application/x-www-form-urlencoded');
    }

    m.addElement(el);
    m.addDivider();
    m.addPost({
        'innerHTML': 'Log in',
        'method': 'POST',
        'onsubmit': function (e) {
            if (m.verified()) {
                var data = m.getValues();
                if (!user.login(data.email, data.password)) {
                    notify('Inloggegevens waren onjuist', 'error', notif.longTime);
                }
            } else {
                notify('Vul de aangegeven waardes in', 'warning', notif.longTime);
            }
            e.preventDefault();
        }
    });
    m.addButton(function () {
        m.close();
        m.clear();
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
    m2.addInput('password', 'Bevestig wachtwoord', 'password_repeat', null, function (e) {
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
                    data += '&residency=GERMANY';
                }
                var path = API_PATH + 'users/create';

                // check if there's a transfer 
                if (params.token) {
                    path = API_PATH + 'trade/register';
                    data += '&token=' + params.token;
                }

                notify('Bezig met registreren', 'info', notif.longTime);
                call('POST', path, data, function (e, succ) {
                    if (succ) {
                        if (modals.logon_callback) {
                            modals.logon_callback(e);
                        }
                        var t = m2.getValues();
                        m2.clear();
                        notify('Account aangemaakt!', 'info');
                        m2.close();
                        m.open();
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
        m2.clear();
        m.open();
    }, 'Log in', 'uninterested');

    modals.logon = m;
    modals.register = m2;

    setTimeout(function () {
        m.open();
    }, 500);
});