function BarChart({
    target, // the id of the div where the svg should be created
    width = 760, // outer width, in pixels
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
        data = data.filter(elem => elem.label_name != "Totaal huwelijkssluitingen")

        // X axis
        const xPeriod = d3.scaleBand().range([0, width]).domain(data.map(d => d.period_name)).padding(0.2);
        const xLabelGroup = d3.scaleBand().domain(data.map(d => d.label_name)).range([0, xPeriod.bandwidth()]).padding([0.05])

        // Y axis
        const y = d3.scaleLinear().domain([0, 70000]).rangeRound([height, 0]);

        // Z axis
        const regionsColor = d3.scaleOrdinal().range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]).domain(data.map(d => d.regions))
        const keys = regionsColor.domain()

        const groupData = d3.rollup(data, d => {
            let d2 = { period_name: d[0].period_name, label_name: d[0].label_name }
            d.forEach(d => d2[d.regions] = d.value)
            return d2
        }, d => d.period_name + d.label_name).values()

        const stackData = stack.keys(keys)(groupData)

        const serie = g.selectAll(".serie")
            .data(stackData)
            .enter().append("g")
            .attr("class", "serie")
            .attr("fill", d => regionsColor(d.key));
    
        serie.selectAll("rect")
            .data(d => d)
            .enter().append("rect")
            .attr("class", "serie-rect")
            .attr("transform", function (d) {
                console.log(`undefined: ${d}`)
                return "translate(" + xPeriod(d.data.period_name) + ",0)";
            })
            .attr("x", function (d) { return xLabelGroup(d.data.label_name); })
            .attr("y", function (d) { return y(d[1]); })
            .attr("height", function (d) { return y(d[0]) - y(d[1]); })
            .attr("width", xLabelGroup.bandwidth())
            .on("click", function (d, i) { console.log("serie-rect click d", i, d); });
    
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
        
        const legend = serie.append("g")
            .attr("class", "legend")
            .attr("transform", d => {
                let dp = d[d.length - 1]
                return `translate(${xPeriod(dp.data.period_name) + xLabelGroup(dp.data.label_name) + xLabelGroup.bandwidth()}, ${y(dp[0]) + y(dp[1]) / 2})`
            })
        
        legend.append("line")
            .attr("x1", -6)
            .attr("x2", 6)
            .attr("stroke", "#000");
      
        legend.append("text")
            .attr("x", 9)
            .attr("dy", "0.35em")
            .attr("fill", "#000")
            .style("font", "10px sans-serif")
            .text(d => d.key);

        
    }).catch(e => console.error(e))
}

BarChart({
    target: "#normal_divorces",
})
// PieChart({
//     target: "#bank_crisis"
// })
// PieChart({
//     target: "#after_bank_crisis"
// })