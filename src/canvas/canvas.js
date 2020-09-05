/**
 * Adaptation of NetInt Canvas class
 * 
 *gp5 is a global instance of p5 object 
 */
class Canvas {

    constructor(graphics) {
        // graphics
        this.graphics = graphics;
        this.graphicsRendered = false;
        this.renderGate = true;
        this.currentBackground = 230;
        // The scale of our world
        this._zoom = 1;
        // A vector to store the offset
        this._offset = gp5.createVector(0, 0, 0);
        // A vector to store the start offset
        this._startOffset = gp5.createVector(0, 0, 0);
        // The previous offset
        this._endOffset = gp5.createVector(0, 0, 0);
        // A vector for the mouse position
        Canvas._canvasMouse = gp5.createVector(0, 0, 0);
        // A Vector for the canvas origin
        this._newOrigin = gp5.createVector(0, 0, 0);
        // Transformation control
        this._shiftDown;
        // Events
        this.mouseEvents();
        this.keyEvents();
    }

    /**
     * Main render function. It switches between two renderers to speed up performance: the p5 canvas and a graphics canvas.
     * The central idea is to have a gate that is always closed except when the user performs actions on the canvas that
     * produce changes on the visual output. When the gate is closed, the render is done on a graphics object only once, 
     * preventing the draw to keep on computing operations that do not yield a different visual output than the one currently
     * being displayed. When the gate is open, the render is done on the regular p5 canvas
     */
    render() {
        gp5.background(this.currentBackground);
        if (this.renderGate) {
            this.renderOnP5();
        } else {
            //this.graphicsRendered = false;
            this.renderOnGraphics();
            gp5.image(this.graphics, -this.graphics.width / 2, -this.graphics.height / 2);
        }
        this.renderGate = false;
    }

    /**
     * render on original p5.Renderer
     */
    renderOnP5() {
        // draw description box
        gp5.fill(250, 150);
        gp5.noStroke();
        gp5.rect(0, gp5.height - 90, gp5.width, 90)

        // draw hem
        gp5.fill(150);
        gp5.noStroke();
        gp5.rect(0, gp5.height - 15, gp5.width, 15)
        gp5.fill(210);
        // show clusters
        ClusterFactory.vClusters.forEach(element => { element.show(gp5) });

        // show edges
        EdgeFactory.vEdges.forEach(element => { element.show(gp5) });
        gp5.ellipse(0, 0, 10);
        this.graphicsRendered = false;
    }

    /**
     *  render on custom p5.Renderer
     */
    renderOnGraphics() {

        if (!this.graphicsRendered) {
            this.graphics.background(this.currentBackground);

            // draw description box
            this.graphics.fill(250, 150);
            this.graphics.noStroke();
            this.graphics.rect(0, gp5.height - 90, gp5.width, 90)

            // draw hem
            this.graphics.fill(150);
            this.graphics.noStroke();
            this.graphics.rect(0, gp5.height - 15, gp5.width, 15)
            this.graphics.fill(200);

            // show clusters
            ClusterFactory.vClusters.forEach(element => { element.show(this.graphics) });

            // show edges
            EdgeFactory.vEdges.forEach(element => { element.show(this.graphics) });
            this.graphics.ellipse(0, 0, 10);
            this.graphicsRendered = true;
        }
    }

    /**
     * This method MUST be invoked iteratively to get a fresh mouseCoordinate.
     * Ideally within browser window loop requestAnimationFrame()
     */
    transform() {
        // **** Convert screenMouse into canvasMouse
        Canvas._canvasMouse = gp5.createVector(gp5.mouseX, gp5.mouseY);
        // translate canvasMouse
        Canvas._canvasMouse.sub(this._newOrigin);
        // Zoom
        Canvas._canvasMouse.div(this._zoom);
        // Pan
        Canvas._canvasMouse.sub(this._offset);
        // **** Transformation of canvas
        // Use scale for 2D "zoom"
        gp5.scale(this._zoom);
        // The offset
        gp5.translate(this._offset.x, this._offset.y);
    }

    /**
     * Updated canvas */
    update() {
        this.renderGate = true;
        this.render();
    }

    /**
     * Reset zoom and pan to original values
     */
    reset() {
        this._zoom = 1;
        this._offset.set(0, 0, 0);
    }

    /**
     * Zoom_in keyboard
     * @param val
     */
    zoomIn(val) {
        this._zoom += val;
    }

