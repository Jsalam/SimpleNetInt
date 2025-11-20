"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.gp5 = void 0;
var p5_1 = require("p5");
var DOMManager_1 = require("./GUI/DOM/DOMManager");
var colorFactory_1 = require("./factories/colorFactory");
var canvas_1 = require("./canvas/canvas");
require("bootstrap/dist/js/bootstrap.min.js");
require("bootstrap/dist/css/bootstrap.min.css");
require("./style.css");
require("./styleSortingList.css");
exports.gp5 = new p5_1.default(main, document.querySelector("#model"));
// main function
function main(p5) {
    // variables
    var graphics;
    // font
    var myFont;
    // Networks path
    DOMManager_1.DOM.pathNetworks = "./files/Networks/";
    // Preload
    p5.preload = function () {
        // get font
        myFont = exports.gp5.loadFont("./fonts/Roboto-Light.ttf");
        // get color palette
        var paletteNames = [
            "palette1.txt",
            "palette2.txt",
            "palette3.txt",
            "palette4.txt",
        ];
        colorFactory_1.ColorFactory.loadPalettes("./files/colorPalettes/originalPalettes/", paletteNames, function () { });
    };
    // Setup variables
    p5.setup = function () {
        // Create canvas
        exports.gp5.createCanvas(window.innerWidth, window.innerHeight);
        exports.gp5.pixelDensity(2);
        // set pixel density based on display
        var canvas4KWidth = 3840;
        var canvas4KHeight = 2160;
        // create non-iterative renderer
        graphics = exports.gp5.createGraphics(canvas4KWidth, canvas4KHeight);
        // set text font
        exports.gp5.textFont(myFont);
        graphics.textFont(myFont);
        // Global static canvas
        canvas_1.Canvas.makeCanvas(graphics);
        // Add grid to canvas: org, width, height, hPartitions, vPartitions, scaleFactor [scaleFactor = 45 pixels represent 64/64 units]
        canvas_1.Canvas.initGrid(exports.gp5.createVector(0, 630), 64, 10, 64, 10, 45);
        // Connect with GUIs
        DOMManager_1.DOM.init();
        // load the first selected model by default
        DOMManager_1.DOM.switchModel(DOMManager_1.DOM.dropdowns.modelChoice.value);
        // scroll
        document.body.style.overflow = "hidden";
    };
    // Everyting drawn on p5 canvas is coming from Canvas class. In Canvas, it shows all the subscribed visual elements.
    p5.draw = function () {
        // push transformation matrix
        exports.gp5.push();
        // DOM event
        if (DOMManager_1.DOM.event) {
            canvas_1.Canvas.update();
            canvas_1.Canvas.notifyObservers({ event: DOMManager_1.DOM.event, type: "DOMEvent" });
            DOMManager_1.DOM.event = undefined;
        }
        // Canvas own transformations
        canvas_1.Canvas.transform();
        canvas_1.Canvas.render();
        // Canvas.originCrossHair();
        canvas_1.Canvas.showOnPointer();
        // pop transformation matrix
        exports.gp5.pop();
        // draw canvas status
        if (DOMManager_1.DOM.showLegend) {
            canvas_1.Canvas.showLegend(exports.gp5.createVector(window.innerWidth - 50, 20), exports.gp5);
            canvas_1.Canvas.displayValues(exports.gp5.createVector(window.innerWidth - 50, window.innerHeight - 150), exports.gp5);
        }
        else {
            canvas_1.Canvas.hideLegend();
            canvas_1.Canvas.hideValues();
        }
        // TransFactory.displayStatus(gp5.createVector(xOrg + gp5.width - 800, yOrg), gp5);
        // Canvas.displayValues(gp5.createVector(gp5.width - 10, 10), gp5);
        // Canvas.showLegend(gp5.createVector(gp5.width - 10, gp5.height - 85), gp5);
    };
    window.onresize = function (evt) {
        exports.gp5.resizeCanvas(window.innerWidth, window.innerHeight);
        DOMManager_1.DOM.event = evt;
    };
}
