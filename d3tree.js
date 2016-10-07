

function createChart(chromeData) {
    var w = 780,
        h = 580,
        index = 0,
        chartNodes = [],
        chartLinks = [];

    /**
     * Create nodes only for the links,
     * remove the folders from the array.
     * They will be grouped visually by color.
     */
    function createNodesArray(data, level) {
        _.each(data, function(d, ind) {

            if (d.children) {
                createNodesArray(d.children, level);
            } else {
                chartNodes.push({
                    'index': index++,
                    'id': d.id,
                    'url': d.url,
                    'title': d.title,
                    'parentId': d.parentId
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

            var nextData = _.reject(data,
                function(num){ return num == d; });

            _.each(nextData, function(nd){

                if (d.id == nd.parentID) {
                    cartLinks.push({
                        'source': d.index,
                        'target': nd.index });
                }

                if (d.parentId == nd.parentId) {
                    chartLinks.push({
                        'source': d.index,
                        'target': nd.index });
                }
            });

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
    var force = d3.forceSimulation()
         .nodes(dataset.nodes)
         .force("link", d3.forceLink(dataset.links).distance(50))
         .force("charge", d3.forceManyBody().strength(-120))
         ;
//         .size([w, h])
//         .linkDistance([50])

    var colors = d3.scaleOrdinal(d3.schemeCategory20);

    //Create SVG element
    var svg = d3.select("#tree")
        .append("svg")
		.attr("preserveAspectRatio", "xMinYMin meet")
//		.attr("viewBox", "0 0 300 300")
        .attr("width", w)
        .attr("height", h)
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
        .attr("r", 10)
        .attr("class", "node")
        .style("fill", function(d) {
            return colors(d.parentId);
        })
        .call(d3.drag());   // Really not sure about this one !!!

    //default browser title
    // nodes.append("title")
    //       .text(function(d) {
    //         //console.log("title: "+d.title);
    //         return d.title; });

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


function dumpTreeNodes(bookmarkNodes, nbLinksCmul, options) {
  var list = $('<ul>');
  var nbLinks = 0;
  for (var i = 0; i < bookmarkNodes.length; i++) {
    if (bookmarkNodes[i].url)  nbLinks++;
    else {
        var elem = dumpNode(bookmarkNodes[i], options);
        nbLinksCmul = nbLinksCmul + elem.nbLinksCmul;
        list.append(elem.li);
    }
  }
  return {"ul":list, "nbLinks":nbLinks, "nbLinksCmul":nbLinksCmul};
}

function dumpNode(bookmarkNode, options) {
  var nbChildren = 0;
  var li;
  var obj;
  var nbLinks = 0;
  var nbLinksCmul = 0;
  if (bookmarkNode.children) {
      nbChildren = bookmarkNode.children.length;
  }
  if (nbChildren > 0) {
      obj = dumpTreeNodes(bookmarkNode.children, nbLinksCmul, options);
      nbLinks = obj.nbLinks;
      nbLinksCmul = obj.nbLinksCmul + nbLinks; 
  }
  var span = $('<span>');
  if (bookmarkNode.title) {
    if (bookmarkNode.url) {
    } else {
	    span.text(bookmarkNode.title + ": "+ nbLinks +" ; "+ nbLinksCmul );
        var scale = Math.log(nbLinksCmul)/Math.log(400);
        if (!options.flat) {
            span.css({ "font-weight": 100*Math.floor(10*scale),
                       "font-size": (1+scale*1.2)+"em" });
        };
        li = $('<li>').append(span);
    }
  } else {
      li = $('<div>').append(span);
  }

  if (obj) {
    li.append(obj.ul);
  }
  return {"li":li, "nbLinksCmul":nbLinksCmul};
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

