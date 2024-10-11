# Simple NetInt

Simple NetInt is a JavaScript sketchpad for the visualization of networks on the browser using a node-edge layout. It seeks to help creative thinkers to structure information through open and speculative mental processes. The visualization strategy used is to place nodes of the same cluster in independent 3D spaces and draw links between nodes across spaces. Each data point is represented by a circular node encompassing as many colored connectors as relational attributes of the data point. The links are colored bezier curves that associate nodes by shared relational attributes or interactions. The result is a simple graphic user interface that enables visual depth as an intuitive dimension for data exploration.

## Sketchpad
<img width="1679" alt="Screen Shot 2022-05-01 at 10 48 18 PM" src="https://user-images.githubusercontent.com/10836823/166181966-f3833a05-9c59-43b8-9d07-fb3e155ccff2.png">*Sketchpad available [here](https://jsalam.github.io/SimpleNetInt/)*


## Application example

![Screen Shot 2022-04-27 at 7 01 17 PM](https://user-images.githubusercontent.com/10836823/165650188-9db0ad61-2f69-468e-a343-bd31762bac94.png)
*An screenshot of Simple NetInt used in [Firefly & Serenity Interactive Timeline](http://fireflytimeline.web.illinois.edu/index.html). The dataset includes the publications in the Firefly canon, the narrative of the series itself, and peer-reviewed journal articles and book chapters about the 2002 Fox science fiction television series Firefly and its follow-up Universal Pictures film Serenity.*

## **How does it work?**

Simple NetInt extends the [p5.js](https://p5js.org) library initiated by Lauren Lee McCarthy in 2013. Simple NetInt assigns numerical or categorical data to corresponding visual channels such as position, length, size, luminance, or hue, using software components named **factories**. The factories are functions that take the information of data points and produce visual nodes or links. Their channels represent magnitudes (numerical), classes (categories), or concepts (regions), following mapping operations and style guidelines customizable by designers. The latest version of Simple NetInt includes cluster, node, edge, color, and spatial factories.

Once Simple NetInt receives the data, either from a JSON database or manually entered, a column of nodes appears on a two-dimensional canvas. Nodes can be moved anywhere with simple drag and drop operations. Links appear automatically or users can add them manually by selecting pairs of source-target nodes. Such flexibility in arranging the distribution of visual elements allows users to convey information from relations of association, proximity, and similarity within regions. By default, the nodes on the canvas belong to a general cluster, but they can be assorted further in non-intersecting subgroups if the user chooses a clustering attribute.

Simple NetInt is a JavaScript version of [NetInt](https://github.com/LeonardoResearchGroup/NetInt) a Java-based node-link visualization prototype designed to support the visual discovery of patterns across datasets by displaying disjoint clusters of vertices that could be filtered, zoomed in or drilled down interactively.


## Data structure

The data structure read by Simple NetInt is a JSON object with two independent arrays, one for nodes and one for edges. 

Each node is an object containing these _key:value_ pairs:

- a unique {integer} _id_
- an {object} with all the node _attributes_
- an {array} with all the _connectors_
- a unique {integer} _pajekIndex_
- an {object} with the 3D coordinates on canvas and color 

Each edge is an object with these key:value pairs:

- an {object} specifying the _source_ (id and pajekIndex)
- an {object} specifying the _target_ (id and pajekIndex)
- an {string} with the category _kind_
- a {number} with the _weight_

## Who do I talk to?

This project is developed and maintained by Juan Salamanca (jsal@illinois.edu)
