// Get the clustering
var rad_cluster = document.Clustering.button;
var cluster_active = false;
var cluster_activation_changed = true;
rad_cluster.onclick = function() {
    cluster_active  = this.checked;
    cluster_activation_changed = true;
};


var clusters_changed = false;
var deleted = false;
var added = false;
var ftype = null;
var focis_order = [];

var rad_council = document.ClusterType.btn_council;
rad_council.onclick = function() {
    if(this.checked) {
        added = true;
    } else {
        deleted = true;
    }
    ftype = "CouncilAbbreviation";
    clusters_changed = true;
};

var rad_party = document.ClusterType.btn_party;
rad_party.onclick = function() {
    if(this.checked) {
        added = true;
    } else {
        deleted = true;
    }
    ftype = "PartyAbbreviation";
    clusters_changed = true;
};

var rad_parl_gr = document.ClusterType.btn_parl_gr;
rad_parl_gr.onclick = function() {
    if(this.checked) {
        added = true;
    } else {
        deleted = true;
    }
    ftype = "ParlGroupAbbreviation";
    clusters_changed = true;
};

var rad_gender = document.ClusterType.btn_gender;
rad_gender.onclick = function() {
    if(this.checked) {
        added = true;
    } else {
        deleted = true;
    }
    ftype = "GenderAsString";
    clusters_changed = true;
};

var rad_language = document.ClusterType.btn_language;
rad_language.onclick = function() {
    if(this.checked) {
        added = true;
    } else {
        deleted = true;
    }
    ftype = "NativeLanguage";
    clusters_changed = true;
};

var rad_age = document.ClusterType.btn_age;
rad_age.onclick = function() {
    if(this.checked) {
        added = true;
    } else {
        deleted = true;
    }
    ftype = "AgeCategory";
    clusters_changed = true;
};

var rad_canton = document.ClusterType.btn_canton;
rad_canton.onclick = function() {
    if(this.checked) {
        added = true;
    } else {
        deleted = true;
    }
    ftype = "CantonAbbreviation";
    clusters_changed = true;
};

// Get the color
var rad_color = document.Colors.buttons;
var prev_color = null;
var colorType = "party";
var color_changed = true;
for(var i = 0; i < rad_color.length; i++) {
    rad_color[i].onclick = function() {
        (prev_color)? console.log(prev_color.value):null;
        if(this !== prev_color) {
            prev_color = this;
            colorType = this.value;
        }
        color_changed = true;
    };
}

var rad_friendship = document.Friendship.buttons;
var prev_friendship = null;
var friendship = "intervention";
var friendship_changed = true;
for(var i = 0; i < rad_friendship.length; i++) {
    rad_friendship[i].onclick = function() {
        (prev_friendship)? console.log(prev_friendship.value):null;
        if(this !== prev_friendship) {
            prev_friendship = this;
            friendship = this.value;
        }
        friendship_changed = true;
    };
}

var rad_interest = document.Interest.buttons;
var prev_interest = null;
var interest_type = "all";
var interest_changed = true;
for(var i = 0; i < rad_interest.length; i++) {
    rad_interest[i].onclick = function() {
        (prev_interest)? console.log(prev_interest.value):null;
        if(this !== prev_interest) {
            prev_interest = this;
            interest_type = this.value;
        }
        interest_changed = true;
    };
}

// Define some variables
var radius = 6,
    padding = 1;

// We consider that the size of the box is 960x600
var width = 737,
    height = 600,
    height_l = 64;

// Variable for node selection
var node_selected = false;
var node_id = null;

var dragging = false;

var nbr = {};
nbr["council"] = {};
nbr["party"] = {};
nbr["gender"] = {};
nbr["language"] = {};
nbr["age"] = {};
nbr["canton"] = {};
nbr["parl_gr"] = {};

var texts = {};
texts["council"] = {'CN': 'National Council', 'CE': 'Council of States', 'CF': 'Federal Council'};
texts["party"] = {};
texts["gender"] = {'m': 'Men', 'f': 'Women'};
texts["language"] = {};
texts["age"] = {};
texts["canton"] = {};
texts["parl_gr"] = {};

