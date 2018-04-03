addEvent(window, 'load', init);


function init() {
    var params = getQueryParams();
    call('GET', API_PATH + 'bills/' + params.id, null, function (e, succ) {
        if (succ) {
            e = JSON.parse(e);
            setValue('factuurnummer', e.billnr);
            setValue('nummerplaat', e.license);
            setValue('totaalbedrag', e.price + ' €');
            setValue('status', e.status);
            setValue('maand', e.month);
        } else {
            // todo 
            //take to other page?
        }
    });
}

function setValue(name, value) {
    $(name).children[1].innerHTML = value;
}