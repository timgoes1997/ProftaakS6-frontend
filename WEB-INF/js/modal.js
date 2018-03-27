var bbd;
var modal;

addEvent(window, 'load', setUp)

function setUp() {
    if (!$('darkener')) {
        console.error("No darkener to attach to");
    }
}

function openMenu(menu) {
    show(bbd);
    if (menu instanceof HTMLElement) {
        modal = menu;
    } else if (menu instanceof Modal) { 
        menu.open();
    } else {
        modal = $(menu);
    }
    if (modal)
        show(modal);
}

function closeMenu(e) {
    if (e != null) {
        if (e.target != null) {
            if (e.target.id.indexOf('darkener') === -1)
                return;
        }
    }

    hide(bbd);
    hide(modal);
}

/// Modal generation
Modal = function (name, form, id) {
    this.formEnabled = form == null ? false : true;

    // Create a basic holder element
    if (this.formEnabled) {
        this.basicElement = document.createElement('iframe');
    } else {
        this.basicElement = document.createElement('div');
        this.form = this.basicElement;
    }

    // Ensure that the user can style the modal
    addClass(this.basicElement, 'modal');

    // Hide the modal in advance
    hide(this.basicElement);

    // Get the darkener, and insert it into the darkener
    bbd = $('darkener');
    this.basicElement.id = id;
    bbd.insertAdjacentElement('afterbegin', this.basicElement);

    if (this.formEnabled) {
        var frame = this.basicElement.contentWindow.document;
        addClass(frame.body.parentNode, 'iframe-modal');

        var f = document.createElement('form');
        addClass(f, 'modal');
        frame.body.appendChild(f);
        this.form = f;

        // append all styles
        var styles = document.getElementsByTagName('LINK');
        var otherhead = frame.getElementsByTagName("head")[0];
        for (var i = 0; i < styles.length; i++) {
            var href = styles[i].href;
            var link = frame.createElement("link");
            link.setAttribute("rel", "stylesheet");
            link.setAttribute("type", "text/css");
            link.setAttribute("href", href);
            otherhead.appendChild(link);
        }
    }

    // Remember the list of added inputs
    var values = [];
    // Rember how to verify
    var verff = [];

    // Basic open function
    Modal.prototype.open = function () {

        openMenu(this.basicElement);

        if (this.basicElement.height < 5) {
            // set frame height
            var e = this.form;
            this.basicElement.height = Math.max(e.clientHeight, e.scrollHeight, e.offsetHeight) + 2;
        }
    }

    // Basic close function
    Modal.prototype.close = function () {
        hide(bbd);
        hide(modal);
    };

    Modal.prototype.getForm = function () {
        return this.form;
    }

    Modal.prototype.getElement =  function() {
        return this.basicElement;
    }

    Modal.prototype.verified = function () {
        var ret = true;
        for (var i = 0; i < verff.length; i++) {
            var v = verff[i];
            var ele = v.ele;
            var func = v.func;
            var t = func(ele);

            if (!t) {
                ret = false;
                addClass(ele, 'wrong');
            }
        }
        return ret;
    }

    // Add an input of type
    // OPTION is not supported
    Modal.prototype.addInput = function (type, label, id, placeholder, verifiedFunc) {
        if (id == null) {
            id = label;
        }

        // wrapper div
        var d = document.createElement('div');
        addClass(d, 't-two-inline');

        // input type
        var inp = document.createElement('input');
        inp.setAttribute('type', type);
        inp.setAttribute('name', id);
        addClass(inp, type);
        inp.id = id;
        if (type === 'text') {
            inp.placeholder = placeholder || label;
        }
        inp.onfocus = function () {
            removeClass(this, 'wrong');
        }
        if (verifiedFunc)
            verff.push({ 'ele': inp, 'func': verifiedFunc });

        values.push(inp);

        // label
        var lab = document.createElement('label');
        lab.setAttribute('for', id);
        lab.innerHTML = label;

        // add
        d.appendChild(lab);
        d.appendChild(inp);
        this.form.appendChild(d);
    }

    // Get all values of the values on the modal
    var gv = function getValues() {
        var ret = {};
        for (var i = 0; i < values.length; i++) {
            var v = values[i];
            ret[v.name] = v.value;
        }
        return ret;
    }
    Modal.prototype.getValues = gv;


    // Add a simple divider for styling
    Modal.prototype.addDivider = function () {
        var divider = document.createElement('div');
        addClass(divider, 'divider');
        this.form.appendChild(divider);
    }

    // Add a title with the desired size (1-5)
    Modal.prototype.addTitle = function (size, name) {
        var t = document.createElement('h' + size);
        t.innerHTML = name;
        this.form.appendChild(t);
    }

    // Add a button
    // callback values are "e" and a JSON of all the filled in values
    Modal.prototype.addButton = function (callback, name, id) {
        id = id || "";
        var d = document.createElement('div');
        addClass(d, 'btn');
        d.innerHTML = name;
        d.id = id;
        d.onclick = function (e) {
            if (callback)
                callback(e, gv());
        };
        this.form.appendChild(d);
    }

    Modal.prototype.addPost = function (properties) {
        var d = document.createElement('button');
        addClass(d, 'btn');
        d.innerHTML = name;
        d.type = "submit";
        this.form.appendChild(d);
        for (var property in properties) {
            if (properties.hasOwnProperty(property)) {
                d[property] = properties[property];
            }
        }
        this.form.onerror = properties.onerror;
        this.form.onsubmit = properties.onsubmit;
    }

    // Add a spacing between elements
    Modal.prototype.addSpace = function (amnt) {
        var d = document.createElement('div');
        d.style.height = amnt + 'px';
        this.form.appendChild(d);
    }

    // add the title
    this.addTitle(2, name);

    // add a divider
    this.addDivider();
}