var variables = {};
variables["council"] = [];
variables["party"] = [];
variables["gender"] = [];
variables["language"] = [];
variables["age"] = [];
variables["canton"] = [];
variables["parl_gr"] = [];

// SVG for the main Viz
var svg = d3.select("div#viz")
        .append("div")
        .classed("svg-container", true) //container class to make it responsive
        .append("svg")
        //responsive SVG needs these 2 attributes and no width and height attr
        .attr("preserveAspectRatio", "xMinYMin meet")
        .attr("viewBox", "0 0 737 600")
        //class to make it responsive
        .classed("svg-content-responsive", true);

// Legend for the colors
var legend = d3.select("div#legend")
    .append("div")
    .classed("svg-container-legend", true) //container class to make it responsive
    .append("svg")
    //responsive SVG needs these 2 attributes and no width and height attr
    .attr("preserveAspectRatio", "xMinYMin meet")
    .attr("viewBox", "0 0 737 64")
    //class to make it responsive
    .classed("svg-content-responsive-legend", true);


// Prepare the Bar Graph
var bGMargin = {top: 10, right: 10, bottom: 10, left: 30};

var barGraph = d3.select("#int_graph")
    .append("g")
    .attr("transform", "translate(" + bGMargin.left + "," + bGMargin.top + ")");

// Prepare the Bar Graph for the interests
var interestsBarGraph = d3.select('#themes')
    .append("g")
    .attr("transform", "translate(" + bGMargin.left + "," + bGMargin.top + ")");

var barWidth = 390 - bGMargin.left - bGMargin.right,
    barHeight = 105 - bGMargin.top - bGMargin.bottom;

// Prepare the Friends
var svgFriends = d3.select('#friends'),
    gFriends = svgFriends.append('g');

// Prepare the autocomplete
var compCounc = document.getElementById("compCouncilors");

// Simulation
var simulation = d3.forceSimulation().alphaDecay(0)
        .velocityDecay(0.1)
        .force("collision", d3.forceCollide().radius(radius+padding).iterations(5).strength(0.5))
    //.force("link", d3.forceLink().id(function(d) { return d.id; }))
    //.force("charge", d3.forceManyBody().strength(-2));
    //.force("center", d3.forceCenter(width / 2, height / 2));
    ;

// Define different functions used to import
// useful stuff

var pos;
function importPositions(json) {
    $.getJSON(json, function(d) {
        pos = d;
    })
}

var adj;
function importAdj(json) {
    $.getJSON(json, function(d) {
        adj =  d;
    });
};

var interests;
function importInterests(json) {
    $.getJSON(json, function(d) {
        interests =  d;
    });
};

var authors;
function importAuthors(json) {
    $.getJSON(json, function(d) {
        authors =  d;
    });
};

var adj_cosign;
function importAdjCosign(json) {
    $.getJSON(json, function(d) {
        adj_cosign = d;
    })
}

var ints;
function importInts(json) {
    $.getJSON(json, function(d) {
        ints = d;
    });
}

var people;
function importPeople(json) {
    $.getJSON(json, function(d) {
        people = d;
    });
}

var friends;
function importFriends(json) {
    $.getJSON(json, function(d) {
        friends = d;
    });
}

var friends_cosign;
function importFriendsCosign(json) {
    $.getJSON(json, function(d) {
        friends_cosign = d;
    });
}

importPositions('data/positions.json');
importAdj('data/adj.json');
importInts('data/year_ints2.json');
importPeople('data/people.json');
importFriends('data/friends.json');
importAdjCosign('data/adj_cosign.json');
importFriendsCosign('data/friends_cosign.json');
importInterests('data/interests.json');
importAuthors('data/authors.json');

