function removeCar(license) {
    addClass(confirm('Verwijder', function (e) {
        call('POST', API_PATH + 'vehicles/destroy', 'license=' + license, function(e,succ,type,code) {
            if (succ) {
                notify('Auto succesvol gemarkeerd als onbruikbaar', 'success', notif.defaultTime); 
                tables['table-generate'].fetch();
            } else {
                if (code === 404) {
                    notify('Auto kon niet worden gevonden', 'error', notif.longTime);
                } else 
                    notify('Er ging iets fout. Probeer het later opnieuw', 'error', notif.longTime);
            }
        },'application/x-www-form-urlencoded');

    }, 'Weet u zeker dat u auto met nummerplaat <b>' + license + '</b> wilt verwijderen?'), 'mini-modal');
}

function transferCar(license) {
    transfer_form(license);
}