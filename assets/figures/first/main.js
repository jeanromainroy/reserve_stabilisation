(function (d3) {
    "use strict";

    // Get Parent Div
    //var mainBox = d3.select("#main-box");
    var dataviz = d3.select("#first_fig");
    var textBox = d3.select("#text-box");
  
    // Main Graph
	var margin = {
		top: 32,
		right: 72,
		bottom: 96,
		left: 72
	};
	//var width = mainBox.node()['clientWidth'] - margin.left - margin.right;
    //var height = mainBox.node()['clientHeight'] - margin.top - margin.bottom;
	var width = 1300 - margin.left - margin.right;
    var height = 500 - margin.top - margin.bottom;

    // Requests
    var promises = [];
	promises.push(d3.dsv(";","assets/data/budgetary_statistics_march_2019.csv"));
	
	Promise.all(promises).then(function (results) {

        // Get data
        var data = results[0];
        if(data == null || data.length < 1){
            alert("ERROR: Could not load the data");
            return;
        }

        // Parse data
        var dataframe = createSources(data);

        // -----------------------------------------------------------------------
        // ------------------------ Objects Creation -----------------------------
        // -----------------------------------------------------------------------
        var svg = dataviz.append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom);

        // Graph Group
        var g = svg
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


        // Axis Labels
        var xAxisLabel = svg.append("text")
            .attr("class","x-label")
            .attr("transform", "translate(" + (width/2.0 + margin.left) + "," + (height + margin.bottom - 16) + ")")
            .text("");

        var yAxisLabel = svg.append("text")
            .attr("class","y-label")
            .attr("transform", "translate(" + 12 + "," + (height/2.0 + margin.top) + ")rotate(-90)")
            .text("");

        // set the labels
        xAxisLabel.text("Year");
        yAxisLabel.text("Millions $");


        // -----------------------------------------------------------------------
        // -------------------------- Scales Domain ------------------------------
        // -----------------------------------------------------------------------

        var xScale = d3.scaleTime().range([0, width]);
        var yScale = d3.scaleLinear().range([height, 0]);

        xScale.domain(d3.extent(data, function (d) {
            return d['year'];
        }));

        var minmaxY = minmax(dataframe,['surplus','gdp','accumulated_deficit_debt','gross_debt']);
        yScale.domain([Math.round(minmaxY[0]), Math.round(minmaxY[1])]);

        var xAxis = d3.axisBottom(xScale).ticks(d3.timeYear.every(1));		
        var yAxis = d3.axisLeft(yScale);

        // -----------------------------------------------------------------------
        // --------------------------- Draw Graph --------------------------------
        // -----------------------------------------------------------------------

        var colors = {
            "gdp":{
                "name":"GDP",
                "color":"#4b4bc3",
                "area": true
            },
            "gross_debt":{
                "name":"Gross Debt",
                "color":"#ac4d39"  ,
                "area": true      
            },
            "accumulated_deficit_debt":{
                "name":"Acc. Deficit Debt",
                "color":"#ccaa66",
                "area": true
            },
            "surplus":{
                "name":"Surplus",
                "color":"#266e73",
                "area": false
            },
            "stabilization_reserve":{
                "name":"Stabilization Reserve",
                "color":"#c6eccf",
                "area": true
                
            },
            "generations_fund":{
                "name":"Generations Fund",
                "color":"#60c85b",
                "area": true
            }
        }

        // Line Object
        var line = function(key){
            return d3.line()
                .x(function (d) {
                    return xScale(d['year']);
                })
                .y(function (d) {
                    return yScale(d[key]);
                });
        }

        // Area Object
        var area = function(key){
            return d3.area()
                .x(function (d) {
                    return xScale(d['year']);
                })
                .y1(function (d) {
                    return yScale(d[key]);
                })
                .y0(height);
        }

        // Draw Lines
        var colorKeys = Object.keys(colors);
        colorKeys.forEach(function(key){
            drawLine(g, dataframe, colors, key, line, area);
        });

        // Draw Legend
        legend(g, colors);
        d3.select(".legend").style("display","none");


        // Draw Axis
        g.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis);

        g.append("g")
            .attr("class", "y axis")
            .call(yAxis);

        
        function brushUpdate(minY, maxY, transitionDuration=1000) {
            
            // update domain
            yScale.domain([minY,maxY]);

            // update axis
            g.select(".y.axis")
            .transition()
            .duration(transitionDuration)
            .call(yAxis);

            // get all svgs
            var areas = svg.selectAll("path.area");
            var lines = svg.selectAll("path.line");

            // go through
            areas.nodes().forEach(function(path){

                // get the id
                var id = path['id'];

                // get the obj
                var mArea = area(id);

                d3.select(path)
                .transition()
                .duration(transitionDuration)
                .attr("d",function(d){
                    return mArea(d);
                });
            });

            // go through
            lines.nodes().forEach(function(path){

                // get the id
                var id = path['id'];

                // get the obj
                var mLine = line(id);

                d3.select(path)
                .transition()
                .duration(transitionDuration)
                .attr("d",function(d){
                    return mLine(d);
                });
            });
        }


        // -----------------------------------------------------------------------
        // ----------------------------- Animate ---------------------------------
        // -----------------------------------------------------------------------

        // 1. Start by hiding all the curves
        hideAll(g);
        textBox.style("display","none");
        fade(textBox.node());

        // 2. Intro text
        setTimeout(function(){
            
            textBox.node().innerHTML = text1;

            unfade(textBox.node())

        },1500);

        // 3. Hide text
        setTimeout(function(){

            fade(textBox.node());

        },6000);


        // 4. Draw Text
        setTimeout(function(){

            textBox.node().innerHTML = text2;

            unfade(textBox.node());

            displayLine(g, "gdp", colors);

        },8000);


        // 3. Hide text
        setTimeout(function(){

            fade(textBox.node());

        },12000);


        // 4. Draw Text
        setTimeout(function(){

            textBox.node().innerHTML = text3;

            unfade(textBox.node());

            displayLine(g, "gross_debt", colors);

        },14000);


        // 3. Hide text
        setTimeout(function(){

            fade(textBox.node());

        },20000);


        // 4. Draw Text
        setTimeout(function(){

            textBox.node().innerHTML = text4;

            unfade(textBox.node());

            brushUpdate(0,200000);

        },22000);


        // 3. Hide text
        setTimeout(function(){

            fade(textBox.node());

        },32000);


        // 4. Draw Text
        setTimeout(function(){

            textBox.node().innerHTML = text5;

            unfade(textBox.node());

            displayLine(g, "surplus", colors);

        },34000);


        // 3. Hide text
        setTimeout(function(){

            fade(textBox.node());

        },38000);


        // 4. Draw Text
        setTimeout(function(){

            textBox.node().innerHTML = text6;

            unfade(textBox.node());

            brushUpdate(0,14000);

        },40000);


        // 3. Hide text
        setTimeout(function(){

            fade(textBox.node());

        },44000);


        // 4. Draw Text
        setTimeout(function(){

            textBox.node().innerHTML = text7;

            unfade(textBox.node());

            displayLine(g, "generations_fund", colors);

        },46000);


        
    });
})(d3);


function fade(element) {
    var op = 1;  // initial opacity
    var timer = setInterval(function () {
        if (op <= 0.1){
            clearInterval(timer);
            element.style.display = 'none';
        }
        element.style.opacity = op;
        element.style.filter = 'alpha(opacity=' + op * 100 + ")";
        op -= op * 0.1;
    }, 50);
}

function unfade(element) {
    var op = 0.1;  // initial opacity
    element.style.display = 'block';
    var timer = setInterval(function () {
        if (op >= 1){
            clearInterval(timer);
        }
        element.style.opacity = op;
        element.style.filter = 'alpha(opacity=' + op * 100 + ")";
        op += op * 0.1;
    }, 10);
}