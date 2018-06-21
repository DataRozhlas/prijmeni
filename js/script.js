/*jslint browser: true*/
/*global $ availableTags console */
"use strict";

function niceNum(val) { //https://stackoverflow.com/questions/2901102/how-to-print-a-number-with-commas-as-thousands-separators-in-javascript
    return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
};

$( function () {
    $(".nameac").click(function() {
        $(this).val("");
    });

    $(".nameac").autocomplete({
        source: availableTags,
        minLength: 2
    });

    $.ui.autocomplete.filter = function (array, term) {
        return $.grep(array, function (value) {
            return value.toLowerCase().startsWith(term.toLowerCase());
        });
    };

    //initial chart load
    var years = [];
    for (var year = 1916; year <= 2016; year++) {
        years.push(year);
    };

    var appchart = Highcharts.chart("appchart", {
                        chart: {
                            height: 300
                        },
                        title: {
                            text: null
                        },
                        tooltip: {
                            shared: true
                        },
                        xAxis: {
                            crosshair: true,
                            categories: years
                        },
                        credits: {
                            enabled: false
                        },
                        yAxis: {
                            min: 0,
                            title: {
                                text: "Počet narozených"
                            },
                            labels: {
                                format: '{value}'
                            }
                        },
                        plotOptions: {
                            column: {
                                pointPadding: 0.1,
                                borderWidth: 0,
                                events: {
                                    legendItemClick: function () {
                                        return false;
                                    }
                                }
                            }
                        }
                    });

    $("#name1").val("Novák");
    $("#name2").val("Nováková");
    loadNameData("Novák", 1, true);

    // choosing name 1 - two options
    var shownName1;
    $(".ui-menu").click(function () {
        if (shownName1 != $("#name1").val()) {
            loadNameData($("#name1").val(), 1);
        }
    });
    $("#name1").on("keydown", function (event) {
        if (event.which === 13) {
            $(".ui-menu").hide();
            if (shownName1 != $("#name1").val()) {
                loadNameData($("#name1").val(), 1);
            }
        }
    });

    var timeoutID1 = 0;
    $("#name1").on("input", function () {
        window.clearTimeout(timeoutID1);
        timeoutID1 = window.setTimeout( function () {
            if (shownName1 != $("#name1").val()) {
                loadNameData($("#name1").val(), 1);
            }
        }, 500);
    });

    // choosing name 2
    var shownName2;
    $(".ui-menu").click(function () {
        if (shownName2 != $("#name2").val()) {
            loadNameData($("#name2").val(), 2);
        }
    });
    $("#name2").on("keydown", function (event) {
        if (event.which === 13) {
            $(".ui-menu").hide();
            if (shownName2 != $("#name2").val()) {
                loadNameData($("#name2").val(), 2);
            }
        }
    });


    var timeoutID2 = 0;
    $("#name2").on("keyup", function () {
        if ($("#name2").val() === "" || $("#name2").val() === " ") {
            try {
                appchart.get("name2").remove();
            } catch(err) {}
        }
    });
    $("#name2").on("input", function () {
        window.clearTimeout(timeoutID2);
        timeoutID2 = window.setTimeout( function () {
            if (shownName2 != $("#name2").val()) {
                loadNameData($("#name2").val(), 2);
            }
        }, 500);
    });
    
    function loadNameData(name, series, init=false) {
        if (name === "") {
            return
        }
        name = name.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
        if (series === 1) {
            shownName1 = name;
            var boxid = "#name1"
        } else if (series === 2) {
            shownName2 = name;
            var boxid = "#name2"
        }

        $.ajax({
            url: "https://nz57zz53mc.execute-api.eu-central-1.amazonaws.com/prod/novorozenci",
            type: "POST",
            contentType: "application/json",
            data: JSON.stringify({"name": name.toUpperCase()}),
            dataType: "json",
            success: function success(response) {
                if (init === true) {
                    loadNameData("Nováková", 2)
                }
                if (response["Items"].length === 0) {
                    $(boxid).addClass("wronginput");
                } else {
                    $(boxid).removeClass("wronginput");
                    var data = [];
                    var median_array = [];
                    years.forEach(function(year) {
                        data.push(response["Items"][0][year]);
                        for (var i = response["Items"][0][year]; i > 0; i--) {
                            median_array.push(year)
                        };
                    });
                    if (series === 1) {
                        $("#median1info").text("V roce 2016 žilo v Česku " + niceNum(median_array.length) + " nositelů příjmení " + name
                            + ". Medián jejich let narození je " + median_array[Math.round(median_array.length/2)-1] + ".");
                        
                        if (appchart.series.length != 0) {
                            appchart.get("name1").remove();
                        }

                        appchart.addSeries({
                            type: "column",
                            name: name,
                            data: data,
                            id: "name1"
                        });

                    } else if (series === 2) {
                        $("#median2info").text("V roce 2016 žilo v Česku " + niceNum(median_array.length) + " nositelů příjmení " + name
                            + ". Medián jejich let narození je " + median_array[Math.round(median_array.length/2)-1] + ".");

                        if (appchart.series.length === 2) {
                            appchart.get("name2").remove();
                        }

                        appchart.addSeries({
                            type: "spline",
                            name: name,
                            data: data,
                            id: "name2"
                        });
                    }
                }
            }
        });
    };

    Highcharts.chart("uniqnames", {
        chart: {
            height: 400
        },
        colors: ["#2b908f"],
        title: {
            text: "Jedinečná příjmení podle roku narození"
        },
        xAxis: {
            crosshair: true,
            categories: years
        },
        credits: {
            enabled: false
        },
        legend: {
            enabled: false
        },
        yAxis: {
            min: 0,
            title: {
                text: "Počet narozených"
            },
            labels: {
                format: '{value}'
            }
        },
        series: [{
            type: "area",
            name: "Jedinečná příjmení",
            data: [237,361,440,1072,1847,2850,3786,5116,6208,7653,9081,10537,12347,13890,15960,17061,18824,19225,20199,21057,22028,23096,24907,26547,29683,30556,32027,34768,35648,35044,40110,41697,41585,41157,42101,42649,42900,42904,42794,42796,42751,42305,40559,38907,39114,40184,40905,43678,44925,43622,42694,42530,42434,43769,45133,46057,47440,50545,52542,52287,52042,51269,50923,49786,46817,45112,44579,43704,43758,43289,42856,42188,42712,41551,42189,41852,40533,40353,37634,35007,33952,33881,33870,33291,34159,34224,34745,35170,35944,37348,38107,40118,41358,40838,40738,38991,38770,38316,38744,38693,37937]
        }],
        plotOptions: {
            area: {
                animation: false
            }
        }
    });

});