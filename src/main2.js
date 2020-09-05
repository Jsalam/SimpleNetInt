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

    // current background
    let backColor = 100;

    // Preload
    p5.preload = function() {
        myFont = gp5.loadFont("../fonts/Roboto-Light.ttf");
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
        gp5.loadJSON(pathNetworks + model.value + '_network.json', onLoadNetwork)
    }


    // Does this only once
    p5.setup = function() {
        // Create canvas
        gp5.createCanvas(window.innerWidth - 60, 740, gp5.WEBGL);
        graphics = gp5.createGraphics(gp5.width * gp5.pixelDensity(), gp5.height * gp5.pixelDensity(), gp5.WEBGL);
        gp5.textFont(myFont);
        graphics.textFont(myFont);
        canvas = new Canvas(graphics);

        // Connect with HTML GUI
        document.getElementById("clearEdges").onclick = clearEdges;

        // Add GUI FORMS
        addClusterModalForm();
        addNodeModalForm();
        exportNetworkModalForm();
        importNetworkModalForm();



        // canvas refresh
        //animate();
    }

    // In a loop
    p5.draw = function() {
        gp5.background(backColor);

        if (document.getElementById("backgroundContrast").checked) {
            backColor = 150;
        } else {
            backColor = 230;
        }
        // draw elements
        gp5.push();
        canvas.transform()
        canvas.originCrossHair();
        canvas.render(backColor);
        gp5.pop();

        // draw canvas status
        canvas.displayValues(gp5.createVector((gp5.width / 2) - 10, (-gp5.height / 2) + 5), gp5)
        canvas.showLegend(gp5.createVector((gp5.width / 2) - 10, (gp5.height / 2) - 40), gp5)
    }

    onLoadNetwork = function(data) {
        console.log("Ready for drawing");
    }


}

function animate() {
    requestAnimationFrame(animate)
    canvas.transform()
}




var gp5 = new p5(main, "model");