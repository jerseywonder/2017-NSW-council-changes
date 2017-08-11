import iframeMessenger from 'guardian/iframe-messenger'
import embedHTML from './text/embed.html!text'
import * as d3 from "d3"
import * as topojson from "topojson"


window.init = function init(el, config) {
    
    console.log("yep")
    iframeMessenger.enableAutoResize();

    el.innerHTML = embedHTML;

    var zoomOn = null;
    var scaleFactor = 5;

    console.log("scaleFactor: " + scaleFactor)

    // if (isAndroidApp) {
    //     d3.select("#variableNote").text("Census data")
    // }

    function numberFormat(num) {
        if ( num > 0 ) {
            if ( num > 1000000000 ) { return ( num / 1000000000 ).toFixed(1) + 'bn' }
            if ( num > 1000000 ) { return ( num / 1000000 ).toFixed(1) + 'm' }
            if (num % 1 != 0) { return num.toFixed(2) }
            else { return num.toLocaleString() }
        }
        if ( num < 0 ) {
            var posNum = num * -1;
            if ( posNum > 1000000000 ) return [ "-" + String(( posNum / 1000000000 ).toFixed(1)) + 'bn'];
            if ( posNum > 1000000 ) return ["-" + String(( posNum / 1000000 ).toFixed(1)) + 'm'];
            else { return num.toLocaleString() }
        }
        return num;
    }


    function makeMap(lga,elected) {

    // console.log(sa2s,places) 

    var statusMessage = d3.select("#statusMessage");

    var width = document.querySelector("#mapContainer").getBoundingClientRect().width
    var height = width * 0.6
    if (width < 500) {
        height = width * 0.8;
    }
    var margin = {top: 0, right: 0, bottom: 0, left:0}
    var active = d3.select(null);
    var scaleFactor = 1;
    var projection = d3.geoMercator()
                    .center([148,-33])
                    .scale(width*3)
                    .translate([width/2,height/2])

    var path = d3.geoPath()
        .projection(projection);

    var graticule = d3.geoGraticule();  

    // console.log(sa2s.objects.sa2s)

    var zoom = d3.zoom()
            .scaleExtent([1, 100])
            .on("zoom", zoomed);    

    d3.select("#mapContainer svg").remove();
            
    var svg = d3.select("#mapContainer").append("svg")
                    .attr("width", width)
                    .attr("height", height)
                    .attr("id", "map")
                    .attr("overflow", "hidden")
                    .on("mousemove", tooltipMove)
                    .call(zoom)
                    .on('onTouchStart', function(currentSwiper, e) {
                        if (isAndroidApp && window.GuardianJSInterface.registerRelatedCardsTouch) {
                            window.GuardianJSInterface.registerRelatedCardsTouch(true);
                        }
                    })
                    .on('onTouchEnd', function(currentSwiper, e) {
                        if (isAndroidApp && window.GuardianJSInterface.registerRelatedCardsTouch) {
                            window.GuardianJSInterface.registerRelatedCardsTouch(false);
                        }
                    });


    var defs = svg.append("defs")

    var defs1 = defs.append("pattern")
          .attr("id", "hash4_4")
          .attr("class", "ding")
          .attr("width", 3)
          .attr("height", 3)
          .attr("patternUnits", "userSpaceOnUse")
          .append("image")
            .attr("class", "ding dong")
            .attr("xlink:href", "data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHdpZHRoPScxMCcgaGVpZ2h0PScxMCc+CiAgPHJlY3Qgd2lkdGg9JzEwJyBoZWlnaHQ9JzEwJyBmaWxsPSd3aGl0ZScvPgogIDxwYXRoIGQ9J00tMSwxIGwyLC0yCiAgICAgICAgICAgTTAsMTAgbDEwLC0xMAogICAgICAgICAgIE05LDExIGwyLC0yJyBzdHJva2U9J2JsYWNrJyBzdHJva2Utd2lkdGg9JzEnLz4KPC9zdmc+Cg==")
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", 3)
            .attr("height", 3)

    var defs2 = defs.append("pattern")
          .attr("id", "circle_pattern")
          .attr("class", "ding")
          .attr("width", 3)
          .attr("height", 3)
          .attr("patternUnits", "userSpaceOnUse")
          .append("image")
          .attr("class", "ding dong")
            .attr("xlink:href", "data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHdpZHRoPScxMCcgaGVpZ2h0PScxMCc+CiAgPHJlY3Qgd2lkdGg9JzEwJyBoZWlnaHQ9JzEwJyBmaWxsPSd3aGl0ZScgLz4KICA8Y2lyY2xlIGN4PScxLjUnIGN5PScxLjUnIHI9JzEuNScgZmlsbD0nYmxhY2snLz4KPC9zdmc+Cg==")
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", 3)
            .attr("height", 3)

    if (zoomOn == true | zoomOn == null) {
        svg.call(zoom)
    }  


    var tooltip = d3.select("#mapContainer")
        .append("div")
        .attr("class", "tooltip")
        .style("position", "absolute")
        .style("z-index", "20")
        .style("visibility", "hidden")
        .style("top", "30px")
        .style("left", "55px");                 

    var features = svg.append("g").attr("id", "mappy")

    var partyColour = ["#aad8f1","#94b1ca","#d61d00","#4a7801","#fdadba"];

    var electorateData = (topojson.feature(elected, elected.objects.electoratemerge)).features;

    features.append("path")
                .datum(graticule)
                .attr("class", "graticule")
                .attr("class", "graticule")
                .attr("d", path);                       


    features.append("g")
        .selectAll(".path")
        .data(electorateData, function(d) { return d['properties']['Name']; })
        .enter().append("path")
        .attr("d", path)
        .style("opacity", 1)
        .style("fill", function(d) { 

            if (d['properties']['margins_pa'] == 'LAB') {
                return partyColour[2];
            }

            else if (d['properties']['margins_pa'] == 'LIB') {
                return partyColour[0];

            }

            else if (d['properties']['margins_pa'] == 'NAT') {
                return partyColour[1];

            }

            else if (d['properties']['margins_pa'] == 'GRN') {
                return partyColour[3];
            }

            else if (d['properties']['margins_pa'] == 'IND') {
                return partyColour[4];
            }
             

        })

    

    var lgaData = (topojson.feature(lga, lga.objects.lga)).features;


    features.append("g")
        .selectAll("path")
        .data(lgaData)
        .enter().append("path")
            .attr("class", "lga")
            .attr("id", d => "lga" + d.properties.NSW_LGA__2)
            .style("fill-opacity", function(d) {

                return 0.3

                /*
                if (d['properties']['new_NEW'] == "TRUE") {
                    return 0.5
                } 

                else if (d['properties']['new_NEW'] == "REJECT") {
                    return 0.4
                } 
                else {
                    return 0
                }
                */

            })
            .style("stroke", "white")
            .style("fill", function(d) {

                if (d['properties']['new_NEW'] == "TRUE") {
                    return "url(#hash4_4)"
                } 

                else if (d['properties']['new_NEW'] == "REJECT") {
                    return "url(#circle_pattern)"
                } 
                else {
                    return "white"
                }

            })
            .attr("data-tooltip",function(d) { 

                return d['properties']['NSW_LGA__2']

            })
            .attr("d", path)
            .on("mouseover", tooltipIn)
            .on("mouseout", tooltipOut)

    if (width > 480) {
        features.append("path")
          .attr("class", "mesh")
          .attr("stroke-width", 0.5)
          .attr("d", path(topojson.mesh(lga, lga.objects.lga, function(a, b) { return a !== b; }))); 
    }
    
          

    var scalePurple = d3.scaleLinear()
        .range(['rgb(242,240,247)','rgb(84,39,143)'])       

    var keyColors = ['#4575b4','#74add1','#abd9e9','#e0f3f8','#ffffbf','#fee090','#fdae61','#f46d43','#d73027']  

    var thresholds = [-1000,-100,-10,-1,0,1,10,100,1000]
    
    var color = d3.scaleThreshold()
        .domain(thresholds)
        .range(keyColors)


    var keyWidth = 500;    

    d3.select("#mergeContainer svg").remove();

    var mergeSvg = d3.select("#mergeContainer")
                    .append("svg")
                    .attr("width", "100%")
                    .attr("height", "40px")
                    .attr("id", "mergeSvg")

    var councilStuff = ["New council", "Council merger rejected"];

    councilStuff.forEach(function(d,i) {

        console.log(d)

        mergeSvg.append("rect")
            .attr("x", (i * 120))
            .attr("y", 0)
            .attr("width", 20)
            .attr("height", 20)
            .style("stroke-width", "1px")
            .style("stroke", "black")
            .style("fill", function() { 

                if (d == 'New council') {
                    return "url(#hash4_4)"
                }

                else if (d == 'Council merger rejected') {
                    return "url(#circle_pattern)"

                }              

            });

        mergeSvg.append("text")
            .attr("x", i * 120 + 25)
            .attr("y", 15) //((i * 50) * scaleFactor) + 23 * scaleFactor
            .style("font-size", "11px")
            .classed("labels",true)
            .text(d)


    });


    d3.select("#keyContainer svg").remove();

    var keySvg = d3.select("#keyContainer")
                    .append("svg")
                    .attr("width", keyWidth)
                    .attr("height", "40px")
                    .attr("id", "keySvg")

    var partyStuff = ["Liberal","National","Labor","Greens","Independent"];
    

    partyStuff.forEach(function(d,i) {

        keySvg.append("rect")
            .attr("x", (i * 70))
            .attr("y", 0)
            .attr("width", 20)
            .attr("height", 20)
            .style("stroke-width", "1px")
            .style("opacity", 0.7)
            .style("fill", function() { 

                if (d == 'Labor') {
                    return partyColour[2];
                }

                else if (d == 'Liberal') {
                    return partyColour[0];

                }

                else if (d == 'National') {
                    return partyColour[1];

                }

                else if (d == 'Greens') {
                    return partyColour[3];
                }

                else if (d == 'Independent') {
                    return partyColour[4];
                }               

            });

        keySvg.append("text")
            .attr("x", i * 70 + 22)
            .attr("y", 15) //((i * 50) * scaleFactor) + 23 * scaleFactor
            .style("font-size", "11px")
            .classed("labels",true)
            .text(d)


    });

    function tooltipMove(d) {
        var leftOffset = 0
        var rightOffset = 0
        var mouseX = d3.mouse(this)[0]
        var mouseY = d3.mouse(this)[1]
        var half = width/2;
        if (mouseX < half) {
            d3.select(".tooltip").style("left", d3.mouse(this)[0] + "px");
        }

        else if (mouseX >= half) {
            d3.select(".tooltip").style("left", ( d3.mouse(this)[0] -200) + "px");
        }
        
        d3.select(".tooltip").style("top", (d3.mouse(this)[1] + 30 ) + "px");
    }       

    function tooltipIn(d) {     
        var tooltipText = d3.select(this).attr('data-tooltip')
        d3.select(".tooltip").html(`<b>${tooltipText}`).style("visibility", "visible");
        
    }

    function tooltipOut(d) {
        d3.select(".tooltip").style("visibility", "hidden");
    }           
    

    d3.select("#zoomIn").on("click", function(d) {
        zoom.scaleBy(svg.transition().duration(750), 1.5);
    });    

    d3.select("#zoomOut").on("click", function(d) {
        zoom.scaleBy(svg.transition().duration(750), 1/1.5);
    }); 

    d3.select("#zoomToggle").on("click", function(d) {
        toggleZoom();
    }); 

    function toggleZoom() {

        
        console.log(zoomOn)
        if (zoomOn == false) {
            d3.select("#zoomToggle").classed("zoomLocked", false)
            d3.select("#zoomToggle").classed("zoomUnlocked", true) 
            svg.call(zoom);
            zoomOn = true
        }

        else if (zoomOn == true) {
            svg.on('.zoom', null);
            d3.select("#zoomToggle").classed("zoomLocked", true)
            d3.select("#zoomToggle").classed("zoomUnlocked", false) 
            zoomOn = false
        }

        else if (zoomOn == null) {
            svg.on('.zoom', null);
            d3.select("#zoomToggle").classed("zoomLocked", true)
            d3.select("#zoomToggle").classed("zoomUnlocked", false)  
            svg.call(zoom);
            zoomOn = false
        }

       
    }

    if (width < 500) {
        if (zoomOn == null) {
            toggleZoom()
        }
    }

    function zoomed() {
        
        scaleFactor = d3.event.transform.k;
        d3.selectAll(".mesh").style("stroke-width", 0.5 / d3.event.transform.k + "px");
        features.style("stroke-width", 0.5 / d3.event.transform.k + "px");
        features.attr("transform", d3.event.transform); // updated for d3 v4

        features.selectAll(".placeContainers")
            .style("display", function(d) { 
                if (d['properties']['scalerank'] < d3.event.transform.k) {
                    return "block";
                }
                else {
                    return "none";
                }
                })

        features.selectAll(".placeText")
                .style("font-size", 0.8/d3.event.transform.k + "rem")
                .attr("dx", 5/d3.event.transform.k )
                .attr("dy", 5/d3.event.transform.k );


        d3.selectAll(".ding")
                .attr("width", (5 / scaleFactor)*2)
                .attr("height", (5 / scaleFactor)*2)



    }

    function reset() {
        active.classed("active", false);
        active = d3.select(null);
        svg.transition()
            .duration(750)
            .call( zoom.transform, d3.zoomIdentity );
    }



    }


    var q = d3.queue()
        .defer(d3.json, `${config.assetPath}/assets/gis/lga.json`)
        .defer(d3.json, `${config.assetPath}/assets/gis/electorate-merge.json`)
        .awaitAll(function(error, results) {
            if (error) throw error;
            console.log(results)
            makeMap(results[0],results[1])
            var to=null
             var lastWidth = document.querySelector(".interactive-container").getBoundingClientRect()
             window.addEventListener('resize', () => {
              var thisWidth = document.querySelector(".interactive-container").getBoundingClientRect()
              if (lastWidth != thisWidth) {
                window.clearTimeout(to);
                to = window.setTimeout(function() {
                    makeMap(results[0],results[1])
                }, 500)
              }
            })
        });


    
}
