addEvent(window, 'load', init);

function init()
{
    var template = document.getElementById("car-holder");
    var merk = document.getElementById("merk");
    var model = document.getElementById("model");
    var nummerplaat = document.getElementById("nummerplaat");
    var bouwdatum = document.getElementById("bouwdatum");

    call ("GET", API_PATH + "vehicles/currentUser/", null, function(e, succ){
        var carlist = JSON.parse(e);

        for (var i = 0; i < carlist.length; i++)
        {
            var car = carlist[i];

            var me = car.vehicle.brand;
            var mo = car.vehicle.modelName + " " + car.vehicle.edition;
            var nu = car.licensePlate;
            var d = new Date(car.vehicle.buildDateLong / 1000);
            var bouw = d.getFullYear() + "/" + (d.getMonth() + 1) + "/" + d.getDate();

            merk.innerHTML = "<p>Merk</p><p>"+ me + "</p>";
            model.innerHTML = "<p>Model</p><p>"+ mo + "</p>";
            nummerplaat.innerHTML = "<p>Nummerplaat</p><p>"+ nu + "</p>";
            bouwdatum.innerHTML = "<p>Bouwdatum</p><p>"+ bouw + "</p>";
            var clone = template.cloneNode(true);
            removeClass(clone, "hidden");
            if (template.nextSibling)
            {
                template.parentNode.insertBefore(clone, template.nextSibling);
            }
            else
            {
                template.parentNode.appendChild(clone);
            }
        }
    });

    
}