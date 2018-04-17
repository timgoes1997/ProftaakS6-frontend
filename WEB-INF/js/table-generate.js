addEvent(window, 'load', loadTable)

function loadTable() {
    ensure('actions', []);

    if (!table.URL) {
        console.error("Please set a tableURL to request the resources from");
        return;
    }
    ensure('Data', null, table);
    ensure('Callback', function(){}, table);
    call('get', API_PATH + table.URL, table.Data, fillTable);
}

// Table fill actions
function fillTable(e, succ, level) {
    if (succ) {
        var t = $('table-generate');
        e = JSON.parse(e);

        // e is an array
        for (var j=0; j<e.length;j++) {
            var obj = e[j];
            // Create a row
            var tr = document.createElement('tr');

            var ids = [];

            // loop through the TH
            var ths = t.getElementsByTagName("TH");
            for (var i = 0; i < ths.length; i++) {
                var th = ths[i];
                if (th.id) {
                    var td;
                    // for non actions
                    if (th.id.indexOf('actions_') === -1) {
                        // Create td
                        td = document.createElement('td');
                        // Fill the td
                        var def = th.getAttribute('default') || 'N/A';

                        var p = th.getAttribute('prefix') || '';
                        var s = th.getAttribute('suffix') || '';

                        // get value from tree (dots accepted)
                        var val = getValueInObject(obj,th.id) || def;
                        val = p + val + s;

                        td.innerHTML = val;
                        ids.push(
                            {
                                'name':th.id,
                                'value':val
                            }
                        );

                    } else {
                        // Create td's
                        td = document.createElement('td');
                        addClass(td, 'actions');
                        var div = document.createElement('div');
                        var string = th.id.replace('actions_', '');
                        addClass(div, 'btn');
                        div.innerHTML = string;

                        // Attach action
                        var action = getActionFor(th, obj, ids);
                        if (action) {
                            div.onclick = action;
                        }
                        td.appendChild(div);
                    }
                    table.Callback(th.id, td);
                    // attach TD to TR
                    tr.appendChild(td);
                } // else no ID. 
            }
            t.appendChild(tr);
        }

    } else {
        if (level === 1 || level === 2) {
            notify('Kon tabel niet inladen', 'error', notif.longTime);
        } else {

            notify('Geen data om in te laden', 'warning', notif.longTime);
        }
    }
}

function getValueInObject(obj, field) {
    var fields = field.split('.');
    var cur = obj;
    for (var i=0; i<fields.length;i++) {
        cur = cur[fields[i]];
    }
    return cur;
}

function getActionFor(ele, obj, ids) {
    var action = ele.getAttribute('action');
    if (action === "a") {
        // Link action based on url and parameters
        var url = ele.getAttribute('link');
        var params = ele.getAttribute('parameters');
        params = params.split(','); // to array

        // replace params by matching IDs
        for (var i=0;i<ids.length;i++) {
            var id = ids[i];
            for (var j=0;j<params.length;j++) {
                var param = params[j];
                if (id.name===param) {
                    params[j] = id.value;
                }
            }
        }

        // replace "{0}", etc by parameters
        url = format(url, params);
        return function() {
            window.location = url;
        };
    }
    console.warn("No action found for " + action);
}