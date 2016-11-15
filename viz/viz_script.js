var radius = 7,
    padding = 1;

var tooltip = d3.select("div#councilor")
    //.style("position", "absolute")
    //.style("z-index", "10")
    .style("visibility", "hidden");

// We consider that the size of the box is 960x600
var width = 960,
    height = 600;

// Foci
var foci = [
                {x: 0.2*width, y:0.6*height}, // Foci CN
                {x: 0.6*width, y: 0.2*height}, // Foci CE
                {x: 0.8*width, y: 0.6*height}  // Foci CF
            ];

var svg = d3.select("div#viz")
        .append("div")
        .classed("svg-container", true) //container class to make it responsive
        .append("svg")
        //responsive SVG needs these 2 attributes and no width and height attr
        .attr("preserveAspectRatio", "xMinYMin meet")
        .attr("viewBox", "0 0 960 600")
        //class to make it responsive
        .classed("svg-content-responsive", true);



var simulation = d3.forceSimulation().alphaDecay(0)
        .force("collision", d3.forceCollide().radius(radius+padding))
    //.force("link", d3.forceLink().id(function(d) { return d.id; }))
    //.force("charge", d3.forceManyBody().strength(-2));
    //.force("center", d3.forceCenter(width / 2, height / 2));
    ;

d3.json("data/active.json", function(error, graph) {
    if (error) throw error;

    var nodes = graph.nodes;

    for(var i=0; i<nodes.length; i++) {
        nodes[i]["x"] = Math.random()*width;
        nodes[i]["y"] = Math.random()*height;
    }

    var node = svg.append("g")
            .attr("class", "nodes")
            .selectAll("circle")
            .data(nodes)
            .enter().append("circle")
            .attr("r", radius)
            .attr("fill", function(d) { return colors_parties(d.PartyAbbreviation);})
            .call(d3.drag()
                .on("start", dragstarted)
                .on("drag", dragged)
                .on("end", dragended))
            .on("mouseover", emphasis)
            .on("mouseout", back_to_normal)
        ;

    simulation
        .nodes(graph.nodes)
        .on("tick", ticked)
    ;

    svg.on("dblclick", dbclick);

    function ticked() {
        /*link
         .attr("x1", function(d) { return d.source.x; })
         .attr("y1", function(d) { return d.source.y; })
         .attr("x2", function(d) { return d.target.x; })
         .attr("y2", function(d) { return d.target.y; });*/

        node
            .each(gravity())
            .attr("cx", function(d) { return d.x; })
            .attr("cy", function(d) { return d.y; });
    }

    function emphasis(d) {
        d3.select(this).style("r", radius+2);
        tooltip.html(
            "<div><b>Name: </b>" + d.FirstName + " " + d.LastName + "</div>" +
            "<div><b>Party: </b>" + d.PartyName + " (" + d.PartyAbbreviation + ")</div>" +
            "<div><b>Council: </b>" + d.CouncilName + "</div>" +
            "<div><b>Birthday: </b>" + d.DateOfBirth + "</div>" +
            "<img src=\"data/portraits/" + d.PersonIdCode + ".jpg\" alt=\"" +
            d.FirstName + " " + d.LastName + "\">"
        )
        return tooltip.style("visibility", "visible");
    }

    function back_to_normal(d) {
        d3.select(this).style("r", radius);
        return tooltip.style("visibility", "hidden");
    }

    function dbclick() {
        // Put force back to null
        nodes.forEach(function(o,i) {
            o.fx = null;
            o.fy = null;
        });

        // Change stroke back to white
        node.style("stroke", null);
    }

});

function colors_parties(abbrev) {
    if (abbrev == 'PLD') {
        return '#3131BD'
    } else if (abbrev == 'UDC') {
        return '#088A4B'
    } else if (abbrev == 'PSS') {
        return '#FA1360'
    } else if (abbrev == 'PDC') {
        return '#FE9A2E'
    } else if (abbrev == 'PLR') {
        return '#0174DF'
    } else if (abbrev == 'PES') {
        return '#01DF01'
    } else if (abbrev == 'pvl') {
        return '#9AFE2E'
    } else if (abbrev == 'PBD') {
        return '#FFFF00'
    } else if (abbrev == 'PEV') {
        return '#FFD735'
    } else if (abbrev == 'Lega') {
        return '#0B3861'
    } else if (abbrev == 'csp-ow') {
        return '#E2563B'
    } else if (abbrev == '-') {
        return '#CCCCCC'
    } else if (abbrev == 'MCG') {
        return '#FECC01'
    } else if (abbrev == 'BastA') {
        return '#DFDE00'
    }  else if (abbrev == 'PdT') {
        return '#FF0000'
    }
}

// Move nodes toward cluster focus.
function gravity() {
    return function(d) {
        var alpha,
            rad,
            foci_x,
            foci_y;

        if (d.CouncilAbbreviation == "CN") {
            alpha = 0.01;
            rad = get_max_radius(200, radius+padding)+1;
            foci_x = foci[0].x;
            foci_y = foci[0].y;
        } else if (d.CouncilAbbreviation == "CE") {
            alpha = 0.03;
            rad = get_max_radius(46, radius+padding)+1;
            foci_x = foci[1].x;
            foci_y = foci[1].y;
        } else {
            alpha = 0.05;
            rad = get_max_radius(7, radius+padding)+1;
            foci_x = foci[2].x;
            foci_y = foci[2].y;
        }

        var dist = Math.sqrt(Math.pow(foci_y - d.y, 2) + Math.pow(foci_x - d.x, 2));

        if (dist > rad) {
            d.y += (foci_y - d.y) * alpha;
            d.x += (foci_x - d.x) * alpha;
        }
    };
}

function dragstarted(d) {
    d3.select(this).style("stroke", "black");
    if (!d3.event.active) simulation.alphaTarget(0.1).restart();
}

function dragged(d) {
    d.fx = d3.event.x;
    d.fy = d3.event.y;
}

function dragended(d) {
    d3.select(this).style("stroke", "black");
    if (!d3.event.active) simulation.alphaTarget(0);
}

function get_max_radius(n, rad) {
    if (n==1) {
        return rad;
    } else if (n<=7) {
        return 2*rad;
    } else if (n<=19) {
        return 3*rad;
    } else if (n<=37) {
        return 4*rad;
    } else if (n<=61) {
        return 5*rad;
    } else if (n<=91) {
        return 6*rad;
    } else if (n<=127) {
        return 7*rad;
    } else if (n<=169) {
        return 8*rad;
    } else if (n<=217) {
        return 9*rad;
    }
}
