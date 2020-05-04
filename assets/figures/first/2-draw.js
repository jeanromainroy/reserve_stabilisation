"use strict";

function getArrSubset(dataframe, key){

    return dataframe.map(function(item) { 
        var dict = {}; 
        dict["year"] = item["year"];
        dict[key] = item[key];
        return dict;
    });
}

function drawLine(g, dataframe, colors, key, lineObj, areaObj){

    // Get line data
    var lineData = getArrSubset(dataframe, key);
    var color = colors[key].color;
    var drawArea = colors[key].area;

    // get keys
    var keys = Object.keys(lineData[0]);
    
    if(keys.length != 2){
        alert("ERROR: Line data doesn't contain enough keys");
        return;
    }

    // get non 'year' key
    var key = keys.filter(function(d){
        return d != "year";
    });

    // Get the draw obj
    var line = lineObj(key);
    var area = areaObj(key);

    if(drawArea){
        // add the area
        g.append("path")
            .data([lineData])
            .attr("id", key)
            .attr("class", "area")
            .attr("fill",color)
            .attr("d", area);
    }else{
        // add the line
        g.append("path")
            .data([lineData])
            .attr("id", key)
            .attr("class", "line")
            .attr("d", line)
            .attr("fill","none")
            .attr("stroke",color)
            .attr("stroke-width","4px");
    }
}
