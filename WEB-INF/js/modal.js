var bbd;
var modal;

addEvent(window, 'load', setUp)

function setUp() {
    loadCSS('css/modal.css');
    bbd = $('darkener');
    if (!bbd) {
        bbd = document.createElement('div');
        bbd.id = 'darkener';
        hide(bbd);
        addClass(bbd, 'darkener');
        document.body.appendChild(bbd);
        bbd.onclick = closeMenu;
    }
}

function openMenu(menu) {
    show(bbd);
    if (menu instanceof HTMLElement) {
        modal = menu;
    } else {
        modal = $(menu);
    }
    show(modal);
}

function closeMenu(e) {
    if (e != null) {
        if (e.target != null){
            if (e.target.id.indexOf('darkener') === -1)
            return;
        }
    }

    hide(bbd);
    hide(modal);
}

/// Modal generation
Modal = function(name) {

    // Create a basic holder element
    this.basicElement = document.createElement('div');

    // Ensure that the user can style the modal
    addClass(this.basicElement, 'modal');

    // Hide the modal in advance
    hide(this.basicElement);

    // Get the darkener, and insert it into the darkener
    bbd.insertAdjacentElement('afterbegin', this.basicElement);

    // Remember the list of added inputs
    var values = [];

    // Basic open function
    Modal.prototype.open = function() {
        openMenu(this.basicElement);
    }

    // Basic close function
    Modal.prototype.close = function() {
        hide(bbd);
        hide(modal);
    };

    // Add an input of type
    // OPTION is not supported
    Modal.prototype.addInput = function(type, label, id) {
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

        values.push(inp);

        // label
        var lab = document.createElement('label');
        lab.setAttribute('for', id);
        lab.innerHTML = label;

        // add
        d.appendChild(lab);
        d.appendChild(inp);
        this.basicElement.appendChild(d);
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
    Modal.prototype.addDivider = function() {
        var divider = document.createElement('div');
        addClass(divider, 'divider');
        this.basicElement.appendChild(divider);
    }

    // Add a title with the desired size (1-5)
    Modal.prototype.addTitle = function(size, name) {
        var t = document.createElement('h' + size);
        t.innerHTML = name;
        this.basicElement.appendChild(t);
    }

    // Add a button
    // callback values are "e" and a JSON of all the filled in values
    Modal.prototype.addButton = function(callback, name, id) {
        id = id || "";
        var d = document.createElement('div');
        addClass(d,'btn');
        d.innerHTML=name;
        d.id = id;
        d.onclick=function(e) {
            if (callback)
                callback(e, gv());   
        };
        this.basicElement.appendChild(d);
    }

    // Add a spacing between elements
    Modal.prototype.addSpace = function(amnt) {
        var d = document.createElement('div');
        d.style.height = amnt + 'px';
        this.basicElement.appendChild(d);
    }

    // add the title
    this.addTitle(2, name);

    // add a divider
    this.addDivider();
}