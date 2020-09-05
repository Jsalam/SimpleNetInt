// main function
var main = function(p5) {

    // variables
    let edgesTemp;
    let nodesTemp;
    let graphics;

    // font
    let myFont;

    // Control rendering loop
    let renderGate;
    let rendered;

    // files path
    let pathNetworks = './files/Networks/';
    let pathPalettes = './files/colorPalettes/';

    // current model
    let model;

    // current background
    let backColor = 100;

    // Preload
    p5.preload = function() {
        myFont = p5.loadFont("../fonts/Roboto-Medium.ttf");
        // Enable the model dropdown selector
        model = document.getElementById("modelChoice");
        //preload(model.value);
        model.addEventListener('change', () => {
            switchModel(model.value);
        })

        let paletteNames = ["palette1.txt", "palette2.txt", "palette3.txt", "palette4.txt"]
        ColorFactory.loadPalettes(pathPalettes, paletteNames, callBackColors);

    }

    function callBackColors() {
        p5.loadJSON(pathNetworks + model.value + '_network.json', onLoadNetwork)
    }


    // Does this only once
    p5.setup = function() {
        // Create cavas
        p5.createCanvas(window.innerWidth - 60, 740, p5.WEBGL);
        graphics = p5.createGraphics(p5.width * p5.pixelDensity(), p5.height * p5.pixelDensity(), p5.WEBGL);
        p5.textFont(myFont);
        graphics.textFont(myFont);

        // Connect with HTML GUI
        document.getElementById("clearEdges").onclick = clearEdges;



        // Add GUI FORMS
        addClusterModalForm();
        addNodeModalForm();
        exportNetworkModalForm();
        importNetworkModalForm();
    }

    // In a loop
    p5.draw = function() {
        p5.background(backColor);

        if (document.getElementById("backgroundContrast").checked) {
            backColor = 150;
        } else {
            backColor = 230;
        }

        if (renderGate) {
            renderOnP5();
        } else {
            renderOnGraphics();
            p5.image(graphics, 0, 0);
        }
        renderGate = false;
    }

    switchModel = function(value) {
        console.log("Switching to " + value + " network");
        p5.loadJSON(pathNetworks + value + '_network.json', onLoadNetwork);
    }

    onLoadNetwork = function(data) {
        nodesTemp = data.nodes;
        buildClusters(nodesTemp);

        edgesTemp = data.edges;
        buildEdges(edgesTemp);
    }

    buildClusters = function(result) {
        ClusterFactory.reset();
        ClusterFactory.makeClusters(result);
    }

    buildEdges = function(result) {
        EdgeFactory.reset();
        EdgeFactory.buildEdges(result, ClusterFactory.clusters)
        renderGate = true;
    }

    /** Delete edges and re-initialize nodes */
    clearEdges = function() {
        EdgeFactory.reset();
        ClusterFactory.resetAllConnectors();
    }

    // Move events
    p5.mouseMoved = function() {
        renderGate = true;

        ClusterFactory.vClusters.forEach(element => {
            element.mouseOverEvents();
        });
    }

    // click events
    p5.mouseClicked = function() {
        renderGate = true;

        ClusterFactory.vClusters.forEach(element => {
            element.mouseClickedEvents();
        });
    }

    // drag events
    p5.mouseDragged = function() {
        renderGate = true;

        ClusterFactory.vClusters.forEach(element => {
            element.mouseDraggedEvents();
        })
    }

    // key events
    p5.keyTyped = function() {
        if (p5.key == 'E' && document.getElementById("edit").checked) {
            EdgeFactory.deleteLastEdge();
            renderGate = true;
        }
    }

    // render on original p5.Renderer
    renderOnP5 = function() {
        // draw description box
        p5.fill(250, 150);
        p5.noStroke();
        p5.rect(0, p5.height - 90, p5.width, 90)

        // draw hem
        p5.fill(150);
        p5.noStroke();
        p5.rect(0, p5.height - 15, p5.width, 15)
        p5.fill(210);
        // show clusters
        ClusterFactory.vClusters.forEach(element => { element.show(p5) });

        // show edges
        EdgeFactory.vEdges.forEach(element => { element.show(p5) });

        rendered = false;
    }

    // render on custom p5.Renderer
    renderOnGraphics = function() {

        if (!rendered) {
            graphics.background(backColor);

            // draw description box
            graphics.fill(250, 150);
            graphics.noStroke();
            graphics.rect(0, p5.height - 90, p5.width, 90)

            // draw hem
            graphics.fill(150);
            graphics.noStroke();
            graphics.rect(0, p5.height - 15, p5.width, 15)
            graphics.fill(210);

            // show clusters
            ClusterFactory.vClusters.forEach(element => { element.show(graphics) });

            // show edges
            EdgeFactory.vEdges.forEach(element => { element.show(graphics) });

            rendered = true;
        }
    }
}
var gp5 = new p5(main, "model");