    /**
     * Zoom out keyboard
     * @param val
     */
    zoomOut(val) {
        this._zoom -= val;
        if (this._zoom < 0.1) {
            this._zoom = 0.1;
        }
    }

    /**
     * Returns the current zoom value
     * @return current zoom value
     */
    getZoomValue() {
        return this._zoom;
    }

    /**
     * Returns the current mouse coordinates in the transformed canvas
     * @return current mouse coordinates in the transformed canvas
     */
    getCanvasMouse() {
        return Canvas._canvasMouse;
    }

    translateOrigin(x, y) {
        this.newOrigin = gp5.createVector(x, y);
    }

    /**
     * Show canvas values on screen
     * @param {Vector} pos 
     */
    displayValues(pos, renderer) {
        // **** Legends
        renderer.fill(90, 200);
        renderer.textAlign(gp5.RIGHT);
        renderer.text("Mouse on canvas: x: " + Canvas._canvasMouse.x.toFixed(1) + ", y: " + Canvas._canvasMouse.y.toFixed(2) + "' z:" + Canvas._canvasMouse.z.toFixed(2), pos.x, pos.y + 25);
        renderer.text("Zoom: " + this._zoom.toFixed(1), pos.x, pos.y + 35);
        renderer.text("Offset: " + this._offset, pos.x, pos.y + 45);
        renderer.text("startOffset: " + this._startOffset, pos.x, pos.y + 55);
        renderer.text("endOffset: " + this._endOffset, pos.x, pos.y + 65);
        renderer.textAlign(gp5.CENTER);
    }

    /**
     * Show GUI instructions on screen
     * @param {Vector} pos 
     */
    showLegend(pos) {
        gp5.fill(90, 200);
        gp5.textAlign(gp5.RIGHT);
        gp5.text("Hold SHIFT and right mouse button to pan", pos.x, pos.y);
        gp5.text("use 'i' to zoom in, 'o' to zoom  out", pos.x, pos.y + 10);
        gp5.text("Press r to restore zoom and pan to default values", pos.x, pos.y + 20);
        gp5.textAlign(gp5.CENTER);
    }

    originCrossHair() {
        gp5.stroke(255);
        gp5.strokeWeight(0.5);
        gp5.line(0, -gp5.height, 0, gp5.height);
        gp5.line(-gp5.width, 0, gp5.width, 0);
    }

    // *** Events registration 

    mouseEvents() {
        document.addEventListener('mousedown', this.mPressed.bind(this))
        document.addEventListener('mouseup', this.mReleased.bind(this))
        document.addEventListener('mousemove', this.mDragged.bind(this))
    }

    keyEvents() {
        document.addEventListener('keydown', this.kPressed.bind(this))
        document.addEventListener('keyup', this.kReleased.bind(this))
    }

    // *** Event related methods

    /** Mouse left button pressed */
    mPressed(evt) {
        this._startOffset.set(gp5.mouseX, gp5.mouseY, 0);
        Canvas.mouseDown = true;
        this.renderGate = true;
        console.log("pressed");
    }

    /** Mouse left button released */
    mReleased(evt) {
        Canvas.mouseDown = false;
        this.renderGate = false
    }

    /** Mouse dragged */
    mDragged(event) {
        if (Canvas.mouseDown) {
            this.renderGate = true
            if (Canvas.shiftDown) {
                // set end for current drag iteration
                this._endOffset.set(gp5.mouseX, gp5.mouseY, 0);
                // set the difference
                this._offset.add(p5.Vector.sub(this._endOffset, this._startOffset));
                // reset start for next drag iteration
                this._startOffset.set(gp5.mouseX, gp5.mouseY, 0);
                this._canvasBeingTransformed = true;
            } else {
                this._canvasBeingTransformed = false;
            }
        }
    }

    kPressed(k) {
        // open the gate to refresh graphics
        this.renderGate = true;
        // evaluate 
        if (k.key == "Shift") {
            Canvas.shiftDown = true;
        }
        // Control of zoom with keyboard
        if (k.key == 'i' || k.key == 'I') {
            this.zoomIn(0.1);
        } else if (k.key == 'o' || k.key == 'O') {
            this.zoomOut(0.1);
        } else if (k.key == 'r' || k.key == 'R') {
            this.reset();
        }
    }

    kReleased(k) {
        // open the gate to refresh graphics
        this.renderGate = true;
        if (k.key == "Shift") {
            Canvas.shiftDown = false;
            this._adaptiveDegreeThresholdPercentage = 100;
        }
    }

}
Canvas.shiftDown = false;
Canvas.mouseDown = false;