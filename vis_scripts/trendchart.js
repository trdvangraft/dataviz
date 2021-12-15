function trendline() {
    var margin = {top: 30, right: 120, bottom: 70, left: 70},
    width = 700 - margin.left - margin.right,
    height = 300 - margin.top - margin.bottom;

    // Set the ranges
    var x = d3.scaleTime().range([0, width]).nice().range([0, width]);  
    var y = d3.scaleLinear().range([height, 0]).nice().range([height, 0]);

    // Adds the svg canvas
    var svg = d3.select("#my_dataviz")
        .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
        .append("g")
            .attr("transform", 
                "translate(" + margin.left + "," + margin.top + ")");

    //Read the data.
    d3.csv("data/data_Ruben/Huwen_en_huwelijksontbinding__geslacht__leeftijd__31_december___regio_05122021_231200.csv").then(data => {
        Load_data = data
        
        Region = Load_data.flatMap(elem => elem['Regio'])
        allGroup = [...new Set(Region)];

        // Defining different groups
        allGroup = ["Marriages", "Divorced men", "Divorced woman", "Widowed man", "Widowed woman"]
        
        // var Variable_prop = "Huwelijkssluitingen"
        function draw(Variable_prop) {

            var parse = d3.timeParse("%Y");
            data = Load_data.map(elem => (
                {
                    Regio: elem.Regio,
                    Perioden: parse(elem.Perioden),
                    [Variable_prop]: elem[Variable_prop]
                } 
            ));

            // Define the line
            var line = d3.line()	
                .x(function(d) { return x(d.Perioden); })
                .y(function(d) { return +y(d[Variable_prop]); });
            
            //Widraw the years from the data.
            year = data.map(elem => elem['Perioden'])

            // Scale the range of the data
            x.domain(d3.extent(data, function(d) { return +d.Perioden; })).nice();
            y.domain(d3.extent(data, function(d) { return +d[Variable_prop]; })).nice();

            // Group the entries by symbol
            dataNest = Array.from(d3.group(data, d => d.Regio), ([Regio, key]) => ({Regio, key}));

            // set the colour scale
            var color = d3.scaleOrdinal(d3.schemePaired);
            legendSpace = 20+width/dataNest.length; // spacing for the legend

            // Loop through each symbol / key
            dataNest.forEach(function(d,i) { 
                svg.append("path")
                    .attr("class", "line")           
                    .attr("d", line(d.key))
                    .attr("fill", "none")
                    .style("stroke", function() { // Add the colours dynamically
                        return d.color = color(d.Regio); })
                    .attr("stroke-width", 1.5);

                // // Add the Legend
                svg.append("text")
                    .style("font", "12px times")
                    .attr("x", width + 20)  // space legend
                    .attr("y", i*19)
                    .attr("class", "legend")    // style the legend
                    .style("fill", function() { // Add the colours dynamically
                        return d.color = color(d.Regio); })
                    .text(d.Regio); 

            });

            // Add the X Axis
            svg.append("g")
                .style("font", "10px times")
                .attr("class", "axis")
                .attr("transform", "translate(0," + height + ")")
                .call(d3.axisBottom(x).tickFormat(d3.timeFormat("%Y")).ticks(d3.timeYear.every(1)));

            // Add the Y Axis
            svg.append("g")
                .style("font", "10px times")
                .attr("class", "axis")
                .call(d3.axisLeft(y));
            }

            // Add X axis label:
            svg.append("text")
                .attr("text-anchor", "end")
                .style("font", "10px times")
                .attr("x", width)
                .attr("y", height + margin.top)
                .text("Years");

            // Y axis label:
            svg.append("text")
                .style("font", "10px times")
                .attr("text-anchor", "end")
                .attr("transform", "rotate(-90)")
                .attr("y", -margin.left+20)
                .attr("x", -margin.top)
                .text("Amount")


        const yearMenu = d3.select('#Dropdown')
            .append('select');

        yearMenu.selectAll('option')
            .data(["Marriages", "Divorced men", "Divorced woman", "Widowed man", "Widowed woman"])
            .join('option')
                .attr('value', d => d)
                .text(d => d);

        yearMenu.on('change', function(event) {
            console.log(event.target.value)
            svg.selectAll("path").remove();
            svg.selectAll("g").remove();
            draw(event.target.value);
        });
            
        draw(yearMenu.property('value'))
    })
}

trendline()