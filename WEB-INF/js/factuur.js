addEvent(window, 'load', init);


function init() {
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
            start = e.startDate;
            end = e.endDate;

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