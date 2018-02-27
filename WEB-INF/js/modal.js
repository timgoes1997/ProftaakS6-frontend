//window.onload = function (e) {
//    $('signin-form').addEventListener('submit', funciton);
//};

function openMenu(menu) {
    show($('darkener'));
    if (menu instanceof HTMLElement) {
        show(menu)
    } else {
        show($(menu));
    }
}

function closeMenu(menu) {
    hide($('darkener'));
    if (menu instanceof HTMLElement) {
        hide(menu)
    } else {
        hide($(menu));
    }
}