addEvent(window, 'load', function () {
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
                    data +='&residency=GERMANY';
                }

                call('POST', API_PATH + 'users/create', data, function (e, succ) {
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