var nodes;
var node;
var array_foci;
// Read the Nodes and do stuff!
d3.json("data/active.json", function(error, graph) {
    if (error) throw error;

    for(var key in pos) {
        pos[key]["x"] = pos[key]["x"]*width;
        pos[key]["y"] = pos[key]["y"]*height;

    }

    nodes = graph.nodes;

    var list_parties = [];
    var list_parl_gr = [];
    var list_languages = [];
    var list_ages = [];
    var list_cantons = [];
    var list_councilors = [];

    for(var i=0; i<nodes.length; i++) {
        nodes[i]["x"] = pos[nodes[i]["PersonIdCode"]]["x"];
        nodes[i]["y"] = pos[nodes[i]["PersonIdCode"]]["y"];
        nodes[i]["radius"] = radius;
        nodes[i]["selected"] = false;
        nodes[i]["dragged"] = false;

        list_councilors.push(nodes[i]["FirstName"] + " " + nodes[i]["LastName"]);

        // Get nbr by council
        if(!(nodes[i]["CouncilAbbreviation"] in nbr["council"])) {
            nbr["council"][nodes[i]["CouncilAbbreviation"]] = 1;
            variables["council"].push(nodes[i]["CouncilAbbreviation"]);
        } else {
            nbr["council"][nodes[i]["CouncilAbbreviation"]] += 1;
        }

        // Get nbr by party
        if(!(nodes[i]["PartyAbbreviation"] in nbr["party"])) {
            nbr["party"][nodes[i]["PartyAbbreviation"]] = 1;
            list_parties.push(nodes[i]["PartyAbbreviation"]);
            texts["party"][nodes[i]["PartyAbbreviation"]] = nodes[i]["PartyAbbreviation"];
            variables["party"].push(nodes[i]["PartyAbbreviation"]);
        } else {
            nbr["party"][nodes[i]["PartyAbbreviation"]] += 1;
        }

        // Get nbr by parl group
        if(!(nodes[i]["ParlGroupAbbreviation"] in nbr["parl_gr"])) {
            nbr["parl_gr"][nodes[i]["ParlGroupAbbreviation"]] = 1;
            list_parl_gr.push(nodes[i]["ParlGroupAbbreviation"]);
            var gr = nodes[i]["ParlGroupAbbreviation"];
            if(gr == "NaN") {
                texts["parl_gr"][nodes[i]["ParlGroupAbbreviation"]] = "Federal Council";
            } else if (gr == "GL") {
                texts["parl_gr"][nodes[i]["ParlGroupAbbreviation"]] = "Grp. Vert'Libéral";
            } else if (gr == "BD") {
                texts["parl_gr"][nodes[i]["ParlGroupAbbreviation"]] = "Grp. BD";
            } else if (gr == "C") {
                texts["parl_gr"][nodes[i]["ParlGroupAbbreviation"]] = "Grp. PDC";
            } else if (gr == "S") {
                texts["parl_gr"][nodes[i]["ParlGroupAbbreviation"]] = "Grp Socialiste";
            } else if (gr == "G") {
                texts["parl_gr"][nodes[i]["ParlGroupAbbreviation"]] = "Grp. des Verts";
            } else if (gr == "RL") {
                texts["parl_gr"][nodes[i]["ParlGroupAbbreviation"]] = "Grp. LR";
            } else if (gr == "V") {
                texts["parl_gr"][nodes[i]["ParlGroupAbbreviation"]] = "Grp. UDC";
            }
            variables["parl_gr"].push(nodes[i]["ParlGroupAbbreviation"]);
        } else {
            nbr["parl_gr"][nodes[i]["ParlGroupAbbreviation"]] += 1;
        }

        // Get nbr by gender
        if(!(nodes[i]["GenderAsString"] in nbr["gender"])) {
            nbr["gender"][nodes[i]["GenderAsString"]] = 1;
            variables["gender"].push(nodes[i]["GenderAsString"]);
        } else {
            nbr["gender"][nodes[i]["GenderAsString"]] += 1;
        }

        // Get nbr by language
        if(!(nodes[i]["NativeLanguage"] in nbr["language"])) {
            nbr["language"][nodes[i]["NativeLanguage"]] = 1;
            list_languages.push(nodes[i]["NativeLanguage"]);
            var lng = nodes[i]["NativeLanguage"];
            if(lng == "F") {
                texts["language"][lng] = "French";
            } else if(lng == "I") {
                texts["language"][lng] = "Italian";
            } else if(lng == "Sk") {
                texts["language"][lng] = "Slovak";
            } else if(lng == "RM") {
                texts["language"][lng] = "Romansh";
            } else if(lng == "D") {
                texts["language"][lng] = "German";
            } else if(lng == "Tr") {
                texts["language"][lng] = "Turkish";
            }
            variables["language"].push(nodes[i]["NativeLanguage"]);

        } else {
            nbr["language"][nodes[i]["NativeLanguage"]] += 1;
        }

        // Get nbr by age
        if(!(nodes[i]["AgeCategory"] in nbr["age"])) {
            nbr["age"][nodes[i]["AgeCategory"]] = 1;
            texts["age"][nodes[i]["AgeCategory"]] = nodes[i]["AgeCategoryText"];
            variables["age"].push(nodes[i]["AgeCategory"]);
            list_ages.push(nodes[i]["AgeCategory"]);
        } else {
            nbr["age"][nodes[i]["AgeCategory"]] += 1;
        }

        // Get nbr by cantons
        if(!(nodes[i]["CantonAbbreviation"] in nbr["canton"])) {
            nbr["canton"][nodes[i]["CantonAbbreviation"]] = 1;
            texts["canton"][nodes[i]["CantonAbbreviation"]] = nodes[i]["CantonAbbreviation"];
            variables["canton"].push(nodes[i]["CantonAbbreviation"]);
            list_cantons.push(nodes[i]["CantonAbbreviation"]);
        } else {
            nbr["canton"][nodes[i]["CantonAbbreviation"]] += 1;
        }
    }

    // Awesomplete
    new Awesomplete(compCounc, {list: list_councilors});

    list_ages.sort();
    variables["age"].sort();

    // Create Foci for age
    for(var i=0; i<list_ages.length; i++) {
        init_foci["AgeCategory"][list_ages[i]] = {"x": (i+1)/(list_ages.length+1)*width, "y": (Math.pow(-1, i)*0.2 + 0.6)*height};
    }

    // Create array of foci
    /*array_foci = {};
    for(var key1 in init_foci) {
        if(key1 != "none") {
            array_foci[key1] = []
            for (var key in init_foci[key1]) {
                var json = {}
                json["cx"] = init_foci[key1][key]["x"];
                json["cy"] = init_foci[key1][key]["y"];
                json["key"] = key;

                array_foci[key1].push(json);
            }
        }
    }*/

    node = svg.append("g")
            .attr("class", "nodes")
            .selectAll("circle")
            .data(nodes)
            .enter().append("circle")
            .attr("class", "dataNodes")
            .attr("r", radius)
            .attr("fill", function(d) { return color(colorType, d);})
            .attr("desc", false)
            .attr("id", function(d) { return d.PersonIdCode;})
            .call(d3.drag()
                .on("start", dragstarted)
                .on("drag", dragged)
                .on("end", dragended))
            .on("mouseover", emphasisAndShowInfo)
            .on('mouseleave', resetOp)
            .on("click", clicked)
        ;

    simulation
        .nodes(graph.nodes)
        .on("tick", ticked)
    ;

    svg.on("dblclick", dbclick);

});

function ticked() {
    /*link
     .attr("x1", function(d) { return d.source.x; })
     .attr("y1", function(d) { return d.source.y; })
     .attr("x2", function(d) { return d.target.x; })
     .attr("y2", function(d) { return d.target.y; });*/

    clusters();

    update_color();

    update_friendship();

    update_interest();

    node
        .each(gravity())
        .attr("cx", function(d) { return d.x; })
        .attr("cy", function(d) { return d.y; });
}