function BarChart({
    target, // the id of the div where the svg should be created
    width = 960, // outer width, in pixels
    height = 400, // outer height, in pixels
    marginTop = 20, // top margin, in pixels
    marginRight = 20, // right margin, in pixels
    marginBottom = 10, // bottom margin, in pixels
    marginLeft = 30, // left margin, in pixels
} = {}) {
    // append the svg object to the body of the page
    const svg = d3.select(target)
        .append("svg")
        .attr("width", width + marginLeft + marginRight)
        .attr("height", height + marginTop + 2 * marginBottom)
        .append("g")
        .attr("transform", `translate(${marginLeft},${marginTop})`);
    
    const stack = d3.stack()
    const g = svg.append("g").attr("transform", "translate(" + marginLeft + "," + 0 + ")");

    // Parse the Data
    d3.csv("./data/preprocessed_divorces.csv").then(data => {
        const keys = data.columns.slice(2)
        data = data.filter(elem => elem.label_name != "Totaal huwelijkssluitingen")

        // X axis
        // Period names are our groups
        const xPeriod = d3.scaleBand().range([0, width-220]).domain(data.map(d => d.period_name)).padding(0.2);

        // Label names are our subgroups
        const xLabelGroup = d3.scaleBand().domain(keys).range([0, xPeriod.bandwidth()]).padding([0.05])
        const labelColor = d3.scaleOrdinal().range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c"]).domain(keys)
        // const keys = xPeriod.domain()

        // Y axis
        const y = d3.scaleLinear().domain([0, 70000]).rangeRound([height, 0]);

        g.selectAll(".serie")
            .data(data)
            .enter().append("g")
            .attr("class", "serie")
            .attr("transform", d => `translate(${xPeriod(d.period_name)},0)`)
            .selectAll("rect")
            .data(d => keys.map(key => ({key, value: d[key]})))
            .enter()
            .append("rect")
            .attr("x", d => xLabelGroup(d.key))
            .attr("y", d => y(d.value))
            .attr("height", d => height - y(d.value))
            .attr("width", xLabelGroup.bandwidth())
            .attr("fill", d => labelColor(d.key))
            .attr("opacity", "0.7")
            .on('mouseover', function (event, i) {
                d3.select(this).transition().duration('50').attr('opacity', '1')
            })
            .on('mouseout', function (event, i) {
                d3.select(this).transition().duration('50').attr('opacity', '0.7')
            });

        svg.selectAll('mydots')
            .data(keys).enter().append('circle')
            .attr('cx', width - 180).attr('cy', (d, i) => 50 + i * 25).attr('r', 7)
            .attr('fill', d => labelColor(d))

        svg.selectAll("mylabels")
            .data(keys).enter().append("text")
            .attr("x", width - 160).attr("y", (d, i) => 50 + i * 25) 
            .style("fill", d => labelColor(d))
            .text(d => d)
            .attr("text-anchor", "left")
            .style("alignment-baseline", "middle")
            .on("mouseclick", function(event, i) {
                print(d3.select(this))
            })

        
        // Legend
        g.append("g")
            .attr("class", "axis")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(xPeriod));

        g.append("g")
            .attr("class", "axis")
            .call(d3.axisLeft(y).ticks(null, "s"))
            .append("text")
            .attr("x", 2)
            .attr("y", y(y.ticks().pop()) + 0.5)
            .attr("dy", "0.32em")
            .attr("fill", "#000")
            .attr("font-weight", "bold")
            .attr("text-anchor", "start")
            .text("Population");
    }).catch(e => console.error(e))
}

BarChart({
    target: "#normal_divorces",
})