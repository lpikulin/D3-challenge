//set size
var svgWidth=860;
var svgHeight=400;

//set margins
var margin={
    top: 20,
    right: 60,
    bottom: 70,
    left: 70
};

//calculate width and height using margin and size
var width=svgWidth-margin.left-margin.right;
var height=svgHeight-margin.top-margin.bottom;

//append a scatter plot to the scatter container
var svg=d3.select("#scatter")
    .append("svg")
    .attr("width",svgWidth)
    .attr("height",svgHeight);

//create a chart group
var chartGroup=svg.append("g")
    .attr("transform",`translate(${margin.left},${margin.top})`);

//set default x-axis
var chosenXaxis="poverty";
//set default y-axis
var chosenYaxis="obesity";

//functions for updating x scales for axis on click
function xScale(brf,chosenXaxis){
    var xLinearScale=d3.scaleLinear()
        .domain([d3.min(brf,d=>d[chosenXaxis])*.8,
        d3.max(brf,d=>d[chosenXaxis])*1.2])
        .range([0,width]);
    //    console.log(xLinearScale);
    return xLinearScale;
}

//functions for updating y scales for axis on click
function yScale(brf,chosenYaxis){
    var yLinearScale=d3.scaleLinear()
        .domain([d3.min(brf,d=>d[chosenYaxis])*.8,
        d3.max(brf,d=>d[chosenYaxis])*1.2])
        .range([height,0]);
    return yLinearScale;
}

//update xaxis on click
function renderXAxes(newXScale,xAxis) {
    var bottomAxis=d3.axisBottom(newXScale);
    xAxis.transition()
        .duration(1000)
        .call(bottomAxis);
        //console.log("xAxis");
        return xAxis;
}

//update yaxis on click
function renderYAxes(newYScale,yAxis) {
    var leftAxis=d3.axisLeft(newYScale);
    yAxis.transition()
        .duration(1000)
        .call(leftAxis);
        return yAxis;
}

//function for updating circles when new axises are chosen
//circlesGroup,xAxis,chosenXaxis,yAxis,chosenYaxis
function renderCircles(circlesGroup,textGroup,newXScale,chosenXaxis,newYScale,chosenYaxis) {
    circlesGroup.selectAll("circle")
    .transition()
    .duration(1000)
    .attr("cx",d=>newXScale(d[chosenXaxis]))
    .attr("cy",d=>newYScale(d[chosenYaxis]));

    textGroup
    .transition()
    .duration(1000)
    .attr("x", d=>newXScale(d[chosenXaxis]))
    .attr("y", d=>newYScale(d[chosenYaxis]-.5));
   return circlesGroup, chartGroup;
}

function updateToolTip(chosenXaxis, chosenYaxis, circlesGroup) {
    var label;
    if (chosenXaxis==="poverty"){
        if (chosenYaxis==="obesity"){
            label="Poverty, Obesity:";
        }
        else {
            label="Poverty, Smoking:";
        }
    }
    else {
        if (chosenYaxis==="obesity"){
            label="Income, Obesity:";
        }
        else {
            label="Income, Smoking:";
        }
    }


    var toolTip = d3.tip()
        .attr("class", "tooltip")
        .offset([80, -60])
        .html(function(d) {
        return (`${d.abbr} ${label}<br>${d[chosenXaxis]},${d[chosenYaxis]}`);
        //return("I'm a tool tip");
        });     
        console.log(chosenXaxis, chosenYaxis);

    
    circlesGroup.call(toolTip);

    circlesGroup.on("mouseover",function(data){
        toolTip.show(data, this);
        })
        .on("mouseout",function(data,index){
        toolTip.hide(data);
        });
    return circlesGroup;
    }

