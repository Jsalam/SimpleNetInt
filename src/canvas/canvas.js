/**
 * Adaptation of NetInt Canvas class
 * 
 *gp5 is a global instance of p5 object 
 */
class Canvas {

    static makeCanvas(graphics) {
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
        Canvas._mouse = gp5.createVector(0, 0, 0);
        // A Vector for the canvas origin
        this._newOrigin = gp5.createVector(0, 0, 0);
        // grid
        this.grid;
        this.showGrid = true;
        // Transformation control
        //this._shiftDown;
        // Observers
        this.observers = [];
        // Events
        Canvas.mouseEvents();
        Canvas.keyEvents();
    }

    static subscribe(obj) {
        if (obj instanceof VEdge) {
            // get VEdge instances only

            let vEdges = this.observers.filter(function(entry) {
                let rtn = false;
                if (entry instanceof VEdge) {
                    rtn = true;
                }
                return rtn;
            });

            // Get the first element if the reference is in the ist
            let edgeInList = EdgeFactory.contains(vEdges, obj);

            // add it if not present
            if (edgeInList != undefined) {
                this.observers.push(obj);
            }
        } else {
            this.observers.push(obj);
        }
        Canvas.update();
    }

    static unsubscribe(obj) {
        this.observers = this.observers.filter(function(subscriber) {
            let rtn = true;
            // Filter edges
            if (subscriber instanceof VEdge || subscriber instanceof Edge) {
                if (EdgeFactory.compareEdges(subscriber, obj)) {
                    rtn = false;
                }
            }
            return rtn;
        });
    }
    static notifyObservers(data) {
        this.observers.forEach(observer => observer.fromCanvas(data))
    }
    static resetObservers() {
        this.observers = [];
    }

    static resetVEdges() {
        this.observers = this.observers.filter(function(obs) {
            if (!(obs instanceof VEdge)) {
                return obs;
            }
        });
    }

    static resetVConnectors() {
        this.observers = this.observers.filter(function(obs) {
            if (!(obs instanceof VConnector)) {
                return obs;
            }
        });
    }

    static initGrid(org, width, height, hPartitions, vPartitions, scaleFactor) {
        this.grid = new Grid(org, width, height, hPartitions, vPartitions, scaleFactor);
    }

    /**
     * Main render function. It switches between two renderers to speed up performance: the p5 canvas and a graphics canvas.
     * The central idea is to have a gate that is always closed except when the user performs actions on the canvas that
     * produce changes on the visual output. When the gate is closed, the render is done on a graphics object only once, 
     * preventing the draw to keep on computing operations that do not yield a different visual output than the one currently
     * being displayed. When the gate is open, the render is done on the regular p5 canvas
     */
    static render() {
        gp5.background(this.currentBackground);
        if (this.renderGate || EdgeFactory.isThereOpenEdge()) {
            Canvas.renderOnP5();
        } else {
            //this.graphicsRendered = false;
            Canvas.renderOnGraphics();
            gp5.image(this.graphics, 0, 0);
        }
        this.renderGate = false;
    }

    /**
     * render on original p5.Renderer
     */
    static renderOnP5() {
        // grid
        if (this.grid && this.showGrid) {
            this.grid.show(gp5);
        }

        // show observers
        this.observers.forEach(element => {
            if (element instanceof VCluster || element instanceof VNode || element instanceof VEdge) {
                element.show(gp5)
            }
        });

        // show EdgeFactory Buffer
        if (EdgeFactory._vEdgeBuffer) EdgeFactory._vEdgeBuffer.show(gp5);

        // Close gp5 render gate and set condition for grahics renderer
        this.graphicsRendered = false;
    }

    /**
     *  render on custom p5.Renderer
     */
    static renderOnGraphics() {

        if (!this.graphicsRendered) {
            this.graphics.background(this.currentBackground);

            // grid
            if (this.grid && this.showGrid) {
                this.grid.show(this.graphics);
            }

            // show observers
            this.observers.forEach(element => {
                if (element instanceof VCluster || element instanceof VNode || element instanceof VEdge) {
                    element.show(this.graphics)
                }
            });

            // show EdgeFactory Buffer
            if (EdgeFactory._vEdgeBuffer) EdgeFactory._vEdgeBuffer.show(this.graphics);

            // canvas edge
            this.graphics.stroke('#C0C0C0');
            this.graphics.noFill();
            this.graphics.rect(0, 0, this.graphics.width, this.graphics.height);

            // Open gp5 renderer gate
            this.graphicsRendered = true;
        }
    }

    /**
     * This method MUST be invoked iteratively to get a fresh mouseCoordinate.
     * Ideally within browser window loop requestAnimationFrame()
     */
    static transform() {
        // **** Convert screenMouse into canvasMouse
        Canvas._mouse = gp5.createVector(gp5.mouseX, gp5.mouseY);
        // translate canvasMouse
        Canvas._mouse.sub(this._newOrigin);
        // Zoom
        Canvas._mouse.div(this._zoom);
        // Pan
        Canvas._mouse.sub(this._offset);
        // **** Transformation of canvas
        // Use scale for 2D "zoom"
        gp5.scale(this._zoom);
        // The offset
        gp5.translate(this._offset.x, this._offset.y);
    }

    /**
     * Updated canvas */
    static update() {
        this.renderGate = true;
        // Canvas.render();
    }

    /**
     * Reset zoom and pan to original values
     */
    static reset() {
        this._zoom = 1;
        this._offset.set(0, 0, 0);
    }

    /**
     * Zoom_in keyboard
     * @param val
     */
    static zoomIn(val) {
        this._zoom += val;
    }

