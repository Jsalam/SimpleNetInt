class VNode extends Button {
    constructor(node, width, height) {
        super(0, 0, width, height);
        this.node = node;
        this.color = '#adadad';
        this.paddingTop = 3;
        this.vConnectors = [];
        this.vConnectorsGap = 13;
        this.node.subscribe(this);
        // events
        this.keyP_Down = false;
    }

    // Observing to Canvas
    fromCanvas(data) {

        if (data.event instanceof MouseEvent) {
            if (data.type == "mouseclick") {
                this.mouseClickedEvents();
            }
            if (data.type == "mouseup") {

            }
            if (data.type == "mousedown") {

            }
            if (data.type == "mousedrag") {
                this.mouseDraggedEvents();
            }
            if (data.type == "mousemove") {
                this.mouseOver();
            }
            // do something
        } else if (data.event instanceof KeyboardEvent) {
            if (data.type == "keydown") {
                if (data.event.key == 'p' || data.event.key == 'P') {
                    this.keyP_Down = true;
                }
            }
            if (data.type == "keyup") {
                if (data.event.key == 'p' || data.event.key == 'P') {
                    this.keyP_Down = false;
                }
            }
        } else {
            // do something
        }
    }

    // Observer node
    fromNode(data) {
        if (data instanceof Connector) {
            this.addVConnector(data);
        }
    }

    addVConnector(connector) {
        let tmpVConnector = new VConnector(connector);
        tmpVConnector.setColor(this.color);
        this.vConnectors.push(tmpVConnector);
        Canvas.subscribe(tmpVConnector);
        this.updateConnectorsCoords();
    }

    resetVConnectors() {
        this.vConnectors = [];
    }

    popLastVConnector() {
        Canvas.unsubscribe(this.vConnectors[this.vConnectors.length - 1]);
        this.vConnectors.shift();
        this.updateConnectorsCoords();
    }

    setColor(color) {
        this.color = color;
        this.setColorConnectors(this.color);
    }

    setColorConnectors(color) {
        this.vConnectors.forEach(connector => {
            connector.setColor(color);
        });
    }

    updateCoords(pos, sequence) {
        this.setPos(gp5.createVector(pos.x, pos.y + (sequence * this.height) + (sequence * this.paddingTop)));
        this.updateConnectorsCoords();
    }

    updateConnectorsCoords() {
        let counter = 0;
        //let positives = this.getConnectors(true);
        this.vConnectors.forEach(vConnector => {
            vConnector.updateCoords(this.pos, 0, counter, this.vConnectorsGap);
            counter++;
        });
    }

    show(renderer) {
        // in case the color palette runs out of colors
        if (!this.color) {
            this.color = '#d4d4d4';
        }
        let normal = 40;
        let accent = 80;
        let dimmed = 10;
        if (this.mouseIsOver) {
            accent += 19;
            normal += 19;
        }
        // if (this.node.inFwdPropagation && document.getElementById("forward").checked &&
        //     this.node.inBkwPropagation && document.getElementById("backward").checked) {
        //     // console.log("here 1 " + this.node.label);
        //     renderer.fill(this.color.concat(accent));
        // } else if (this.node.inFwdPropagation && document.getElementById("forward").checked) {
        //     // console.log("here 2 " + this.node.label);
        //     renderer.fill(this.color.concat(accent));
        // } else if (this.node.inBkwPropagation && document.getElementById("backward").checked) {
        //     // console.log("here 3 " + this.node.label);
        //     renderer.fill(this.color.concat(accent));
        //     // if it has no linked edges
        // } else if (this.vPositives.length + this.vNegatives.length <= 2) {
        //     // console.log("here 4 " + this.node.label);
        //     renderer.fill(this.color.concat(normal));
        // } else {
        // console.log("here last " + this.node.label);
        renderer.fill(this.color.concat(normal));
        // }

        // Highlight rect
        if (this.propagated) {
            renderer.strokeWeight(2);
            renderer.stroke(200, 0, 0);
        } else {
            renderer.strokeWeight(1);
            renderer.stroke(250);
        }
        // Show linked only
        if (DOM.boxChecked("filterLinked")) {
            // filter by edge number
            if ((this.vConnectors.length > 0) && DOM.boxChecked("filterLinked")) {
                // draw the rect
                renderer.strokeWeight(2);
                renderer.stroke(this.color);
                //renderer.rect(this.pos.x, this.pos.y, this.width, this.height);
                renderer.ellipseMode(gp5.CENTER)
                renderer.ellipse(this.pos.x, this.pos.y, this.width);

                // draw the label
                renderer.fill("#000000");
                renderer.noStroke();
                renderer.textSize(10);
                if (this.propagated) {
                    renderer.textStyle(renderer.BOLD);
                }
                renderer.textAlign(gp5.CENTER, gp5.CENTER);
                renderer.text(this.node.label, this.pos.x, this.pos.y);
                renderer.textStyle(renderer.NORMAL);

                //connectors
                for (let index = 0; index < this.vConnectors.length; index++) {
                    this.vConnectors[index].show(renderer)
                }

                if (this.mouseIsOver) {
                    this.showDescription(renderer);
                }
            } else {
                // draw the rect
                renderer.fill(this.color.concat(dimmed));
                //renderer.rect(this.pos.x, this.pos.y, this.width, this.height);
                renderer.ellipseMode(gp5.CENTER)
                renderer.ellipse(this.pos.x, this.pos.y, this.width);

                // draw the label
                renderer.fill("#00000070");
                renderer.noStroke();
                renderer.textSize(10);
                renderer.textAlign(gp5.CENTER, gp5.CENTER);
                renderer.text(this.node.label, this.pos.x, this.pos.y);
                renderer.textStyle(renderer.NORMAL);
                if (this.mouseIsOver) {
                    this.showDescription(renderer);
                }
            }
        } else {
            // draw the rect
            // renderer.rect(this.pos.x, this.pos.y, this.width, this.height);
            renderer.ellipseMode(gp5.CENTER)
            renderer.ellipse(this.pos.x, this.pos.y, this.width);

            // draw the label
            renderer.fill("#000000");
            renderer.noStroke();
            renderer.textSize(10);
            if (this.propagated) {
                renderer.textStyle(renderer.BOLD);
            }
            renderer.textAlign(gp5.CENTER, gp5.CENTER);
            renderer.text(this.node.label, this.pos.x, this.pos.y);
            renderer.textStyle(renderer.NORMAL);

            //connectors
            for (let index = 0; index < this.vConnectors.length; index++) {
                this.vConnectors[index].show(renderer)
            }

            if (this.mouseIsOver) {
                this.showDescription(renderer);
            }

        }
    }

    showDescription(renderer) {
        renderer.fill("#000000");
        renderer.textAlign(gp5.LEFT, gp5.TOP);
        renderer.strokeWeight(0.5);
        renderer.textSize(12);
        renderer.text(this.node.label, 95, gp5.height - 80, gp5.width - 200, 97);
        renderer.noStroke();
        renderer.textSize(11);
        renderer.text(this.node.description, 100, gp5.height - 62, gp5.width - 200, 97);
    }

    getJSON() {
        let cnctrs = [];
        for (const vConnector of this.vConnectors) {
            cnctrs.push(vConnector.getJSON())
        }
        let rtn = {
            id: this.node.idCat.index,
            nodeLabel: this.node.label,
            nodeDescription: this.node.description,
            polarity: this.node.polarity,
            connectors: cnctrs,
            pajekIndex: this.node.idCat.pajekIndex,
            vNode: {
                posX: this.pos.x,
                posY: this.pos.y,
                posZ: this.pos.z,
                color: this.color
            }
        }
        return rtn;
    }

    // **** EVENTS *****

    mouseDraggedEvents() {
        if (this.delta == undefined) {
            this.delta = this.getDeltaMouse();
        }
        if (this.mouseIsOver) {
            this.dragged = true;
            this.pos.x = Canvas._mouse.x - this.delta.x;
            this.pos.y = Canvas._mouse.y - this.delta.y;
            this.updateConnectorsCoords()
        }
    }

    mouseClickedEvents() {
        /** Note: this.dragged is true at the slightest drag motion. Sometimes 
         * this is imperceptible thus the click behavior of vNodes is not as 
         * responsive as it should, but it is highly accurate ;-)
         */
        if (this.mouseIsOver && !this.dragged) {

            if (this.keyP_Down) {
                this.propagated = !this.propagated;
                this.node.propagate(this.node, this.propagated);
            } else {
                let lastEdge = this.node.workOnLastEdge();
                this.workOnLastVEdge(lastEdge);
            }
        }
        this.dragged = false;
        this.delta = undefined;
    }

    /** If you get an open edge it is becuse it does not have a target yet. 
     * @param edge might come open or closed  
     */

    workOnLastVEdge(edge) {
        if (DOM.boxChecked("edit")) {

            // if the edge does not have a target
            if (edge.open) {
                this.sproutVEdge(edge);

            } else {
                // If the edge is closed, close the current VEdge
                this.closeLastVEdge(edge);
            }
        }
    }

    sproutVEdge(edge) {
        // generate a new vEdge
        let lastVEdge = new VEdge(edge);

        // set the source
        lastVEdge.setVSource(this);

        // set connector position
        lastVEdge.pos =

            // add to the canvas elements to be rendered on screen
            Canvas.subscribe(lastVEdge);

        // add to the collections of vEdges in factory
        EdgeFactory.pushVEdge(lastVEdge);
    }

    closeLastVEdge(edge) {
        // take the current VEdge
        let currentVEdge = EdgeFactory.getLastVEdge();

        //validate it is the same edge
        if (currentVEdge.edge == edge) {

            // set the target
            currentVEdge.setVTarget(this);
        }
    }
}