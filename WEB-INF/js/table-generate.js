addEvent(window, 'load', loadTable)

// Class
TableLoader = function(t, id) {
    this.table = t || window.table || {};
    this.id = id || this.table.id || console.error('Please specify the ID of the table');
    var me = this;

    ensure('actions', []);

    if (!this.table.URL) {
        console.error("Please set a tableURL to request the resources from");
        return;
    }
    ensure('Data', null, table);
    ensure('Manually', false, table);
    ensure('Callback', function(){}, table);

    this.fetch = function() {
        call('get', API_PATH + this.table.URL, this.table.Data, this.fill);
    }

    this.showEmpty = function() {
        var t = $(this.id);
        var tr = document.createElement('tr');
        tr.innerHTML='Geen resultaten gevonden';
        addClass(t, 'empty');
        t.appendChild(tr);
    }

    this.showError = function() {
        var t = $(this.id);
        var td = document.createElement('td');

        var eText = t.getAttribute('failtext') || 'Een error is opgetreden. Neem contact op met een beheerder als het probleem zich niet oplost.';
        td.innerHTML= eText;

        var eClass = t.getAttribute('failclass') || 'error';
        addClass(td, eClass);
        t = t.children[0].children[0];
        t.appendChild(td);
    }
    
    // Table fill actions
    this.fill = function(e, succ, level) {
        if (succ) {
            var t = $(me.id);
            e = JSON.parse(e);

            // Use root if given (always an array)
            var root = me.table.root || '';
            if (root == '') {
                root = e;
            } else {
                root = getValueInObject(e, root);
            }
            if (root == null) {
                me.showEmpty(); // nothing to show
                return;
            }
            if (!(root instanceof Array)) {
                console.error('Table root was not an Array');
            }
            if (!root.length) {
                me.showEmpty(); // nothing to show
            }
    
            // e is an array
            for (var j=0; j<root.length;j++) {
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
                me.showError();
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
}

// Exposed function
function loadTable() {
    ensure('table', null);
    if (!table.Manually) {
        table.id = 'table-generate';
        var tl = new TableLoader();
        tl.fetch();
    }
}