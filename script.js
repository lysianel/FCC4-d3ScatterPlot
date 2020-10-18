//Scatter Plot with D3

document.addEventListener('DOMContentLoaded', function(){

	fetch("https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json")
		.then((response) => {
			if (response.ok){
				return response.json(); 
			}
			else {
				var error = new Error ('Error' + response.status + ": " + response.statusText);
				error.response = response;
				throw error;  
			}
		},
		error => {
			var errmess = new Error(error.message);
			throw errmess;  
		})
		.then(response => plotdata(response))
		.catch(error => { console.log(error.message); alert(error.message); })


	function plotdata(dataset){
		
		//Title
		d3.select("main")
		  .append("h1")
		  .attr("id", "title")
		  .text("Times up the Alpe d'Huez in Professional Cycling");
		
		d3.select("main")  
		  .append("p")
		  .text("The 35 fastest and doping allegations correlation");

		//Plot parameters
		const h = 500;
		const w = 900;
		const padding = 75;
		const r = 5;
		const fill_doping = "#d6404e" ; 
		const fill_normal = "#5babab";
		const color_fill = "gray";
		const color_highlight = "blue" ;

		d3.select("main").style("width",w + "px");

		// Type
		dataset.forEach(function (d) {
			d.TimeFormatted = new Date("1970-01-01T00:" + d.Time)
		});

		//Scale 
		const minX = d3.min(dataset, d => d.Year);
		const maxX = d3.max(dataset, d => d.Year)	
		const minY = d3.min(dataset, d => d.TimeFormatted)	
		const maxY = d3.max(dataset, d => d.TimeFormatted)			

		const xScale = d3.scaleLinear()
						 .domain([minX-1, maxX])
						 .range([padding, w-padding]);

		const yScale = d3.scaleTime()
					     .domain([maxY, minY])
					     .range([h - padding, padding]);

		dataset.forEach(function (d) {
			d.YearScaled = xScale(d.Year);
			d.TimeScaled = yScale(d.TimeFormatted);
		});

		//Def Axes
		const x_axis = d3.axisBottom()
						 .ticks(10,"d")
						 .scale(xScale);

		const y_axis = d3.axisLeft()
		 				 .tickFormat( function (d) {
		 				 	let format = d.getMinutes() + ":";
		 				 	if (d.getSeconds() === 0) {
		 				 		return format += "00";
		 				 	}
		 				 	else
		 				 	{
		 				 		return format += d.getSeconds();
		 				 	} 
		 				 }) 
						 .scale(yScale);

		//Legend
	  	d3.select("main")
	  	  .append("div")
	  	  .attr("id","legend")
	  	  .html("<div><span id='leg-dop'></span/>Doping allegations</div>" + 
	  	  		"<div><span id='no-leg-dop'></span/>No doping allegations</div>")
	  	  .style("right", "10px" )
	   	  .style("top", h/2 + "px")

	  	d3.select("#leg-dop")
	  	  .style("background-color",fill_doping);
	  	d3.select("#no-leg-dop")
	  	  .style("background-color",fill_normal);

		//Prepare plot
		const svg = d3.select("main")
					  .append("svg")
					  .attr("width", w)
					  .attr("height", h);

		//Plot axes
		svg.append("g")
		   .attr("id","x-axis")
		   .attr("transform","translate(0,"+ ( h - padding ) + ")")
		   .call(x_axis); 

		
		svg.append("g")
		   .attr("id","y-axis")
		   .attr("transform","translate(" + padding + ")")
		   .call(y_axis);
		
		//Add axis label
		svg.append("text")
		    .attr("text-anchor", "end")
		    .attr("x", w/2)
		    .attr("y", h - padding/2)
		    .text("Year");

		svg.append("text")
		    .attr("text-anchor", "end")
		    .attr("x", - h / 3 )
		    .attr("y", padding/2 - 10)
		    .attr("transform","rotate(-90)")
		    .text("Time (mm:ss)");

		//Tooltip
		const tooltip = d3
			.select("main")
			.append("div")
			.attr("id","tooltip")
			.style("opacity","0")
			.style("position","absolute");

		//Plot dots
		svg.selectAll("circle")
		   .data(dataset)
		   .enter()
		   .append("circle")
		   .attr("cx", (d) => d.YearScaled)
		   .attr("cy", (d) => d.TimeScaled)
		   .attr("r", r)
		   .attr("class","dot")
		   .style("opacity","0.8")
		   .attr("fill", d => {
		   		if (d.Doping === "") {
		   			return fill_normal
		   		} 
		   		else
		   		{ 
		   			return fill_doping
		   		}})
		   .attr("data-xvalue", d => d.Year)
		   .attr("data-yvalue", d => d.TimeFormatted)
		   .on("mouseover", function(event,d) {
		   		tooltip.transition().duration(100).style('opacity', 0.9);
		   		tooltip.html(d.Name + "<br>" + d.Nationality + "<br>" + d.Year +
		   			     " - " + d.Time + "<br>" + d.Doping)
		   			   .style("left",  d.YearScaled + 20 + "px" )
		   			   .style("top", d.TimeScaled + padding + "px")
		   			   .style("background-color", d.Doping === ""? fill_normal : fill_doping)
		   			   .attr("data-year", d.Year);	
		   		d3.select(event.target).style("opacity","1");
		  		})   
		  	.on("mouseout",function(event){
		  		tooltip.transition().duration(100).style('opacity',0);
		  		d3.select(event.target).style("opacity","0.8");
		  	})
	}	
});