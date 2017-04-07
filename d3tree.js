

function createChart(chromeData) {
    var index = 0,
        chartNodes = [],
        chartLinks = [];

    /**
     * Create nodes
     */
    function createNodesArray(data, level) {
        _.each(data, function(d, ind) {

            if (d.children) {
                chartNodes.push({
                    'index': index++,
                    'id': d.id,
                    'title': d.title,
                    'parentId': d.parentId,
                    'r': 30
                });
                createNodesArray(d.children, level++);
            } else {
                chartNodes.push({
                    'index': index++,
                    'id': d.id,
                    'url': d.url,
                    'title': d.title,
                    'parentId': d.parentId,
                    'r': 20
                });
            }
        });
    }

    createNodesArray(chromeData, -1);
    //console.log("chromeNodes: "+ JSON.stringify(chartNodes));

    /**
     * The links array needs to be in the format
     * { source: <nodeIndex>, target: <nodeIndex>}
     * This is what makes the links between the circles
     */
    function createLinksArray(data) {
        _.each(data, function(d) {
            
   			if (d.parentId) {

                var parentExist = false;
                for (var i=0 ; i < data.length && !parentExist ; i++) {
                        parentExist = ( data[i].id == d.parentId ); 
                };
                if (parentExist) {
                    chartLinks.push({
                        'source': d.parentId,
                        'target': d.id });
                } else console.log("Parent "+ d.parentId +" does not exist!!");
            }
        });
    }


    createLinksArray(chartNodes);

    var dataset = {
        'nodes': chartNodes,
        'links': chartLinks
    };

    /**
     * Initialize a default force layout,
     * using the nodes and links in dataset
     */
    var force = d3.forceSimulation(dataset.nodes)
         .force("link", d3.forceLink(dataset.links).id( function(d) { return d.id;} ))
         .force("charge", d3.forceManyBody()/*.strength(-120)*/)
         .force("center", d3.forceCenter()) ;

//    force.nodes(dataset.nodes);
//    force.force("link").links(dataset.links);

    var colors = d3.scaleOrdinal(d3.schemeCategory20);

    //Create SVG element
    var svg = d3.select("#tree")
        .append("svg")
		.attr("preserveAspectRatio", "xMinYMin meet")
		.attr("viewBox", "0 0 1000 1000")
		.classed("svg-content", true);

    //Create links as lines
    var links = svg.selectAll("line")
        .data(dataset.links)
        .enter()
        .append("line")
        .style("stroke", "#ccc")
        .style("stroke-width", 1);

    //Create nodes as circles
    var nodes = svg.selectAll("circle")
        .data(dataset.nodes)
        .enter()
        .append("circle")
        .attr("r", function(d) { return d.r; })
        .attr("class", "node")
        .style("fill", function(d) { return colors(d.parentId); })
        .call(d3.drag());   // Really not sure about this one !!!

    //default browser title
     nodes.append("title")
           .text(function(d) { return d.title; });
    
     nodes.parent.append("text")
         .text(function(d) { return d.title; })
         .attr(
                 {"text-anchor": "middle",
                  "font-size": function(d) { return d.r / ((d.r * 10) / 100); }
                  //,
                  //"dy": function(d) { return d.r / ((d.r * 25) / 100); }
                 }
           );


    //open the url on dbclick
    //the single click drags the circles around :)
    nodes.on('dblclick', function(d) {
        //console.log(JSON.stringify(d.url));
        window.open(d.url);
    });

    nodes.on('mouseover', function(d) {
        //find x, y position
        var xPosition = parseFloat(d3.select(this).attr("x")),
            yPosition = parseFloat(d3.select(this).attr("y")),
            color = d3.select(this).style("fill");

        // make the circle bigger
        d3.select(this)
            .attr('r', 20);

        //Update the tooltip position and value
        var tooltip = d3.select("#tooltip")
            .style("left", xPosition + "px")
            .style("top", yPosition + "px")
            .style("background-color", color);

        tooltip.select("#title")
            .text(d.title);

        //Show the tooltip
        d3.select("#tooltip").classed("hidden", false);
    })
    .on("mouseout", function(d) {
        d3.select(this)
            .transition()
            .duration(250)
            .attr('r', 10);
        d3.select("#tooltip").classed("hidden", true);
    });

    //Every time the simulation "ticks", this will be called
    force.on("tick", function() {
        links.attr("x1", function(d) { return d.source.x; })
             .attr("y1", function(d) { return d.source.y; })
             .attr("x2", function(d) { return d.target.x; })
             .attr("y2", function(d) { return d.target.y; });

        nodes.attr("cx", function(d) { return d.x; })
             .attr("cy", function(d) { return d.y; });

    });
}

//////////////////////////////////////////////////////////


// Traverse the bookmark tree, and print the folder and nodes.
function dumpBookmarks() {
  var nodes = chrome.bookmarks.getTree(
      function(nodes) {
          createChart(nodes);
      }
  );
}


function getOptions() {
    var options = {"flat": $('#flat').is(':checked')};
    return options;
}

document.addEventListener('DOMContentLoaded', function () {
  $("#view_table").click(function() {
    chrome.tabs.update( null, {"url": chrome.extension.getURL("table.html")});
  });
  $("#view_tree").click(function() {
    chrome.tabs.update( null, {"url": chrome.extension.getURL("tree.html")});
  });
  $("#flat").change(function() { dumpBookmarks()});
  dumpBookmarks();
});

