// // set the dimensions and margins of the graph
const margin = {top: 10, right: 30, bottom: 30, left: 60}
const width = 460 - margin.left - margin.right
const height = 400 - margin.top - margin.bottom
const inner_width  = width;
const inner_height = height;

// // append the svg object to the body of the page
// var svg = d3.select("#economic_growth")
//   .append("svg")
//     .attr("width", width + margin.left + margin.right)
//     .attr("height", height + margin.top + margin.bottom)
//   .append("g")
//     .attr("transform",
//           "translate(" + margin.left + "," + margin.top + ")");


// d3.dsv(" ", "./data/GDP_NL.csv").then((data) => {
//     // Add X axis --> it is a date format
//     console.info(data)
    
//     // Add Y axis
//     var yScale = d3.scaleLinear()
//         .domain([d3.min(data, d => +d.growth), d3.max(data, d => +d.growth)])
//         .range([ height, 0 ]);
        
//     var xScale = d3.scaleTime()
//         .domain(d3.extent(data, d => d3.timeParse("%Y-%m-%d")(d.date)))
//         .range([ 0, width ]);
    
//     const x = d3.scaleLinear().domain([0, 1]).range([0, inner_width]);
//     const y = d3.scaleLinear().domain([0, 1]).range([inner_height, 0]);
//     const xAxisGrid = d3.axisBottom(x).tickSize(-inner_height).tickFormat('').ticks(14);
//     const yAxisGrid = d3.axisLeft(y).tickSize(-inner_width).tickFormat('').ticks(12);

//     // Create grids.
//     svg.append('g')
//         .attr('class', 'x axis-grid')
//         .attr('transform', 'translate(0,' + inner_height + ')')
//         .call(xAxisGrid);

//     svg.append('g')
//         .attr('class', 'y axis-grid')
//         .call(yAxisGrid);
    
//     // Create axis
//     svg.append("g").call(d3.axisLeft(yScale));
//     svg.append("g").attr("transform", `translate(0, ${height})`).call(d3.axisBottom(xScale))

//     // Add the line
//     svg.append("path")
//         .datum(data)
//         .attr("fill", "none")
//         .attr("stroke", "steelblue")
//         .attr("stroke-width", 3.5)
//         .attr("d", 
//             d3.line()
//                 .x(d => xScale(d3.timeParse("%Y-%m-%d")(d.date)))
//                 .y(d => yScale(+d.growth))
//         )
// })
// //Read the data
// // When reading the csv, I must format variables:
// // function(d){
// //     return { date : d3.timeParse("%Y-%m-%d")(d.date), value : d.value }
// // }

function AnimatedScatter({
    x = ([x]) => x, // given d in data, returns the (quantitative) x-value
    y = ([, y]) => y, // given d in data, returns the (quantitative) y-value
    r = 3, // (fixed) radius of dots, in pixels
    title, // given d in data, returns the label
    orient = () => "bottom", // given d in data, returns a label orientation (top, right, bottom, left)
    defined, // for gaps in data
    curve = d3.curveCatmullRom, // curve generator for the line
    width = 640, // outer width, in pixels
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
    duration = 0 // intro animation in milliseconds (0 to disable)
  } = {}) {
    const svg = d3.select("#economic_growth")
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", [0, 0, width, height])
        .attr("style", "max-width: 100%; height: auto; height: intrinsic;");

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
        if (xDomain === undefined) xDomain = d3.nice(...d3.extent(X), width / 80);
        if (yDomain === undefined) yDomain = d3.nice(...d3.extent(Y), height / 50);
    
        // Construct scales and axes.
        const xScale = xType(xDomain, xRange)
        const yScale = yType(yDomain, yRange);
        const xAxis = d3.axisBottom(xScale).ticks(width / 80, xFormat);
        const yAxis = d3.axisLeft(yScale).ticks(height / 50, yFormat);
    
        svg.append("g")
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
    
        svg.append("g")
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
        const line = d3.line()
            .curve(curve)
            .defined(i => D[i])
            .x(i => xScale(X[i]))
            .y(i => yScale(Y[i]));
    
        const path = svg.append("path")
            .attr("fill", "none")
            .attr("stroke", stroke)
            .attr("stroke-width", strokeWidth)
            .attr("stroke-linejoin", strokeLinejoin)
            .attr("stroke-linecap", strokeLinecap)
            .attr("d", line(I));
    
        svg.append("g")
            .attr("fill", fill)
            .attr("stroke", stroke)
            .attr("stroke-width", strokeWidth)
            .selectAll("circle")
            .data(I.filter(i => D[i]))
            .join("circle")
            .attr("cx", i => xScale(X[i]))
            .attr("cy", i => yScale(Y[i]))
            .attr("r", r);
    
        const label = svg.append("g")
            .attr("font-family", "sans-serif")
            .attr("font-size", 10)
            .attr("stroke-linejoin", "round")
            .selectAll("g")
            .data(I.filter(i => D[i]))
            .join("g")
            .attr("transform", i => `translate(${xScale(X[i])},${yScale(Y[i])})`);

        console.warn(T)
    
        if (T) label.append("text")
            .text(i => T[i])
            .each(function(i) {
                const t = d3.select(this);
                console.log(t)
                switch (O[i]) {
                    case "bottom": t.attr("text-anchor", "middle").attr("dy", "1.4em"); break;
                    case "left": t.attr("dx", "-0.5em").attr("dy", "0.32em").attr("text-anchor", "end"); break;
                    case "right": t.attr("dx", "0.5em").attr("dy", "0.32em").attr("text-anchor", "start"); break;
                    default: t.attr("text-anchor", "middle").attr("dy", "-0.7em"); break;
                }
            })
            .call(text => text.clone(true))
            .attr("fill", "none")
            .attr("stroke", halo)
            .attr("stroke-width", haloWidth);
    
        // Measure the length of the given SVG path string.
        const length = path => d3.create("svg:path").attr("d", path).node().getTotalLength()
    
        function animate() {
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
    
        animate();
    })
}

AnimatedScatter({
    x: d => d3.timeParse("%Y-%m-%d")(d.date),
    y: d => +d.growth,
    title: d => Math.floor(d.growth),
    yFormat: ".2f",
    xType: d3.scaleTime,
    xLabel: "Date",
    yLabel: "Growth w.r.t. base year 1995 (per year per quarter (%))",
    height: 400,
    duration: 5000 // for the intro animation; 0 to disable
  })





// var svg = d3.select("#economic_growth")
//   .append("svg")
//     .attr("width", width + margin.left + margin.right)
//     .attr("height", height + margin.top + margin.bottom)





