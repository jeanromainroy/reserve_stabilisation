(function (d3) {
    "use strict";

    // Check if Mobile or Desktop
    var heightCoeff = 0.25;
    var onMobile = false;
    if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
        onMobile = true;
        heightCoeff = 0.66;
    }

    // Get Parent Div
    //var mainBox = d3.select("#main-box");
    var dataviz = d3.select("#first_fig");
    var textDiv = d3.select("#text-div");
  
    // Main Graph
	var margin = {
		top: 32,
		right: 128,
		bottom: 96,
		left: 128
	};
    var width = d3.select("body").node()['clientWidth'] - margin.left - margin.right;
    var height = Math.round(width*heightCoeff) - margin.top - margin.bottom;
    var textDivTop = height + margin.top + margin.bottom + 32 + 32 + 48;
    textDiv.style("top",textDivTop + "px")

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

        // additional 
        dataframe.forEach(function(datum){
            var diff = datum['surplus'] - datum['generations_fund'];
            datum['surplus_diff'] = (diff > 0) ? diff : 0.0;
        });

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
            .attr("transform", "translate(" + 48 + "," + (height/2.0 + margin.top) + ")rotate(-90)")
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
                "area": true
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
            },
            "surplus_diff":{
                "name":"Surplus Difference",
                "color":"#db94d4",
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

        var action1 = function(){
            hideAll(g);
            brushUpdate(0,0);
        }

        var action2 = function(){
            hideAll(g);
            brushUpdate(0,minmaxY[1]);
            displayLine(g, "gdp", colors);
        }

        var action3 = function(){
            hideAll(g);
            brushUpdate(0,minmaxY[1]);
            displayLine(g, "gdp", colors);
            displayLine(g, "gross_debt", colors);
        }

        var action4 = function(){
            hideAll(g);
            displayLine(g, "gdp", colors);
            displayLine(g, "gross_debt", colors);
            brushUpdate(0,200000);
        }

        var action5 = function(){
            hideAll(g);
            displayLine(g, "gdp", colors);
            displayLine(g, "gross_debt", colors);
            brushUpdate(0,200000);
            displayLine(g, "surplus", colors);
        }

        var action6 = function(){
            hideAll(g);
            displayLine(g, "surplus", colors);
            brushUpdate(0,14000);
        }

        var action7 = function(){
            hideAll(g);
            displayLine(g, "generations_fund", colors);
            displayLine(g, "surplus", colors);
            brushUpdate(0,14000);
        }


        var action8 = function(){
            hideAll(g);
            displayLine(g, "generations_fund", colors);
            displayLine(g, "surplus", colors);
            displayLine(g, "surplus_diff", colors);
            brushUpdate(0,14000);
        }

        var texts = [text1, text2, text3, text4, text5, text6, text7, text8];
        var actions = [action1,action2,action3,action4,action5,action6,action7,action8];
        var divHeight = textDiv.node().clientHeight;

        var nodes = [];

        for(var i=0 ; i<texts.length ; i++){

            // create node
            var pNode = document.createElement("p");
            pNode.innerHTML = texts[i];
            pNode.style.opacity = "0.0";
            pNode.style.paddingLeft = "32px";
            pNode.style.paddingRight = "32px";

            // add to array
            nodes.push(pNode);

            // Add to parent node
            textDiv.node().appendChild(pNode);

            if(i < texts.length - 1){
                var divNode = document.createElement("div");
                divNode.style.paddingBottom = (divHeight + 32) + "px";
                textDiv.node().appendChild(divNode);
            }
        };

        function hideAllpNodes(){
            for(var i=0 ; i<nodes.length ; i++){
                nodes[i].style.opacity = "0.0";
            }
        }     

        var lastViewed = -1;
        function showPNode(nodeIndex){
            
            // show node
            lastViewed = nodeIndex;
            hideAllpNodes();
            unfade(nodes[nodeIndex]);

            // graph update
            actions[nodeIndex].call(this);
        }

        textDiv.node().onscroll = function(){

            var nodesInView = {};
            for(var i=0 ; i<nodes.length ; i++){
                nodesInView[i] = isScrolledIntoView(textDiv.node(),nodes[i]);
            }

            if(lastViewed == -1 || nodesInView[lastViewed] == false){
                for(var i=0 ; i<nodes.length ; i++){
                    if(nodesInView[i]){
                        showPNode(i);
                        break;
                    }
                }
            }
        }

        // hide all
        hideAll(g);
        textDiv.node().scrollTo(0,0);
        showPNode(0);

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

function isScrolledIntoView(parent, child) {

    // Where is the parent on page
    var parentRect = parent.getBoundingClientRect();
    // What can you see?
    var parentViewableArea = {
        top: parentRect.top,
        bottom: parentRect.bottom,
        height: parent.clientHeight,
        width: parent.clientWidth
    };

    // Where is the child
    var childRect = child.getBoundingClientRect();

    // is viewable?
    if(childRect.bottom < parentViewableArea.top){
        return false;
    }else if(childRect.top > parentViewableArea.bottom){
        return false;
    }else{
        return true;
    }
}