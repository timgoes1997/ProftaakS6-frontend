// Extend the addcar function
var __$a = addCar;
addCar = function () {
    var f = $('owner').value;
    return __$a(f);
}

addEvent(window, 'load', initTrack);

function initTrack() {
    // set realtime function
    setRealtime();

    // set the enter key to track if possible
    addEvent($('owner'), 'keyup', function(e) {
        event.preventDefault();
        if (event.keyCode === 13) {
            addCar();
        }
    });
}

////////// OPTION FUNCTIONS
function setRealtime() {
    useRealtime = $('realtime').checked;

    $('starttime').disabled = useRealtime;
    $('endtime').disabled = useRealtime;
}
function setStartTime() {
    start = $('starttime').value;
}
function setEndTime() {
    end = $('endtime').value;
}