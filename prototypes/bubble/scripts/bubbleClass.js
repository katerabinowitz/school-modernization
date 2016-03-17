function Bubble(budget){ // data
    var that = this;
    this.budget = budget;
    this.money = d3.format('$,');
    this.commas = d3.format(',');
    this.column = null;
    this.data = null;
    this.sizes = {width: 950, height: 500, padding: 100};
    this.force = null;
    this.circles = null;
    this.force_gravity = -0.03; // -0.018
    this.damper = 0.6; // 0.4 tightness of the bubbles
    this.center = {x: this.sizes.width / 2, y: this.sizes.height / 2};
    this.radius_scale = d3.scale.pow().exponent(0.4).domain([-25190, 115000000]).range([3, 25]); // 15
    this.nodes = [];
    this.unique = null;
};



Bubble.prototype.setColumn = function(column){
    this.column = column;
};

Bubble.prototype.setData = function(newData){
    this.data = newData;
};

Bubble.prototype.setBudget = function(budget){
    this.budget = budget;
};

Bubble.prototype.make_svg = function(){
    if(document.querySelector('svg')){
        d3.select('svg').remove();
    }
    this.svg = d3.select('#chart').append('svg')
        .attr('width', this.sizes.width)
        .attr('height', this.sizes.height);
};

Bubble.prototype.create_nodes = function(){
    if(this.nodes.length){
        this.nodes = [];
    }
    var that = this,
        max = d3.max(this.data, function(d){
            // console.log(that.commas(e[that.budget]));
            return +d[that.budget];
        }),

        min = d3.min(this.data, function(d){
            return +d[that.budget];
        }),

        radius_scale = d3.scale.pow().exponent(0.4).domain([min, max]).range([3, 25]); // 15

    console.log(this.commas(min), this.commas(max));
    for(var i = 0, j = this.data.length; i < j; i++){
        var that = this,
        current = this.data[i];
        current.myx = this.center.x;
        current.myy = this.center.y;
        current.radius = (function(){
            var amount= current[that.budget].trim();
            if (amount !== 'NA'){
                if(amount > 0){
                    // return Math.pow(parseInt(amount), 0.157);
                    return radius_scale(amount);
                } else {
                    return 5;
                }   
            } else {
                return 7;
            }
        }());
        this.nodes.push(current);
    }
    this.nodes.sort(function(a,b){ return b.value - a.value});
};

Bubble.prototype.add_bubbles = function(set){
    var that = this;
     this.circles = this.svg.append('g').attr('id', 'groupCircles')
        .selectAll('circle')
        .data(set).enter()
        .append('circle')
        .attr('class', 'circle')
        .style('fill', function(d,i){
            return set[i].color;
        })
        .attr('cx', function(d,i){
            return set[i].myx;
        })
        .attr('cy', function(d,i){
            return set[i].myy;
        })
        .attr('r', function(d,i){ 
            return set[i].radius;})
        ;
};

Bubble.prototype.update = function() {
    d3.selectAll('.circle').data(this.data).exit()
    .transition()
    .duration(3000)
    .style('opacity', '0')
    .remove();
};

Bubble.prototype.add_tootltips = function(d){
    var that = this;
    this.circles.on('mouseenter', function(d){

        // GET THE X/Y COOD OF OBJECT
        var tooltipPadding = 160,
            xPosition = d3.select(this)[0][0]['cx'].animVal.value + tooltipPadding,
            yPosition = d3.select(this)[0][0]['cy'].animVal.value;
        
        // TOOLTIP INFO
        d3.select('#school').text('School: ' + camel(d.School));
        d3.select('#agency').text('Agency: ' + d.Agency);
        d3.select('#ward').text('Ward: ' + d.Ward);
        if(d.ProjectType && d.ProjectType !== 'NA'){
            d3.select('#project').text('Project: ' + d.ProjectType);
        } else {
            d3.select('#project').text('');
        }
        if(d.YrComplete && d.YrComplete !== 'NA'){
            d3.select('#yearComplete').text('Year Completed: ' + d.YrComplete);
        } else {
            d3.select('#yearComplete').text('');
        }
        d3.select('#majorexp').text('Total Spent: ' + that.money(d[this.budget]));
        d3.select('#spent_sqft').text('Spent per Sq.Ft.: ' + that.money(d.SpentPerSqFt) + '/sq. ft.');
        d3.select('#expPast').text('Spent per Maximum Occupancy: ' + that.money(d.SpentPerMaxOccupancy));
        if(d.FeederHS && d.FeederHS !== "NA"){ 
            d3.select('#hs').text('High School: ' + camel(d.FeederHS));
        } else {
            d3.select('#hs').text('');
        }

        // Make the tooltip visisble
        d3.select('#tooltip')
            .style('left', xPosition + 'px')
            .style('top', yPosition + 'px');
        d3.select('#tooltip').classed('hidden', false);
    })
    .on('mouseleave', function(){
        d3.select('#tooltip').classed('hidden', true);
    });
}

