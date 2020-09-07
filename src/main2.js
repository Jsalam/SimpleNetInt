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
        myFont = gp5.loadFont("../fonts/Roboto-Light.ttf");

        // get color palette
        let paletteNames = ["palette1.txt", "palette2.txt", "palette3.txt", "palette4.txt"]
        ColorFactory.loadPalettes('./files/colorPalettes/', paletteNames);
    }


    // Setup variables
    p5.setup = function() {

        // Create canvas
        gp5.createCanvas(window.innerWidth - 60, 740, gp5.WEBGL);
        graphics = gp5.createGraphics(gp5.width * gp5.pixelDensity(), gp5.height * gp5.pixelDensity(), gp5.WEBGL);
        gp5.textFont(myFont);
        graphics.textFont(myFont);

        // Global static canvas
        Canvas.makeCanvas(graphics);

        // Connect with HTML GUI
        DOM.init()

        // load the first selected model by default
        DOM.switchModel(DOM.dropdowns.modelChoice.value);
    }

    // Everyting drawn on p5 canvas is comming from Canvas class. In Canvas, it shows all the subscribed visual elements.
    p5.draw = function() {

        // push transformation matrix
        gp5.push();

        // DOM event
        if (DOM.event) {
            Canvas.update();
            DOM.event = false;
        }

        // translating to upper left corner
        gp5.translate(-gp5.width / 2, -gp5.height / 2);

        // Canvas own transformations
        Canvas.transform();
        Canvas.render();
        Canvas.originCrossHair();
        Canvas.showOnPointer();

        // pop transformation matrix
        gp5.pop();

        // draw canvas status
        Canvas.displayValues(gp5.createVector((gp5.width / 2) - 10, (-gp5.height / 2) + 5), gp5);
        Canvas.showLegend(gp5.createVector((gp5.width / 2) - 10, (gp5.height / 2) - 65), gp5);



    }
}





var gp5 = new p5(main, "model");