    /**
     * Zoom out keyboard
     * @param val
     */
    static zoomOut(val) {
        this._zoom -= val;
        if (this._zoom < 0.1) {
            this._zoom = 0.1;
        }
    }

    /**
     * Returns the current zoom value
     * @return current zoom value
     */
    static getZoomValue() {
        return this._zoom;
    }

    /**
     * Returns the current mouse coordinates in the transformed canvas
     * @return current mouse coordinates in the transformed canvas
     */
    static getCanvasMouse() {
        return Canvas._mouse;
    }

    static translateOrigin(x, y) {
        this.newOrigin = gp5.createVector(x, y);
    }

    /**
     * Show canvas values on screen
     * @param {Vector} pos 
     */
    static displayValues(pos, renderer) {
        // **** Legends
        renderer.fill('#C0C0C0');
        renderer.textAlign(gp5.RIGHT);
        renderer.text("Mouse on canvas: x: " + Canvas._mouse.x.toFixed(1) + ", y: " + Canvas._mouse.y.toFixed(2) + "' z:" + Canvas._mouse.z.toFixed(2), pos.x, pos.y + 25);
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
    static showLegend(pos) {
        gp5.fill('#C0C0C0');
        gp5.textAlign(gp5.RIGHT);
        gp5.text("Hold SHIFT and right mouse button to pan", pos.x, pos.y);
        gp5.text("use 'SHIFT + ' to zoom in, 'SHIFT -' to zoom  out", pos.x, pos.y + 10);
        gp5.text("Press 'SHIFT + r' to restore zoom and pan to default values", pos.x, pos.y + 20);
        gp5.text("Press 'p' to enable propagation selection on node click", pos.x, pos.y + 30);
        gp5.textAlign(gp5.CENTER);
    }

    static originCrossHair() {
        gp5.stroke(255);
        gp5.strokeWeight(0.5);
        gp5.line(0, -gp5.height, 0, gp5.height);
        gp5.line(-gp5.width, 0, gp5.width, 0);
    }

    static showOnPointer() {
        if (EdgeFactory.isThereOpenEdge()) {
            gp5.fill(90, 200);
            gp5.textAlign(gp5.LEFT);
            gp5.textSize(10);
            gp5.text("open edge", Canvas._mouse.x, Canvas._mouse.y - 10);
        }
    }

    // *** Events registration 
    static mouseEvents() {
        let htmlCanvas = document.getElementById('model');
        htmlCanvas.addEventListener('mousedown', Canvas.mPressed.bind(this))
        htmlCanvas.addEventListener('mouseup', Canvas.mReleased.bind(this))
        htmlCanvas.addEventListener('mousemove', Canvas.mDragged.bind(this))
        htmlCanvas.addEventListener('click', Canvas.mClicked.bind(this))
    }

    static keyEvents() {
        document.addEventListener('keydown', Canvas.kPressed.bind(this))
        document.addEventListener('keyup', Canvas.kReleased.bind(this))
    }

    // *** Event related methods

    /** Mouse left button pressed */
    static mPressed(evt) {
        this._startOffset.set(gp5.mouseX, gp5.mouseY, 0);
        Canvas.mouseDown = true;
        this.renderGate = true;
        Canvas.notifyObservers({ event: evt, type: "mousedown", pos: Canvas._mouse });
    }

    /** Mouse left button released */
    static mReleased(evt) {
        Canvas.mouseDown = false;
        this.renderGate = false
        Canvas.notifyObservers({ event: evt, type: "mouseup", pos: Canvas._mouse });
    }

    /** Mouse dragged */
    static mDragged(evt) {

        if (Canvas.mouseDown) {
            this.renderGate = true;
            // if mouse move & down & key shift
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
            // if mouse move & down
            Canvas.notifyObservers({ event: evt, type: "mousedrag", pos: Canvas._mouse });
        } else {
            // if mouse move
            Canvas.notifyObservers({ event: evt, type: "mousemove", pos: Canvas._mouse });
        }
    }

    /** Mouse clicked */
    static mClicked(evt) {
        Canvas.notifyObservers({ event: evt, type: "mouseclick", pos: Canvas._mouse });
        this.renderGate = true;
    }

    static kPressed(k) {
        // open the gate to refresh graphics
        this.renderGate = true;
        // evaluate 
        if (k.key == "Shift") {
            Canvas.shiftDown = true;
        }
        // Control of zoom with keyboard
        if (k.shiftKey && (k.key == '+')) {
            this.zoomIn(0.1);
        } else if (k.shiftKey && (k.key == '_' || k.key == '-')) {
            this.zoomOut(0.1);
            // Restore initial values
        } else if (k.shiftKey && (k.key == 'r' || k.key == 'R')) {
            this.reset();
        }

        Canvas.notifyObservers({ event: k, type: "keydown" });
    }

    static kReleased(k) {
        // open the gate to refresh graphics
        this.renderGate = true;
        if (k.key == "Shift") {
            Canvas.shiftDown = false;
        }

        // Escape key
        if (k.key == 'Escape') {
            Canvas.unsubscribe(EdgeFactory._vEdgeBuffer);
            EdgeFactory.recallBuffer();
            EdgeFactory.clearBuffer();
        }

        // Delete last edge Shift + 'e' || 'E'
        if (k.key == "Shift" && (k.key == 'e' || k.key == 'E')) {
            EdgeFactory.deleteLastEdge();
        }
        Canvas.notifyObservers({ event: k, type: "keyup" });
    }
}
Canvas.shiftDown = false;
Canvas.mouseDown = false;