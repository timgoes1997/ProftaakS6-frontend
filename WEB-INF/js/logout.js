var lo = false;

window.onload = function (e) {
    // simulate logging out
    setTimeout(function() {
        lo = true;
    }, 3000);

    waitUntil(loggedOut, function() {
        window.location = 'login.html';
    }, 100, 10000, function() {
        location.reload();
    })
};

function loggedOut() {
    return lo;
}