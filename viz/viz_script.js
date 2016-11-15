// Get the clustering
var rad = document.Clustering.buttons;
var prev = null;
var cluster = "none";
var changed = false;
for(var i = 0; i < rad.length; i++) {
    rad[i].onclick = function() {
        (prev)? console.log(prev.value):null;
        if(this !== prev) {
            prev = this;
            cluster = this.value;
        }
        changed = true;
    };
}

var pi = Math.PI;

// Define some variables
var radius = 7,
    padding = 1;

// We consider that the size of the box is 960x600
var width = 960,
    height = 600;

// Foci
var foci = {
    "council": {
        "CN": {"x": 0.2 * width, "y": 0.6 * height},        // Foci CN
        "CE": {"x": 0.6 * width, "y": 0.2 * height},        // Foci CE
        "CF": {"x": 0.8 * width, "y": 0.6 * height}         // Foci CF
    },
    "none": {},                                             // No Foci
    "party": {},                                            // Foci are created later
    "gender": {
        "m": {"x": 0.3*width, "y": 0.5*height},             // Foci Male
        "f": {"x": 0.7*width, "y": 0.5*height}              // Foci Female
    },
    "language": {}                                          // Foci are created later
};

var nbr = {};
nbr["council"] = {};
nbr["party"] = {};
nbr["gender"] = {};
nbr["language"] = {};

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
        .velocityDecay(0.1)
        .force("collision", d3.forceCollide().radius(radius+2*padding).iterations(2))
    //.force("link", d3.forceLink().id(function(d) { return d.id; }))
    //.force("charge", d3.forceManyBody().strength(-2));
    //.force("center", d3.forceCenter(width / 2, height / 2));
    ;

