// global variables
var API_PATH = 'http://localhost:8080/Rekeningrijden/api/';


function addEvent(element, eventName, fn) {
    if (element.addEventListener)
        element.addEventListener(eventName, fn, false);
    else if (element.attachEvent)
        element.attachEvent('on' + eventName, fn);
}

function hide(ele, n) {
    if (!n) {
        addClass(ele, 'hidden');
    } else
        addClass(ele, 'hidden-space');
}
function show(ele, n) {
    if (!n) {
        removeClass(ele, 'hidden');
    } else
        removeClass(ele, 'hidden-space');
}

function eat(e) {
    e.preventDefault();
}

function hasClass(ele, cls) {
    return (" " + ele.className + " ").indexOf(" " + cls + " ") > -1;
}

function addClass(ele, cls) {
    if (!hasClass(ele, cls)) {
        var space = ' ';
        if (endsWith(ele.className, space)) {
            space = '';
        }
        ele.className += space + cls;
        return true;
    }
    return false;
}

function removeClass(ele, cls) {
    if (hasClass(ele, cls)) {
        var reg = new RegExp("(\\s|^)" + cls + "(\\s|$)");
        ele.className = ele.className.replace(reg, " ")
    }
}

function toggleClass(ele, cls) {
    if (!addClass(ele, cls)) {
        removeClass(ele, cls)
    }
}

function removeElement(ele) {
    ele.parentNode.removeChild(ele);
}

function endsWith(str, suffix) {
    if (!str) return false;
    return str.indexOf(suffix, str.length - suffix.length) !== -1;
}

function $(id) {
    return document.getElementById(id);
}

function ensure(variable, def, root) {
    if (!root) root = window;
    var x = root[variable];

    if (typeof x == 'undefined') {
        root[variable] = def;
    }
}

function call(type, url, data, callback, h) {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function () {
        if (xmlHttp.readyState === 4 && xmlHttp.status === 200) {
            callback(xmlHttp.responseText, true);
        } else if (xmlHttp.readyState === 4 && xmlHttp.status !== 200) {
            callback('ERROR: ' + xmlHttp.responseText, false);
        }
    }
    xmlHttp.open(type, url, true);
    if (h) {
        xmlHttp.setRequestHeader('Content-Type', h);
    }
    xmlHttp.send(data);
}

function waitUntil(funcCond, readyAction, checkInterval, timeout, timeoutfunc) {
    if (checkInterval == null) {
        checkInterval = 100;
    }
    var start = +new Date();
    if (timeout == null) {
        timeout = Number.POSITIVE_INFINITY;
    }
    var checkFunc = function () {
        var end = +new Date();

        if (end - start > timeout) {
            if (timeoutfunc) {
                timeoutfunc();
            }
        } else {
            if (funcCond()) {
                readyAction();
            } else {
                setTimeout(checkFunc, checkInterval);
            }
        }
    };
    checkFunc();
};
function removeFromArray(arr) {
    var what, a = arguments, L = a.length, ax;
    while (L > 1 && arr.length) {
        what = a[--L];
        while ((ax = arr.indexOf(what)) !== -1) {
            arr.splice(ax, 1);
        }
    }
    return arr;
}
function format(format) {
    var args = Array.prototype.slice.call(arguments, 1);
    return format.replace(/{(\d+)}/g, function (match, number) {
        return typeof args[number] != 'undefined'
            ? args[number]
            : match
            ;
    });
}
function formatArray(format, arr) {
    arr.splice(0, 0, format);
    return window.format.apply(null, arr);
}

/* ##############################
         ASYNC LOADING
############################## */
function loadScript(url, ignore) {
    var r = window.location.hostname === '' ? '' : '/';
    if (ignore) r = '';
    var resource = document.createElement("script");
    resource.async = "true";
    resource.src = r + url;
    var script = document.getElementsByTagName("script")[0];
    script.parentNode.insertBefore(resource, script)
}
function loadCSS(url, ignore) {
    lastCSSloaded = false;
    var r = window.location.hostname === '' ? '' : '/';
    if (ignore) r = '';
    var link = document.createElement("link");
    link.href = r + url;
    link.type = "text/css";
    link.rel = "stylesheet";
    document.getElementsByTagName("head")[0].appendChild(link)
}
function loadUrl(url, ignore) {
    if (url.indexOf('css/') != -1) {
        loadCSS(url, ignore);
    } else {
        loadScript(url, ignore);
    }
}