"use strict";

// Sort
function sortByDateAscending(a,b){
    return a['date'] - b['date'];
}

// Cleanup
function cleanup(myStr){

    // remove ,
    var cleaned = myStr.replace(/,/g, '');

    // replace -
    cleaned = cleaned.replace(/–/g, '-');
    
    return cleaned;
}


function createSources(data){

    // Init
    var dataframe = [];
    var dateParser = d3.timeParse("%Y");

    data.forEach(function(d){ 
        
        // obtain keys
        var keys = Object.keys(d);
        
        // cleanup
        keys.forEach(function(key){
            d[key] = cleanup(d[key]);

            // convert to numb if not year
            if(key != 'year'){
                d[key] = +d[key];
            }
        });

        // start-end, we take start
        d['year'] = dateParser(String(d['year'].split("-")[0]));

        // populate
        dataframe.push(d);
    });

    // sort by date
    dataframe = dataframe.sort(sortByDateAscending);

    return dataframe;
}

function minmax(dataframe, keys){

    var minY = Infinity;
    var maxY = -Infinity;

    dataframe.forEach(function(d){ 
        
        // go through
        keys.forEach(function(key){
            
            // get val
            var val = d[key];

            if(val > maxY){
                maxY = val;
            }

            if(val < minY){
                minY = val;
            }
        });

    });

    return [minY, maxY];
}