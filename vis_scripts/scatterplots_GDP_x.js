function scatterplots_GDP(plot_id, y_label, y_axis_label) {
    const margin = {top: 10, right: 30, bottom: 30, left: 60}
    const width = 460 - margin.left - margin.right
    const height = 400 - margin.top - margin.bottom

    // append the svg obgect to the body of the page
    // appends a 'group' element to 'svg'
    // moves the 'group' element to the top left margin
    var svg = d3.select(plot_id).append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
    .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

    

    // Get the data
    d3.dsv(",", "./data/merged_data_GDP.csv").then(data => {
        // Add X axis --> it is a date format
        const x = d3.scaleLinear()
            .domain([-5, 6])
            .range([0, width ]);

        // Add Y axis
        const y = d3.scaleLinear()
            .domain([-0.25, d3.max(data.map(elem => elem[y_label]))])
            .range([height, 0 ]);

        // Add period labels
        const labelColor = d3.scaleOrdinal().range(["red", "green", "blue"]).domain(data.map(elem => elem["Crisis_label"]))

        const defined = (d, i) => !isNaN(d.GDP_Growth) && !isNaN(d[y_label]);
        const D = d3.map(data, defined);
        const I = d3.range(data.length);

        // Append X axis to graph
        svg.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x).ticks(10));

        // text label for the x axis
        svg.append("text")             
            .attr("y", height + margin.top+17)
            .attr("x",0 + (2*width / 3))
            .style("text-anchor", "middle")
            .style("font-size",'smaller')
            .text("Yearly GDP Growth (%)");

        // Add the Y Axis
        svg.append("g")
            .call(d3.axisLeft(y));

        // text label for the y axis
        svg.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 0 - margin.left)
            .attr("x",0 - (height / 3))
            .attr("dy", "1em")
            .style("font-size",'smaller')
            .style("text-anchor", "middle")
            .text(`Yearly ${y_axis_label} Growth (%)`);  

        var div = d3.select("body").append("div")
            .attr("class", "tooltip")
            .style("opacity", 0)
            .style("position","absolute");

        const tooltip_formatter = (data) => {
            return `
                <div class="card-body">
                    <p></p>
                </div>
                <ul class="list-group list-group-flush" style="font-size: 90%">
                    <li class="list-group-item py-1">Total yearly marriage growth: ${parseFloat(data[y_label]).toFixed(2)}% </li>
                    <li class="list-group-item py-1">Yearly gdp growth: ${parseFloat(data.GDP_Growth).toFixed(2)}%</li>
                </ul>
                `
        }

        // Add the scatterplot
        svg.selectAll("dot")
            .data(data)
            .enter().append("circle")
            .attr("r", 5)
            .attr("cx", function(d) { return x(d.GDP_Growth); })
            .attr("cy", function(d) { return y(d[y_label]); })
            .attr("fill", d => labelColor(d["Crisis_label"]))
            .on('mouseover', function (event, i) {
                d3.select(this).transition().duration('250').attr('opacity', '0.85')
                div.transition().duration(10).style("opacity", 1)
                event.preventDefault()
                div.html(tooltip_formatter(i)).style("left", (event.pageX) + "px").style("top", `calc(${event.pageY}px)`);
            })
            .on('mouseout', function (event, i) {
                d3.select(this).transition()
                d3.select(this).transition().duration('50').attr('opacity', '1')
                div.transition().duration(10).style("opacity", 0)
            });
        
        // Construct the line generator.
        const line = d3.line()
            .defined(i => D[i])
            .x(i => x(data[i].GDP_Growth))
            .y(i => y(data[i][y_label]))

        // const lines = svg.selectAll("lines").data(data).enter().append("path").attr("d", line(data))

        // Define the path plot
        const path = svg.append("path")
            .attr("fill", "none")
            .attr("stroke", "black")
            .attr("stroke-width", 2)
            .attr("stroke-linejoin", "round")
            .attr("stroke-linecap", "round")
            .data(I.filter(i => D[i]))
            .attr("d", line(I));

        const label = svg.append("g")
            .attr("font-family", "sans-serif")
            .attr("font-size", 10)
            .attr("stroke-linejoin", "round")
            .selectAll("g")
            .data(d3.range(data.length).filter(i => D[i]))
            .join("g")
            .attr("transform", i => `translate(${x(data[i].GDP_Growth)},${y(data[i][y_label])})`);
        
        const length = path => d3.create("svg:path").attr("d", path).node().getTotalLength()
    
        function animate(duration) {
            if (duration > 0) {
                const l = length(line(d3.range(data.length)));
        
                path
                    .interrupt()
                    .attr("stroke-dasharray", `0,${l}`)
                    .transition()
                    .duration(duration)
                    .ease(d3.easeLinear)
                    .attr("stroke-dasharray", `${l},${l}`);
        
                label
                    .interrupt()
                    .attr("opacity", 0)
                    .transition()
                    .delay(i => {
                        length(line(d3.range(data.length).filter(j => j <= i).map(i => data[i]))) / l * (duration - 125)
                    })
                    .attr("opacity", 1);
            }
        }
    
        animate(10000);
    });
}

scatterplots_GDP("#scatter_plot_gdp", "Totaal_huwelijkssluitingen", "Marriage")
scatterplots_GDP("#trial_plot_2", "total_divorces", "Divorces")
