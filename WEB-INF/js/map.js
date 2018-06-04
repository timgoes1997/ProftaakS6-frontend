// Extend the addcar function
var __$a = addCar;
addCar = function () {
    var f = $('owner').value;
    return __$a(toUpperCase(f));
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
    
    // load in query param to see what car should be initially tracked
    waitUntil(function() {return window.mapLoaded;}, function() {
        var params = getQueryParams();
        if (params.license) {
            $('owner').value = params.license;

            var d = new Date();
            d.setDate(d.getDate()-7);
            $('starttime').valueAsDate = d;
            $('endtime').valueAsDate = new Date();

            setEndTime();
            setStartTime();
            addCar();
        }
    }, 100, 100000);
    
}

////////// OPTION FUNCTIONS
function setRealtime() {
    if ($('realtime')) {
        useRealtime = $('realtime').checked;

        $('starttime').disabled = useRealtime;
        $('endtime').disabled = useRealtime;
    } else {
        useRealtime = false;
    }
}
function setStartTime() {
    start = $('starttime').valueAsDate;
}
function setEndTime() {
    end = $('endtime').valueAsDate;
}