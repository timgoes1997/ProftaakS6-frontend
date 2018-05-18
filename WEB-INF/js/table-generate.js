addEvent(window, 'load', loadTable);

// Class
TableLoader = function (t, id) {
    function hasTableSort() {
        return typeof Tablesort !== 'undefined';
    }


    this.table = t || window.table || {};
    this.id = id || this.table.id || console.error('Please specify the ID of the table');
    var me = this;
    if (hasTableSort())
        this.sorter = new Tablesort(document.getElementById(this.id), {
            //descending: true
        });

    ensure('actions', []);

    if (!this.table.URL) {
        console.error("Please set a tableURL to request the resources from");
        return;
    }
    ensure('Data', null, table);
    ensure('Manually', false, table);
    ensure('Callback', function () { }, table);

    this.subscribeSearchBar = function () {
        me.table.search.addEventListener('keyup', function () {
            var empty = true;

            var t = $(me.id).getElementsByTagName("TBODY")[0];

            var kiddos = t.getElementsByTagName("TR");
            // filter rows (1 partial tr match = OK)
            for (var i = 0; i < kiddos.length; i++) {
                var tr = kiddos[i];
                if (!rowHasData(tr, me.table.search.value)) {
                    addClass(tr, 'hidden');
                } else {
                    removeClass(tr, 'hidden');
                    empty = false;
                }
            }

            // refresh sorter
            if (hasTableSort())
                me.sorter.refresh();

            // show the empty list if necessary
            if (empty) {
                me.showEmpty();
            } else {
                me.hideEmpty();
            }
        });
    }

    function rowHasData(row, data) {
        var kiddos = row.getElementsByTagName("td");
        for (i = 0; i < kiddos.length; i++) {
            td = kiddos[i];
            if (td) {
                if (toUpperCase(td.innerHTML).indexOf(toUpperCase(data)) > -1) {
                    return true;
                }
            }
        }
        return false;
    }

    this.fetch = function () {
        call('get', API_PATH + this.table.URL, this.table.Data, this.fill);
    }

    var hasempty = 0;
    this.showEmpty = function () {
        if (hasempty) {
            removeClass(hasempty, 'hidden');
        } else {
            var e = {};
            if (this.table.onempty) {
                this.table.onempty(e);
            }
            if (e.handled || e.preventDefault) {
                return;
            }
            var t = $(this.id);
            var tr = document.createElement('tr');
            tr.innerHTML = 'Geen resultaten gevonden';
            addClass(t, 'empty');
            t.appendChild(tr);
            hasempty = tr;
        }
    }

    this.hideEmpty = function () {
        addClass(hasempty, 'hidden');
    }

    this.showError = function () {
        var t = $(this.id);
        var td = document.createElement('td');

        var eText = t.getAttribute('failtext') || 'Een error is opgetreden. Neem contact op met een beheerder als het probleem zich niet oplost.';
        td.innerHTML = eText;

        var eClass = t.getAttribute('failclass') || 'error';
        addClass(td, eClass);
        t = t.children[0].children[0];
        t.appendChild(td);
    }

    // Table fill actions
    this.fill = function (e, succ, level) {
        if (succ) {
            var t = $(me.id);
            if (e === "") {
                me.showEmpty();
                return;
            }

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

            var tbody = document.createElement('tbody');
            // e is an array
            for (var j = 0; j < root.length; j++) {
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
                            var val = getValueInObject(obj, th.id);
                            val = getMatchingValueAttribute(val, th) || def;
                            val = p + val + s;

                            td.innerHTML = val;
                            ids.push(
                                {
                                    'name': th.id,
                                    'value': val
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
                tbody.appendChild(tr);
            }
            t.appendChild(tbody);
            if (hasTableSort())
                me.sorter.refresh();
        } else {
            if (level === 1 || level === 2) {
                notify('Kon tabel niet inladen', 'error', notif.longTime);
                me.showError();
            } else {
                notify('Geen data om in te laden', 'warning', notif.longTime);
            }
        }
    }

    function getMatchingValueAttribute(val, ele) {
        return ele.getAttribute(val) || val;
    }

    function getValueInObject(obj, field) {
        var fields = field.split('.');
        var cur = obj;
        for (var i = 0; i < fields.length; i++) {
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
            for (var i = 0; i < ids.length; i++) {
                var id = ids[i];
                for (var j = 0; j < params.length; j++) {
                    var param = params[j];
                    if (id.name === param) {
                        params[j] = id.value;
                    }
                }
            }

            // replace "{0}", etc by parameters
            url = format(url, params);
            return function () {
                window.location = url;
            };
        }
        console.warn("No action found for " + action);
    }

    if (table.search) {
        this.subscribeSearchBar();
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