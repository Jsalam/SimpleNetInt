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
        this.currentBackground = 50;

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
        this.showGrid = false;

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
            if (obj instanceof VEdge && subscriber instanceof VEdge || subscriber instanceof Edge) {
                if (EdgeFactory.compareEdges(subscriber, obj)) {
                    rtn = false;
                }
            }
            // Filter nodes
            if (obj instanceof VNode && subscriber instanceof VNode || subscriber instanceof Node) {
                if (obj.node.idCat === subscriber.node.idCat) {
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
     * produce changes on the visual output. When the gate is closed, the render is drawn on a graphics object only once, 
     * preventing the draw to keep on computing operations that do not yield a different visual output than the one currently
     * being displayed. When the gate is open, the render is drawn on the regular p5 canvas
     */
    static render() {
        gp5.background(this.currentBackground);
        if (this.renderGate || EdgeFactory.isThereOpenEdge()) {
            Canvas.renderOnP5();
        } else {
            //  this.graphicsRendered = false;
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

        // push transformations
        TransFactory.pushVClusters();

        // show observers
        this.observers.forEach(element => {
            if (element instanceof VCluster || element instanceof VNode || element instanceof VEdge) {

                // if (element instanceof VNode) {
                //     this.transformAndShowVNodes(element, gp5);
                // } else {
                element.show(gp5);
                // }

            }
            // else {
            //     element.show(gp5);
            // }
        });

        // pop transformations
        TransFactory.popVClusters();

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

            // push transformations
            TransFactory.pushVClusters();

            // show observers
            this.observers.forEach(element => {
                if (element instanceof VCluster || element instanceof VNode || element instanceof VEdge) {

                    // if (element instanceof VNode) {
                    //     this.transformAndShowVNodes(element, this.graphics);
                    // } else {
                    element.show(this.graphics);
                    //}

                }
            });

            // pop transformations
            TransFactory.popVClusters();

            // show EdgeFactory Buffer. This is used to visualize the temporary edge while the user picks the target
            if (EdgeFactory._vEdgeBuffer) EdgeFactory._vEdgeBuffer.show(this.graphics);

            // canvas edge
            // this.graphics.stroke('#C0C0C0');
            // this.graphics.noFill();
            // this.graphics.rect(0, 0, this.graphics.width, this.graphics.height);

            // grid
            if (this.grid && this.showGrid) {
                this.grid.show(this.graphics);
            }

            // Open gp5 renderer gate
            this.graphicsRendered = true;
        }
    }

    /**
     *This method applies the transformation in the class Transformer to nodes belonging to a specific cluster
     * @param {Object} element An element from the canvas.observers collection
     * @param {Object} renderer either gp5 or this.graphics
     * @param {Integer} clusterID the cluster id
     */
    static transformAndShowVNodes(element, renderer) {

        let transformer = TransformerFactory.get(element.node.idCat.cluster);

        let vN = element;

        // Applies transformation on the node
        transformer.pushTo([vN.pos]);

        vN.show(renderer);

        // Applies inverse transformation on the node
        transformer.popTo([vN.pos]);
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
        TransFactory.reset();
        for (let i = 0; i < Canvas.observers; i++) {
            let element = Canvas.observers[i];
            if (element instanceof VNode) {
                element.transformed = false;
            }
        }
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
        renderer.textSize(10);
        renderer.text("Mouse on canvas: x: " + Canvas._mouse.x.toFixed(1) + ", y: " + Canvas._mouse.y.toFixed(2) + "' z:" + Canvas._mouse.z.toFixed(2), pos.x, pos.y + 25);
        renderer.text("Zoom: " + this._zoom.toFixed(1), pos.x, pos.y + 35);
        renderer.text("Offset: " + this._offset, pos.x, pos.y + 45);
        renderer.text("startOffset: " + this._startOffset, pos.x, pos.y + 55);
        renderer.text("endOffset: " + this._endOffset, pos.x, pos.y + 65);
        renderer.text("Frame rate: " + gp5.nf(gp5.frameRate(), 2, 1), pos.x, pos.y + 75)
        renderer.textAlign(gp5.CENTER);
    }

    /**
     * Show GUI instructions on screen
     * @param {Vector} pos 
     */
    static showLegend(pos) {
        gp5.fill('#C0C0C0');
        gp5.textAlign(gp5.RIGHT);
        let copy = [
            "ZOOM & PAN",
            "Hold SHIFT and right mouse button to pan",
            "use 'SHIFT + ' to zoom in the canvas, 'SHIFT -' to zoom  out the canvas",
            "use 'SHIFT + mouse wheel' to zoom in and out clusters",
            "Press 'SHIFT + r' to restore zoom and pan to default values",
            " ",
            "PROPAGATION",
            "Press 'p' to enable propagation selection on node click",
            " ",
            "DELETING",
            "Press 'SHIFT + e' to delete the last edge",
            "Press 'd' and click on an node to delete it"
        ]
        for (let i = 0; i < copy.length; i++) {
            const sentence = copy[i];
            gp5.text(sentence, pos.x, pos.y + i * 13);
        }

        // gp5.text("Hold SHIFT and right mouse button to pan", pos.x, pos.y);
        // gp5.text("use 'SHIFT + ' to zoom in the canvas, 'SHIFT -' to zoom  out the canvas", pos.x, pos.y + 13);
        // gp5.text("use 'SHIFT + mouse wheel' to zoom in and out clusters", pos.x, pos.y + 26);
        // gp5.text("Press 'SHIFT + r' to restore zoom and pan to default values", pos.x, pos.y + 39);
        // gp5.text("Press 'p' to enable propagation selection on node click", pos.x, pos.y + 52);
        // gp5.text("Press 'SHIFT + e' to delete the last edge", pos.x, pos.y + 65);
        // gp5.text("Press 'd' and click on an node to delete it", pos.x, pos.y + 78);
        gp5.textAlign(gp5.CENTER);
    }

    static originCrossHair() {
        gp5.stroke(255, 100);
        gp5.strokeWeight(0.5);
        gp5.line(gp5.width / 2, -gp5.height, gp5.width / 2, gp5.height);
        gp5.line(-gp5.width, gp5.height / 2, gp5.width, gp5.height / 2);
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
        htmlCanvas.addEventListener('mousedown', Canvas.mPressed.bind(this));
        htmlCanvas.addEventListener('mouseup', Canvas.mReleased.bind(this));
        htmlCanvas.addEventListener('mousemove', Canvas.mDragged.bind(this));
        htmlCanvas.addEventListener('click', Canvas.mClicked.bind(this));
        htmlCanvas.addEventListener('wheel', Canvas.mWheel.bind(this));
    }

    static keyEvents() {
        document.addEventListener('keydown', Canvas.kPressed.bind(this));
        document.addEventListener('keyup', Canvas.kReleased.bind(this));
    }

    // *** Event related methods

    /** Mouse left button pressed */
    static mPressed(evt) {
        this._startOffset.set(gp5.mouseX, gp5.mouseY, 0);
        Canvas.mouseDown = true;
        this.renderGate = true;

        if (Canvas.shiftDown) {
            gp5.cursor('grab')
        }
        Canvas.notifyObservers({ event: evt, type: "mousedown", pos: Canvas._mouse });
    }

    /** Mouse left button released */
    static mReleased(evt) {
        Canvas.mouseDown = false;
        this.renderGate = false;
        gp5.cursor(gp5.ARROW)
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

    /** Mouse wheel */
    static mWheel(evt) {

        Canvas.notifyObservers({ event: evt, type: "mousewheel", pos: Canvas._mouse });

        // Amount to scale.
        const amnt = evt.deltaY < 0 ? 1.02 : .98;

        // Zoom by amount about point.
        //  TransFactory.zoom(amnt);
        TransFactory.crissCross(amnt);

        this.renderGate = true;

    }

    static kPressed(k) {
        // open the gate to refresh graphics
        this.renderGate = true;
        // evaluate 
        if (k.key == "Shift") {
            Canvas.shiftDown = true;

            if (Canvas.mouseDown) {
                gp5.cursor('grab')
            }
        }
        // Control of zoom with keyboard
        if (k.shiftKey && (k.key == '+')) {
            this.zoomIn(0.1);
        } else if (k.shiftKey && (k.key == '_' || k.key == '-')) {
            this.zoomOut(0.1);
            // Restore initial values
        } else if (k.shiftKey && (k.key == 'r' || k.key == 'R')) {
            this.reset();
        } else if (k.shiftKey && (k.key == 'e' || k.key == 'E')) {
            // delete last edge
            EdgeFactory.deleteLastVEdge();
        }

        Canvas.notifyObservers({ event: k, type: "keydown" });
    }

    static kReleased(k) {
        // open the gate to refresh graphics
        this.renderGate = true;
        if (k.key == "Shift") {
            Canvas.shiftDown = false;
            if (Canvas.mouseDown) {
                gp5.cursor(gp5.ARROW)
            }

        }

        // Escape key
        if (k.key == 'Escape') {
            Canvas.unsubscribe(EdgeFactory._vEdgeBuffer);
            EdgeFactory.recallBuffer();
            EdgeFactory.clearBuffer();
        }

        Canvas.notifyObservers({ event: k, type: "keyup" });
    }
}
Canvas.shiftDown = false;
Canvas.mouseDown = false;