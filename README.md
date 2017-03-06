# Ucharts
Superheroic Data Visualization library for bar, line and doughnut charts containing code and style in a single file.


Self Help:

Developer  Karthik Uday Murthy

-------Syntax:-------

```javascript

var x = new UChart(id,data,x,y,width,height,colors); // for bar chart

    x.drawBarChart(); // for bar chart
    
    
var x = new UChart(id,data,x,y,width,height,colors); // for line chart

    x.drawLineChart(); // for line chart
    
    
var x = new UChart(id,data,x,"",width,"",colors); // for Dough Nut chart

    x.drawDnutChart(); // for Dough Nut chart
    
```
    
-----------Parameters:-----------

id = Parent id in which the chart needs to created (Mandatory).

data = Array containing sub array of two columns example : [["Jan",20],["Feb",30],["Mar",15]] (Mandatory).

x = text that needs to be displayed in x-Axis (Optional).

y = text that needs to be displayed in y-Axis (Optional).

width = Width of the chart excluding Axis (Optional).

height = height of the chart excluding Axis (Optional).

colors = Array with two array of colors first one for bar and second is used when hovered (Optional);



-------------------Additional Methods:-------------------

```javascript
drawBenchMarks(array if objects);

//example:

x.drawBenchMarks([{name:'50th Percentile',value:18,color:"#993300"},{name:'75th Percentile',value:36,color:"#009933"}]);




toggleValues();

//example:

x.toggleValues();

```
