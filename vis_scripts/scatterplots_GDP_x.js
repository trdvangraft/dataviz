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
        const labelColor = d3.scaleOrdinal().range(["#98abc5", "#8a89a6", "#7b6888"]).domain(data.map(elem => elem["Crisis_label"]))

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

    });
}

scatterplots_GDP("#scatter_plot_gdp", "Totaal_huwelijkssluitingen", "Marriage")
scatterplots_GDP("#trial_plot_2", "total_divorces", "Divorces")
