addEvent(window, 'load', function () {
    var params = getQueryParams();
    if (params.code)
    {
        //ToDo 
    }
    else
    {
        window.location = "login.html";
    }
});