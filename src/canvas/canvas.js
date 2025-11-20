"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Canvas = void 0;
var p5_1 = require("p5");
var main_1 = require("../main");
var edge_1 = require("../graphElements/edge");
var vNode_1 = require("../visualElements/vNode");
var edgeFactory_1 = require("../factories/edgeFactory");
var vEdge_1 = require("../visualElements/vEdge");
var transformerFactory_1 = require("../factories/transformerFactory");
var vConnector_1 = require("../visualElements/vConnector");
var grid_1 = require("./grid");
var vCluster_1 = require("../visualElements/vCluster");
var vGeoCluster_1 = require("../visualElements/vGeoCluster");
var ClusterSettings_1 = require("../GUI/widgets/ClusterSettings");
var clusterFactory_1 = require("../factories/clusterFactory");
/**
 * Adaptation of NetInt Canvas class
 *
 *gp5 is a global instance of p5 object
 */
var Canvas = /** @class */ (function () {
    function Canvas() {
    }
    Canvas.makeCanvas = function (graphics) {
        // graphics
        this.graphicsw = graphics;
        this.graphicsRendered = false;
        this.renderGate = true;
        this.currentBackground = 50;
        // The scale of our world
        this._zoom = 1;
        // A vector to store the offset
        this._offset = main_1.gp5.createVector(0, 0, 0);
        // A vector to store the start offset
        this._startOffset = main_1.gp5.createVector(0, 0, 0);
        // The previous offset
        this._endOffset = main_1.gp5.createVector(0, 0, 0);
        // A vector for the mouse position
        Canvas._mouse = main_1.gp5.createVector(0, 0, 0);
        // A Vector for the canvas origin
        this._newOrigin = main_1.gp5.createVector(0, 0, 0);
        // grid
        this.grid;
        this.showGrid = false;
        // Observers
        this.observers = [];
        // Events
        Canvas.mouseEvents();
        Canvas.keyEvents();
    };
    Canvas.subscribe = function (obj) {
        if (obj instanceof vEdge_1.VEdge) {
            // get VEdge instances only
            var vEdges = this.observers.filter(function (entry) {
                var rtn = false;
                if (entry instanceof vEdge_1.VEdge) {
                    rtn = true;
                }
                return rtn;
            });
            // Get the first element if the reference is in the ist
            var edgeInList = edgeFactory_1.EdgeFactory.contains(vEdges, obj);
            // add it if not present
            if (edgeInList != undefined) {
                this.observers.push(obj);
            }
        }
        else {
            this.observers.push(obj);
        }
        Canvas.update();
    };
    Canvas.unsubscribe = function (obj) {
        this.observers = this.observers.filter(function (subscriber) {
            var rtn = true;
            // Filter edges
            if ((obj instanceof vEdge_1.VEdge && subscriber instanceof vEdge_1.VEdge) ||
                subscriber instanceof edge_1.Edge) {
                if (edgeFactory_1.EdgeFactory.compareEdges(subscriber, obj)) {
                    rtn = false;
                }
            }
            // Filter nodes
            if ((obj instanceof vNode_1.VNode && subscriber instanceof vNode_1.VNode) ||
                subscriber instanceof Node) {
                if (obj.node.idCat === subscriber.node.idCat) {
                    rtn = false;
                }
            }
            return rtn;
        });
    };
    Canvas.notifyObservers = function (data) {
        var handled = false;
        this.observers.forEach(function (observer) {
            var _a;
            if ((_a = observer.fromCanvas) === null || _a === void 0 ? void 0 : _a.call(observer, data)) {
                handled = true;
            }
        });
        return handled;
    };
    Canvas.resetObservers = function () {
        this.observers = [];
    };
    Canvas.resetVEdges = function () {
        this.observers = this.observers.filter(function (obs) {
            if (!(obs instanceof vEdge_1.VEdge)) {
                return obs;
            }
        });
    };
    Canvas.resetVConnectors = function () {
        this.observers = this.observers.filter(function (obs) {
            if (!(obs instanceof vConnector_1.VConnector)) {
                return obs;
            }
        });
    };
    Canvas.initGrid = function (org, width, height, hPartitions, vPartitions, scaleFactor) {
        this.grid = new grid_1.Grid(org, width, height, hPartitions, vPartitions, scaleFactor);
    };
    /**
     * Main render function. It switches between two renderers to speed up performance: the p5 canvas and a graphics canvas.
     * The central idea is to have a gate that is always closed except when the user performs actions on the canvas that
     * produce changes on the visual output. When the gate is closed, the render is drawn on a graphics object only once,
     * preventing the draw to keep on computing operations that do not yield a different visual output than the one currently
     * being displayed. When the gate is open, the render is drawn on the regular p5 canvas
     */
    Canvas.render = function () {
        if (this.renderGate || edgeFactory_1.EdgeFactory.isThereOpenEdge()) {
            main_1.gp5.background(this.currentBackground);
            Canvas.renderOnP5();
        }
        this.renderGate = false;
        clusterFactory_1.ClusterFactory.showSelectedArea();
    };
    /**
     * render on original p5.Renderer
     */
    Canvas.renderOnP5 = function () {
        // grid
        if (this.grid && this.showGrid) {
            this.grid.show(main_1.gp5);
        }
        // push transformations
        transformerFactory_1.TransFactory.pushVClusters();
        vGeoCluster_1.VGeoCluster.pixelTarget.background(0, 0, 0, 0);
        vGeoCluster_1.VGeoCluster.idTarget.background(0, 0, 0, 0);
        // show observers
        this.observers.forEach(function (element) {
            if (element instanceof vCluster_1.VCluster) {
                // if (element instanceof VNode) {
                //     this.transformAndShowVNodes(element, gp5);
                // } else {
                element.show(main_1.gp5);
                // }
            }
            // else {
            //     element.show(gp5);
            // }
        });
        main_1.gp5.image(vGeoCluster_1.VGeoCluster.pixelTarget, 0, 0);
        vGeoCluster_1.VGeoCluster.detectHitAsync();
        this.observers.forEach(function (element) {
            if (element instanceof vNode_1.VNode || element instanceof vEdge_1.VEdge) {
                // if (element instanceof VNode) {
                //     this.transformAndShowVNodes(element, gp5);
                // } else {
                element.show(main_1.gp5);
                // }
            }
            // else {
            //     element.show(gp5);
            // }
        });
        // pop transformations
        // TransFactory.popVClusters();
        // show EdgeFactory Buffer
        if (edgeFactory_1.EdgeFactory._vEdgeBuffer)
            edgeFactory_1.EdgeFactory._vEdgeBuffer.show(main_1.gp5);
        // Close gp5 render gate and set condition for grahics renderer
        this.graphicsRendered = false;
    };
    /**
     *This method applies the transformation in the class Transformer to nodes belonging to a specific cluster
     * @param {Object} element An element from the canvas.observers collection
     * @param {Object} renderer either gp5 or this.graphics
     * @param {Integer} clusterID the cluster id
     * NOTE: this method is deprecated. It was a work around to apply transformations on nodes but
     * Wenqi found a better solution.
     */
    // static transformAndShowVNodes(element: VNode, renderer: p5) {
    //   let transformer = TransformerFactory.get(element.node.idCat.cluster)!;
    //   let vN = element;
    //   // Applies transformation on the node
    //   transformer.pushTo([vN.pos!]);
    //   vN.show(renderer);
    //   // Applies inverse transformation on the node
    //   transformer.popTo([vN.pos!]);
    // }
    /**
     * This method MUST be invoked iteratively to get a fresh mouseCoordinate.
     * Ideally within browser window loop requestAnimationFrame()
     */
    Canvas.transform = function () {
        // **** Convert screenMouse into canvasMouse
        Canvas._mouse = main_1.gp5.createVector(main_1.gp5.mouseX, main_1.gp5.mouseY);
        // translate canvasMouse
        Canvas._mouse.sub(this._newOrigin);
        // Zoom
        Canvas._mouse.div(this._zoom);
        // Pan
        Canvas._mouse.sub(this._offset);
        // **** Transformation of canvas
        // Use scale for 2D "zoom"
        main_1.gp5.scale(this._zoom);
        // The offset
        main_1.gp5.translate(this._offset.x, this._offset.y);
    };
    /**
     * Updated canvas */
    Canvas.update = function () {
        this.renderGate = true;
        //  Canvas.render();
    };
    /**
     * Reset zoom and pan to original values
     */
    Canvas.reset = function () {
        this._zoom = 1;
        this._offset.set(0, 0, 0);
        transformerFactory_1.TransFactory.reset();
        ClusterSettings_1.ClusterSettings.reset();
        var vNodeObservers = Canvas.observers.filter(function (observer) { return observer instanceof vNode_1.VNode; });
        for (var _i = 0, vNodeObservers_1 = vNodeObservers; _i < vNodeObservers_1.length; _i++) {
            var element = vNodeObservers_1[_i];
            element.transformed = false;
        }
    };
    /**
     * Zoom_in keyboard
     * @param val
     */
    Canvas.zoomIn = function (val) {
        this._zoom += val;
    };
    /**
     * Zoom out keyboard
     * @param val
     */
    Canvas.zoomOut = function (val) {
        this._zoom -= val;
        if (this._zoom < 0.1) {
            this._zoom = 0.1;
        }
    };
    /**
     * Returns the current zoom value
     * @return current zoom value
     */
    Canvas.getZoomValue = function () {
        return this._zoom;
    };
    /**
     * Returns the current mouse coordinates in the transformed canvas
     * @return current mouse coordinates in the transformed canvas
     */
    Canvas.getCanvasMouse = function () {
        return Canvas._mouse;
    };
    Canvas.translateOrigin = function (x, y) {
        this.newOrigin = main_1.gp5.createVector(x, y);
    };
    Canvas.hideValues = function () {
        if (this.valuesEl) {
            this.valuesEl.style.opacity = "0";
        }
    };
    /**
     * Show canvas values on screen
     * @param {Vector} pos
     */
    Canvas.displayValues = function (pos, __UNUSED_ARG__) {
        // **** Legends
        if (!this.valuesEl) {
            this.valuesEl = document.createElement("div");
            var containerEl = document.querySelector("#model");
            this.valuesEl.style.color = "#C0C0C0";
            this.valuesEl.style.textAlign = "right";
            this.valuesEl.style.fontSize = "10px";
            this.valuesEl.style.lineHeight = "1";
            this.valuesEl.style.paddingTop = "15px";
            this.valuesEl.style.whiteSpace = "pre-line";
            this.valuesEl.style.position = "absolute";
            this.valuesEl.style.left = "0px";
            this.valuesEl.style.top = "0px";
            this.valuesEl.style.fontFamily = "Roboto";
            this.valuesEl.style.pointerEvents = "none";
            if (containerEl) {
                containerEl.append(this.valuesEl);
            }
        }
        this.valuesEl.style.opacity = "1";
        this.valuesEl.style.transform = "\n            translate(".concat(pos.x, "px, ").concat(pos.y, "px)\n            translateX(-100%)\n        ");
        this.valuesEl.textContent =
            "Mouse on canvas: x: " +
                Canvas._mouse.x.toFixed(1) +
                ", y: " +
                Canvas._mouse.y.toFixed(2) +
                "' z:" +
                Canvas._mouse.z.toFixed(2) +
                "\n" +
                "Zoom: " +
                this._zoom.toFixed(1) +
                "\n" +
                "Offset: " +
                this._offset +
                "\n" +
                "startOffset: " +
                this._startOffset +
                "\n" +
                "endOffset: " +
                this._endOffset +
                "\n" +
                "Frame rate: " +
                main_1.gp5.nf(main_1.gp5.frameRate(), 2, 1);
    };
    Canvas.hideLegend = function () {
        if (this.legendEl) {
            this.legendEl.style.opacity = "0";
        }
    };
    /**
     * Show GUI instructions on screen
     * @param {Vector} pos
     */
    Canvas.showLegend = function (pos, __UNUSED_ARG__) {
        if (!this.legendEl) {
            this.legendEl = document.createElement("div");
            var containerEl = document.querySelector("#model");
            this.legendEl.style.color = "#C0C0C0";
            this.legendEl.style.textAlign = "right";
            this.legendEl.style.fontSize = "10px";
            this.legendEl.style.lineHeight = "13px";
            this.legendEl.style.whiteSpace = "pre-line";
            this.legendEl.style.position = "absolute";
            this.legendEl.style.left = "0px";
            this.legendEl.style.top = "0px";
            this.legendEl.style.fontFamily = "Roboto";
            this.legendEl.style.pointerEvents = "none";
            if (containerEl) {
                containerEl.append(this.legendEl);
            }
        }
        this.legendEl.style.opacity = "1";
        this.legendEl.style.transform = "\n            translate(".concat(pos.x, "px, ").concat(pos.y, "px)\n            translateX(-100%)\n        ");
        this.legendEl.textContent =
            "ZOOM & PAN\n" +
                "Hold SHIFT and right mouse button to pan\n" +
                "use 'SHIFT + ' to zoom in the canvas, 'SHIFT -' to zoom  out the canvas\n" +
                "use 'SHIFT + mouse wheel' to zoom in and out clusters\n" +
                "Press 'SHIFT + r' to restore zoom and pan to default values\n" +
                " \n" +
                "PROPAGATION\n" +
                "Press 'p' to enable propagation selection on node click\n" +
                " \n" +
                "DELETING\n" +
                "Press 'SHIFT + e' to delete the last edge\n" +
                "Press 'd' and click on an node to delete it\n";
    };
    Canvas.originCrossHair = function () {
        main_1.gp5.stroke(255, 100);
        main_1.gp5.strokeWeight(0.5);
        main_1.gp5.line(main_1.gp5.width / 2, -main_1.gp5.height, main_1.gp5.width / 2, main_1.gp5.height);
        main_1.gp5.line(-main_1.gp5.width, main_1.gp5.height / 2, main_1.gp5.width, main_1.gp5.height / 2);
    };
    Canvas.showOnPointer = function () {
        if (edgeFactory_1.EdgeFactory.isThereOpenEdge()) {
            main_1.gp5.fill(90, 200);
            main_1.gp5.textAlign(main_1.gp5.LEFT);
            main_1.gp5.textSize(10);
            main_1.gp5.text("open edge", Canvas._mouse.x, Canvas._mouse.y - 10);
        }
    };
    // *** Events registration
    Canvas.mouseEvents = function () {
        var htmlCanvas = document.getElementById("model");
        htmlCanvas.addEventListener("mousedown", Canvas.mPressed.bind(this));
        htmlCanvas.addEventListener("mouseup", Canvas.mReleased.bind(this));
        htmlCanvas.addEventListener("mousemove", Canvas.mDragged.bind(this));
        htmlCanvas.addEventListener("click", Canvas.mClicked.bind(this));
        htmlCanvas.addEventListener("wheel", Canvas.mWheel.bind(this));
    };
    Canvas.keyEvents = function () {
        document.addEventListener("keydown", Canvas.kPressed.bind(this));
        document.addEventListener("keyup", Canvas.kReleased.bind(this));
    };
    // *** Event related methods
    /** Mouse left button pressed */
    Canvas.mPressed = function (evt) {
        this._startOffset.set(main_1.gp5.mouseX, main_1.gp5.mouseY, 0);
        Canvas.mouseDown = true;
        this.renderGate = true;
        if (Canvas.shiftDown) {
            main_1.gp5.cursor("grab");
        }
        if (!Canvas.notifyObservers({
            event: evt,
            type: "mousedown",
            pos: Canvas._mouse,
        })) {
            clusterFactory_1.ClusterFactory.selectionStart = Canvas._mouse;
        }
    };
    /** Mouse left button released */
    Canvas.mReleased = function (evt) {
        Canvas.mouseDown = false;
        this.renderGate = false;
        main_1.gp5.cursor(main_1.gp5.ARROW);
        if (!Canvas.notifyObservers({
            event: evt,
            type: "mouseup",
            pos: Canvas._mouse,
        })) {
            clusterFactory_1.ClusterFactory.createSelection();
        }
    };
    /** Mouse dragged */
    Canvas.mDragged = function (evt) {
        if (Canvas.mouseDown) {
            this.renderGate = true;
            // if mouse move & down & key shift
            if (Canvas.shiftDown) {
                // set end for current drag iteration
                this._endOffset.set(main_1.gp5.mouseX, main_1.gp5.mouseY, 0);
                // set the difference
                this._offset.add(p5_1.default.Vector.sub(this._endOffset, this._startOffset));
                // reset start for next drag iteration
                this._startOffset.set(main_1.gp5.mouseX, main_1.gp5.mouseY, 0);
                this._canvasBeingTransformed = true;
            }
            else {
                this._canvasBeingTransformed = false;
            }
            // if mouse move & down
            if (!Canvas.notifyObservers({
                event: evt,
                type: "mousedrag",
                pos: Canvas._mouse,
            })) {
                clusterFactory_1.ClusterFactory.selectionEnd = Canvas._mouse;
            }
        }
        else {
            // if mouse move
            if (!Canvas.notifyObservers({
                event: evt,
                type: "mousemove",
                pos: Canvas._mouse,
            })) {
                clusterFactory_1.ClusterFactory.selectionEnd = Canvas._mouse;
            }
        }
    };
    /** Mouse clicked */
    Canvas.mClicked = function (evt) {
        Canvas.notifyObservers({
            event: evt,
            type: "mouseclick",
            pos: Canvas._mouse,
        });
        this.renderGate = true;
    };
    /** Mouse wheel */
    Canvas.mWheel = function (evt) {
        Canvas.notifyObservers({
            event: evt,
            type: "mousewheel",
            pos: Canvas._mouse,
        });
        // Amount to scale.
        var amnt = evt.deltaY < 0 ? 1.02 : 0.98;
        // Zoom by amount about point.
        //  TransFactory.zoom(amnt);
        transformerFactory_1.TransFactory.crissCross(amnt);
        // TODO: consolidate the logic here
        vGeoCluster_1.VGeoCluster.applyZoom(evt.deltaY < 0 ? 1 : -1);
        this.renderGate = true;
    };
    Canvas.kPressed = function (k) {
        // open the gate to refresh graphics
        this.renderGate = true;
        // evaluate
        if (k.key == "Shift") {
            Canvas.shiftDown = true;
            if (Canvas.mouseDown) {
                main_1.gp5.cursor("grab");
            }
        }
        // Control of zoom with keyboard
        if (k.shiftKey && k.key == "+") {
            this.zoomIn(0.1);
        }
        else if (k.shiftKey && (k.key == "_" || k.key == "-")) {
            this.zoomOut(0.1);
            // Restore initial values
        }
        else if (k.shiftKey && (k.key == "r" || k.key == "R")) {
            this.reset();
        }
        else if (k.shiftKey && (k.key == "e" || k.key == "E")) {
            // delete last edge
            edgeFactory_1.EdgeFactory.deleteLastVEdge();
        }
        Canvas.notifyObservers({ event: k, type: "keydown" });
    };
    Canvas.kReleased = function (k) {
        // open the gate to refresh graphics
        this.renderGate = true;
        if (k.key == "Shift") {
            Canvas.shiftDown = false;
            if (Canvas.mouseDown) {
                main_1.gp5.cursor(main_1.gp5.ARROW);
            }
        }
        // Escape key
        if (k.key == "Escape") {
            Canvas.unsubscribe(edgeFactory_1.EdgeFactory._vEdgeBuffer);
            edgeFactory_1.EdgeFactory.recallBuffer();
            edgeFactory_1.EdgeFactory.clearBuffer();
        }
        Canvas.notifyObservers({ event: k, type: "keyup" });
    };
    Canvas.shiftDown = false;
    Canvas.mouseDown = false;
    return Canvas;
}());
exports.Canvas = Canvas;