d3.json("data/active.json", function(error, graph) {
    if (error) throw error;

    var nodes = graph.nodes;

    var list_parties = [];
    var list_languages = [];

    for(var i=0; i<nodes.length; i++) {
        nodes[i]["x"] = Math.random()*width;
        nodes[i]["y"] = Math.random()*height;
        nodes[i]["radius"] = radius;

        // Get nbr by council
        if(!(nodes[i]["CouncilAbbreviation"] in nbr["council"])) {
            nbr["council"][nodes[i]["CouncilAbbreviation"]] = 1;
        } else {
            nbr["council"][nodes[i]["CouncilAbbreviation"]] += 1;
        }

        // Get nbr by party
        if(!(nodes[i]["PartyAbbreviation"] in nbr["party"])) {
            nbr["party"][nodes[i]["PartyAbbreviation"]] = 1;
            list_parties.push(nodes[i]["PartyAbbreviation"]);
        } else {
            nbr["party"][nodes[i]["PartyAbbreviation"]] += 1;
        }

        // Get nbr by gender
        if(!(nodes[i]["GenderAsString"] in nbr["gender"])) {
            nbr["gender"][nodes[i]["GenderAsString"]] = 1;
        } else {
            nbr["gender"][nodes[i]["GenderAsString"]] += 1;
        }

        // Get nbr by language
        if(!(nodes[i]["NativeLanguage"] in nbr["language"])) {
            nbr["language"][nodes[i]["NativeLanguage"]] = 1;
            list_languages.push(nodes[i]["NativeLanguage"]);
        } else {
            nbr["language"][nodes[i]["NativeLanguage"]] += 1;
        }
    }

    // Create Foci for parties
    shuffle(list_parties);

    for(var i=0; i<list_parties.length; i++) {
        foci["party"][list_parties[i]] = {"x": (i+1)/(list_parties.length+1)*width, "y": (Math.pow(-1, i)*0.25 + 0.5)*height};
    }

    // Create Foci for languages
    shuffle(list_languages);

    for(var i=0; i<list_languages.length; i++) {
        foci["language"][list_languages[i]] = {"x": (i+1)/(list_languages.length+1)*width, "y": (Math.pow(-1, i)*0.25 + 0.5)*height};
    }

    // Create array of foci
    var array_foci = {};
    for(var key1 in foci) {
        if(key1 != "none") {
            array_foci[key1] = []
            for (var key in foci[key1]) {
                var json = {}
                json["cx"] = foci[key1][key]["x"];
                json["cy"] = foci[key1][key]["y"];
                json["key"] = key;

                array_foci[key1].push(json);
            }
        }
    }

    var node = svg.append("g")
            .attr("class", "nodes")
            .selectAll("circle")
            .data(nodes)
            .enter().append("circle")
            .attr("class", "dataNodes")
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

        //update_foci(changed);

        node
            .each(gravity())
            .attr("cx", function(d) { return d.x; })
            .attr("cy", function(d) { return d.y; });
    }

    function emphasis(d) {
        d3.selectAll(".dataNodes").style("r", radius);
        d3.select(this).style("r", 1.5*radius);
        document.getElementById("councilorName").innerHTML = d.FirstName + " " + d.LastName;
        document.getElementById("councilorParty").innerHTML = d.PartyName;
        document.getElementById("councilorCouncil").innerHTML = d.CouncilName;
        document.getElementById("councilorBirthday").innerHTML = d.DateOfBirth;
        document.getElementById("councilorLanguage").innerHTML = d.NativeLanguage;
        document.getElementById("councilorImage").src = "data/portraits/" + d.PersonIdCode + ".jpg";
        document.getElementById("councilorImage").alt = d.FirstName + " " + d.LastName;
    }

    window.addEventListener('click', function (evt) {
        if (evt.detail === 3) {
            nodes.forEach(function(o, i) {
                o.x += (Math.random() - .5) * 40;
                o.y += (Math.random() - .5) * 40;
            });
        }
    });

    function back_to_normal(d) {
        //d3.select(this).style("r", radius);
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

    function update_foci() {
        if (changed) {
            d3.selectAll(".surroundings").remove();
            if (cluster != "none") {
                var surroundings = svg.append("g")
                    .selectAll("circle")
                    .data(array_foci[cluster])
                    .enter().append("circle")
                    .attr("class", "surroundings")
                    .attr("cx", function (d) {
                        return d.cx
                    })
                    .attr("cy", function (d) {
                        return d.cy
                    })
                    .attr("r", function (d) {
                        return radius_foci(radius, nbr[cluster][d.key]);
                    })
                    .attr("fill", "transparent")
                    .attr("stroke-width", 3)
                    .attr("stroke", "black");

                for(var key in nbr[cluster]) {
                    var rad = radius_foci(radius, nbr[cluster][key])

                    var arc = d3.arc()
                            .innerRadius(20)
                            .outerRadius(20+10)
                            .startAngle(45 * (Math.PI/180)) //convert from degs to radians
                            .endAngle(3) //just radians
                        ;

                    svg.append("g")
                        .selectAll("path")
                        .append("path")
                        .attr("class", "arcFoci")
                        .attr("id", "arcFoci_"+key)
                        .attr("d", arc)
                        .attr("transform", function(d) {
                            return "translate(" + array_foci[cluster][key].cx + ", " + array_foci[cluster][key].cy + ")";
                        })
                        .attr("stroke", "red")
                        .attr("stroke-width", 18);
                }

                /*svg.append("g")
                    .data(array_foci[cluster])
                    .enter().append("text")
                    .attr("class", "textFoci")
                    .append("textPath")
                    .attr("xlink:href",function(d){return "#arcFoci_"+d.key;})
                    .text("LOOOOOOOOOOOOL");*/

                changed = false;

            }
        }
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
            foci_x,
            foci_y;

        if(cluster == "council") {
            foci_x = foci[cluster][d.CouncilAbbreviation].x;
            foci_y = foci[cluster][d.CouncilAbbreviation].y;
        } else if (cluster == "none") {
            // Find a way such that the points goes to a random location
            foci_x = d.x;
            foci_y = d.y;
        } else if (cluster == "party") {
            foci_x = foci[cluster][d.PartyAbbreviation].x;
            foci_y = foci[cluster][d.PartyAbbreviation].y;
        } else if (cluster == "gender") {
            foci_x = foci[cluster][d.GenderAsString].x;
            foci_y = foci[cluster][d.GenderAsString].y;
        } else if (cluster == "language") {
            foci_x = foci[cluster][d.NativeLanguage].x;
            foci_y = foci[cluster][d.NativeLanguage].y;
        }
        alpha = 0.05;
        d.y += (foci_y - d.y) * alpha;
        d.x += (foci_x - d.x) * alpha;
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

function shuffle(a) {
    for (var i = a.length; i; i--) {
        var j = Math.floor(Math.random() * i);
        [a[i - 1], a[j]] = [a[j], a[i - 1]];
    }
}

function radius_foci(radius, n) {
    var ratio = 0;

    if (n==1) {
        ratio = 3;
    } else if (n<=7) {
        ratio = 6;
    } else if (n<=19) {
        ratio = 9;
    } else if (n<=37) {
        ratio = 12;
    } else if (n<=61) {
        ratio = 15;
    } else if (n<=91) {
        ratio = 18;
    } else if (n<=127) {
        ratio = 21;
    } else if (n<=169) {
        ratio = 23;
    } else if (n<=217) {
        ratio = 26;
    } else {
        ratio = 29;
    }

    return radius*ratio;
}
