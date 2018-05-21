addEvent(window, 'load', init);

function init() {
    var template = document.getElementById("car-holder");
    var merk = document.getElementById("merk");
    var model = document.getElementById("model");
    var nummerplaat = document.getElementById("nummerplaat");
    var bouwdatum = document.getElementById("bouwdatum");
    var facturen = document.getElementById("facturen");
    var track = document.getElementById("track");

    call("GET", API_PATH + "vehicles/currentUser/", null, function (e, succ) {
        var carlist = JSON.parse(e);

        if (!carlist.length) {
            removeClass($('no-cars'), 'hidden');
        }

        for (var i = 0; i < carlist.length; i++) {
            var car = carlist[i];

            var me = car.vehicle.brand;
            var mo = car.vehicle.modelName + " " + car.vehicle.edition;
            var nu = car.licensePlate;
            var d = new Date(car.vehicle.buildDateLong / 1000);
            var bouw = d.getFullYear() + "/" + (d.getMonth() + 1) + "/" + d.getDate();

            merk.innerHTML = "<p>Merk</p><p>" + me + "</p>";
            model.innerHTML = "<p>Model</p><p>" + mo + "</p>";
            nummerplaat.innerHTML = "<p>Nummerplaat</p><p>" + nu + "</p>";
            bouwdatum.innerHTML = "<p>Bouwdatum</p><p>" + bouw + "</p>";
            track.href = '/track.html?license=' + car.licensePlate;
            facturen.href = '/facturen.html?type=vehicle&filter=' + car.vehicle.id;

            var clone = template.cloneNode(true);
            clone.getElementsByClassName('btn-transfer')[0].onclick = function () {
                transfer_form(nu);
            }
            removeClass(clone, "hidden");
            if (template.nextSibling) {
                template.parentNode.insertBefore(clone, template.nextSibling);
            }
            else {
                template.parentNode.appendChild(clone);
            }
        }
        removeElement(template);
    });
}

function checkStatus(obj) {
    // true on:
    // AcceptedNewOwner
    return obj.status === 'AcceptedNewOwner';
}

function acceptRequest(id, license) {
    addClass(confirm('Accepteer', function (e) {
        call('POST', API_PATH + 'trade/accept', 'id=' + id, function (e, succ, type, code) {
            if (succ) {
                notify('Overschrijving geaccepteerd', 'success', notif.defaultTime);
            } else {
                if (code === 405) {
                    notify('U heeft niet de juiste rechten om deze overschrijving te accepteren', 'error', notif.longTime);
                } else
                    notify('Er ging iets fout. Probeer het later opnieuw', 'error', notif.longTime);
            }
        },'application/x-www-form-urlencoded')
    }, 'Weet u zeker dat u deze overschrijving van <b>' + license + '</b> wilt accepteren?', 0, 0, 'confirm'), 'mini-modal');
}

function declineRequest(id, license) {
    addClass(confirm('Weiger', function (e) {
        call('POST', API_PATH + 'trade/decline', 'id=' + id, function (e, succ, type, code) {
            if (succ) {
                notify('Overschrijving geannuleerd', 'success', notif.defaultTime);
            } else {
                if (code === 405) {
                    notify('U heeft niet de juiste rechten om deze overschrijving te weigeren', 'error', notif.longTime);
                } else
                    notify('Er ging iets fout. Probeer het later opnieuw', 'error', notif.longTime);
            }
        },'application/x-www-form-urlencoded')
    }, 'Weet u zeker dat u deze overschrijving van <b>' + license + '</b> wilt weigeren?'), 'mini-modal');
}