d3.csv ("./data/data.csv").then(function(brf,err){
    if (err) throw err;
    //console.log(brf);
    //obesity, poverty, state, healthcare, smokes, income
    brf.forEach(function(data){
        data.obesity=+data.obesity;
        data.poverty=+data.poverty;
        data.abbr=data.abbr;
        data.healthcare=+data.healthcare;
        data.smokes=+data.smokes;
        data.income=+data.income;
    })
    var xLinearScale=xScale(brf,chosenXaxis);
    var yLinearScale=yScale(brf,chosenYaxis);
    var bottomAxis=d3.axisBottom(xLinearScale);
    var leftAxis=d3.axisLeft(yLinearScale);

    var xAxis=chartGroup.append("g")
        .classed("x-axis",true)
        .attr("transform",`translate(0,${height})`)
        .call(bottomAxis);
    
   var yAxis=chartGroup.append("g")
        .classed("y-axis",true)
        .attr("transform",`translate(0,0)`)
        .call(leftAxis);

    var circlesGroup=chartGroup.selectAll("circle")
        .data(brf)
        .enter()
        .append("circle")
        .attr("cx",d=>xLinearScale(d[chosenXaxis]))
        .attr("cy",d=>yLinearScale(d[chosenYaxis]))
        .attr("r",14)
        .attr("fill","purple")
        .attr("opacity",".6")
    
    var textGroup=chartGroup.selectAll(null)
        .data(brf)
        .enter()
        .append("text")
        //.text(function(d){return d.abbr;})
        .text(d=>d.abbr)
        .attr("x", d=>xLinearScale(d[chosenXaxis]))
        .attr("y", d=>yLinearScale(d[chosenYaxis]-.5))
        .attr("text-anchor","middle")
        .attr("text-size","8px");
   
        //create group for x-axis labels
//    var xLabelGroup=chartGroup.append("g")
    var xLabelGroup=chartGroup.append("g")
        .attr("transform",`translate(${width/2},${height+20})`);
    //create group for y-axis labels
    //var yLabelGroup=chartGroup.append("g")
    var yLabelGroup=chartGroup.append("g")
        .attr("transform",`translate(0,${height/2})`)
        .attr("tranform","rotate(-90)")
        ;
    
//y-axises
    var obesityLabel=yLabelGroup.append("text")
      .attr("x",0)
      .attr("y",-30)
      .attr("value","obesity")
      .classed("active",true)
      .text("Pct Obese")
      .attr("transform","rotate(-90)");
    
       //obesity, poverty, state, healthcare, smokes, income
    var smokingLabel=yLabelGroup.append("text")
       .attr("x",0)
       .attr("y",-50)
       .attr("value","smokes")
       .classed("inactive",true)
       .text("Pct Smoking")
       .attr("transform","rotate(-90)");

       
//x-axises
    var povertyLabel=xLabelGroup.append("text")
       .attr("x", 40)
       .attr("y", 15)
       .attr("value","poverty")
       .classed("active",true)
       .text("Pct in Poverty");
    var incomeLabel=xLabelGroup.append("text")
        .attr("x", 40)
        .attr("y",35)
       .attr("value","income")
       .classed("inactive",true)
       .text("Yearly Income");
   
    var circlesGroup=updateToolTip(chosenXaxis,chosenYaxis,circlesGroup);

    xLabelGroup.selectAll("text")
        .on("click",function(){
        var xValue=d3.select(this).attr("value");
        if (xValue !== chosenXaxis) {
            chosenXaxis=xValue;
            xLinearScale=xScale(brf,chosenXaxis);
            xAxis=renderXAxes(xLinearScale,xAxis);
            yLinearScale=yScale(brf,chosenYaxis);
            yAxis=renderYAxes(yLinearScale,yAxis);
 
            circlesGroup=renderCircles(circlesGroup,textGroup,xLinearScale,chosenXaxis,yLinearScale,chosenYaxis);
            circlesGroup=updateToolTip(chosenXaxis,chosenYaxis,circlesGroup);
            //circlesGroup=updateToolTip(xAxis,yAxis,circlesGroup);
            console.log(chosenXaxis, chosenYaxis);
            //changes bold text
            if (chosenXaxis==="poverty") {
                povertyLabel
                .classed("active",true)
                .classed("inactive",false);
                incomeLabel
                .classed("active",false)
                .classed("inactive",true);
            }
            else {
                povertyLabel
                .classed("active",false)
                .classed("inactive",true);
                incomeLabel
                .classed("active",true)
                .classed("inactive",false);
            }
        }
        return chosenXaxis, chosenYaxis;

    });    
        yLabelGroup.selectAll("text")
        .on("click",function(){
        var yValue=d3.select(this).attr("value");
        if (yValue !== chosenYaxis) {
            chosenYaxis=yValue;
            xLinearScale=xScale(brf,chosenXaxis);
            xAxis=renderXAxes(xLinearScale,xAxis);
            yLinearScale=yScale(brf,chosenYaxis);
            yAxis=renderYAxes(yLinearScale,yAxis);
            circlesGroup=renderCircles(circlesGroup,textGroup,xLinearScale,chosenXaxis,yLinearScale,chosenYaxis);
            circlesGroup=updateToolTip(chosenXaxis,chosenYaxis,circlesGroup);
            console.log(chosenXaxis,chosenYaxis);
    
            //changes bold text
            if (chosenYaxis==="obesity") {
                obesityLabel
                .classed("active",true)
                .classed("inactive",false);
                smokingLabel
                .classed("active",false)
                .classed("inactive",true);
            }
            else {
                obesityLabel
                .classed("active",false)
                .classed("inactive",true);
                smokingLabel
                .classed("active",true)
                .classed("inactive",false);
            }
        }    

        return chosenXaxis, chosenYaxis;
     
        });

}).catch(function(error){
    console.log(error);
});