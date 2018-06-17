addEvent(window, 'load', init);

function init() {
    function toShortDate(date) {
        return date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate();
    }
    notifElement = $(notifID);
    notifElement.addEventListener("notify", function (e) {
        var b = e.detail;
        if (b.type === "location_access_error") {
            //prevent default
            b.notified = true;

            // remove the map
            notify("U heeft geen rechten om deze route in te zien", "info", b.life);
            var map = $("map");
            removeElement(map);
        }
    }, false);

    var params = getQueryParams();
    call('GET', API_PATH + 'bills/' + params.id, null, function (e, succ) {
        if (succ) {
            e = JSON.parse(e);
            setValue('factuurnummer', e.billnr);
            setValue('nummerplaat', e.license);
            var price = Math.round(e.price * 100) / 100;

            setValue('totaalbedrag', price + ' €');
            setValue('totaalbedrag2', price + ' €');
            setValue('status', e.status);
            setValue('maand', e.month);

            // Get dates
            var l = e.license;

            // mapcore.js interface
            window.start = new Date(e.numberStartDate * 1e3);
            window.end = new Date(e.numberEndDate * 1e3);

            // Draw on map
            addCar(l);

        } else {
            // todo 
            //take to other page?
        }
    });

    table.URL = "bills/rates/" + params.id;
    table.id = 'trips';

    // Fill table with trips
    var tl = new TableLoader();
    tl.fetch();
}

function setValue(name, value) {
    $(name).children[1].innerHTML = value;
}