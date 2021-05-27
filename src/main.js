// main function
var main = function(p5) {

    // variables
    let graphics;
    let gallery;

    // font
    let myFont;

    // Networks path
    DOM.pathNetworks = './files/Networks/';

    // Preload
    p5.preload = function() {

        // get font
        myFont = gp5.loadFont("./fonts/Roboto-Light.ttf");

        // get color palette
        let paletteNames = ["paletteA.txt", "paletteB.txt", "paletteC.txt", "paletteD.txt", "paletteE.txt", "paletteF.txt", "paletteG.txt", "paletteH.txt"]
        ColorFactory.loadPalettes('./files/colorPalettes/', paletteNames);
    }


    // Setup variables
    p5.setup = function() {

        // Create canvas
        gp5.createCanvas(window.innerWidth - 60, 740);

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

        // add gallery
        gallery = new Gallery(1710, 270, 7.5);

        // Connect with GUIs
        DOM.init();

        // load the first selected model by default
        DOM.switchModel(DOM.dropdowns.modelChoice.value);

    }

    // Everyting drawn on p5 canvas is coming from Canvas class. In Canvas, it shows all the subscribed visual elements.
    p5.draw = function() {
        // gp5.background(250)

        let xOrg = 0 //-gp5.width / 2
        let yOrg = 0 //  -gp5.height / 2

        // push transformation matrix
        gp5.push();


        // DOM event
        if (DOM.event) {
            Canvas.update();
            Canvas.notifyObservers({ event: DOM.event, type: "DOMEvent" })
            DOM.event = undefined;
        }

        // translating to upper left corner in WebGL mode
        // gp5.translate(xOrg,yOrg );

        Canvas.render();

        // Canvas.originCrossHair();
        Canvas.showOnPointer();

        // gallery
        if (DOM.boxChecked('showWall')) {
            gallery.wall(gp5);
            gallery.column(gp5);
            gallery.canvas(gp5);
            gallery.hotArea(gp5);
        }
        if (DOM.boxChecked('showColleges')) {
            gallery.colleges(gp5, ["Carle College of Medicine", "College of Agriculture, Consumer and Environmental Sciences", "College of Veterinary Medicine", "College of Applied Health Sciences", "College of Education", "College of Fine and Applied Arts", "College of Liberal Arts and Sciences", "College of Media", "Gies College of Business", "Grainger College of Engineering", "Institute for Genomic Biology", "Institute for Sustainability Energy and Environment",
                "National Center of Supercomputer Applications", "School of Information Sciences", "School of Social Work", "University of Illinois Library", "Other"
            ])
        }

        // pop transformation matrix
        gp5.pop();

        // draw canvas status
        Canvas.displayValues(gp5.createVector(gp5.width - 10, 10), gp5); //gp5.createVector((xOrg) , (yOrg) + 5)
        Canvas.showLegend(gp5.createVector(gp5.width - 10, gp5.height - 90), gp5);
    }
}

var gp5 = new p5(main, "model");