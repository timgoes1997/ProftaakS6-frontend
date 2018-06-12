// Dependent on a element with id "notif-holder"
addEvent(window, 'load', setUp)
var notifID = 'notif-holder';
var notifElement;
var notifs = [];
var notif = {
    "shortTime": 1000,
    "defaultTime": 1500,
    "longTime": 5000
}

function setUp() {
    notifElement = document.getElementById(notifID);
    if (!notifElement) {
        console.error("No element with id " + notifID + " found");
    }
    notifElement.addEventListener("notify", function (e) {
        e = e.detail;
        if (e.notified) return;
        notify(e.message, e.level, e.life, e.parent);
    });
}

function notify(message, level, life, parent) {
    // check if notification already exists
    var n = getNotif(message);
    if (n) {
        n.refresh();
        return n;
    }

    var p = parent ? parent : notifElement;
    if (!(p instanceof HTMLElement)) {
        p = document.getElementById(p);
    }
    var n = new Notif(message, level, life);
    n.show(p);
    return n;
}

function getNotif(message) {
    for (var i = 0; i < notifs.length; i++) {
        if (notifs[i].message === message) {
            return notifs[i];
        }
    }
    return null;
}

Notif = function (message, level, life) {
    var me = this;
    this.life = life ? life : Infinity;
    this.message = message;
    this.level = level ? level : "info";
    this.basicElement;
    this.active = true;
    this.timer;
    this.show = function (parent) {
        this.basicElement = this.createOn(parent);
        notifs.push(this);
        if (this.life !== Infinity) {
            this.timer = setTimeout(this.remove, this.life);
        }
    };

    this.remove = function () {
        if (me.active) {
            removeElement(me.basicElement);
            removeFromNotifs(this);
            me.active = false;
        }
    }

    this.refresh = function () {
        if (this.active && this.timer) {
            clearTimeout(this.timer);
            this.timer = setTimeout(this.remove, this.life);
        }
    }

    this.createOn = function (parent) {
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
        c.onclick = this.remove;
        return notif;
    }

    function removeFromNotifs(n) {
        notifs.splice(notifs.indexOf(n), 1);
    }
}