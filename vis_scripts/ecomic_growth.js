const margin = {top: 10, right: 30, bottom: 30, left: 60}
const width = 460 - margin.left - margin.right
const height = 400 - margin.top - margin.bottom
const inner_width  = width;
const inner_height = height;

function AnimatedScatter({
    x = ([x]) => x, // given d in data, returns the (quantitative) x-value
    y = ([, y]) => y, // given d in data, returns the (quantitative) y-value
    r = 3, // (fixed) radius of dots, in pixels
    title, // given d in data, returns the label
    orient = () => "bottom", // given d in data, returns a label orientation (top, right, bottom, left)
    defined, // for gaps in data
    curve = d3.curveCatmullRom, // curve generator for the line
    width = 760, // outer width, in pixels
    height = 400, // outer height, in pixels
    marginTop = 20, // top margin, in pixels
    marginRight = 20, // right margin, in pixels
    marginBottom = 30, // bottom margin, in pixels
    marginLeft = 30, // left margin, in pixels
    inset = r * 2, // inset the default range, in pixels
    insetTop = inset, // inset the default y-range
    insetRight = inset, // inset the default x-range
    insetBottom = inset, // inset the default y-range
    insetLeft = inset, // inset the default x-range
    xType = d3.scaleLinear, // type of x-scale
    xDomain, // [xmin, xmax]
    xRange = [marginLeft + insetLeft, width - marginRight - insetRight], // [left, right]
    xFormat, // a format specifier string for the x-axis
    xLabel, // a label for the x-axis
    yType = d3.scaleLinear, // type of y-scale
    yDomain, // [ymin, ymax]
    yRange = [height - marginBottom - insetBottom, marginTop + insetTop], // [bottom, top]
    yFormat, // a format specifier string for the y-axis
    yLabel, // a label for the y-axis
    fill = "white", // fill color of dots
    stroke = "currentColor", // stroke color of line and dots
    strokeWidth = 2, // stroke width of line and dots
    strokeLinecap = "round", // stroke line cap of line
    strokeLinejoin = "round", // stroke line join of line
    halo = "#fff", // halo color for the labels
    haloWidth = 6, // halo width for the labels
    duration = 0, // intro animation in milliseconds (0 to disable)
    figureWidth = "100%",
  } = {}) {
    const svg = d3.select("#economic_growth")
        .append("svg")
        .attr("width", figureWidth)
        .attr("height", height)
        .attr("viewBox", [0, 0, width, height])
        .attr("style", "max-width: 100%; height: auto; height: intrinsic; touch-action: none; ");

    d3.dsv(" ", "./data/GDP_NL.csv").then((data) => {
        console.info(data)

        const X = d3.map(data, x);
        const Y = d3.map(data, y);
        const T = title == null ? null : d3.map(data, title);
        const O = d3.map(data, orient);
        const I = d3.range(X.length);
        if (defined === undefined) defined = (d, i) => !isNaN(X[i]) && !isNaN(Y[i]);
        const D = d3.map(data, defined);
    
        // Compute default domains.
        if (xDomain === undefined) xDomain = d3.nice(...d3.extent(X), width / data.length);
        
        if (yDomain === undefined) yDomain = d3.nice(...d3.extent(Y), height / 50);
        const xPeriod = d3.scaleBand().range([0, width-220]).domain(data.map(d => d.period_name)).padding(0.2);
        const periodColor = d3.scaleOrdinal().range(["#f00", "#0f0", "#00f"]).domain(data.map(d => d.period))

        // Construct scales and axes.
        let xScale = xType(xDomain, xRange)
        const yScale = yType(yDomain, yRange);
        const xAxis = d3.axisBottom(xScale).ticks(width / data.length, xFormat);
        const yAxis = d3.axisLeft(yScale).ticks(height / 50, yFormat);

        // Define a clipping plane that obsecures items when they are out of view
        svg.append("defs").append("svg:clipPath")
            .attr("id", "clip")
            .append("svg:rect")
            .attr("transform", `translate(${margin.left},0)`)
            .attr("width", width - marginRight - insetRight - margin.left)
            .attr("height", height - margin.bottom)
            .attr("x", 0)
            .attr("y", 0)

        // Add brushing
        const brush = d3.brushX()                 
            .extent([[margin.left,20], [width - marginRight - margin.left,height - margin.bottom]]) 
            .on("end", updateChartBrush)

        const brushArea = svg.append("g").attr("class", "brush").call(brush)

        // set up the axis
        const gx = svg.append("g")
            .attr("transform", `translate(0,${height - margin.bottom})`)
            .call(xAxis)
            .call(g => g.select(".domain").remove())
            .call(g => g.selectAll(".tick line").clone()
                .attr("y2", marginTop + margin.bottom - height)
                .attr("stroke-opacity", 0.1))
            .call(g => g.append("text")
                .attr("x", width)
                .attr("y", marginBottom - 4)
                .attr("fill", "currentColor")
                .attr("text-anchor", "end")
                .text(xLabel));
    
        const gy = svg.append("g")
            .attr("transform", `translate(${margin.left},0)`)
            .call(yAxis)
            .call(g => g.select(".domain").remove())
            .call(g => g.selectAll(".tick line").clone()
                .attr("x2", width - margin.left - marginRight)
                .attr("stroke-opacity", 0.1))
            .call(g => g.append("text")
                .attr("x", -margin.left)
                .attr("y", 10)
                .attr("fill", "currentColor")
                .attr("text-anchor", "start")
                .text(yLabel));
    
        // Construct the line generator.
        let line = d3.line()
            .curve(curve)
            .x(i => xScale(X[i]))
            .y(i => yScale(Y[i]))

        // Define the path plot
        const path = svg.append("path")
            .attr("clip-path", "url(#clip)")
            .attr("fill", "none")
            .attr("stroke", stroke)
            .attr("stroke-width", strokeWidth)
            .attr("stroke-linejoin", strokeLinejoin)
            .attr("stroke-linecap", strokeLinecap)
            .data(I.filter(i => D[i]))
            .attr("d", line(I));
        
        // Overlay the path with points
        const scatter = svg.append("g")
            .attr("clip-path", "url(#clip)")
            .attr("stroke", stroke)
            .attr("stroke-width", strokeWidth)
            .selectAll("circle")
            .data(I.filter(i => D[i]))
            .join("circle")
            .attr("cx", i => xScale(X[i]))
            .attr("cy", i => yScale(Y[i]))
            .attr("r", r)
            .attr("fill", i => periodColor(data[i].period))
        
        
    
        // A function that set idleTimeOut to null
        var idleTimeout
        function idled() { idleTimeout = null; }

        function updateChartBrush(event) {
            let extent = event.selection

            if (!extent) {
                if (!idleTimeout) return idleTimeout = setTimeout(idled, 350);
                xScale = xType(xDomain, xRange)
            } else {
                xScale = xType([xScale.invert(extent[0]), xScale.invert(extent[1])], xRange)
                brushArea.call(brush.move, null)
            }

            gx.transition(1000).call(d3.axisBottom(xScale))
            svg
                .selectAll("circle")
                .transition(1000)
                .attr("cx", i => xScale(X[i]))
                .attr("cy", i => yScale(Y[i]))
            svg
                .selectAll("path")
                .transition(1000)
                .attr("d", line(I))
            
            animate(1)
        }

        // Line animation handling functions
        const label = svg.append("g")
            .attr("font-family", "sans-serif")
            .attr("font-size", 10)
            .attr("stroke-linejoin", "round")
            .selectAll("g")
            .data(I.filter(i => D[i]))
            .join("g")
            .attr("transform", i => `translate(${xScale(X[i])},${yScale(Y[i])})`);
        
        // Measure the length of the given SVG path string.
        const length = path => d3.create("svg:path").attr("d", path).node().getTotalLength()
    
        function animate(duration) {
            if (duration > 0) {
                const l = length(line(I));
        
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
                    .delay(i => length(line(I.filter(j => j <= i))) / l * (duration - 125))
                    .attr("opacity", 1);
            }    
        }
    
        animate(duration);
    })
}

AnimatedScatter({
    x: d => d3.timeParse("%Y-%m-%d")(d.date),
    y: d => +d.growth,
    yFormat: ".2f",
    xType: d3.scaleTime,
    xLabel: "Date",
    yLabel: "Growth w.r.t. base year 1995 (per year per quarter (%))",
    height: 300,
    duration: 5000 // for the intro animation; 0 to disable
})



