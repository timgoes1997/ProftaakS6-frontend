// Dependent on a element with id "notif-holder"
addEvent(window, 'load', setUp)
var notifID = 'notif-holder';
var notifElement;

function setUp() {
    notifElement = document.getElementById(notifID);
    if (!notifElement) {
        console.error("No element with id " + notifID + " found");
    }
}

function notify(message, level, life, parent) {
    var p = parent ? parent : notifElement;
    if (!(p instanceof HTMLElement)) {
        p = document.getElementById(p);
    }
    var n = new Notif(message, level, life);
    n.show(p);
    return n;
}

Notif = function (message, level, life) {
    this.life = life ? life : Infinity;
    this.message = message;
    this.level = level ? level : "info";
}

Notif.prototype.show = function (parent) {
    var basicElement = this.createOn(parent);
    if (this.life !== Infinity) {
        setTimeout(function () {
            removeElement(basicElement);
        }, this.life);
    }
};

Notif.prototype.createOn = function (parent) {
    var notif = document.createElement('div');
    var container = document.createElement('span');
    var c = document.createElement('p');
    notif.appendChild(container);
    notif.appendChild(c);
    c.innerHTML = 'x';
    container.innerHTML = this.message;

    // Add all classes
    addClass(notif, 'notif notif-' + this.level);

    // Add the element
    parent.appendChild(notif);
    c.onclick = function () {
        removeElement(notif);
    };
    return notif;
}