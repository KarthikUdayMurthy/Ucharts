/*
Developer  Karthik Uday Murthy
-------
Syntax:
-------
var x = new UChart(id,data,x,y,width,height,colors);
x.drawBarChart(); // for bar chart

var x = new UChart(id,data,x,y,width,height,colors);
x.drawLineChart(); // for line chart

var x = new UChart(id,data,x,"",width,"",colors);
x.drawDnutChart(); // for Dough Nut chart

-----------
Parameters:
-----------
id = Parent id in which the chart needs to created (Mandatory).
data = Array containing sub array of two columns example : [["Jan",20],["Feb",30],["Mar",15]] (Mandatory).
x = text that needs to be displayed in x-Axis (Optional).
y = text that needs to be displayed in y-Axis (Optional).
width = Width of the chart excluding Axis (Optional).
height = height of the chart excluding Axis (Optional).
colors = Array with two array of colors first one for bar and second is used when hovered (Optional);

-------------------
Additional Methods:
-------------------
drawBenchMarks(array if objects);
example:
x.drawBenchMarks([{name:'50th Percentile',value:18,color:"#993300"},{name:'75th Percentile',value:36,color:"#009933"}]);

toggleValues();
example:
x.toggleValues();
*/

function UChart(id,data,x,y,width,height,colors)
{
try {
	var DefColors = ['#84c718','#e75d42','#00B2F6','#ff9a00','#42be84','#8844cc','crimson','#8cae39','teal','#6b8eef','#6b2063','#b54921'];

	var shuffle = function(array) {
		var currentIndex = array.length, temporaryValue, randomIndex;
		while (0 !== currentIndex) {
			randomIndex = Math.floor(Math.random() * currentIndex);
			currentIndex -= 1;
			temporaryValue = array[currentIndex];
			array[currentIndex] = array[randomIndex];
			array[randomIndex] = temporaryValue;
		}
		return array;
	}
	DefColors = shuffle(DefColors);

	// DATA VALIDATION

	if(!id || !document.getElementById(id)) {
		throw new Error("Invalid id");
	}
	if(!data || typeof data !== "object" || data.length === undefined) {
		throw new Error("No data given to display");
	}
	if(data.length == 0) {
		throw new Error("No data given to display");
	}
	for(var i=0; i<data.length; i++) {
		if(data[i].length === undefined || data[i].length < 2)
			throw new Error("Data format improper");
		
		if((typeof data[i][1]).toUpperCase() != "NUMBER")
			throw new Error("Values must be numbers (" + data[i][1] + ")");
	}

	//PROPERTIES DECLARATION

	this.parentId = document.getElementById(id);
	this.data = data;
	colors = colors || [];
	this.colorsDefined = 0;
	if(colors.length === undefined || colors.length == 0 || typeof colors !== "object") {
		this.colorsDefined = 0;
		colors = [[],[]];
		colors[0].push(DefColors[0]);
		colors[1].push(DefColors[1]);
	} else {
		this.colorsDefined = 1;
		if(colors.length != 2 || colors[0].length === undefined || typeof colors[0] !== "object" || colors[1].length === undefined || typeof colors[1] !== "object")
			throw new Error("Colors needs to have two arrays");
		if(colors[0].length == 0 || colors[1].length == 0)
			throw new Error("Both the arrays in colors must contain atleast one value");
	}

	this.colors = [[],[]];

	for(var i=0; i<this.data.length; i++) {
		i >= colors[0].length ? this.colors[0].push(colors[0][i%colors[0].length]) : this.colors[0].push(colors[0][i]);
		i >= colors[1].length ? this.colors[1].push(colors[1][i%colors[1].length]) : this.colors[1].push(colors[1][i]);
	}

	this.multiColors = [[],[]];

	for(var i=0; i<this.data.length; i++) {
		i >= DefColors.length ? this.multiColors[0].push(DefColors[i%DefColors.length]) : this.multiColors[0].push(DefColors[i]);
		i >= DefColors.length ? this.multiColors[1].push(DefColors[i%DefColors.length]) : this.multiColors[1].push(DefColors[i]);
	}

	this.width = width || 400;
	this.height = height || 200;
	this.maxVal = 0;
	this.benchMarks = [];
	this.benchMarksValid = 0;
	this.lineChartActive = 0;
	this.barChartActive = 0;
	this.dNutChartActive = 0;

	//STYLES

	var style_parent = "position:relative !important;  display:inline-block !important;"
	var style_chart = "border:0px; border-bottom:1px solid #212121; border-left:1px solid #212121; margin:0px; margin-top:20px; box-sizing:content-box !important;";
	    style_chart+= "background:transparent; margin-left:" + this.width/18 + "px !important; display:block; margin-bottom:20px;";

	var style_xAxis = "color:#212121; border:0px; text-align:center; width:"+this.width+"px; font-family:verdana; padding:2px;";
	    style_xAxis+= "margin-left:" + this.width/18 + "px !important; font-size:" + this.width/30 + "px; line-height:" + this.width/24 + "px;";
	    style_xAxis+= "display:block; background:transparent; height:" + this.width/24 + "px; text-overflow:ellipsis;";
	    style_xAxis+= "margin-top:20px; white-space:nowrap;";

	var style_yAxis = "color:#212121; border:1px; text-align:center; width:"+this.height+"px; font-family:verdana; padding:2px;";
	    style_yAxis+= "-webkit-transform: rotate(-90deg); transform: rotate(-90deg); -webkit-transform-origin: bottom left; transform-origin: top left;";
            style_yAxis+= "position:absolute; top:" + (this.height + 20) + "px; left:0; font-size:" + this.width/30 + "px; text-overflow:ellipsis;";
	    style_yAxis+= "height:" + this.width/24 + "px; background:transparent; line-height:" + this.width/24 + "px; white-space:nowrap;";

	var style_toolTip = "z-index:999; position:absolute; box-shadow:0 4px 8px 0 rgba(0,0,0,0.2),0 6px 20px 0 rgba(0,0,0,0.19)!important;";
	    style_toolTip+= "display:inline-block; padding:4px 8px; background:rgba(0,0,0,0.69); color:white; font-size:16px; font-family:segoe UI;";
	    style_toolTip+= "border:0px; font-weight:bold; border-radius:4px;";

	var style_bar = "position:absolute; background:#EEE; display:inline-block; transition:0.6s; -webkit-transition:0.6s; transform:rotateY(90deg);";
	    style_bar+= "border-radius:0px; z-index:996;";

	var style_txt = "display:inilne-block; position:absolute; white-space:nowrap; overflow:hidden; z-index:998; font-family:verdana; margin:0px;";
	    style_txt+= "text-align:center; text-overflow:ellipsis; font-size:12px; padding:0px; border:0px; border-radius:33%; padding:0;"
	    style_txt+= "background:#EEE; background:linear-gradient(rgba(250,250,250,0.7),rgba(235,235,235,0.7),rgba(233,233,233,0.7));";
	    style_txt+= "border:0px; transition:0.9s; -webkit-transition:0.9s; transform:rotateY(90deg);";

	var style_bMark = "position:absolute; z-index:997; border:0px; height:0px; display:inline-block; width:" + this.width + "px;"
	    style_bMark+= "border-bottom:1px dotted black; transition:0.8s; -webkit-transition:0.8s;";

	var style_bMarkHandle = "position:absolute; border-radius:50%; border:0px; height:" + (this.width/50) + "px; width:" + (this.width/50) + "px;";
	    style_bMarkHandle+= "display:inline-block; margin-top:" + (((this.width/100) * -1) + 1) + "px; right:0px; transition:0.3s; -webkit-transition:0.3s;";
	    style_bMarkHandle+= "background:#212121; box-shadow:0 4px 8px 0 rgba(0,0,0,0.2),0 6px 20px 0 rgba(0,0,0,0.19)!important;";


	var style_hl = "position:absolute; padding:0px; margin:0px; border:0px; line-height:1px; transition:0.6s; -webkit-transition:0.6s;"; 
	    style_hl+= "height:1px; background:#EEE; z-index:997; box-shadow:0 -4px 4px 0 rgba(0,0,0,0.2)!important;";

	var style_point = "position:absolute; border-radius:50%; border:0px; transition:0.6s; -webkit-transition:0.6s; background:#EEE; display:inline-block;";
	    style_point+= "margin-top:" + Math.round(((this.width+this.height)/200) * -1,0) + "px; left:" + Math.round(((this.width+this.height)/200) * -1,0) + "px;";
	    style_point+= " width:" + Math.round((this.width+this.height)/100,0) + "px; height:" + Math.round((this.width+this.height)/100,0) + "px;";
	    style_point+= " box-shadow:0 -4px 4px 0 rgba(0,0,0,0.2)!important;";

	this.parentId.setAttribute('style',style_parent);

	if(!document.getElementById(this.parentId.getAttribute('id') + '_U_Chart')) {
		var chart = document.createElement('div');
		chart.setAttribute('style',style_chart);
		chart.style.width = this.width + "px";
		chart.style.height = this.height + "px";
		chart.setAttribute('id',this.parentId.getAttribute('id') + '_U_Chart');
		this.parentId.appendChild(chart);

		if(y && typeof y == "string" && y != "") {
			var yAxis = document.createElement("div");
			yAxis.setAttribute("style",style_yAxis);
			yAxis.innerHTML = y;
			this.parentId.appendChild(yAxis);
		}

		if(x && typeof x == "string" && x != "") {
			var xAxis = document.createElement("div");
			xAxis.setAttribute("style",style_xAxis);
			xAxis.innerHTML = x;
			this.parentId.appendChild(xAxis);
		}
	} else {
		var chart = document.getElementById(this.parentId.getAttribute('id') + '_U_Chart');
	}


	var bars = [];

	this.toolTip = document.createElement('div');
	this.toolTip.setAttribute('style',style_toolTip);
	this.toolTip.style.display = 'none';
	this.toolTipActive = 0;
	this.toolTip.addEventListener('mouseover',function(){
		this.toolTipActive = 1;
	});
	this.toolTip.addEventListener('mouseout',function(){
		this.toolTipActive = 0;
	});
	document.body.appendChild(this.toolTip);

	// THAT = THIS

	var that = this; 

	//METHODS


	this.maxValFn = function() {
		try {
			var m = 0;
			if(!document.getElementById(this.parentId.getAttribute('id') + '_U_Chart_maxval')) {
				var hin = document.createElement('input');
				hin.setAttribute('id',this.parentId.getAttribute('id') + '_U_Chart_maxval');
				hin.setAttribute('value',0);
				hin.setAttribute('type','hidden');
				this.parentId.appendChild(hin);
			} else {
				m = document.getElementById(this.parentId.getAttribute('id') + '_U_Chart_maxval').value;
			}
			for(var i=0; i<this.data.length; i++) {
				if(this.data[i][1] > m)
					m = this.data[i][1];
			}
			if(this.benchMarksValid) {
				for(var j=0; j<this.benchMarks.length; j++) {
					if(this.benchMarks[j].value > m)
						m = this.benchMarks[j].value;
				}
			}
		this.maxVal = m;
		document.getElementById(this.parentId.getAttribute('id') + '_U_Chart_maxval').value = m;
		} catch(e) {
			document.getElementById(id).innerHTML = "Error while calculating the maximum value: <br>"+e;
			this.maxVal = 0;
		}
			
	}
	this.maxValFn();

	this.animateY = function(elem,t) {
		var t = t || 333;
		setTimeout(function(){elem.style.transform = "rotateY(0deg)";},t);
	}
	this.animateTop = function(elem,topVal,t) {
		var t = t || 333;
		setTimeout(function(){elem.style.top = topVal+"px";},t);
	}
	this.animateHeight = function(elem,h,t) {
		var t = t || 333;
		setTimeout(function(){elem.style.height = h+"px";},t);
	}

	this.createTexts = function(i) {
		try {
			var txt1 = document.createElement('span');
			txt1.setAttribute('style',style_txt);
			txt1.setAttribute('title',this.data[i][0]);
			txt1.style.left = this.width/18 + 1 + (i / this.data.length *  this.width) + "px";
			txt1.style.top = (this.height) + 22 + "px";
			txt1.style.width = ((this.width / this.data.length)-5) + "px";
			txt1.style.transform = "rotateY(0deg)";
			txt1.style.background = "transparent";
			txt1.style.border = "0px";
			txt1.style.height = "18px";
			txt1.style.lineHeight = "16px";
			txt1.appendChild(document.createTextNode(this.data[i][0]));
			chart.appendChild(txt1);

			if(this.data[i][1] == 0)
				return;

			var txt2 = document.createElement('span');
			txt2.setAttribute('style',style_txt);
			txt2.setAttribute('title',this.data[i][1]);
			txt2.setAttribute('class',this.parentId.getAttribute('id') + '_values');
			txt2.style.left = this.width/18 + 1 + (i / this.data.length *  this.width) + "px";
			txt2.style.top = (this.height - ((this.height / this.maxVal) * this.data[i][1]) ) + "px";
			txt2.style.width = ((this.width / this.data.length)-5) + "px";
			txt2.style.height = "16px";
			txt2.style.lineHeight = "16px";
			txt2.appendChild(document.createTextNode(this.data[i][1]));
			this.animateY(txt2,((i+1)*10)+600);
			chart.appendChild(txt2);
		} catch(e) {
			document.getElementById(id).innerHTML = "Error while creating the texts: <br>"+e;
		}
	}
	

	this.drawBarChart = function() {
		try {
			this.maxValFn();
			var mOver = function(elem,i) {
					elem.addEventListener('mouseover',function(event){
						elem.style.background = that.colors[1][i];
					});
				}
			var mOut = function(elem,i) {
					elem.addEventListener('mouseout',function(event){
						elem.style.background = that.colors[0][i];
						if(!that.toolTipActive) {
							that.toolTip.style.display = 'none';
							that.toolTip.innerHTML = "";
						}
					});
				}
				
			for(var i=0; i<this.data.length; i++) {
				this.createTexts(i);
				if(this.data[i][1] == 0)
					continue;
				bars[i] = document.createElement('div');
				bars[i].setAttribute('style',style_bar);
				bars[i].style.left = this.width/18 + 1 + (i / this.data.length *  this.width) + "px";
				bars[i].style.top = this.height - ((this.height / this.maxVal) * this.data[i][1]) + 20 + "px";
				bars[i].style.width = ((this.width / this.data.length)-5) + "px";
				bars[i].style.height = (this.height / this.maxVal) * this.data[i][1] + "px";
				bars[i].style.background = this.colors[0][i];
				bars[i].setAttribute('title',this.data[i][0] + ':' + this.data[i][1]);
				this.animateY(bars[i],((i+1)*10)+300);
				mOver(bars[i],i);
				mOut(bars[i],i);
				bars[i].addEventListener('mousemove',function(event){
					that.toolTip.style.display = 'inline-block';
					that.toolTip.innerHTML = event.target.getAttribute('title');
					that.moveToolTip(event.clientX,event.clientY);
				});
				chart.appendChild(bars[i]);
			}
			this.barChartActive = 1;
		} catch(e) {
			document.getElementById(id).innerHTML = "Error while drawing the bar chart: <br>"+e;
			this.barChartActive = 0;
		}
	}
	this.moveToolTip = function(x,y) {
		try {
			var scrollTop = (document.documentElement && document.documentElement.scrollTop) || document.body.scrollTop;
			var scrollLeft = (document.documentElement && document.documentElement.scrollLeft) || document.body.scrollLeft;
			var x = (Number(scrollLeft) + Number(x));
			var y = (Number(scrollTop) + Number(y));
			var p = this.parentId;

			if(y-Number(p.offsetTop) > Number(p.offsetHeight) / 2) {
				y = Number(y) - Number(this.toolTip.offsetHeight) - 5;
			} else{
				y = Number(y) + 10;
			}

			if(x-Number(p.offsetLeft) > Number(p.offsetWidth) / 2) {
				x = Number(x) - Number(this.toolTip.offsetWidth) - 5;
			} else {
				x = Number(x) + 10;
			}

			this.toolTip.style.left = x+"px";
			this.toolTip.style.top = y+"px";

			//window.scrollTo(x,y);
		} catch(e) {
			document.getElementById(id).innerHTML = 'Error while moving tool tip: <br>' + e;
		}
	}

	this.drawBenchMarks = function(b) {
		try {
			if(typeof b !== "object" || b.length === undefined || b.length == 0) 
				throw new Error("Input parameter invalid");

			for(var i=0; i<b.length; i++){
				if(!b[i].hasOwnProperty("name"))
					throw new Error("Input parameter doesn't contain the property 'name' at position (" + i + ")");
				if(!b[i].hasOwnProperty("value"))
					throw new Error("Input parameter doesn't contain the property 'value' at position (" + i + ")");
				if(typeof b[i].name != 'string')
					throw new Error("Input parameter name is not a string at position (" + i + ")");
				if(typeof b[i].value != 'number')
					throw new Error("Input parameter name is not a number at position (" + i + ")");
			}

			this.benchMarks = b;
			this.benchMarksValid = 1;
			this.maxValFn();
			chart.innerHTML = '';
			if(this.barChartActive)
				this.drawBarChart();
			if(this.lineChartActive)
				this.drawLineChart();

			for(var j=0; j<b.length; j++){
				var mark = document.createElement('div');
				mark.setAttribute('style',style_bMark);
				mark.style.top = this.height + 20 + "px";
				this.animateTop(mark,this.height - ((this.height / this.maxVal) * b[j].value) + 20,1200);
				mark.setAttribute('title',b[j].name + " (" + b[j].value + ")");
				var handle = document.createElement('span');
				handle.setAttribute('style',style_bMarkHandle);
				if(b[j].hasOwnProperty("color")) {
					mark.style.borderColor = b[j].color;
					handle.style.background = b[j].color;
				}
				handle.addEventListener('mousemove',function(event){
					event.target.style.borderRadius = "0%";
					event.target.parentNode.style.borderStyle = 'solid';
					that.toolTip.style.display = 'inline-block';
					that.toolTip.innerHTML = event.target.parentNode.getAttribute('title');
					that.moveToolTip(event.clientX,event.clientY);
				});
				handle.addEventListener('mouseout',function(event){	
					if(!that.toolTipActive) {				
						that.toolTip.style.display = 'none';
						that.toolTip.innerHTML = "";
					}
					event.target.style.borderRadius = "50%";
					event.target.parentNode.style.borderStyle = 'dotted';
				});
				mark.appendChild(handle);
				chart.appendChild(mark);
			}
			
		} catch(e) {
			document.getElementById(id).innerHTML = 'Error while drawing Bench Marks: <br>' + e;
			this.benchMarks = [];
			this.benchMarksValid = 0;
		}
	}

	this.toggleValues = function() {
		try {
			var c = document.getElementsByClassName(this.parentId.getAttribute('id') + '_values');
			for(var i=0; i<c.length; i++) {
				if(c[i].style.display != 'none')
					c[i].style.display = 'none';
				else
					c[i].style.display = 'inline-block';
			}
		} catch(e) {
			document.getElementById(id).innerHTML = 'Error while showing/hiding values: <br>' + e;
		}
	}

	this.drawLine  = function(x1,y1,x2,y2,data,i) {
		try {
			var length = Math.sqrt(((x2-x1) * (x2-x1)) + ((y2-y1) * (y2-y1)));

			var angle = Math.atan2((y1-y2),(x1-x2))*(180/Math.PI);

			var cx = ((x1 + x2) / 2) - (length / 2);
			var cy = ((y1 + y2) / 2) - (0.5);

			var hl = document.createElement('div');
			hl.setAttribute('style',style_hl);
			hl.setAttribute('title',data);
			hl.style.left = this.width/2 + "px";
			setTimeout(function(){hl.style.left = cx + "px";},600);
			hl.style.top = this.height/2 + "px";
			setTimeout(function(){hl.style.top = cy + "px";},600);
			hl.style.width = 0 + "px";
			setTimeout(function(){hl.style.width = length + "px";},600);
			hl.style.background = this.colors[0][i];
			hl.style.mozTransform = "rotate(" + angle + "deg)";
			hl.style.webkitTransform = "rotate(" + angle + "deg)";
			hl.style.oTransform = "rotate(" + angle + "deg)";
			hl.style.msTransform = "rotate(" + angle + "deg)";
			hl.style.transform = "rotate(" + angle + "deg)";
			var p = document.createElement('span');
			p.setAttribute('style',style_point);
			p.style.background = this.colors[0][i];
			p.addEventListener('mouseover',function(event){
				event.target.style.background = that.colors[1][i];
				event.target.parentNode.style.background = that.colors[1][i];
				event.target.style.transform = "scale(1.5)";
			});
			p.addEventListener('mousemove',function(event){
				that.toolTip.style.display = 'inline-block';
				that.toolTip.innerHTML = event.target.parentNode.getAttribute('title');
				that.moveToolTip(event.clientX,event.clientY);
			});
			p.addEventListener('mouseout',function(event){	
				if(!that.toolTipActive) {				
					that.toolTip.style.display = 'none';
					that.toolTip.innerHTML = "";
				}
				event.target.style.background = that.colors[0][i];
				event.target.parentNode.style.background = that.colors[0][i];
				event.target.style.transform = "scale(1)";
			});
			hl.appendChild(p);
			this.parentId.appendChild(hl);
		} catch(e) {
			document.getElementById(id).innerHTML = 'Error while drawing the line: <br>' + e;
		}
	}

	this.drawLineChart = function() {
		try {
			this.maxValFn();
			for(var i=0; i<this.data.length; i++) {
				this.createTexts(i);
				if(this.data[i][1] == 0)
					continue;
				var x1 = i == 0 ? (this.width/18) + 1 : this.width/18 + (this.width/this.data.length) * (i) - ((this.width/this.data.length)*0.5);
				var y1 = i == 0 ? this.height + 20 : this.height + 20 - ((this.height / this.maxVal) * this.data[i-1][1]);
				var x2 = this.width/18 + (this.width/this.data.length) * (i+1) - ((this.width/this.data.length)*0.5);
				var y2 = this.height + 20 - ((this.height / this.maxVal) * this.data[i][1]);
				this.drawLine(x1,y1,x2,y2,this.data[i][0] + ':' + this.data[i][1],i);
			}

			this.lineChartActive = 1;
		} catch(e) {
			document.getElementById(id).innerHTML = "Error while drawing the line chart: <br>"+e;
			this.lineChartActive = 0;
		}
	}

	this.drawDnutChart = function () {
		try {
			if(!this.colorsDefined)
				this.colors = this.multiColors;	
			this.parentId.innerHTML = '';
			var dim = this.width || this.height;
			var thickness = Math.round(dim/6);
			var style_wrap = "width:" + dim + "px; height:" + dim + "px; border-radius: 50%; background:rgba(225,225,225,0.5);";
			    style_wrap+= "transition:0.9s; -webkit-transition:0.9s; box-shadow:none; border:0px; margin:" + (dim/12) + "px;";

			var style_base = "position:absolute; width:" + dim + "px; height:" + dim + "px; border-radius: 50%; background:transparent";
			    style_base+= "top:0px; left:0px; z-index:995;";

			var style_mask = "position:absolute; width:" + (dim - (thickness*2)) + "px; height:" + (dim - (thickness*2)) + "px; border-radius:50%;";
			    style_mask+= "color:black; text-align:center; left:" + (thickness) + "px; top:" + (thickness) + "px; z-index:997; font-family:verdana;";
			    style_mask+= "font-size:" + Math.round(dim/12) + "px; line-height:" + (dim - (thickness*2)) + "px;";
			    style_mask+= "box-shadow:0px 0px " + Math.round(dim/20) + "px black inset; transition:0.3s; -webkit-transition:0.3s;";
			    style_mask+= "white-space:nowrap; text-overflow:ellipsis; overflow:hidden; background:#FFF;);";

			var style_hold = "position:absolute; width:" + dim + "px; height:" + dim + "px; border-radius: 50%; background :transparent;";
			    style_hold+= "clip: rect(0px, " + dim + "px, " + dim + "px, " + dim/2 + "px); top:0px; left:0px; z-index:996;";

			var style_pie = "position:absolute; width:" + dim + "px; height:" + dim + "px; border-radius: 50%;";
			    style_pie+= "clip: rect(0px, " + dim/2 + "px, " + dim + "px, 0px); transition:0.4s; -webkit-transition:0.4s;";
			    style_pie+= "box-shadow:none;";

			var style_l = "position:absolute; display:inline-block; top:50%; right:" + (dim/30) * -1 + "px; width:" + (dim/30) + "px; border:0px; height:1px;";
			    style_l+= "opacity:0.7; transition:0.3s; -webkit-transition:0.3s; background:#000;";

			var styleInfo = "position:absolute; display:inline-block; top:" + ((dim/-40) + 0.5) + "px; right:" + (dim/20) * -1 + "px; width:" + (dim/20) + "px;";
			    styleInfo+= "transition:0.3s; -webkit-transition:0.3s; height:" + (dim/20) + "px; background:inherit; border-radius:50%;";

			var tot = 0, angles = [], tempAng = 0;
			for(var i=0; i<this.data.length; i++)
				tot+= this.data[i][1];
			for(var i=0; i<this.data.length; i++) {
				angles.push(tempAng);
				tempAng+= ((360/tot) * this.data[i][1]);
			}

			var wrap = document.createElement('div');
			wrap.setAttribute('style',style_wrap);
			wrap.style.transform = 'scale(0)';
			setTimeout(function(){wrap.style.transform = 'scale(1)';},100);

			var base = document.createElement('div');
			base.setAttribute('style',style_base);
			wrap.appendChild(base);

			var mask = document.createElement('div');
			mask.setAttribute('style',style_mask);
			mask.innerHTML = x;
			wrap.appendChild(mask);

			var createLine = function(i,len,p,p1) {
				var a = (angles[i] + (len / 2))-90;
				var lb = document.createElement('div');
				lb.setAttribute('style',style_base);
				lb.style.transform = 'rotate(' + a + 'deg)';
				var l = document.createElement('div');
				l.setAttribute('style',style_l);
				var d = document.createElement('div');
				d.setAttribute('style',styleInfo);
				d.setAttribute('title',that.data[i][0] + ':' + that.data[i][1]);
				d.style.background = that.colors[0][i];
				d.addEventListener('mouseover',function(event) {
					event.target.parentNode.style.opacity = '1.0';
					p.style.boxShadow = '0px 0px ' + Math.round(dim/20) + 'px black inset';
					if(p1) p1.style.boxShadow = '0px 0px ' + Math.round(dim/20) + 'px black inset';
					mask.innerHTML = Math.round((that.data[i][1] * 10000) / tot) / 100 + '%';
					mask.style.boxShadow = '0px 0px ' + Math.round(dim/15) + 'px ' + that.colors[0][i] + ' inset';
					event.target.style.transform = 'scale(1.4)';
					
				});
				d.addEventListener('mousemove',function(event){
					that.toolTip.style.display = 'inline-block';
					that.toolTip.innerHTML = event.target.getAttribute('title');
					that.moveToolTip(event.clientX,event.clientY);
				});
				d.addEventListener('mouseout',function(event) {	
					if(!that.toolTipActive) {				
						that.toolTip.style.display = 'none';
						that.toolTip.innerHTML = "";
					}
					event.target.parentNode.style.opacity = '0.7';
					p.style.boxShadow = 'none';
					if(p1) p1.style.boxShadow = 'none';
					mask.innerHTML = x;
					mask.style.boxShadow = '0px 0px ' + Math.round(dim/15) + 'px black inset';
					event.target.style.transform = 'scale(1)';
				});
				l.appendChild(d);
				lb.appendChild(l);
				wrap.appendChild(lb);
			}

			for(var i=0; i<this.data.length; i++) {
				var len = ((360/tot) * this.data[i][1]);
				var h = document.createElement('div');
				h.setAttribute('style',style_hold);
				var p = document.createElement('div');
				p.setAttribute('style',style_pie);
				p.style.background = that.colors[0][i];
				h.style.transform = 'rotate(' + (angles[i]) + 'deg)';
				var h1 = undefined;
				var p1 = undefined;
				if(len > 180) {
					p.style.transform = 'rotate(' + 180 + 'deg)';
					h1 = document.createElement('div');
					h1.setAttribute('style',style_hold);
					p1 = document.createElement('div');
					p1.setAttribute('style',style_pie);
					p1.style.background = that.colors[0][i];
					if(len >= 360)
						h1.style.transform = 'rotate(' + 180 + 'deg)';
					else
						h1.style.transform = 'rotate(' + (Number(angles[i]) + 179.5) + 'deg)';
					if(len >= 360)
						p1.style.transform = 'rotate(' + 180 + 'deg)';
					else
						p1.style.transform = 'rotate(' + (Number(len) - 179) + 'deg)';
					h1.appendChild(p1);
				} else {
					p.style.transform = 'rotate(' + (len) + 'deg)';
				}
				if(p1)
					createLine(i,len,p,p1);
				else
					createLine(i,len,p,0);
				h.appendChild(p);
				wrap.appendChild(h);
				if(h1) wrap.appendChild(h1);
			}

			this.parentId.appendChild(wrap);
			this.dNutChartActive = 1;
		} catch(e) {
			document.getElementById(id).innerHTML = "Error while creating the Dough Nut chart: <br>"+e;
		}
	}

	
} catch(e) {
	if(id && document.getElementById(id))
		document.getElementById(id).innerHTML = "Error while initiating the chart: <br>"+e;
	else
		alert("Error while creating the chart: \n"+e);
}
}