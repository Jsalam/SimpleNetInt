//let canvas;
// main function
var main = function(p5) {

    // variables
    let edgesTemp;
    let nodesTemp;
    let graphics;

    // font
    let myFont;

    // files path
    let pathNetworks = './files/Networks/';
    let pathPalettes = './files/colorPalettes/';

    // current model
    let model;
    let canvas;

    // Preload
    p5.preload = function() {
        // get font
        myFont = gp5.loadFont("../fonts/Roboto-Light.ttf");
        // get color palette
        let paletteNames = ["palette1.txt", "palette2.txt", "palette3.txt", "palette4.txt"]
        ColorFactory.loadPalettes(pathPalettes, paletteNames);
    }


    // Setup variables
    p5.setup = function() {
        // Create canvas
        gp5.createCanvas(window.innerWidth - 60, 740, gp5.WEBGL);
        graphics = gp5.createGraphics(gp5.width * gp5.pixelDensity(), gp5.height * gp5.pixelDensity(), gp5.WEBGL);
        gp5.textFont(myFont);
        graphics.textFont(myFont);
        canvas = new Canvas(graphics);
        // Connect with HTML GUI
        document.getElementById("clearEdges").onclick = clearEdges;
        document.getElementById("backgroundContrast").onclick = switchBackground;
        // Add GUI FORMS
        addClusterModalForm();
        addNodeModalForm();
        exportNetworkModalForm();
        importNetworkModalForm();
        // Enable the model dropdown selector
        model = document.getElementById("modelChoice");
        model.addEventListener('change', () => {
            switchModel(model.value);
        });
    }

    // In a loop
    p5.draw = function() {
        // draw elements
        gp5.push();
        canvas.transform()
        canvas.render();
        canvas.originCrossHair();
        gp5.pop();
        // draw canvas status
        canvas.displayValues(gp5.createVector((gp5.width / 2) - 10, (-gp5.height / 2) + 5), gp5)
        canvas.showLegend(gp5.createVector((gp5.width / 2) - 10, (gp5.height / 2) - 40), gp5)
    }

    /*** GUI CALLBACKS */
    switchModel = function(value) {
        console.log("Switching to " + value + " network");
        p5.loadJSON(pathNetworks + value + '_network.json', onLoadNetwork);
    }

    onLoadNetwork = function(data) {
        nodesTemp = data.nodes;
        buildClusters(nodesTemp);
        edgesTemp = data.edges;
        buildEdges(edgesTemp);
        canvas.update();
    }

    buildClusters = function(result) {
        ClusterFactory.reset();
        ClusterFactory.makeClusters(result);
    }

    buildEdges = function(result) {
        EdgeFactory.reset();
        EdgeFactory.buildEdges(result, ClusterFactory.clusters)
    }

    /** Delete edges and re-initialize nodes */
    clearEdges = function() {
        EdgeFactory.reset();
        ClusterFactory.resetAllConnectors();
    }

    switchBackground = function(evt) {
        if (document.getElementById("backgroundContrast").checked) {
            canvas.currentBackground = 150;
        } else {
            canvas.currentBackground = 230;
        }
        canvas.update();
    }
}





var gp5 = new p5(main, "model");