addEvent(window, 'load', function () {
    ensure('modals', {});
});

function confirm(title, callback, text, yes, no) {
    var el = $('confirmation');
    if (el) {
        el.parentNode.removeChild(el);
    }

    yes = yes || title;
    no = no || 'Annuleer';

    var m = new Modal(title, true, 'confirmation', true);

    if (text) {
        m.addText(text);
        m.addDivider();
    }
    var p = m.addPost({
        'innerHTML': yes,
        'method': 'POST',
        'onsubmit': function (e) {
            // function interface here...
            callback(e);
            eat(e);
            m.close();
        }
    });
    addClass(p, 'warn');
    var e = m.addButton(function () {
        m.close();
        m.clear();
    }, no);
    addClass(e, 'ignore');
    modals.confirm = m;
    m.open();
    return m.basicElement;
}