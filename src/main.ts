// main function
var main = function(p5) {

    // variables
    let graphics;

    // font
    let myFont;

    // Networks path
    DOM.pathNetworks = './files/Networks/';

    // Preload
    p5.preload = function() {

        // get font
        myFont = gp5.loadFont("./fonts/Roboto-Light.ttf");

        // get color palette
        let paletteNames = ["palette1.txt", "palette2.txt", "palette3.txt", "palette4.txt"]
        ColorFactory.loadPalettes('./files/colorPalettes/originalPalettes/', paletteNames, () => {});
    }


    // Setup variables
    p5.setup = function() {

        // Create canvas
        gp5.createCanvas(window.innerWidth, window.innerHeight);

        gp5.pixelDensity(2);

        // set pixel density based on display
        const canvas4KWidth = 3840;
        const canvas4KHeight = 2160

        // create non-iterative renderer
        graphics = gp5.createGraphics(canvas4KWidth, canvas4KHeight);

        // set text font
        gp5.textFont(myFont);
        graphics.textFont(myFont);

        // Global static canvas
        Canvas.makeCanvas(graphics);

        // Add grid to canvas: org, width, height, hPartitions, vPartitions, scaleFactor [scaleFactor = 45 pixels represent 64/64 units]
        Canvas.initGrid(gp5.createVector(0, 630), 64, 10, 64, 10, 45);

        // Connect with GUIs
        DOM.init();

        // load the first selected model by default
        DOM.switchModel(DOM.dropdowns.modelChoice.value);

        // scroll
        document.body.style.overflow = "hidden";
    }


    // Everyting drawn on p5 canvas is coming from Canvas class. In Canvas, it shows all the subscribed visual elements.
    p5.draw = function() {

        // push transformation matrix
        gp5.push();

        // DOM event
        if (DOM.event) {
            Canvas.update();
            Canvas.notifyObservers({ event: DOM.event, type: "DOMEvent" })
            DOM.event = undefined;
        }

        // Canvas own transformations
        Canvas.transform();
        Canvas.render();

        // Canvas.originCrossHair();
        Canvas.showOnPointer();

        // pop transformation matrix
        gp5.pop();

        // draw canvas status
        if (DOM.showLegend) {
            Canvas.showLegend(gp5.createVector(window.innerWidth - 50, 20), gp5);
            Canvas.displayValues(gp5.createVector(window.innerWidth - 50, window.innerHeight - 150), gp5);
        } else {
            Canvas.hideLegend();
            Canvas.hideValues();
        }
        // TransFactory.displayStatus(gp5.createVector(xOrg + gp5.width - 800, yOrg), gp5);
        // Canvas.displayValues(gp5.createVector(gp5.width - 10, 10), gp5);
        // Canvas.showLegend(gp5.createVector(gp5.width - 10, gp5.height - 85), gp5);

    }

    window.onresize = (evt) => {
        gp5.resizeCanvas(window.innerWidth, window.innerHeight);
        DOM.event = evt;
    }
}

var gp5 = new p5(main, "model");