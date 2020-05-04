"use strict"


function legend(svg, sources, boxWidth=20) {
    
    var legend = svg.append("g")
        .attr("class", "legend")
        .attr("transform", "translate(20,10)")
        .style("font-size", "12px");

    // Keys
    var keys = Object.keys(sources);
    
    // populate data arr
    var data = [];
    keys.forEach(function(key){
        
        var name = sources[key]['name'];
        var color = sources[key]['color'];

        data.push({
            "src_name":key,
            "name":name,
            "color":color
        });
    });
    
    // Affiche un carré de la même couleur que la ligne qui lui correspond
    legend.selectAll("rect")
        .data(data)
        .enter()
        .append("rect")
        .attr("id",function(d){
            return d.src_name;
        })
        .attr("fill", function (d) {
            return d.color;
        })
        .attr("stroke", "black")
        .attr("width", boxWidth)
        .attr("height", boxWidth)
        .attr("y", function (d, i) {
            return i * (boxWidth + 15);
        })
        .attr("x", 0)
        .attr("value", function (d) {
            return d.name;
        })
        .on("click", function(d) {
            displayLine(svg, d.src_name, sources);
        });

    // Affiche un texte à droite du carré de couleur pour lier le nom de la rue à une couleur
    legend.selectAll("text")
        .data(data).enter()
        .append("text")
        .attr("y", function (d, i) {
            return 14 + i * (boxWidth + 15);
        })
        .attr("x", boxWidth + 8)
        .text(function (d) {
            return d.name;
        });
}


function displayLine(svg, id, sources) {

    // Get the color
    var color = sources[id]['color'];

    // Get the clicked path
    var paths = svg.selectAll("path.area,path.line");
    var path = paths.nodes().filter(function(path){
        return path['id'] == id;
    });
    if(path == null){
        return;
    }
    path = d3.select(path[0]);


    // Get the clicked rectangle
    var elements = svg.selectAll("rect")
    var element = elements.nodes().filter(function(rect){
        return rect['id'] == id;
    });
    if(element == null){
        return;
    }
    element = d3.select(element[0]);
    
    
    // Hide/Show
    if (element.attr("fill") === "white") {
        element.attr("fill", color);
        path.style("opacity",1);
    } else {
        element.attr("fill", "white");
        path.style("opacity",0);
    }
}


function hideAll(svg){

    // Get the clicked path
    var paths = svg.selectAll("path.area,path.line");
    var elements = svg.selectAll("rect");
    elements.attr("fill", "white");
    paths.style("opacity",0);
}