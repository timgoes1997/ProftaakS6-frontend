addEvent(window, 'load', init);


function init() {
    function toShortDate(date) {
        return date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate();
    }

    var params = getQueryParams();
    call('GET', API_PATH + 'bills/' + params.id, null, function (e, succ) {
        if (succ) {
            e = JSON.parse(e);
            setValue('factuurnummer', e.billnr);
            setValue('nummerplaat', e.license);
            setValue('totaalbedrag', e.price + ' €');
            setValue('totaalbedrag2', e.price + ' €');
            setValue('status', e.status);
            setValue('maand', e.month);

            // Get dates
            var l = e.license;

            // mapcore.js interface
            window.start = toShortDate(new Date(e.numberStartDate*1e3));
            window.end = toShortDate(new Date(e.numberEndDate*1e3));

            // Draw on map
            addCar(l);

        } else {
            // todo 
            //take to other page?
        }
    });

    table.URL = "bills/" + params.id;
    table.id = 'trips';
    table.root = 'trips';

    // Fill table with trips
    var tl = new TableLoader();
    tl.fetch();
}

function setValue(name, value) {
    $(name).children[1].innerHTML = value;
}