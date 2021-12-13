const margin = {top: 10, right: 30, bottom: 30, left: 60}
const width = 460 - margin.left - margin.right
const height = 400 - margin.top - margin.bottom
const inner_width  = width;
const inner_height = height;




// append the svg obgect to the body of the page
// appends a 'group' element to 'svg'
// moves the 'group' element to the top left margin
var svg = d3.select("#trial_plot").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");

// Get the data
d3.dsv(",", "./data/merged_data_GDP.csv").then(data => {
growth = data.map(elem => elem['GDP_Growth'])
marriages = data.map(elem => elem['Totaal_huwelijkssluitingen'])
 
    // Add X axis --> it is a date format
    var x = d3.scaleLinear()
        .domain([-5, 6])
        .range([0, width ]);

    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x).ticks(10));

    // Add Y axis
    var y = d3.scaleLinear()
        .domain([-0.2, d3.max(marriages)])
        .range([height, 0 ]);

    svg.append("g")
        .call(d3.axisLeft(y));

// define the line
var valueline = d3.line()
    .x(function(d) { return x(growth); })
    .y(function(d) { return y(marriages); });

  // Add the valueline path.
  svg.append("path")
      .data([data])
      .attr("class", "line")
      .attr("d", valueline);
      
  // Add the X Axis
  svg.append("g")
      .attr("transform", "translate(0," + height + ")")
      
      .call(d3.axisBottom(x));
  // text label for the x axis
  svg.append("text")             
      .attr("y", height+ margin.top+17)
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
      .text("Yearly Marriage Growth (%)");  

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
        <li class="list-group-item py-1">Total yearly marriage growth: ${parseFloat(data.Totaal_huwelijkssluitingen).toFixed(2)}% </li>
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
  .attr("cy", function(d) { return y(d.Totaal_huwelijkssluitingen); })
  .on('mouseover', function (event, i) {
          d3.select(this).transition()
                .duration('100')
                .attr("r", 7);
          div.transition()
               .duration(100)
               .style("opacity", 1);
      event.preventDefault()
          div.html(tooltip_formatter(i)).style("left", (event.pageX) + "px").style("top", `calc(${event.pageY}px)`);
     })
     .on('mouseout', function (event, i) {
          d3.select(this).transition()
               .duration('200')
               .attr("r", 5);
          div.transition()
               .duration('200')
               .style("opacity", 0);
     });

});