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
    ensure('Data', null, this.table);
    //ensure('Manually', false, table);
    ensure('Callback', function () { }, this.table);

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

    this.hasEmpty = 0;
    this.showEmpty = function () {
        if (this.hasEmpty) {
            removeClass(this.hasEmpty, 'hidden');
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
            this.hasEmpty = tr;
        }
    }

    this.hideEmpty = function () {
        addClass(this.hasEmpty, 'hidden');
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

    this.empty = function () {
        var b = $(this.id).getElementsByTagName('TBODY')[0];
        if (b)
            b.parentNode.removeChild(b);
    }

    // Table fill actions
    this.fill = function (e, succ, level) {
        if (succ) {
            me.empty();

            var t = $(me.id);
            if (e === "") {
                me.showEmpty();
                return;
            }

            e = JSON.parse(e);

            // cache the thead for actions
            var tactions;

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
                var rt = root;
                root = [];
                root.push(rt);
            }
            if (!root.length) {
                me.showEmpty(); // nothing to show
                return;
            }

            var tbody = document.createElement('tbody');
            // e is an array
            for (var j = 0; j < root.length; j++) {
                var obj = root[j];
                // Create a row
                var tr = document.createElement('tr');

                // keep a td for all actions
                var tdactions = false;

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

                            // parsers
                            var dateformat = th.getAttribute('dateformat');
                            if (dateformat) {
                                val = parseDate(dateformat, val);
                            }

                            td.innerHTML = val;

                        } else {
                            tactions = th;

                            // check if should be visible
                            if (!tdactions) {
                                // Create td's
                                td = document.createElement('td');
                            }
                            var div = document.createElement('div');
                            var string = th.id.replace('actions_', '');
                            addClass(div, 'btn');

                            var s2 = th.getAttribute('content');
                            if (typeof (s2) === typeof ('')) {
                                div.innerHTML = s2;
                            } else {
                                div.innerHTML = string;
                            }

                            var vo = th.getAttribute('visibleOn');
                            if (vo) {
                                if (window[vo]()) {
                                    // Attach action
                                    var action = getActionFor(th, obj);
                                    if (action) {
                                        div.onclick = action;
                                    }
                                    td.appendChild(div);
                                }
                            } else {
                                var action = getActionFor(th, obj);
                                if (action) {
                                    div.onclick = action;
                                }
                                td.appendChild(div);
                            }

                            // Attach classes
                            addClass(div, (th.getAttribute('action-class') || 'btn'));

                            if (!tdactions)
                                tdactions = true;
                        }
                        me.table.Callback(th.id, td);
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
                var event = new CustomEvent("notify", {
                    detail:
                        { message: "Geen data om in te laden", life: notif.longTime, level: "warning", type:"no_access_warning", id:me.id }
                });
                notifElement.dispatchEvent(event);
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
            if (typeof cur === 'undefined') {
                return '';
            }
        }
        return cur;
    }

    var days = ['Maandag', 'Dinsdag', 'Woensdag', 'Donderdag', 'Vrijdag', 'Zaterdag', 'Zondag'];

    function parseDate(format, val) {
        var ret = format;
        var date = new Date(val);

        var h = date.getHours() || "00";
        var m = date.getMinutes() || "00";

        ret = ret.replace('DAY', days[date.getDay()]);
        ret = ret.replace('HH', h);
        ret = ret.replace('mm', m);

        return ret;
    }

    function getActionFor(ele, obj) {
        var action = ele.getAttribute('action');
        var params = ele.getAttribute('parameters').replace(/ /g, '');;
        params = params.split(','); // to array

        // replace params by matching IDs
        for (var i = 0; i < params.length; i++) {
            var p = params[i];
            params[i] = getValueInObject(obj, p);
        }

        // get actions
        if (action === "a") {
            // Link action based on url and parameters
            var url = ele.getAttribute('link');

            // replace "{0}", etc by parameters
            url = format(url, params);
            return function () {
                window.location = url;
            };
        } else if (action === "click" || action === "onclick") {
            var refresh = ele.getAttribute('refresh') || false;

            var fname = ele.getAttribute('function');
            var ff = format(fname, params);

            var func = window[ff.slice(0, ff.indexOf("("))];

            return function () {
                // call function from string
                func.apply(this, params);
            }
        }
        console.warn("No action found for " + action);
    }

    if (this.table.search) {
        this.subscribeSearchBar();
    }
    ensure('tables', []);
    window.tables[this.id] = this;
}

// Exposed function
function loadTable() {
    ensure('table', { Manually: true });
    if (!table.Manually) {
        table.id = 'table-generate';
        var tl = new TableLoader();
        tl.fetch();
    }
}