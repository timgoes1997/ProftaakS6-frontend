// Extend the addcar function
var __$a = addCar;
addCar = function () {
    var f = $('owner').value;
    return __$a(f);
}

addEvent(document, 'load', setRealtime);

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