Bubble.prototype.set_force = function() {
    var that = this;
    this.force = d3.layout.force()
        .nodes(this.data)
        .links([])
        .size([this.sizes.width, this.sizes.height])
        .gravity(this.force_gravity) // -0.01
        .charge(function(d){ return that.charge(d) || -15; })
        .friction(0.9); // 0.9

};

Bubble.prototype.charge = function(d) {
    var charge = (-Math.pow(d.radius, 1.8) / 2.05); // 1.3
    if(charge == NaN){
        charge = -25;
    }
    return charge;
};

Bubble.prototype.group_bubbles = function(d){
    var that = this;

    this.force.on('tick', function(e){
        that.circles.each(that.move_towards_centers(e.alpha/2, that.column))
            .attr('cx', function(d){ return d.x;})
            .attr('cy', function(d){ return d.y;});
        })
        ;   
    this.force.start();


};

Bubble.prototype.move_towards_center = function(alpha){
    var that = this;
    return function(d){
        d.x = d.x + (that.center.x - d.x) * (that.damper + 0.02) * alpha;
        d.y = d.y + (that.center.y - d.y) * (that.damper + 0.02) * alpha;    
    };
}

Bubble.prototype.move_towards_centers = function(alpha, column) {
    // Make an array of unique items
    var that = this,
        items = _.uniq(_.pluck(this.nodes, column)).sort();
        unique = [];
    for (var i = 0; i < items.length; i++) { 
        unique.push({name: items[i]}); 
    }

    // Assign unique_item a point to occupy
    var width = this.sizes.width,
        height = this.sizes.height,
        padding = this.sizes.padding;
    for (var i in unique){
        // Make the grid here
        unique[i].x = (i * width / unique.length) * 0.55 + 250; // + 250; //+ 500; // * alpha
        unique[i].y = this.center.y; // * alpha
    }

    // Attach the target coordinates to each node
    _.each(this.nodes, function(node){
        for (var i = 0; i < unique.length; i++) {
            if (node[column] === unique[i].name){
                node.target = {
                    x: unique[i].x,
                    y: unique[i].y
                };
            }
        }
    });

    // Add Text
    this.svg.selectAll('text')
        .data(unique)
        .enter()
        .append('text')
        .attr('class', 'sub_titles')
        .attr('x', function(d){
            return d.x * 1.5 - 250;
        })
        // .attr('x', function(d){return d.x *1.8 - 450;})
        .attr('y', function(d,i){
            if(i%2 === 0){
                return d.y - 225;
            }
            return d.y - 200;
        })
        .text(function(d){
            return d.name;
        })
        ;
    // Send the nodes the their corresponding point
    return function(d){
        // d3.select('#groupCircles').attr('transform', 'translate(' + that.center.x + ', ' + that.center.y + ')');
        d.x = d.x + (d.target.x - d.x) * (that.damper + 0.02) * alpha;
        d.y = d.y + (d.target.y - d.y) * (that.damper + 0.02) * alpha;
    }
};

Bubble.prototype.make_legend = function(){
    var that = this,
        nums = [100000000, 1000000, 1000, 1];

    var legend = d3.select('#legend_cont')
        .append('svg').attr('width','250').attr('height', 192);
    legend.selectAll('circle')
        .data(nums)
        .enter()
        .append('circle')
        .attr('cx', 40)
        .attr('cy', function(d,i){
            return 5 + 35 * (i+1);
        })
        .attr('r', function(d){
            return that.radius_scale(d);
        });
    legend.selectAll('text')
        .data(nums)
        .enter()
        .append('text')
        .attr('x', 95)
        .attr('y', function(d,i){
            return 5 + 37 * (i+1);
        })
        .text(function(d){return that.money(d);})
        ;
};

Bubble.prototype.reset_svg = function() {
    d3.selectAll('.circle').remove();
    d3.selectAll('.sub_titles').remove();
};

Bubble.prototype.graph = function(){
    this.make_svg();
    this.set_force();
    this.create_nodes();
    this.add_bubbles(this.nodes);
    this.update();
    this.add_tootltips();
    this.group_bubbles(); 
    this.make_legend();
    
};

Bubble.prototype.change = function(){
    this.reset_svg();
    this.create_nodes();
    this.add_bubbles(this.nodes);
    this.add_tootltips();
    this.group_bubbles(); 
    
};

// Utility functions
function get(sel){return document.querySelector(sel);}
function getAll(sel){ return Array.prototype.slice.call(document.querySelectorAll(sel));}
function camel(str){ return str.replace(/(\-[a-z])/g, function($1){return $1.toUpperCase();});}