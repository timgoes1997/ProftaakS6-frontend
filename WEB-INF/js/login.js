window.onload = function (e) {
    $('signin-form').addEventListener('submit', logon);
    $('signup-form').addEventListener('submit', register);
};

function logon(e) {
    eat(e);
    window.location = 'profiel.html';
}
function register(e) {
    eat(e);
    window.location = 'profiel.html';
}